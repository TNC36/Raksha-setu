import { useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import {
  MapPin,
  Navigation,
  Crosshair,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import {
  DISASTER_TYPES,
  DISASTER_META,
  DisasterType,
} from "../../data/disasters";
import { loadZones, loadAlerts, loadGuides } from "../../utils/storage";
import { DEFAULT_FACILITIES } from "../../data/facilities";
import { DEFAULT_REPORTS } from "../../data/reports";
import { formatDistance, findNearest } from "../../utils/distance";
import { generateDemoRoute, openGoogleMapsNavigation } from "../../utils/routing";
import MapView from "../../components/suraksha/MapView";
import { SafeZone } from "../../data/zones";

export default function SafeZones() {
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

  const zones = loadZones();
  const alerts = loadAlerts();
  const guides = loadGuides();

  const meta = DISASTER_META[disaster];

  const filteredZones = zones.filter(
    (z) => z.disasterTypes.includes(disaster) && z.status !== "Closed"
  );

  const filteredAlerts = alerts.filter((a) => a.type === disaster);
  const filteredGuides = guides.filter((g) => g.type === disaster);

  // Nearest zone with distance
  const zonesWithDistance = userLocation
    ? findNearest(filteredZones, userLocation.latitude, userLocation.longitude)
    : filteredZones.map((z) => ({ ...z, distance: 0 }));

  const nearestZone = zonesWithDistance.length > 0 ? zonesWithDistance[0] : null;

  // Route
  const routePoints =
    userLocation && selectedZone
      ? generateDemoRoute(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: selectedZone.latitude, longitude: selectedZone.longitude }
        )
      : undefined;

  function handleDisasterChange(dt: DisasterType) {
    setDisaster(dt);
    setSelectedZone(null);
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
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900 mb-1">
          Safe Zones & Evacuation Routes
        </h1>
        <p className="text-xs text-neutral-400">
          Select a disaster type to view relevant safe zones, danger areas, and
          suggested evacuation routes.
        </p>
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
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
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
      <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={detectLocation}
            disabled={loadingLocation}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Crosshair className="w-3.5 h-3.5" />
            {loadingLocation ? "Detecting…" : "Use My Location"}
          </button>

          {userLocation && (
            <div className="text-xs text-neutral-500 flex flex-wrap gap-3">
              <span>
                Lat: <strong>{userLocation.latitude.toFixed(4)}</strong>
              </span>
              <span>
                Lon: <strong>{userLocation.longitude.toFixed(4)}</strong>
              </span>
              <span>
                Accuracy: <strong>{Math.round(userLocation.accuracy)}m</strong>
              </span>
            </div>
          )}

          {locationError && (
            <p className="text-xs text-red-600">{locationError}</p>
          )}
        </div>
      </div>

      {/* Nearest shelter card */}
      {userLocation && nearestZone && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                Nearest {disaster} Safe Zone
              </p>
              <h3 className="text-base font-semibold text-neutral-900">
                {nearestZone.name}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {nearestZone.type} · {nearestZone.location}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-neutral-900">
                {formatDistance(nearestZone.distance)}
              </p>
              <p
                className={`text-[10px] font-medium ${
                  nearestZone.status === "Available"
                    ? "text-green-600"
                    : nearestZone.status === "Limited"
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {nearestZone.status}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-neutral-500 mb-4">
            <span>Capacity: {nearestZone.capacity}</span>
            <span>·</span>
            <span>{nearestZone.latitude.toFixed(4)}, {nearestZone.longitude.toFixed(4)}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedZone(nearestZone)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <MapPin className="w-3 h-3" />
              Show on Map
            </button>
            <button
              onClick={() =>
                openGoogleMapsNavigation(nearestZone.latitude, nearestZone.longitude)
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Navigation className="w-3 h-3" />
              Navigate
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
          zones={zones}
          alerts={alerts}
          reports={DEFAULT_REPORTS}
          facilities={DEFAULT_FACILITIES}
          userLocation={
            userLocation
              ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
              : null
          }
          selectedZone={selectedZone}
          routePoints={routePoints}
        />
      </div>

      {/* Two column: Zones + Sidebar */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Zones list */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">
            {meta.icon} {disaster} Safe Zones ({zonesWithDistance.length})
          </h2>

          {zonesWithDistance.length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-sm text-neutral-400">
                No safe zones available for {disaster}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {zonesWithDistance.map((zone) => (
                <div
                  key={`zone-${zone.id}`}
                  className={`bg-white border rounded-xl p-4 transition-colors cursor-pointer ${
                    selectedZone?.id === zone.id
                      ? "border-neutral-900"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {zone.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {zone.type} · {zone.location}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {userLocation && (
                        <p className="text-sm font-medium text-neutral-900">
                          {formatDistance(zone.distance)}
                        </p>
                      )}
                      <p
                        className={`text-[10px] font-medium ${
                          zone.status === "Available"
                            ? "text-green-600"
                            : zone.status === "Limited"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {zone.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-neutral-400">
                      Capacity: {zone.capacity}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedZone(zone);
                        }}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        Show on Map
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoogleMapsNavigation(zone.latitude, zone.longitude);
                        }}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors inline-flex items-center gap-1"
                      >
                        Navigate <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Alerts + Reports + Guide */}
        <div className="space-y-6">
          {/* Disaster-specific alerts */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-neutral-500" />
              {disaster} Alerts
            </h3>
            {filteredAlerts.length === 0 ? (
              <p className="text-xs text-neutral-400">No active alerts.</p>
            ) : (
              <div className="space-y-2">
                {filteredAlerts.slice(0, 3).map((alert) => (
                  <div
                    key={`alert-${alert.id}`}
                    className="bg-white border border-neutral-200 rounded-lg p-3"
                  >
                    <p className="text-xs font-medium text-neutral-900">
                      {alert.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {alert.severity}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Community Reports */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              Community Reports
            </h3>
            <p className="text-[10px] text-neutral-400 mb-2 italic">
              Demo reports — for demonstration purposes only
            </p>
            {DEFAULT_REPORTS.filter((r) => r.disaster === disaster).length ===
            0 ? (
              <p className="text-xs text-neutral-400">
                No reports for this disaster.
              </p>
            ) : (
              <div className="space-y-2">
                {DEFAULT_REPORTS.filter((r) => r.disaster === disaster).map(
                  (rpt) => (
                    <div
                      key={`rpt-${rpt.id}`}
                      className="bg-white border border-neutral-200 rounded-lg p-3"
                    >
                      <p className="text-xs text-neutral-700">{rpt.title}</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Quick guide */}
          {filteredGuides.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                {meta.icon} Safety Tips
              </h3>
              <div className="bg-white border border-neutral-200 rounded-lg p-3">
                <p className="text-xs font-medium text-neutral-900 mb-2">
                  {filteredGuides[0].title}
                </p>
                {filteredGuides[0].during?.slice(0, 2).map((tip, i) => (
                  <p key={`tip-${i}`} className="text-[11px] text-neutral-500 leading-relaxed">
                    • {tip}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
