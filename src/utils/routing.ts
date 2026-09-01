export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export function openGoogleMapsNavigation(
  lat: number,
  lng: number,
): void {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  window.open(url, "_blank", "noopener,noreferrer");
}
