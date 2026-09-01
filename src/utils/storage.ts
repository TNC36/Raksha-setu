import { DEFAULT_ALERTS, Alert } from "../data/alerts";
import { DEFAULT_ZONES, SafeZone } from "../data/zones";
import { DEFAULT_GUIDES, Guide } from "../data/guides";
import { DEFAULT_HELPLINES, Helpline } from "../data/helplines";

type StorageKey = "suraksha_alerts" | "suraksha_zones" | "suraksha_guides" | "suraksha_helplines";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadData<T>(key: StorageKey, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed)) {
      return parsed as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveData<T>(key: StorageKey, data: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn(`Failed to save data to key: ${key}`);
  }
}

export function loadAlerts(): Alert[] {
  return loadData<Alert[]>("suraksha_alerts", DEFAULT_ALERTS);
}

export function saveAlerts(alerts: Alert[]): void {
  saveData("suraksha_alerts", alerts);
}

export function loadZones(): SafeZone[] {
  const zones = loadData<SafeZone[]>("suraksha_zones", DEFAULT_ZONES);
  return zones.map((z) => ({
    id: z.id || crypto.randomUUID(),
    name: z.name || "Unnamed Zone",
    type: z.type || "Shelter",
    disasterTypes: Array.isArray(z.disasterTypes) ? z.disasterTypes : [],
    latitude: typeof z.latitude === "number" ? z.latitude : 22.3072,
    longitude: typeof z.longitude === "number" ? z.longitude : 73.1812,
    location: z.location || "",
    capacity: typeof z.capacity === "number" ? z.capacity : 100,
    status: z.status || "Available",
  }));
}

export function saveZones(zones: SafeZone[]): void {
  saveData("suraksha_zones", zones);
}

export function loadGuides(): Guide[] {
  const guides = loadData<Guide[]>("suraksha_guides", DEFAULT_GUIDES);
  return guides.map((g) => ({
    id: g.id || crypto.randomUUID(),
    type: g.type || "Flood",
    title: g.title || "Safety Guide",
    before: Array.isArray(g.before) ? g.before : [],
    during: Array.isArray(g.during) ? g.during : [],
    after: Array.isArray(g.after) ? g.after : [],
  }));
}

export function saveGuides(guides: Guide[]): void {
  saveData("suraksha_guides", guides);
}

export function loadHelplines(): Helpline[] {
  return loadData<Helpline[]>("suraksha_helplines", DEFAULT_HELPLINES);
}

export function saveHelplines(helplines: Helpline[]): void {
  saveData("suraksha_helplines", helplines);
}

export function isAdminLoggedIn(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem("suraksha_admin") === "true";
}

export function adminLogin(): void {
  if (isBrowser()) window.localStorage.setItem("suraksha_admin", "true");
}

export function adminLogout(): void {
  if (isBrowser()) window.localStorage.removeItem("suraksha_admin");
}
