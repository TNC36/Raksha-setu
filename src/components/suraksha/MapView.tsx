import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SafeZone } from "../../data/zones";
import { Alert } from "../../data/alerts";
import { CommunityReport } from "../../data/reports";
import { Facility } from "../../data/facilities";
import { DisasterType, DISASTER_META } from "../../data/disasters";
import { RoutePoint } from "../../utils/routing";

// Fix Leaflet default icon paths for bundled builds
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createIcon(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);" title="${label}"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -8],
  });
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    }
  }, [points, map]);
  return null;
}

interface LayerToggles {
  safeZones: boolean;
  dangerZones: boolean;
  hospitals: boolean;
  police: boolean;
  fireStations: boolean;
  alerts: boolean;
  reports: boolean;
  route: boolean;
}

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  disaster: DisasterType;
  zones: SafeZone[];
  alerts: Alert[];
  reports: CommunityReport[];
  facilities: Facility[];
  userLocation?: { latitude: number; longitude: number } | null;
  selectedZone?: SafeZone | null;
  routePoints?: RoutePoint[];
  /** Real OSRM road-network route as [lat, lng] pairs — preferred over demo routePoints */
  realRoute?: [number, number][];
  /** Route info label (distance, ETA from OSRM) */
  routeInfo?: { distance: string; duration: string; source: string } | null;
  layers?: LayerToggles;
}

function useMapLayers(_disaster: DisasterType, initial?: Partial<LayerToggles>): [LayerToggles, (key: keyof LayerToggles) => void] {
  const [layers, setLayers] = useState<LayerToggles>({
    safeZones: true,
    dangerZones: true,
    hospitals: true,
    police: true,
    fireStations: true,
    alerts: true,
    reports: true,
    route: true,
    ...initial,
  });

  const toggle = (key: keyof LayerToggles) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return [layers, toggle];
}

// Danger zone data per disaster type (demo)
const DANGER_ZONES: Record<DisasterType, { lat: number; lng: number; radius: number; label: string }[]> = {
  Flood: [
    { lat: 22.3020, lng: 73.1880, radius: 400, label: "Low-lying waterlogging zone" },
    { lat: 22.2980, lng: 73.1780, radius: 300, label: "River overflow risk area" },
  ],
  Earthquake: [
    { lat: 22.3220, lng: 73.1620, radius: 350, label: "Unsafe structure zone" },
    { lat: 22.3060, lng: 73.1950, radius: 250, label: "Damaged building area" },
  ],
  Cyclone: [
    { lat: 22.2800, lng: 73.2100, radius: 600, label: "Exposed high-wind zone" },
    { lat: 22.2900, lng: 73.2050, radius: 400, label: "Coastal risk area" },
  ],
  Wildfire: [
    { lat: 22.3350, lng: 73.2080, radius: 450, label: "Fire / smoke risk zone" },
    { lat: 22.3400, lng: 73.2000, radius: 300, label: "Dry vegetation zone" },
  ],
  Landslide: [
    { lat: 22.3400, lng: 73.1500, radius: 400, label: "Unstable slope zone" },
    { lat: 22.3360, lng: 73.1580, radius: 250, label: "Debris flow risk area" },
  ],
  Conflict: [
    { lat: 22.3072, lng: 73.1812, radius: 350, label: "High-risk conflict zone" },
    { lat: 22.3100, lng: 73.1760, radius: 200, label: "Market unrest area" },
  ],
};

const DANGER_COLORS: Record<DisasterType, string> = {
  Flood: "#3b82f6",
  Earthquake: "#f59e0b",
  Cyclone: "#8b5cf6",
  Wildfire: "#ef4444",
  Landslide: "#92400e",
  Conflict: "#6b7280",
};

