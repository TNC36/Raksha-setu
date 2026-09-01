/**
 * OpenStreetMap Overpass API Service
 * Fetches real hospitals, police stations, and fire stations
 * from OpenStreetMap data via the Overpass API.
 * No API key required.
 */

import { Facility, FacilityType } from "../types/services";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const OVERPASS_TAGS: Record<FacilityType, string> = {
  Hospital: "amenity=hospital",
  Police: "amenity=police",
  "Fire Station": "amenity=fire_station",
};

const OVERPASS_LABELS: Record<FacilityType, string> = {
  Hospital: "Hospital",
  Police: "Police Station",
  "Fire Station": "Fire Station",
};

interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

/**
 * Fetch real facilities from OpenStreetMap via Overpass API.
 *
 * @param bbox - Bounding box: [south, west, north, east]
 * @param types - Which facility types to fetch
 * @param limit - Max results per type
 */
export async function fetchLiveFacilities(
  bbox: [number, number, number, number] = [6, 68, 38, 98], // India
  types: FacilityType[] = ["Hospital", "Police", "Fire Station"],
  limit = 30
): Promise<Facility[]> {
  const [south, west, north, east] = bbox;
  const bBox = `${south},${west},${north},${east}`;

  const typeFilters = types
    .map((t) => `node["${OVERPASS_TAGS[t]}"](${bBox});`)
    .join("\n");

  const query = `
[out:json][timeout:15];
(
  ${typeFilters}
);
out body ${limit};
`;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`Overpass API returned ${res.status}`);
    }

    const data: OverpassResponse = await res.json();
    const facilities: Facility[] = [];

    for (const element of data.elements || []) {
      // Determine facility type from tags
      let fType: FacilityType = "Hospital";
      if (element.tags?.["amenity"] === "police") fType = "Police";
      else if (element.tags?.["amenity"] === "fire_station") fType = "Fire Station";

      const name =
        element.tags?.["name:en"] ||
        element.tags?.["name"] ||
        element.tags?.["name:hi"] ||
        `${OVERPASS_LABELS[fType]} #${element.id}`;

      facilities.push({
        id: `osm-${element.id}`,
        type: fType,
        name,
        latitude: element.lat,
        longitude: element.lon,
      });
    }

    return facilities;
  } catch (err) {
    console.error("[Overpass] Failed to fetch facilities:", err);
    return [];
  }
}

/**
 * Fetch facilities near a specific point (within ~25 km radius).
 * Uses a bounding box around the point.
 */
export async function fetchNearbyFacilities(
  lat: number,
  lon: number,
  radiusKm = 25,
  types: FacilityType[] = ["Hospital", "Police", "Fire Station"]
): Promise<Facility[]> {
  const delta = radiusKm / 111; // ~1 degree ≈ 111 km
  const bbox: [number, number, number, number] = [
    lat - delta,
    lon - delta,
    lat + delta,
    lon + delta,
  ];
  return fetchLiveFacilities(bbox, types, 50);
}
