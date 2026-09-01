import { DisasterType } from "./disasters";

export type ZoneStatus = "Available" | "Limited" | "Full" | "Closed";

export interface SafeZone {
  id: string;
  name: string;
  type: string;
  disasterTypes: DisasterType[];
  latitude: number;
  longitude: number;
  location: string;
  capacity: number;
  status: ZoneStatus;
}

export const DEFAULT_ZONES: SafeZone[] = [
  {
    id: "zone-1",
    name: "Vadodara Municipal School Shelter",
    type: "High-ground shelter",
    disasterTypes: ["Flood"],
    latitude: 22.3120,
    longitude: 73.1850,
    location: "School Ground, Fatehgunj",
    capacity: 500,
    status: "Available",
  },
  {
    id: "zone-2",
    name: "Sayaji Baug Open Ground",
    type: "Open assembly area",
    disasterTypes: ["Earthquake", "Conflict"],
    latitude: 22.3100,
    longitude: 73.1800,
    location: "Sayaji Baug, Vadodara",
    capacity: 1200,
    status: "Available",
  },
  {
    id: "zone-3",
    name: "Gujarat State Emergency Shelter",
    type: "Cyclone shelter",
    disasterTypes: ["Cyclone", "Flood"],
    latitude: 22.2950,
    longitude: 73.1950,
    location: "Coastal Road, Vadodara",
    capacity: 800,
    status: "Limited",
  },
  {
    id: "zone-4",
    name: "Community Hall Shelter",
    type: "Civilian shelter",
    disasterTypes: ["Conflict", "Earthquake"],
    latitude: 22.3050,
    longitude: 73.1700,
    location: "Alkapuri, Vadodara",
    capacity: 300,
    status: "Available",
  },
  {
    id: "zone-5",
    name: "Fire Station Safe Zone",
    type: "Fire evacuation shelter",
    disasterTypes: ["Wildfire"],
    latitude: 22.3250,
    longitude: 73.1950,
    location: "Near Fire Station, Vadodara",
    capacity: 200,
    status: "Available",
  },
  {
    id: "zone-6",
    name: "Hill Area Evacuation Centre",
    type: "Stable evacuation area",
    disasterTypes: ["Landslide"],
    latitude: 22.3380,
    longitude: 73.1550,
    location: "Hill Road, Vadodara",
    capacity: 250,
    status: "Available",
  },
  {
    id: "zone-7",
    name: "Stadium Emergency Centre",
    type: "Open assembly area",
    disasterTypes: ["Earthquake", "Flood", "Cyclone"],
    latitude: 22.3180,
    longitude: 73.1720,
    location: "Race Course, Vadodara",
    capacity: 2000,
    status: "Available",
  },
  {
    id: "zone-8",
    name: "Railway Station Shelter",
    type: "High-ground shelter",
    disasterTypes: ["Flood"],
    latitude: 22.3080,
    longitude: 73.1880,
    location: "Near Railway Station, Vadodara",
    capacity: 600,
    status: "Limited",
  },
  {
    id: "zone-9",
    name: "University Campus Shelter",
    type: "Civilian shelter",
    disasterTypes: ["Conflict", "Cyclone"],
    latitude: 22.3010,
    longitude: 73.1650,
    location: "University Road, Vadodara",
    capacity: 900,
    status: "Available",
  },
  {
    id: "zone-10",
    name: "Industrial Area Safe Zone",
    type: "Fire evacuation shelter",
    disasterTypes: ["Wildfire", "Conflict"],
    latitude: 22.3320,
    longitude: 73.2000,
    location: "Industrial Estate, Vadodara",
    capacity: 400,
    status: "Closed",
  },
];
