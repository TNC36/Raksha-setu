import { useState, useEffect } from "react";
import { loadAlerts } from "../../utils/storage";
import { DISASTER_TYPES, DISASTER_META, DisasterType } from "../../data/disasters";
import { Alert } from "../../data/alerts";
import AlertCard from "../../components/suraksha/AlertCard";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { fetchEarthquakes } from "../../services/earthquake";
import { fetchDisasterAlerts } from "../../services/disasters";

export default function AlertsPage() {
  const demoAlerts = loadAlerts();
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DisasterType | "All">("All");

  // All alerts: live first, then demo
  const allAlerts: Alert[] = [...liveAlerts, ...demoAlerts];

  // Deduplicate by ID
  const seen = new Set<string>();
  const uniqueAlerts = allAlerts.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  const filtered =
    selectedType === "All"
      ? uniqueAlerts
      : uniqueAlerts.filter((a) => a.type === selectedType);

  const sorted = [...filtered].sort((a, b) => {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    const sevDiff = (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    if (sevDiff !== 0) return sevDiff;
    return bTime - aTime; // most recent first
  });

  async function refreshLiveData() {
    setLoading(true);
    try {
      // Fetch USGS earthquakes (worldwide, recent 7 days)
      const earthquakes = await fetchEarthquakes({
        minMagnitude: 3.0,
        limit: 30,
      });

      // Fetch ReliefWeb disaster alerts
      const disasters = await fetchDisasterAlerts();

      // Combine
      const combined = [...earthquakes, ...disasters];

      setLiveAlerts(combined);
      setLastSync(new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }));
    } catch (err) {
      console.error("Failed to refresh live alerts:", err);
    }
    setLoading(false);
  }

  // Auto-fetch on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const earthquakes = await fetchEarthquakes({ minMagnitude: 3.0, limit: 30 });
        const disasters = await fetchDisasterAlerts();
        if (!cancelled) {
          setLiveAlerts([...earthquakes, ...disasters]);
          setLastSync(new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }));
        }
      } catch (err) {
        console.error("Failed to refresh live alerts:", err);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const liveCount = liveAlerts.length;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-neutral-600" />
            <h1 className="text-xl font-semibold text-neutral-900">
              Emergency Alerts
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            Real-time disaster alerts from USGS, ReliefWeb (UN OCHA), and weather services — plus platform demo alerts.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Status indicator */}
          <div className="text-[10px] text-right">
            {lastSync && (
              <p className="text-neutral-400">Last sync: {lastSync}</p>
            )}
            <p className="text-neutral-500 font-medium">
              {liveCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-green-500" />
                  {liveCount} live alert{liveCount !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Demo only
                </span>
              )}
            </p>
          </div>
          {/* Refresh button */}
          <button
            onClick={refreshLiveData}
            disabled={loading}
            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            title="Refresh live alerts"
          >
            <RefreshCw
              className={`w-4 h-4 text-neutral-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedType("All")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            selectedType === "All"
              ? "bg-neutral-900 text-white border-neutral-900"
              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
          }`}
        >
          All
        </button>
        {DISASTER_TYPES.map((dt) => {
          const meta = DISASTER_META[dt];
          return (
            <button
              key={dt}
              onClick={() => setSelectedType(dt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedType === dt
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
              }`}
            >
              {meta.icon} {dt}
            </button>
          );
        })}
      </div>

      {/* Alert count */}
      <p className="text-xs text-neutral-400 mb-4">
        {sorted.length} alert{sorted.length !== 1 ? "s" : ""} found
        {liveCount > 0 && ` (${liveCount} from live sources)`}
      </p>

      {/* Data source legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-[10px] text-neutral-400">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> LIVE = real-time external API data
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-neutral-300" /> No badge = demo/simulation data
        </span>
      </div>

      {/* Alerts list */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-sm">No alerts for this disaster type.</p>
          <button
            onClick={refreshLiveData}
            className="mt-3 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
          >
            Refresh live data
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((alert) => (
            <AlertCard key={`alert-${alert.id}`} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
