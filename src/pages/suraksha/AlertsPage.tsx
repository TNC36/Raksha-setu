import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useTranslation } from "react-i18next";
import { api } from "../../convex/_generated/api";
import { DISASTER_TYPES, DISASTER_META, DisasterType } from "../../data/disasters";
import { Alert } from "../../data/alerts";
import AlertCard from "../../components/suraksha/AlertCard";
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { fetchEarthquakes } from "../../services/earthquake";
import { fetchDisasterAlerts } from "../../services/disasters";

export default function AlertsPage() {
  const { t } = useTranslation();
  const convexAlerts = useQuery(api.alerts.list);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DisasterType | "All">("All");

  const dbAlerts: Alert[] = (convexAlerts || []).map((a) => ({
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

  const allAlerts: Alert[] = [...liveAlerts, ...dbAlerts];

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
    const order: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    const sevDiff = (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    if (sevDiff !== 0) return sevDiff;
    return bTime - aTime;
  });

  async function refreshLiveData() {
    setLoading(true);
    try {
      const earthquakes = await fetchEarthquakes({ minMagnitude: 3.0, limit: 30 });
      const disasters = await fetchDisasterAlerts();
      setLiveAlerts([...earthquakes, ...disasters]);
      setLastSync(new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }));
    } catch (err) {
      console.error("Failed to refresh live alerts:", err);
    }
    setLoading(false);
  }

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

  const liveCount = liveAlerts.filter((a) => a.isLive).length;
  const dbCount = dbAlerts.length;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold text-foreground">
              {t("alerts.title")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("alerts.subtitle")}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {t("alerts.dataSource")}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-[10px] text-right">
            {lastSync && (
              <p className="text-muted-foreground">{t("alerts.lastSync")}: {lastSync}</p>
            )}
            <p className="text-muted-foreground font-medium">
              {liveCount > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-success" />
                  {liveCount} {t("alerts.liveAlerts")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  {t("alerts.demoOnly")}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={refreshLiveData}
            disabled={loading}
            className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50"
            title={t("alerts.refresh")}
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedType("All")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            selectedType === "All"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/50"
          }`}
        >
          {t("alerts.all")}
        </button>
        {DISASTER_TYPES.map((dt) => {
          const meta = DISASTER_META[dt];
          return (
            <button
              key={dt}
              onClick={() => setSelectedType(dt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                selectedType === dt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {meta.icon} {dt}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {sorted.length} alert{sorted.length !== 1 ? "s" : ""} found
        {liveCount > 0 && ` (${liveCount} ${t("alerts.liveAlerts")})`}
        {dbCount > 0 && ` (${dbCount} ${t("alerts.demoOnly")})`}
      </p>

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-sm">
            {convexAlerts === undefined ? t("common.loading") : t("alerts.noAlerts")}
          </p>
          <button
            onClick={refreshLiveData}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            {t("alerts.refresh")}
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
