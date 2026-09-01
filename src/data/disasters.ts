export type DisasterType = "Flood" | "Earthquake" | "Cyclone" | "Wildfire" | "Landslide" | "Conflict";

export const DISASTER_TYPES: DisasterType[] = [
  "Flood",
  "Earthquake",
  "Cyclone",
  "Wildfire",
  "Landslide",
  "Conflict",
];

export interface DisasterMeta {
  icon: string;
  color: string;
  safeZoneLabel: string;
  dangerZoneLabel: string;
}

export const DISASTER_META: Record<DisasterType, DisasterMeta> = {
  Flood: {
    icon: "🌊",
    color: "#2563eb",
    safeZoneLabel: "High-ground shelter",
    dangerZoneLabel: "Flood / waterlogging",
  },
  Earthquake: {
    icon: "🌎",
    color: "#d97706",
    safeZoneLabel: "Open assembly area",
    dangerZoneLabel: "Damaged / unsafe structure",
  },
  Cyclone: {
    icon: "🌀",
    color: "#7c3aed",
    safeZoneLabel: "Cyclone shelter",
    dangerZoneLabel: "Exposed / coastal-risk area",
  },
  Wildfire: {
    icon: "🔥",
    color: "#dc2626",
    safeZoneLabel: "Fire evacuation shelter",
    dangerZoneLabel: "Fire / smoke zone",
  },
  Landslide: {
    icon: "🪨",
    color: "#92400e",
    safeZoneLabel: "Stable evacuation area",
    dangerZoneLabel: "Slope / landslide zone",
  },
  Conflict: {
    icon: "🛡️",
    color: "#374151",
    safeZoneLabel: "Civilian shelter",
    dangerZoneLabel: "Conflict / high-risk zone",
  },
};
