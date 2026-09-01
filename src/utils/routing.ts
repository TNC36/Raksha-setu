export interface RoutePoint {
  latitude: number;
  longitude: number;
}

/**
 * Generate a demo evacuation route between two points.
 * Adds intermediate waypoints to simulate a road-path.
 * For production, replace with a real routing engine (OSRM, GraphHopper, etc.).
 */
export function generateDemoRoute(
  from: RoutePoint,
  to: RoutePoint
): RoutePoint[] {
  const midLat1 = from.latitude + (to.latitude - from.latitude) * 0.3 + 0.003;
  const midLon1 = from.longitude + (to.longitude - from.longitude) * 0.1;
  const midLat2 = from.latitude + (to.latitude - from.latitude) * 0.7 - 0.002;
  const midLon2 = from.longitude + (to.longitude - from.longitude) * 0.6 + 0.002;

  return [
    from,
    { latitude: midLat1, longitude: midLon1 },
    { latitude: midLat2, longitude: midLon2 },
    to,
  ];
}

/**
 * Open Google Maps directions in a new tab.
 */
export function openGoogleMapsNavigation(
  toLat: number,
  toLon: number
): void {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${toLat},${toLon}&travelmode=driving`;
  window.open(url, "_blank", "noopener,noreferrer");
}
