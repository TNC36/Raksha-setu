import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "convex/react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import {
  MapPin,
  Navigation,
  Crosshair,
  AlertTriangle,
  ExternalLink,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  DISASTER_TYPES,
  DISASTER_META,
  DisasterType,
} from "../../data/disasters";
import { DEFAULT_FACILITIES } from "../../data/facilities";
import { DEFAULT_REPORTS } from "../../data/reports";
import { formatDistance, findNearest } from "../../utils/distance";
import { openGoogleMapsNavigation } from "../../utils/routing";
import { fetchRoute, RouteResult } from "../../services/liveRouting";
import { checkRouteHazards, HazardZone, HazardCheckResult } from "../../services/hazardRouting";
import { fetchNearbyFacilities } from "../../services/liveFacilities";
import { fetchEarthquakes } from "../../services/earthquake";
import { fetchWeatherAlerts } from "../../services/weather";
import MapView from "../../components/suraksha/MapView";
import { SafeZone } from "../../data/zones";
import { Alert } from "../../data/alerts";
import { Facility } from "../../data/facilities";

export default function SafeZones() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDisaster = (searchParams.get("disaster") as DisasterType) || "Flood";
  const [disaster, setDisaster] = useState<DisasterType>(initialDisaster);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null);

  // Live data state
  const [liveFacilities, setLiveFacilities] = useState<Facility[]>([]);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<{
    facilities: boolean;
    earthquakes: boolean;
    weather: boolean;
    routing: boolean;
  }>({ facilities: false, earthquakes: false, weather: false, routing: false });

  // OSRM real route state
  const [realRoute, setRealRoute] = useState<[number, number][] | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [hazardCheck, setHazardCheck] = useState<HazardCheckResult | null>(null);

  // Keep a ref to abort in-flight route requests
  const routeAbortRef = useRef<AbortController | null>(null);

  // Convex reactive queries for database-stored data
  const convexZones = useQuery(api.safeZones.listActive);
  const convexAlerts = useQuery(api.alerts.list);
  const convexGuides = useQuery(api.guides.list);

  // Map Convex documents to the shapes expected by existing components
  const demoZones: SafeZone[] = (convexZones || []).map((z) => ({
    id: z._id,
    name: z.name,
    type: z.type,
    location: z.location,
    latitude: z.latitude,
    longitude: z.longitude,
    capacity: z.capacity,
    disasterTypes: z.disasterTypes as DisasterType[],
    status: z.status,
    verified: z.verified,
  }));

  const demoAlerts: Alert[] = (convexAlerts || []).map((a) => ({
    id: a._id,
    type: a.type,
    severity: a.severity,
    title: a.title,
    description: a.description,
    location: a.location,
    latitude: a.latitude,
    longitude: a.longitude,
    createdAt: new Date(a.issuedAt).toISOString(),
    isLive: a.mode === "live",
    source: a.source,
    sourceUrl: a.sourceUrl,
  }));

  const meta = DISASTER_META[disaster];

  // Merge demo + live facilities
  const allFacilities = [...liveFacilities, ...DEFAULT_FACILITIES];

  // Merge demo + live alerts
  const allAlerts = [...liveAlerts, ...demoAlerts];

  const filteredZones = demoZones.filter(
    (z) => z.disasterTypes.includes(disaster) && z.status !== "Closed"
  );

  const filteredAlerts = allAlerts.filter(
    (a) => a.type === disaster || (a.isLive && a.source?.includes("USGS"))
  );

  // Nearest zone with distance
  const zonesWithDistance = userLocation
    ? findNearest(filteredZones, userLocation.latitude, userLocation.longitude)
    : filteredZones.map((z) => ({ ...z, distance: 0 }));

  const nearestZone = zonesWithDistance.length > 0 ? zonesWithDistance[0] : null;

  // Fetch live data when user location is detected (async side effect)
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => {
    if (!userLocation) return;

    const controller = new AbortController();

    async function fetchLiveData() {
      setLoadingLive(true);
      try {
        // Fetch real facilities nearby
        const facilities = await fetchNearbyFacilities(
          userLocation!.latitude,
          userLocation!.longitude,
          50,
          ["Hospital", "Police", "Fire Station"]
        );
        if (!controller.signal.aborted) {
          setLiveFacilities(facilities);
          setLiveStatus((s) => ({ ...s, facilities: facilities.length > 0 }));
        }

        // Fetch real earthquake data for the region
        const earthquakes = await fetchEarthquakes({
          minLatitude: userLocation!.latitude - 5,
          maxLatitude: userLocation!.latitude + 5,
          minLongitude: userLocation!.longitude - 5,
          maxLongitude: userLocation!.longitude + 5,
          minMagnitude: 2.5,
          limit: 20,
        });
        if (!controller.signal.aborted) {
          setLiveAlerts(earthquakes);
          setLiveStatus((s) => ({ ...s, earthquakes: earthquakes.length > 0 }));
        }

        // Fetch weather-based alerts
        const weatherAlerts = await fetchWeatherAlerts(
          userLocation!.latitude,
          userLocation!.longitude
        );
        if (!controller.signal.aborted) {
          setLiveAlerts((prev) => [...prev, ...weatherAlerts]);
          setLiveStatus((s) => ({ ...s, weather: weatherAlerts.length > 0 }));
        }
      } catch (err) {
        console.error("Failed to fetch live data:", err);
      }
      if (!controller.signal.aborted) setLoadingLive(false);
    }

    fetchLiveData();

    return () => controller.abort();
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Fetch OSRM route when user selects a zone
  useEffect(() => {
    if (!userLocation || !selectedZone) return;

    // Abort previous request
    routeAbortRef.current?.abort();
    const controller = new AbortController();
    routeAbortRef.current = controller;

    async function getRoute() {
      setLoadingRoute(true);
      try {
        const result = await fetchRoute(
          userLocation!.latitude,
          userLocation!.longitude,
          selectedZone!.latitude,
          selectedZone!.longitude
        );
        if (!controller.signal.aborted && result) {
          setRealRoute(result.polyline);
          setRouteResult(result);
          setLiveStatus((s) => ({ ...s, routing: true }));

          // Hazard-aware route check against demo danger zones
          const demoHazards: HazardZone[] = [
            { latitude: 22.3020, longitude: 73.1880, radius: 400, type: "Flood", severity: "High" },
            { latitude: 22.2980, longitude: 73.1780, radius: 300, type: "Flood", severity: "Medium" },
          ];
          const hazardResult = checkRouteHazards(result.polyline, demoHazards);
          setHazardCheck(hazardResult);
        }
      } catch (err) {
        console.error("OSRM routing failed:", err);
      }
      if (!controller.signal.aborted) setLoadingRoute(false);
    }

    getRoute();

    return () => controller.abort();
  }, [userLocation?.latitude, userLocation?.longitude, selectedZone?.id]);

  function handleDisasterChange(dt: DisasterType) {
    setDisaster(dt);
    setSelectedZone(null);
    setRealRoute(null);
    setRouteResult(null);
    setHazardCheck(null);
    setSearchParams({ disaster: dt });
  }

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLoadingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLoadingLocation(false);
      },
      (err) => {
        setLoadingLocation(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please allow location access.");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable. Please try again.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Unable to detect your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground mb-1">
            {t("safeZones.title")}
          </h1>
          <p className="text-xs text-muted-foreground">              {t("safeZones.subtitle")}
          </p>
        </div>
        {/* Live data status indicator */}
        <div className="flex-shrink-0 flex items-center gap-2 text-[10px]">
          {loadingLive ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {t("alerts.syncing")}
            </span>
          ) : liveStatus.facilities || liveStatus.earthquakes ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-success/10 text-green-600 border border-green-200">
              <Wifi className="w-3 h-3" />
              {t("status.live")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border">
              <WifiOff className="w-3 h-3" />
              {t("status.demo")}
            </span>
          )}
        </div>
      </div>

      {/* Disaster selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DISASTER_TYPES.map((dt) => {
          const m = DISASTER_META[dt];
          return (
            <button
              key={dt}
              onClick={() => handleDisasterChange(dt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                disaster === dt
                  ? "text-white border-transparent"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
              style={
                disaster === dt
                  ? { backgroundColor: m.color, borderColor: m.color }
                  : undefined
              }
            >
              {m.icon} {dt}
            </button>
          );
        })}
      </div>

      {/* Location detection */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={detectLocation}
            disabled={loadingLocation}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Crosshair className="w-3.5 h-3.5" />
            {loadingLocation ? t("safeZones.detecting") : t("safeZones.useMyLocation")}
          </button>

          {userLocation && (
            <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
              <span>
                Lat: <strong>{userLocation.latitude.toFixed(4)}</strong>
              </span>
              <span>
                Lon: <strong>{userLocation.longitude.toFixed(4)}</strong>
              </span>
              <span>
                Accuracy: <strong>{Math.round(userLocation.accuracy)}m</strong>
              </span>
              {loadingLive && (
                <span className="text-amber-500">Loading live data…</span>
              )}
            </div>
          )}

          {locationError && (
            <p className="text-xs text-destructive">{locationError}</p>
          )}
        </div>
      </div>

      {/* Nearest shelter card */}
      {userLocation && nearestZone && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {t("safeZones.nearestSafeZone", { type: disaster })}
              </p>
              <h3 className="text-base font-semibold text-foreground">
                {nearestZone.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {nearestZone.type} · {nearestZone.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground">
                {formatDistance(nearestZone.distance)}
              </p>
              <p
                className={`text-[10px] font-medium ${
                  nearestZone.status === "Available"
                    ? "text-green-600"
                    : nearestZone.status === "Limited"
                    ? "text-amber-600"
                    : "text-destructive"
                }`}
              >
                {nearestZone.status}
              </p>
            </div>
          </div>

          {/* OSRM Route info */}
          {routeResult && (
            <div className="bg-background rounded-lg p-3 mb-3">
              <div className="flex items-center gap-4 text-xs">
                <span className="font-medium text-foreground">
                  🛣️ Route: {routeResult.distanceFormatted}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  ETA: {routeResult.durationFormatted}
                </span>
                {loadingRoute && (
                  <span className="text-amber-500 animate-pulse">Recalculating…</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t("safeZones.roadNetworkRoute", { source: routeResult.source })}
              </p>

              {/* Hazard check result */}
              {hazardCheck && (
                <div className={`mt-2 px-2 py-1.5 rounded text-[10px] font-medium border ${
                  hazardCheck.safetyLabel === "SAFE"
                    ? "bg-success/10 text-green-700 border-green-200"
                    : hazardCheck.safetyLabel === "CAUTION"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-destructive/10 text-destructive border-destructive/30"
                }`}>
                  {hazardCheck.safetyLabel === "SAFE" ? "✅" : hazardCheck.safetyLabel === "CAUTION" ? "⚠️" : "🚫"} {hazardCheck.explanation}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
            <span>Capacity: {nearestZone.capacity}</span>
            <span>·</span>
            <span>{nearestZone.latitude.toFixed(4)}, {nearestZone.longitude.toFixed(4)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedZone(nearestZone)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MapPin className="w-3 h-3" />
              {t("safeZones.showOnMap")}
            </button>
            <button
              onClick={() =>
                openGoogleMapsNavigation(nearestZone.latitude, nearestZone.longitude)
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border text-foreground rounded-lg hover:bg-secondary transition-colors"
            >
              <Navigation className="w-3 h-3" />
              {t("safeZones.navigate")}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="mb-8">
        <MapView
          center={[22.3072, 73.1812]}
          zoom={13}
          disaster={disaster}
          zones={demoZones}
          alerts={allAlerts}
          reports={DEFAULT_REPORTS}
          facilities={allFacilities}
          userLocation={
            userLocation
              ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
              : null
          }
          selectedZone={selectedZone}
          routePoints={undefined}
          realRoute={realRoute || undefined}
          routeInfo={
            routeResult
              ? {
                  distance: routeResult.distanceFormatted,
                  duration: routeResult.durationFormatted,
                  source: routeResult.source,
                }
              : null
          }
        />
      </div>

      {/* Two column: Zones + Sidebar */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Zones list */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {meta.icon} {disaster} Safe Zones ({zonesWithDistance.length})
          </h2>

          {zonesWithDistance.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-xl border border-border">
              <p className="text-sm text-muted-foreground">
                {convexZones === undefined                    ? t("common.loading")
                    : t("safeZones.noZones", { type: disaster })}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {zonesWithDistance.map((zone) => (
                <div
                  key={`zone-${zone.id}`}
                  className={`bg-card border rounded-xl p-4 transition-colors cursor-pointer ${
                    selectedZone?.id === zone.id
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {zone.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {zone.type} · {zone.location}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {userLocation && (
                        <p className="text-sm font-medium text-foreground">
                          {formatDistance(zone.distance)}
                        </p>
                      )}
                      <p
                        className={`text-[10px] font-medium ${
                          zone.status === "Available"
                            ? "text-green-600"
                            : zone.status === "Limited"
                            ? "text-amber-600"
                            : "text-destructive"
                        }`}
                      >
                        {zone.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-muted-foreground">
                      Capacity: {zone.capacity}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedZone(zone);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {t("safeZones.showOnMap")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoogleMapsNavigation(zone.latitude, zone.longitude);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        {t("safeZones.navigate")} <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Alerts + Facilities + Reports + Guide */}
        <div className="space-y-6">
          {/* Disaster-specific alerts */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              {disaster} Alerts
            </h3>
            {filteredAlerts.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("alerts.noAlerts")}</p>
            ) : (
              <div className="space-y-2">
                {filteredAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={`alert-${alert.id}`}
                    className="bg-card border border-border rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium text-foreground flex-1">
                        {alert.title}
                      </p>
                      {alert.isLive && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-medium bg-success/10 text-green-600 border border-green-200">
                          <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {alert.severity} · {alert.location}
                    </p>
                    {alert.source && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Source: {alert.source}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time nearby facilities */}
          {liveFacilities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                🏥 {t("safeZones.nearbyFacilities")}
              </h3>
              <div className="space-y-2">
                {liveFacilities.slice(0, 6).map((fac) => (
                  <div
                    key={`live-fac-${fac.id}`}
                    className="bg-card border border-border rounded-lg p-3 flex items-center gap-3"
                  >
                    <span className="text-sm">
                      {fac.type === "Hospital"
                        ? "🏥"
                        : fac.type === "Police"
                        ? "🚔"
                        : "🚒"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {fac.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {fac.type} · {fac.latitude.toFixed(4)}, {fac.longitude.toFixed(4)}
                      </p>
                    </div>
                    {userLocation && (
                      <button
                        onClick={() =>
                          openGoogleMapsNavigation(fac.latitude, fac.longitude)
                        }
                        className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 flex-shrink-0"
                      >
                        Nav <ExternalLink className="w-2 h-2" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Reports */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t("safeZones.communityReports")}
            </h3>
            <p className="text-[10px] text-muted-foreground mb-2 italic">
              Demo reports — for demonstration purposes only
            </p>
            {DEFAULT_REPORTS.filter((r) => r.disaster === disaster).length ===
            0 ? (
              <p className="text-xs text-muted-foreground">
                No reports for this disaster.
              </p>
            ) : (
              <div className="space-y-2">
                {DEFAULT_REPORTS.filter((r) => r.disaster === disaster).map(
                  (rpt) => (
                    <div
                      key={`rpt-${rpt.id}`}
                      className="bg-card border border-border rounded-lg p-3"
                    >
                      <p className="text-xs text-foreground">{rpt.title}</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Quick guide */}
          {convexGuides && (() => {
            const guides = convexGuides.filter((g) => g.type === disaster);
            if (guides.length === 0) return null;
            return (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {meta.icon} Safety Tips
                </h3>
                <div className="bg-card border border-border rounded-lg p-3">
                  <p className="text-xs font-medium text-foreground mb-2">
                    {guides[0].title}
                  </p>
                  {(guides[0].during || []).slice(0, 2).map((tip: string, i: number) => (
                    <p key={`tip-${i}`} className="text-[11px] text-muted-foreground leading-relaxed">
                      • {tip}
                    </p>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Data source disclaimer */}
      <div className="mb-6 bg-background border border-border rounded-xl p-4 text-center">
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Live facility data sourced from OpenStreetMap (Overpass API). Earthquake data from USGS Earthquake Hazards Program.
          Weather alerts from Open-Meteo. Road-network routing via OSRM (Open Source Routing Machine).
          Safe zones and community reports stored in Convex database — replace with verified government data for production.
        </p>
      </div>
    </div>
  );
}
