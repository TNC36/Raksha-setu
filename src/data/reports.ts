import { DisasterType } from "./disasters";

export interface CommunityReport {
  id: string;
  disaster: DisasterType;
  title: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export const DEFAULT_REPORTS: CommunityReport[] = [
  {
    id: "rpt-1",
    disaster: "Flood",
    title: "Waterlogged road — heavy traffic blocked",
    latitude: 22.3105,
    longitude: 73.1870,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rpt-2",
    disaster: "Flood",
    title: "Drainage overflow near residential area",
    latitude: 22.3030,
    longitude: 73.1790,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rpt-3",
    disaster: "Earthquake",
    title: "Building damage reported — cracks visible",
    latitude: 22.3220,
    longitude: 73.1650,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rpt-4",
    disaster: "Earthquake",
    title: "Wall collapse near old market",
    latitude: 22.3072,
    longitude: 73.1812,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rpt-5",
    disaster: "Wildfire",
    title: "Smoke reported near industrial outskirts",
    latitude: 22.3340,
    longitude: 73.2020,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rpt-6",
    disaster: "Conflict",
    title: "Unsafe crowd reported near market area",
    latitude: 22.3080,
    longitude: 73.1805,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rpt-7",
    disaster: "Landslide",
    title: "Debris on hill road — passage blocked",
    latitude: 22.3390,
    longitude: 73.1520,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rpt-8",
    disaster: "Cyclone",
    title: "Fallen tree blocking main road",
    latitude: 22.2960,
    longitude: 73.1930,
    createdAt: new Date().toISOString(),
  },
];
