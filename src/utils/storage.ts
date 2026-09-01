/**
 * Client-side preferences only.
 *
 * Core application data (alerts, zones, guides, helplines, reports)
 * is managed by Convex — never stored in localStorage.
 *
 * SECURITY: No admin credentials, passwords, or auth tokens are stored here.
 */

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getPreference<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setPreference<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function removePreference(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Silently ignore
  }
}
