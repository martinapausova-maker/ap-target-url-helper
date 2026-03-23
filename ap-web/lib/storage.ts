import type { APRecord } from "./types";

const KEY = "ap-helper:bundle:v1";
const PICKS_LOCAL = "ap-helper:picks-local:v1";

export type StoredBundle = {
  uploadedAt: string;
  records: APRecord[];
};

export function loadBundle(): StoredBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredBundle;
  } catch {
    return null;
  }
}

export function saveBundle(bundle: StoredBundle): void {
  localStorage.setItem(KEY, JSON.stringify(bundle));
}

export function clearBundle(): void {
  localStorage.removeItem(KEY);
}

/** Local-only picks (fallback when Google Sheet sync is not configured). */
export function loadLocalPicks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PICKS_LOCAL);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.map(String);
  } catch {
    return [];
  }
}

export function addLocalPick(recordId: string): void {
  const cur = new Set(loadLocalPicks());
  cur.add(recordId);
  localStorage.setItem(PICKS_LOCAL, JSON.stringify([...cur]));
}

export function clearLocalPicks(): void {
  localStorage.removeItem(PICKS_LOCAL);
}
