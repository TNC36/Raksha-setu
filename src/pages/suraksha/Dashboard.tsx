import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
  loadAlerts,
  loadZones,
  loadGuides,
} from "../../utils/storage";
import { DISASTER_META } from "../../data/disasters";
import { formatDistance, findNearest } from "../../utils/distance";
import { openGoogleMapsNavigation } from "../../utils/routing";
import AlertCard from "../../components/suraksha/AlertCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
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

  const alerts = loadAlerts();
  const zones = loadZones();
  const guides = loadGuides();

  const criticalAlerts = alerts.filter(
    (a) => a.severity === "Critical" || a.severity === "High"
  );
  const availableZones = zones.filter((z) => z.status !== "Closed");

  // Find nearest safe zone for each disaster type
  const nearestPerDisaster = userLoc
    ? (["Flood", "Earthquake", "Cyclone", "Wildfire", "Landslide", "Conflict"] as const).map(
        (dt) => {
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
        }
      )
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
            <Shield className="w-5 h-5 text-neutral-600" />
            <h1 className="text-xl font-semibold text-neutral-900">
              Your Dashboard
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            {greeting}, {user.name}. Here is your emergency overview.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex-shrink-0"
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
              ? "bg-red-50 text-red-600"
              : "bg-neutral-100 text-neutral-600"
          }
        />
        <DashStat
          icon={AlertTriangle}
          label="Critical / High"
          value={criticalAlerts.length}
          accent={
            criticalAlerts.length > 0
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }
        />
        <DashStat
          icon={MapPin}
          label="Safe Zones"
          value={availableZones.length}
          accent="bg-neutral-100 text-neutral-600"
        />
        <DashStat
          icon={BookOpen}
          label="Safety Guides"
          value={guides.length}
          accent="bg-neutral-100 text-neutral-600"
        />
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Critical Alerts — Immediate Attention Required
            </h2>
            <Link
              to="/alerts"
              className="text-xs text-neutral-600 hover:text-neutral-900 font-medium no-underline flex items-center gap-1"
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
          <h2 className="text-sm font-semibold text-neutral-900">
            Nearest Safe Zones
          </h2>
          {!locationDetected && (
            <button
              onClick={detectLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <MapPin className="w-3 h-3" />
              Detect Location
            </button>
          )}
        </div>

        {!locationDetected ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
            <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 mb-1">
              Enable location to see nearest safe zones
            </p>
            <p className="text-xs text-neutral-400">
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
                  className="bg-white border border-neutral-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{d.meta.icon}</span>
                    <span className="text-xs font-medium text-neutral-700">
                      {d.type}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 mb-0.5">
                    {d.zone!.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 mb-2">
                    {d.zone!.type} · {d.zone!.location}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-900">
                      {formatDistance(d.zone!.distance)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openGoogleMapsNavigation(d.zone!.latitude, d.zone!.longitude)}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1"
                      >
                        Navigate <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 text-center">
            <p className="text-sm text-neutral-500">
              {locationError || "Location unavailable. Please check your browser settings."}
            </p>
            {locationError && (
              <button
                onClick={detectLocation}
                className="mt-3 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Try again
              </button>
            )}
          </div>
        )}
      </section>

      {/* Quick Access */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-900 mb-4">
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
          <h2 className="text-sm font-semibold text-neutral-900">
            Recent Alerts
          </h2>
          <Link
            to="/alerts"
            className="text-xs text-neutral-600 hover:text-neutral-900 font-medium no-underline flex items-center gap-1"
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
        <div className="bg-neutral-950 text-white rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Shield className="w-8 h-8 text-white/60 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">
              Emergency preparedness reminder
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Keep your phone charged. Know your nearest safe zone. Save
              emergency numbers. Follow official instructions. Stay calm and
              help those around you.
            </p>
          </div>
          <Link
            to="/guides"
            className="text-xs font-medium text-white border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors no-underline flex-shrink-0"
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
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-lg font-semibold text-neutral-900 leading-none">
            {value}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{label}</p>
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
      className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3 hover:border-neutral-300 transition-colors no-underline group"
    >
      <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-neutral-900 transition-colors flex-shrink-0">
        <Icon
          className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors"
          strokeWidth={1.8}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-neutral-900">{label}</p>
        <p className="text-[10px] text-neutral-400 truncate">{sub}</p>
      </div>
      <ArrowRight className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 flex-shrink-0" />
    </Link>
  );
}
