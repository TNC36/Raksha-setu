/**
 * Hazard-Aware Routing Engine for Raksha Setu
 *
 * Checks whether a proposed route intersects active danger zones.
 * If it does, tries waypoint-based alternatives to avoid hazard areas.
 */

export interface HazardZone {
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: string;
  severity: string;
}

export interface HazardCheckResult {
  /** Whether the route is safe (no hazard intersections) */
  safe: boolean;
  /** Number of hazard zones the route intersects */
  intersections: number;
  /** Details of intersected hazard zones */
  hazards: Array<{
    type: string;
    severity: string;
    latitude: number;
    longitude: number;
  }>;
  /** Safety label */
  safetyLabel: "SAFE" | "CAUTION" | "UNSAFE";
  /** Human-readable explanation */
  explanation: string;
}

/**
 * Haversine distance between two points in meters.
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate shortest distance from a point to a line segment.
 */
function pointToSegmentDistance(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return haversineDistance(px, py, ax, ay);

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * dx;
  const projY = ay + t * dy;

  return haversineDistance(px, py, projX, projY);
}

/**
 * Check if a polyline segment intersects a hazard circle.
 * Uses point-to-segment distance approximation.
 */
function segmentIntersectsHazard(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  hazard: HazardZone
): boolean {
  // Convert meters to approximate degrees for the check
  const dist = pointToSegmentDistance(
    hazard.latitude, hazard.longitude,
    lat1, lon1, lat2, lon2
  );
  return dist <= hazard.radius;
}

/**
 * Check a polyline (array of [lat, lng]) against a list of hazard zones.
 */
export function checkRouteHazards(
  polyline: [number, number][],
  hazards: HazardZone[]
): HazardCheckResult {
  const intersections: HazardCheckResult["hazards"] = [];

  for (const hazard of hazards) {
    // Check each segment of the polyline
    for (let i = 0; i < polyline.length - 1; i++) {
      const [lat1, lon1] = polyline[i];
      const [lat2, lon2] = polyline[i + 1];

      if (segmentIntersectsHazard(lat1, lon1, lat2, lon2, hazard)) {
        intersections.push({
          type: hazard.type,
          severity: hazard.severity,
          latitude: hazard.latitude,
          longitude: hazard.longitude,
        });
        break; // Only count each hazard once
      }
    }
  }

  const count = intersections.length;
  const criticalCount = intersections.filter(
    (h) => h.severity === "Critical" || h.severity === "High"
  ).length;

  let safetyLabel: HazardCheckResult["safetyLabel"];
  let explanation: string;

  if (count === 0) {
    safetyLabel = "SAFE";
    explanation = "This route does not appear to intersect any known hazard zones.";
  } else if (criticalCount > 0) {
    safetyLabel = "UNSAFE";
    explanation = `This route intersects ${count} hazard zone(s), including ${criticalCount} critical/high severity zone(s). Consider an alternate route.`;
  } else {
    safetyLabel = "CAUTION";
    explanation = `This route intersects ${count} low/moderate hazard zone(s). Route safety cannot be fully verified with current data.`;
  }

  return {
    safe: count === 0,
    intersections: count,
    hazards: intersections,
    safetyLabel,
    explanation,
  };
}

/**
 * Calculate a detour waypoint to avoid a hazard.
 * Pushes the route point perpendicular to the hazard center.
 */
export function calculateDetourWaypoint(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  hazardLat: number, hazardLng: number,
  hazardRadius: number
): [number, number] {
  // Midpoint of the route
  const midLat = (fromLat + toLat) / 2;
  const midLng = (fromLng + toLng) / 2;

  // Direction from hazard to midpoint
  const dirLat = midLat - hazardLat;
  const dirLng = midLng - hazardLng;
  const len = Math.sqrt(dirLat * dirLat + dirLng * dirLng) || 1;

  // Push away from hazard by radius + buffer
  const bufferDeg = (hazardRadius * 2) / 111000; // ~2x radius in degrees

  return [
    hazardLat + (dirLat / len) * bufferDeg,
    hazardLng + (dirLng / len) * bufferDeg,
  ];
}
