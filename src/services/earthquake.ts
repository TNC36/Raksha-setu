/**
 * USGS Earthquake API Service
 * Fetches real-time earthquake data from https://earthquake.usgs.gov
 * No API key required.
 */

import { Alert, AlertSeverity } from "../types/services";

const USGS_BASE = "https://earthquake.usgs.gov/fdsnws/event/1/query";

function magnitudeToSeverity(mag: number): AlertSeverity {
  if (mag >= 7) return "Critical";
  if (mag >= 5.5) return "High";
  if (mag >= 4) return "Medium";
  return "Low";
}



export interface USGSFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string;
    time: number;
    updated: number;
    status: string | null;
    tsunami: number;
    title: string;
    type: string;
    url: string;
  };
  geometry: {
    coordinates: [number, number, number]; // [lon, lat, depth]
  };
}

export interface USGSResponse {
  type: string;
  metadata: {
    generated: number;
    title: string;
    count: number;
  };
  features: USGSFeature[];
}

/**
 * Fetch recent earthquakes near a bounding box.
 * Default: India region (6°N to 38°N, 68°E to 98°E)
 */
export async function fetchEarthquakes(opts?: {
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  startTime?: string;
  minMagnitude?: number;
  limit?: number;
}): Promise<Alert[]> {
  const params = new URLSearchParams({
    format: "geojson",
    starttime: opts?.startTime || getDaysAgo(7),
    minlatitude: String(opts?.minLatitude ?? 6),
    maxlatitude: String(opts?.maxLatitude ?? 38),
    minlongitude: String(opts?.minLongitude ?? 68),
    maxlongitude: String(opts?.maxLongitude ?? 98),
    minmagnitude: String(opts?.minMagnitude ?? 2.5),
    orderby: "time",
    limit: String(opts?.limit ?? 50),
  });

  try {
    const res = await fetch(`${USGS_BASE}?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`USGS API returned ${res.status}`);
    }

    const data: USGSResponse = await res.json();

    return (data.features || []).map((feature) => {
      const { properties, geometry } = feature;
      const mag = properties.mag ?? 0;
      const [lon, lat, depth] = geometry.coordinates;

      return {
        id: `usgs-${feature.id}`,
        type: "Earthquake" as const,
        severity: magnitudeToSeverity(mag),
        title: properties.title || `M${mag} earthquake`,
        description:
          `${properties.place || "Location unknown"}. ` +
          `Magnitude: ${mag.toFixed(1)}. Depth: ${depth.toFixed(1)} km. ` +
          `Tsunami: ${properties.tsunami ? "Warning" : "None"}. ` +
          `Source: USGS Earthquake Hazards Program.`,
        location: properties.place || "Unknown location",
        latitude: lat,
        longitude: lon,
        createdAt: new Date(properties.time).toISOString(),
        source: "USGS Earthquake Hazards Program",
        sourceUrl: properties.url || "https://earthquake.usgs.gov",
        isLive: true,
      };
    });
  } catch (err) {
    console.error("[USGS] Failed to fetch earthquakes:", err);
    return [];
  }
}

function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
