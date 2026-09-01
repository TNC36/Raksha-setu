import { DisasterType } from "./disasters";

export type AlertSeverity = "Low" | "Medium" | "High" | "Critical";

export interface Alert {
  id: string;
  type: DisasterType;
  severity: AlertSeverity;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  createdAt: string;
}

export const DEFAULT_ALERTS: Alert[] = [
  {
    id: "alert-1",
    type: "Flood",
    severity: "Critical",
    title: "Severe Waterlogging in Vadodara East",
    location: "Vadodara, Gujarat",
    latitude: 22.3100,
    longitude: 73.1900,
    description:
      "Heavy rainfall has caused severe waterlogging in eastern Vadodara. Residents are advised to move to higher ground immediately. Avoid low-lying areas and underpasses.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-2",
    type: "Flood",
    severity: "High",
    title: "Overflowing Vishwamitri River",
    location: "Vadodara, Gujarat",
    latitude: 22.3050,
    longitude: 73.1750,
    description:
      "Vishwamitri River is nearing danger mark. Evacuation recommended for riverside communities. Stay away from river banks.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-3",
    type: "Earthquake",
    severity: "High",
    title: "Magnitude 4.2 Earthquake Detected",
    location: "Vadodara, Gujarat",
    latitude: 22.3200,
    longitude: 73.1600,
    description:
      "A 4.2 magnitude earthquake was detected near Vadodara. Check buildings for structural damage. Move to open areas if aftershocks are felt.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-4",
    type: "Cyclone",
    severity: "Critical",
    title: "Cyclone Warning — Category 3",
    location: "Gujarat Coast",
    latitude: 22.2800,
    longitude: 73.2100,
    description:
      "A Category 3 cyclone is approaching the Gujarat coast. Seek shelter in cyclone-resistant buildings. Stay indoors and away from windows.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-5",
    type: "Wildfire",
    severity: "Medium",
    title: "Brush Fire Near outskirts",
    location: "Vadodara Outskirts",
    latitude: 22.3350,
    longitude: 73.2050,
    description:
      "A brush fire has been reported near the outskirts. Monitor air quality and keep windows closed. Avoid the area if possible.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-6",
    type: "Landslide",
    severity: "High",
    title: "Landslide Risk on Hill Road",
    location: "Vadodara Hills",
    latitude: 22.3400,
    longitude: 73.1500,
    description:
      "Heavy rainfall has destabilised slopes near hill road. Avoid travel on hilly routes. Move to stable evacuation areas if in the vicinity.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-7",
    type: "Conflict",
    severity: "Medium",
    title: "Civil Unrest Reported in Market Area",
    location: "Vadodara Market",
    latitude: 22.3072,
    longitude: 73.1812,
    description:
      "Civil unrest reported near central market. Avoid the area. Seek shelter in designated civilian shelters. Follow authority instructions.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "alert-8",
    type: "Flood",
    severity: "Low",
    title: "Minor Waterlogging Expected",
    location: "Vadodara West",
    latitude: 22.2950,
    longitude: 73.1600,
    description:
      "Moderate rainfall expected. Minor waterlogging possible in low-lying areas. Stay cautious and monitor updates.",
    createdAt: new Date().toISOString(),
  },
];
