import { Alert, AlertSeverity } from "../../data/alerts";
import { DISASTER_META } from "../../data/disasters";
import ReadAloud from "./ReadAloud";
import { MapPin, Clock } from "lucide-react";

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  Low: "bg-neutral-100 text-neutral-600",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  High: "bg-orange-50 text-orange-700 border border-orange-200",
  Critical: "bg-red-50 text-red-700 border border-red-200",
};

interface AlertCardProps {
  alert: Alert;
  compact?: boolean;
}

export default function AlertCard({ alert, compact }: AlertCardProps) {
  const meta = DISASTER_META[alert.type];

  return (
    <article className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
              style={{ backgroundColor: meta.color + "10", color: meta.color }}
            >
              {meta.icon} {alert.type}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLES[alert.severity]}`}
            >
              {alert.severity}
            </span>
          </div>
          <ReadAloud
            text={`${alert.title}. ${alert.description}`}
            label=""
          />
        </div>

        <h3 className="text-sm font-semibold text-neutral-900 mb-1">
          {alert.title}
        </h3>

        {!compact && (
          <p className="text-xs text-neutral-500 leading-relaxed mb-3">
            {alert.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {alert.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(alert.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Severity accent line */}
      <div
        className="h-0.5"
        style={{ backgroundColor: meta.color }}
      />
    </article>
  );
}