export default function MapView({
  center,
  zoom = 13,
  disaster,
  zones,
  alerts,
  reports,
  facilities,
  userLocation,
  selectedZone,
  routePoints,
  realRoute,
  routeInfo,
}: MapViewProps) {
  const [layers, toggleLayer] = useMapLayers(disaster);
  const meta = DISASTER_META[disaster];

  const filteredZones = zones.filter(
    (z) => z.disasterTypes.includes(disaster) && z.status !== "Closed"
  );
  const filteredAlerts = alerts.filter((a) => a.type === disaster);
  const filteredReports = reports.filter((r) => r.disaster === disaster);

  const hospitals = facilities.filter((f) => f.type === "Hospital");
  const policeStations = facilities.filter((f) => f.type === "Police");
  const fireStations = facilities.filter((f) => f.type === "Fire Station");

  const bounds: [number, number][] = [];
  if (userLocation) bounds.push([userLocation.latitude, userLocation.longitude]);
  filteredZones.forEach((z) => bounds.push([z.latitude, z.longitude]));
  filteredAlerts.forEach((a) => bounds.push([a.latitude, a.longitude]));
  if (selectedZone) bounds.push([selectedZone.latitude, selectedZone.longitude]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-white">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-[500px] lg:h-[600px]"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {bounds.length > 1 && <FitBounds points={bounds} />}
        {bounds.length <= 1 && <Recenter center={center} />}

        {/* User location */}
        {userLocation && layers.safeZones && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createIcon("#111827", "Your location")}
          >
            <Popup>
              <div className="text-xs">
                <strong>Your Location</strong>
                <br />
                {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Safe Zones */}
        {layers.safeZones &&
          filteredZones.map((zone) => (
            <Marker
              key={`zone-${zone.id}`}
              position={[zone.latitude, zone.longitude]}
              icon={createIcon(meta.color, zone.name)}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <strong>{zone.name}</strong>
                  <br />
                  <span className="text-neutral-500">{zone.type}</span>
                  <br />
                  Capacity: {zone.capacity}
                  <br />
                  Status: {zone.status}
                  <br />
                  {zone.location}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Danger Zones */}
        {layers.dangerZones &&
          DANGER_ZONES[disaster].map((dz, i) => (
            <Circle
              key={`danger-${disaster}-${i}`}
              center={[dz.lat, dz.lng]}
              radius={dz.radius}
              pathOptions={{
                color: DANGER_COLORS[disaster],
                fillColor: DANGER_COLORS[disaster],
                fillOpacity: 0.12,
                weight: 2,
                dashArray: "6 4",
              }}
            >
              <Popup>
                <div className="text-xs">
                  <strong>⚠️ {meta.dangerZoneLabel}</strong>
                  <br />
                  {dz.label}
                  <br />
                  <em className="text-neutral-400">Demo data</em>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Hospitals */}
        {layers.hospitals &&
          hospitals.map((f) => (
            <Marker
              key={`hosp-${f.id}`}
              position={[f.latitude, f.longitude]}
              icon={createIcon("#ef4444", f.name)}
            >
              <Popup>
                <div className="text-xs">
                  🏥 <strong>{f.name}</strong>
                  <br />
                  Hospital
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Police */}
        {layers.police &&
          policeStations.map((f) => (
            <Marker
              key={`police-${f.id}`}
              position={[f.latitude, f.longitude]}
              icon={createIcon("#2563eb", f.name)}
            >
              <Popup>
                <div className="text-xs">
                  🚔 <strong>{f.name}</strong>
                  <br />
                  Police Station
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Fire Stations */}
        {layers.fireStations &&
          fireStations.map((f) => (
            <Marker
              key={`fire-${f.id}`}
              position={[f.latitude, f.longitude]}
              icon={createIcon("#f97316", f.name)}
            >
              <Popup>
                <div className="text-xs">
                  🚒 <strong>{f.name}</strong>
                  <br />
                  Fire Station
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Alerts */}
        {layers.alerts &&
          filteredAlerts.map((a) => (
            <Marker
              key={`alert-${a.id}`}
              position={[a.latitude, a.longitude]}
              icon={createIcon(
                a.severity === "Critical"
                  ? "#dc2626"
                  : a.severity === "High"
                  ? "#f97316"
                  : "#eab308",
                a.title
              )}
            >
              <Popup>
                <div className="text-xs">
                  <strong>{a.title}</strong>
                  <br />
                  {a.severity} — {a.type}
                  <br />
                  {a.description}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Community Reports */}
        {layers.reports &&
          filteredReports.map((r) => (
            <Marker
              key={`rpt-${r.id}`}
              position={[r.latitude, r.longitude]}
              icon={createIcon("#a855f7", r.title)}
            >
              <Popup>
                <div className="text-xs">
                  📢 <strong>Community Report</strong>
                  <br />
                  {r.title}
                  <br />
                  <em className="text-neutral-400">Demo report</em>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Suggested Route — prefer real OSRM route, fall back to demo */}
        {layers.route && realRoute && realRoute.length > 1 ? (
          <Polyline
            positions={realRoute}
            pathOptions={{
              color: meta.color,
              weight: 5,
              opacity: 0.9,
            }}
          />
        ) : layers.route && routePoints && routePoints.length > 1 ? (
          <Polyline
            positions={routePoints.map((p) => [p.latitude, p.longitude] as [number, number])}
            pathOptions={{
              color: meta.color,
              weight: 4,
              opacity: 0.8,
              dashArray: "10 8",
            }}
          />
        ) : null}
      </MapContainer>

      {/* Layer toggles */}
      <LayerPanel layers={layers} disaster={disaster} onToggle={toggleLayer} />

      {/* Route info badge */}
      {routeInfo && (
        <div className="absolute bottom-16 left-4 z-[1000] bg-white border border-neutral-200 rounded-lg px-3 py-2 shadow-sm">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-medium text-neutral-900">Route: {routeInfo.distance}</span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-600">ETA: {routeInfo.duration}</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-0.5">{routeInfo.source}</p>
        </div>
      )}
    </div>
  );
}

function LayerPanel({
  layers,
  disaster,
  onToggle,
}: {
  layers: LayerToggles;
  disaster: DisasterType;
  onToggle: (key: keyof LayerToggles) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggles: { key: keyof LayerToggles; label: string; color: string }[] = [
    { key: "safeZones", label: "Safe Zones", color: DISASTER_META[disaster].color },
    { key: "dangerZones", label: "Danger Zones", color: DANGER_COLORS[disaster] },
    { key: "hospitals", label: "Hospitals", color: "#ef4444" },
    { key: "police", label: "Police", color: "#2563eb" },
    { key: "fireStations", label: "Fire Stations", color: "#f97316" },
    { key: "alerts", label: "Alerts", color: "#eab308" },
    { key: "reports", label: "Reports", color: "#a855f7" },
    { key: "route", label: "Route", color: DISASTER_META[disaster].color },
  ];

  return (
    <div className="absolute top-3 right-3 z-[1000]">
      <button
        onClick={() => setOpen(!open)}
        className="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors"
      >
        Layers
      </button>
      {open && (
        <div className="mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 w-44">
          {toggles.map((t) => (
            <label
              key={t.key}
              className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-600 cursor-pointer hover:bg-neutral-50 rounded"
            >
              <input
                type="checkbox"
                checked={layers[t.key]}
                onChange={() => onToggle(t.key)}
                className="w-3 h-3 accent-neutral-900"
              />
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              {t.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
