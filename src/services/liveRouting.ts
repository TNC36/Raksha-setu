/**
 * OSRM (Open Source Routing Machine) Service
 * Provides road-network routing with proper polylines.
 * Uses the public OSRM demo server.
 *
 * For production, self-host an OSRM instance or use a commercial routing API.
 */

export interface RouteResult {
  /** Array of [lat, lng] pairs forming the route polyline */
  polyline: [number, number][];
  /** Total route distance in meters */
  distanceMeters: number;
  /** Estimated travel time in seconds */
  durationSeconds: number;
  /** Distance formatted for display */
  distanceFormatted: string;
  /** Duration formatted for display */
  durationFormatted: string;
  /** Number of route steps (turn-by-turn) */
  steps: number;
  /** Source (for transparency) */
  source: string;
}

const OSRM_BASE = "https://router.project-osrm.org";

/**
 * Get a road-network route between two points.
 * Returns a polyline that follows actual roads.
 *
 * @param fromLat - Origin latitude
 * @param fromLng - Origin longitude
 * @param toLat - Destination latitude
 * @param toLng - Destination longitude
 */
export async function fetchRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteResult | null> {
  // OSRM uses lon,lat order
  const coords = `${fromLng},${fromLat};${toLng},${toLat}`;
  const params = new URLSearchParams({
    geometries: "geojson",
    overview: "full",
    steps: "true",
    annotations: "true",
  });

  const url = `${OSRM_BASE}/route/v1/driving/${coords}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`OSRM API returned ${res.status}`);
    }

    const data = await res.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      console.warn("[OSRM] No route found:", data.code);
      return null;
    }

    const route = data.routes[0];
    // GeoJSON coordinates are [lon, lat], convert to [lat, lng] for Leaflet
    const coordsArray = route.geometry?.coordinates || [];
    const polyline: [number, number][] = coordsArray.map(
      (c: [number, number]) => [c[1], c[0]]
    );

    const distanceMeters = route.distance || 0;
    const durationSeconds = route.duration || 0;

    return {
      polyline,
      distanceMeters,
      durationSeconds,
      distanceFormatted: formatOSRMDistance(distanceMeters),
      durationFormatted: formatOSRMDuration(durationSeconds),
      steps: route.legs?.reduce(
        (acc: number, leg: { steps?: unknown[] }) =>
          acc + (leg.steps?.length || 0),
        0
      ) || 0,
      source: "OSRM (Open Source Routing Machine)",
    };
  } catch (err) {
    console.error("[OSRM] Routing failed:", err);
    return null;
  }
}

/**
 * Get routes from user location to multiple destinations.
 * Returns routes sorted by travel time.
 */
export async function fetchRoutesToMultiple(
  fromLat: number,
  fromLng: number,
  destinations: { lat: number; lng: number; name: string }[]
): Promise<
  (RouteResult & { destinationName: string })[]
> {
  const results = await Promise.allSettled(
    destinations.map(async (dest) => {
      const route = await fetchRoute(fromLat, fromLng, dest.lat, dest.lng);
      return { ...route, destinationName: dest.name };
    })
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<RouteResult & { destinationName: string }> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value)
    .sort((a, b) => a.durationSeconds - b.durationSeconds);
}

function formatOSRMDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatOSRMDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}
