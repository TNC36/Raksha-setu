import { DISASTER_META } from "../../data/disasters";
import ReadAloud from "./ReadAloud";
import { MapPin, Clock } from "lucide-react";

type AlertSeverity = "Low" | "Medium" | "High" | "Critical";
type DisasterType = "Flood" | "Earthquake" | "Cyclone" | "Wildfire" | "Landslide" | "Conflict";
type DataMode = "live" | "demo";

export interface ConvexAlert {
  _id: string;
  type: DisasterType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  source: string;
  sourceUrl?: string;
  issuedAt: number;
  updatedAt: number;
  mode: DataMode;
  verified: boolean;
  status: string;
}

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  Low: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  High: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
  Critical: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
};

interface AlertCardProps {
  alert: ConvexAlert;
  compact?: boolean;
}

export default function AlertCard({ alert, compact }: AlertCardProps) {
  const meta = DISASTER_META[alert.type];

  return (
    <article className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-300 transition-colors dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700">
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
            {alert.mode === "demo" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-400">
                DEMO
              </span>
            )}
            {alert.mode === "live" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <ReadAloud
            text={`${alert.title}. ${alert.description}`}
            label=""
          />
        </div>

        <h3 className="text-sm font-semibold text-neutral-900 mb-1 dark:text-neutral-100">
          {alert.title}
        </h3>

        {!compact && (
          <p className="text-xs text-neutral-500 leading-relaxed mb-3 dark:text-neutral-400">
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
            {new Date(alert.issuedAt).toLocaleDateString()}
          </span>
        </div>

        {(alert.source || alert.verified) && (
          <div className="flex items-center gap-2 mt-2">
            {alert.source && (
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                Source: {alert.source}
              </span>
            )}
            {alert.sourceUrl && (
              <a
                href={alert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-500 hover:text-blue-700 underline"
              >
                View Source
              </a>
            )}
          </div>
        )}
      </div>

      {/* Severity accent line */}
      <div
        className="h-0.5"
        style={{ backgroundColor: meta.color }}
      />
    </article>
  );
}
