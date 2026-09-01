export type FacilityType = "Hospital" | "Police" | "Fire Station";

export interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  latitude: number;
  longitude: number;
}

export const DEFAULT_FACILITIES: Facility[] = [
  {
    id: "fac-1",
    type: "Hospital",
    name: "SSG Hospital",
    latitude: 22.3100,
    longitude: 73.1780,
  },
  {
    id: "fac-2",
    type: "Hospital",
    name: "Sterling Hospital",
    latitude: 22.3050,
    longitude: 73.1850,
  },
  {
    id: "fac-3",
    type: "Hospital",
    name: "Gotri Hospital",
    latitude: 22.3200,
    longitude: 73.1700,
  },
  {
    id: "fac-4",
    type: "Police",
    name: "Vadodara City Police HQ",
    latitude: 22.3080,
    longitude: 73.1820,
  },
  {
    id: "fac-5",
    type: "Police",
    name: "Fatehgunj Police Station",
    latitude: 22.3150,
    longitude: 73.1880,
  },
  {
    id: "fac-6",
    type: "Police",
    name: "Alkapuri Police Station",
    latitude: 22.3020,
    longitude: 73.1730,
  },
  {
    id: "fac-7",
    type: "Fire Station",
    name: "Vadodara Fire Station Central",
    latitude: 22.3090,
    longitude: 73.1810,
  },
  {
    id: "fac-8",
    type: "Fire Station",
    name: "Makarpura Fire Station",
    latitude: 22.2900,
    longitude: 73.1950,
  },
  {
    id: "fac-9",
    type: "Fire Station",
    name: "Waghodia Fire Station",
    latitude: 22.3250,
    longitude: 73.1600,
  },
];
