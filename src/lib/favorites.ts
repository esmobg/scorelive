const STORAGE_KEY = "turnyfly.favorites.v1";

export function loadLocalFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function saveLocalFavorites(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function mergeIds(...lists: string[][]): string[] {
  const seen = new Set<string>();
  for (const list of lists) {
    for (const id of list) {
      if (id) {
        seen.add(id);
      }
    }
  }
  return [...seen];
}

export const FAVORITES_STORAGE_KEY = STORAGE_KEY;
