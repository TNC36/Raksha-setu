import { DEFAULT_ALERTS, Alert } from "../data/alerts";
import { DEFAULT_ZONES, SafeZone } from "../data/zones";
import { DEFAULT_GUIDES, Guide } from "../data/guides";
import { DEFAULT_HELPLINES, Helpline } from "../data/helplines";

type StorageKey =
  | "raksha_alerts"
  | "raksha_zones"
  | "raksha_guides"
  | "raksha_helplines"
  | "raksha_users"
  | "raksha_current_user"
  | "raksha_admin";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadDataRaw<T>(key: string, fallback: T): T {
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

function saveDataRaw<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn(`Failed to save data to key: ${key}`);
  }
}

// ── Alerts ──────────────────────────────────────────────────

export function loadAlerts(): Alert[] {
  return loadDataRaw<Alert[]>("raksha_alerts", DEFAULT_ALERTS);
}

export function saveAlerts(alerts: Alert[]): void {
  saveDataRaw("raksha_alerts", alerts);
}

// ── Safe Zones ──────────────────────────────────────────────

export function loadZones(): SafeZone[] {
  const zones = loadDataRaw<SafeZone[]>("raksha_zones", DEFAULT_ZONES);
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
  saveDataRaw("raksha_zones", zones);
}

// ── Guides ──────────────────────────────────────────────────

export function loadGuides(): Guide[] {
  const guides = loadDataRaw<Guide[]>("raksha_guides", DEFAULT_GUIDES);
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
  saveDataRaw("raksha_guides", guides);
}

// ── Helplines ───────────────────────────────────────────────

export function loadHelplines(): Helpline[] {
  return loadDataRaw<Helpline[]>("raksha_helplines", DEFAULT_HELPLINES);
}

export function saveHelplines(helplines: Helpline[]): void {
  saveDataRaw("raksha_helplines", helplines);
}

// ── User Auth (Civilian) ────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

function loadUsers(): User[] {
  return loadDataRaw<User[]>("raksha_users", []);
}

function saveUsers(users: User[]): void {
  saveDataRaw("raksha_users", users);
}

export function registerUser(name: string, email: string, password: string): { ok: boolean; error?: string } {
  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  setCurrentUser(user);
  return { ok: true };
}

export function loginUser(email: string, password: string): { ok: boolean; error?: string } {
  const users = loadUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) {
    return { ok: false, error: "Invalid email or password." };
  }
  setCurrentUser(user);
  return { ok: true };
}

export function getCurrentUser(): User | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem("raksha_current_user");
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function setCurrentUser(user: User | null): void {
  if (!isBrowser()) return;
  if (user) {
    window.localStorage.setItem("raksha_current_user", JSON.stringify(user));
  } else {
    window.localStorage.removeItem("raksha_current_user");
  }
}

export function logoutUser(): void {
  setCurrentUser(null);
}

export function isUserLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

// ── Admin Auth ──────────────────────────────────────────────

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Raksha@123";

export function isAdminLoggedIn(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem("raksha_admin") === "true";
}

export function adminLogin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    if (isBrowser()) window.localStorage.setItem("raksha_admin", "true");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  if (isBrowser()) window.localStorage.removeItem("raksha_admin");
}
