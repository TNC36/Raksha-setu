import { useState } from "react";
import { loadAlerts } from "../../utils/storage";
import { DISASTER_TYPES, DISASTER_META, DisasterType } from "../../data/disasters";
import AlertCard from "../../components/suraksha/AlertCard";
import { AlertTriangle } from "lucide-react";

export default function AlertsPage() {
  const alerts = loadAlerts();
  const [selectedType, setSelectedType] = useState<DisasterType | "All">("All");

  const filtered =
    selectedType === "All"
      ? alerts
      : alerts.filter((a) => a.type === selectedType);

  const sorted = [...filtered].sort((a, b) => {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
  });

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-neutral-600" />
          <h1 className="text-xl font-semibold text-neutral-900">
            Emergency Alerts
          </h1>
        </div>
        <p className="text-sm text-neutral-500">
          Current disaster alerts. Demo data — replace with verified authority
          data before production.
        </p>
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
      </p>

      {/* Alerts list */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-sm">No alerts for this disaster type.</p>
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
