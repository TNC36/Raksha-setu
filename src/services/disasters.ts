/**
 * ReliefWeb API Service
 * Fetches real-time disaster data from UN OCHA ReliefWeb.
 * No API key required.
 */

import { Alert, AlertSeverity } from "../data/alerts";

const RELIEFWEB_BASE = "https://api.reliefweb.int/v1/disasters";

// Map ReliefWeb status/type to our disaster types
function mapDisasterType(rwType: string): string {
  const lower = rwType.toLowerCase();
  if (lower.includes("flood")) return "Flood";
  if (lower.includes("earthquake")) return "Earthquake";
  if (lower.includes("cyclone") || lower.includes("typhoon") || lower.includes("hurricane") || lower.includes("storm")) return "Cyclone";
  if (lower.includes("wildfire") || lower.includes("fire")) return "Wildfire";
  if (lower.includes("landslide")) return "Landslide";
  if (lower.includes("conflict") || lower.includes("war") || lower.includes("violence")) return "Conflict";
  // Default: map to the closest type
  if (lower.includes("drought")) return "Flood"; // closest proxy
  if (lower.includes("heat") || lower.includes("cold") || lower.includes("wave")) return "Cyclone";
  return "Flood"; // fallback
}

function mapSeverity(status: string): AlertSeverity {
  const lower = status?.toLowerCase() || "";
  if (lower === "alert") return "Critical";
  if (lower === "emergency") return "Critical";
  if (lower === "current") return "High";
  if (lower === "recently closed") return "Medium";
  return "Low";
}

interface ReliefWebDisaster {
  id: number;
  fields: {
    name: string;
    status: string;
    type: { name: string }[];
    country?: { name: string }[];
    date: {
      created: number;
      event: number;
    };
    url: string;
    description?: string;
  };
}

interface ReliefWebResponse {
  data: ReliefWebDisaster[];
  links: { next?: string };
}



export async function fetchDisasterAlerts(): Promise<Alert[]> {
  try {
    const params = new URLSearchParams({
      "app[name]": "RakshaSetu",
      "app[version]": "1.0",
      "filter[field]": "status",
      "filter[value]": "current",
      "filter[negate]": "false",
      "limit": "30",
      "sort[]": "date:desc",
      "fields[disasters]": "name,status,type,country,date,url,description",
    });

    const res = await fetch(`${RELIEFWEB_BASE}?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`ReliefWeb API returned ${res.status}`);
    }

    const data: ReliefWebResponse = await res.json();

    const alerts: Alert[] = [];

    for (const disaster of (data.data || []).slice(0, 30)) {
      const { fields } = disaster;
      const primaryType = fields.type?.[0]?.name || "Other";
      const countries = fields.country?.map((c) => c.name).join(", ") || "Unknown region";

      // Only include India/South Asia relevant disasters + global
      // (we show all but mark region clearly)
      const disType = mapDisasterType(primaryType);

      alerts.push({
        id: `rw-${disaster.id}`,
        type: disType as Alert["type"],
        severity: mapSeverity(fields.status),
        title: fields.name || primaryType,
        description:
          (fields.description?.substring(0, 200) || fields.name || primaryType) +
          ` [Source: ReliefWeb / UN OCHA]`,
        location: countries,
        latitude: 22.3072, // approximate center (will be overridden by map center)
        longitude: 73.1812,
        createdAt: fields.date?.created
          ? new Date(fields.date.created).toISOString()
          : new Date().toISOString(),
        source: `ReliefWeb (${primaryType})`,
        sourceUrl: fields.url || "https://reliefweb.int",
        isLive: true,
      });
    }

    return alerts;
  } catch (err) {
    console.error("[ReliefWeb] Failed to fetch disaster alerts:", err);
    return [];
  }
}
