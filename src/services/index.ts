/**
 * Live Data Services
 *
 * All services fetch from free, public APIs with no API key required.
 * - USGS Earthquake API: https://earthquake.usgs.gov
 * - ReliefWeb (UN OCHA): https://reliefweb.int
 * - Open-Meteo Weather: https://open-meteo.com
 * - OpenStreetMap Overpass: https://overpass-api.de
 * - OSRM Routing: https://router.project-osrm.org
 *
 * All services fail gracefully — if an API is unavailable,
 * the app falls back to demo data.
 */

export { fetchEarthquakes } from "./earthquake";
export { fetchDisasterAlerts } from "./disasters";
export { fetchLiveFacilities, fetchNearbyFacilities } from "./liveFacilities";
export { fetchRoute, fetchRoutesToMultiple } from "./liveRouting";
export { fetchWeather, fetchWeatherAlerts } from "./weather";

export interface ConnectionStatus {
  liveAlerts: boolean;
  liveFacilities: boolean;
  liveWeather: boolean;
  liveRouting: boolean;
  lastSync: string | null;
  errors: string[];
}
