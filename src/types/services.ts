/**
 * Shared types for external API services (USGS, ReliefWeb, Open-Meteo, Overpass).
 * These are NOT the same as Convex database types — they represent raw API responses
 * that get transformed into Convex-compatible formats before storage.
 */

export type DisasterType = "Flood" | "Earthquake" | "Cyclone" | "Wildfire" | "Landslide" | "Conflict";
export type AlertSeverity = "Low" | "Medium" | "High" | "Critical";
export type FacilityType = "Hospital" | "Police" | "Fire Station" | "Shelter" | "Other";
export type DataMode = "live" | "demo";

export interface Alert {
  id: string;
  type: DisasterType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  source: string;
  sourceUrl?: string;
  isLive?: boolean;
  createdAt: string;
}

export interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  latitude: number;
  longitude: number;
  phone?: string;
}
