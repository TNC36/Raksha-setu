import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  AlertTriangle,
  MapPin,
  BookOpen,
  Phone,
  ArrowRight,
  LogOut,
  Shield,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getCurrentUser,
  logoutUser,
} from "../../utils/storage";
import { DISASTER_TYPES, DISASTER_META } from "../../data/disasters";
import { formatDistance, findNearest } from "../../utils/distance";
import { openGoogleMapsNavigation } from "../../utils/routing";
import AlertCard from "../../components/suraksha/AlertCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Convex reactive queries — auto-update when database changes
  const alertsData = useQuery(api.alerts.list);
  const zonesData = useQuery(api.safeZones.listActive);
  const guidesData = useQuery(api.guides.list);

  const [locationDetected, setLocationDetected] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  // Map Convex documents to the shapes expected by existing components
  const alerts = (alertsData || []).map((a) => ({
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
  }));

  const zones = (zonesData || []).map((z) => ({
    id: z._id,
    name: z.name,
    type: z.type,
    location: z.location,
    latitude: z.latitude,
    longitude: z.longitude,
    capacity: z.capacity,
    disasterTypes: z.disasterTypes,
    status: z.status,
    verified: z.verified,
  }));

  const guides = (guidesData || []).map((g) => ({
    id: g._id,
    type: g.type,
    title: g.title,
  }));

  const criticalAlerts = alerts.filter(
    (a) => a.severity === "Critical" || a.severity === "High"
  );
  const availableZones = zones.filter((z) => z.status !== "Closed");

  // Find nearest safe zone for each disaster type
  const nearestPerDisaster = userLoc
    ? DISASTER_TYPES.map((dt) => {
        const meta = DISASTER_META[dt];
        const relevant = availableZones.filter((z) =>
          z.disasterTypes.includes(dt)
        );
        const withDist = findNearest(
          relevant,
          userLoc.latitude,
          userLoc.longitude
        );
        return { type: dt, meta, zone: withDist[0] || null };
      })
    : [];

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationDetected(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationDetected(true);
      },
      (err) => {
        setLocationDetected(true);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please allow location access in your browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable. Please try again.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Unable to detect your location. Please check your browser settings.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleLogout() {
    logoutUser();
    navigate("/", { replace: true });
  }

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold text-foreground">
              Your Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {greeting}, {user.name}. Here is your emergency overview.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Data synced from Convex database · Last updated: {new Date().toLocaleTimeString("en-IN", { timeStyle: "short" })}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <DashStat
          icon={AlertTriangle}
          label="Active Alerts"
          value={alerts.length}
          accent={
            criticalAlerts.length > 0
              ? "bg-destructive/10 text-destructive"
              : "bg-secondary text-muted-foreground"
          }
        />
        <DashStat
          icon={AlertTriangle}
          label="Critical / High"
          value={criticalAlerts.length}
          accent={
            criticalAlerts.length > 0
              ? "bg-destructive/10 text-destructive"
              : "bg-success/10 text-green-600"
          }
        />
        <DashStat
          icon={MapPin}
          label="Safe Zones"
          value={availableZones.length}
          accent="bg-secondary text-muted-foreground"
        />
        <DashStat
          icon={BookOpen}
          label="Safety Guides"
          value={guides.length}
          accent="bg-secondary text-muted-foreground"
        />
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Critical Alerts — Immediate Attention Required
            </h2>
            <Link
              to="/alerts"
              className="text-xs text-muted-foreground hover:text-foreground font-medium no-underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {criticalAlerts.slice(0, 4).map((alert) => (
              <AlertCard key={`alert-${alert.id}`} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {/* Location & Nearest Zones */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            Nearest Safe Zones
          </h2>
          {!locationDetected && (
            <button
              onClick={detectLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MapPin className="w-3 h-3" />
              Detect Location
            </button>
          )}
        </div>

        {!locationDetected ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <MapPin className="w-8 h-8 text-muted-foreground/60 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              Enable location to see nearest safe zones
            </p>
            <p className="text-xs text-muted-foreground">
              Your location is used only to calculate distances and is not stored.
            </p>
          </div>
        ) : userLoc ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nearestPerDisaster
              .filter((d) => d.zone)
              .map((d) => (
                <div
                  key={`nearest-${d.type}`}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{d.meta.icon}</span>
                    <span className="text-xs font-medium text-foreground">
                      {d.type}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">
                    {d.zone!.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-2">
                    {d.zone!.type} · {d.zone!.location}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {formatDistance(d.zone!.distance)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openGoogleMapsNavigation(d.zone!.latitude, d.zone!.longitude)}
                        className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      >
                        Navigate <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {locationError || "Location unavailable. Please check your browser settings."}
            </p>
            {locationError && (
              <button
                onClick={detectLocation}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground font-medium"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </section>

      {/* Quick Access */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Quick Access
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickLink
            to="/alerts"
            icon={AlertTriangle}
            label="All Alerts"
            sub="View all active disaster alerts"
          />
          <QuickLink
            to="/safe-zones"
            icon={MapPin}
            label="Safe Zones"
            sub="Find shelters and evacuation routes"
          />
          <QuickLink
            to="/guides"
            icon={BookOpen}
            label="Safety Guides"
            sub="Before, during, and after instructions"
          />
          <QuickLink
            to="/helplines"
            icon={Phone}
            label="Emergency Helplines"
            sub="Tap to call on mobile"
          />
        </div>
      </section>

      {/* Latest Alerts */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            Recent Alerts
          </h2>
          <Link
            to="/alerts"
            className="text-xs text-muted-foreground hover:text-foreground font-medium no-underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.slice(0, 3).map((alert) => (
            <AlertCard key={`dash-alert-${alert.id}`} alert={alert} compact />
          ))}
        </div>
      </section>

      {/* Safety reminder */}
      <section className="mb-10">
        <div className="bg-primary text-primary-foreground rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Shield className="w-8 h-8 text-white/60 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">
              Emergency preparedness reminder
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keep your phone charged. Know your nearest safe zone. Save
              emergency numbers. Follow official instructions. Stay calm and
              help those around you.
            </p>
          </div>
          <Link
            to="/guides"
            className="text-xs font-medium text-white border border-white/20 px-3 py-1.5 rounded-lg hover:bg-card/5 transition-colors no-underline flex-shrink-0"
          >
            Read Guides
          </Link>
        </div>
      </section>
    </div>
  );
}

function DashStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground leading-none">
            {value}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
  sub,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  sub: string;
}) {
  return (
    <Link
      to={to}
      className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/50 transition-colors no-underline group"
    >
      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary transition-colors flex-shrink-0">
        <Icon
          className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors"
          strokeWidth={1.8}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
      </div>
      <ArrowRight className="w-3 h-3 text-muted-foreground/60 group-hover:text-muted-foreground flex-shrink-0" />
    </Link>
  );
}
