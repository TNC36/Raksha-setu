/**
 * Open-Meteo Weather Service
 * Fetches real-time weather conditions and severe weather warnings.
 * No API key required.
 *
 * Used to generate weather-based disaster alerts (heavy rain, extreme heat, storms).
 */

import { Alert } from "../data/alerts";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

export interface WeatherCondition {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  description: string;
  isSevere: boolean;
}

const WMO_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function getWeatherDescription(code: number): string {
  return WMO_CODES[code] || `Weather code ${code}`;
}

/**
 * Fetch current weather conditions for a location.
 */
export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherCondition> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,wind_speed_10m,precipitation,weather_code",
    timezone: "Asia/Kolkata",
  });

  try {
    const res = await fetch(`${OPEN_METEO_BASE}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Open-Meteo returned ${res.status}`);

    const data = await res.json();
    const current = data.current;

    const weatherCode = current.weather_code ?? 0;
    const precipitation = current.precipitation ?? 0;
    const windSpeed = current.wind_speed_10m ?? 0;
    const temperature = current.temperature_2m ?? 0;

    // Determine if weather is severe
    const isSevere =
      weatherCode >= 95 || // Thunderstorm
      precipitation > 20 || // Heavy rain (mm/hr)
      windSpeed > 60 || // Strong winds (km/h)
      temperature > 45 || // Extreme heat
      temperature < -5; // Extreme cold

    return {
      temperature,
      windSpeed,
      precipitation,
      weatherCode,
      description: getWeatherDescription(weatherCode),
      isSevere,
    };
  } catch (err) {
    console.error("[Weather] Failed to fetch weather:", err);
    return {
      temperature: 0,
      windSpeed: 0,
      precipitation: 0,
      weatherCode: 0,
      description: "Weather data unavailable",
      isSevere: false,
    };
  }
}

/**
 * Generate weather-based disaster alerts from current conditions.
 */
export async function fetchWeatherAlerts(
  lat: number,
  lon: number
): Promise<Alert[]> {
  const weather = await fetchWeather(lat, lon);
  const alerts: Alert[] = [];

  if (weather.weatherCode >= 95) {
    alerts.push({
      id: `weather-thunder-${lat.toFixed(0)}-${lon.toFixed(0)}`,
      type: "Cyclone",
      severity: weather.weatherCode >= 96 ? "Critical" : "High",
      title: `${weather.description} in your area`,
      description: `Active thunderstorm detected near your location. Wind speed: ${weather.windSpeed} km/h. Seek shelter immediately.`,
      location: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
      latitude: lat,
      longitude: lon,
      createdAt: new Date().toISOString(),
      source: "Open-Meteo Weather Data",
      sourceUrl: "https://open-meteo.com",
      isLive: true,
    });
  }

  if (weather.precipitation > 15) {
    alerts.push({
      id: `weather-rain-${lat.toFixed(0)}-${lon.toFixed(0)}`,
      type: "Flood",
      severity: weather.precipitation > 30 ? "Critical" : "High",
      title: `Heavy rainfall warning: ${weather.precipitation} mm/hr`,
      description: `Very heavy rainfall detected. Precipitation rate: ${weather.precipitation} mm/hr. Risk of flooding in low-lying areas. Avoid waterlogged roads.`,
      location: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
      latitude: lat,
      longitude: lon,
      createdAt: new Date().toISOString(),
      source: "Open-Meteo Weather Data",
      sourceUrl: "https://open-meteo.com",
      isLive: true,
    });
  }

  if (weather.windSpeed > 60) {
    alerts.push({
      id: `weather-wind-${lat.toFixed(0)}-${lon.toFixed(0)}`,
      type: "Cyclone",
      severity: weather.windSpeed > 90 ? "Critical" : "High",
      title: `Strong wind alert: ${weather.windSpeed} km/h`,
      description: `Dangerously high wind speeds detected. Secure loose objects and stay indoors.`,
      location: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
      latitude: lat,
      longitude: lon,
      createdAt: new Date().toISOString(),
      source: "Open-Meteo Weather Data",
      sourceUrl: "https://open-meteo.com",
      isLive: true,
    });
  }

  if (weather.temperature > 45) {
    alerts.push({
      id: `weather-heat-${lat.toFixed(0)}-${lon.toFixed(0)}`,
      type: "Flood", // using closest available type
      severity: "High",
      title: `Extreme heat warning: ${weather.temperature}°C`,
      description: `Dangerously high temperature: ${weather.temperature}°C. Stay hydrated, avoid outdoor exposure, and check on vulnerable individuals.`,
      location: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
      latitude: lat,
      longitude: lon,
      createdAt: new Date().toISOString(),
      source: "Open-Meteo Weather Data",
      sourceUrl: "https://open-meteo.com",
      isLive: true,
    });
  }

  return alerts;
}
