"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Tournament } from "@/lib/tournament";
import {
  deleteTournament as deleteFromLocal,
  getSeedTournaments,
  loadTournaments,
  resetToSeed,
  saveTournaments,
  upsertTournament as upsertLocal,
} from "@/lib/storage";

type StoreSnapshot = Tournament[];

const EMPTY: StoreSnapshot = [];
let memoryCache: StoreSnapshot | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function mergeServerAndLocal(
  local: Tournament[],
  server: Tournament[],
): Tournament[] {
  const byId = new Map<string, Tournament>();
  for (const seed of getSeedTournaments()) {
    byId.set(seed.id, seed);
  }
  for (const item of local) {
    // Prefer local edits for seed demos; skip owned server copies later.
    if (!item.ownerUsername || item.id.startsWith("demo-")) {
      byId.set(item.id, item);
    }
  }
  for (const item of server) {
    byId.set(item.id, item);
  }
  // Keep non-seed local-only drafts that failed to sync (rare offline).
  for (const item of local) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

function readStore(): StoreSnapshot {
  if (typeof window === "undefined") {
    return EMPTY;
  }
  if (!memoryCache) {
    memoryCache = loadTournaments();
  }
  return memoryCache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === "turnyfly.tournaments.v2" ||
      event.key === "turnyfly.tournaments.v1"
    ) {
      memoryCache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot(): StoreSnapshot {
  return EMPTY;
}

function setCache(next: StoreSnapshot) {
  memoryCache = next;
  saveTournaments(next);
  emit();
}

export type TournamentSaveResult =
  | { ok: true }
  | {
      ok: false;
      error: "unauthorized" | "forbidden" | "sync_failed";
    };

interface TournamentStoreValue {
  tournaments: Tournament[];
  ready: boolean;
  save: (tournament: Tournament) => Promise<TournamentSaveResult>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
  getById: (id: string) => Tournament | undefined;
  refresh: () => Promise<void>;
  refreshTournament: (id: string) => Promise<Tournament | null>;
}

const TournamentStoreContext = createContext<TournamentStoreValue | null>(
  null,
);

async function fetchServerTournaments(): Promise<Tournament[]> {
  try {
    const res = await fetch("/api/tournaments", { credentials: "include" });
    if (!res.ok) return [];
    const data = (await res.json()) as { tournaments?: Tournament[] };
    return Array.isArray(data.tournaments) ? data.tournaments : [];
  } catch {
    return [];
  }
}

async function fetchServerTournament(id: string): Promise<Tournament | null> {
  try {
    const res = await fetch(`/api/tournaments/${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { tournament?: Tournament };
    return data.tournament ?? null;
  } catch {
    return null;
  }
}

export function TournamentStoreProvider({ children }: { children: ReactNode }) {
  const tournaments = useSyncExternalStore(
    subscribe,
    readStore,
    getServerSnapshot,
  );
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const local = loadTournaments();
    const server = await fetchServerTournaments();
    const merged = mergeServerAndLocal(local, server);
    setCache(merged);
  }, []);

  const refreshTournament = useCallback(async (id: string) => {
    const remote = await fetchServerTournament(id);
    if (!remote) return null;
    const current = readStore();
    const existing = current.find((item) => item.id === id);
    if (
      existing &&
      existing.updatedAt === remote.updatedAt &&
      JSON.stringify(existing.matches) === JSON.stringify(remote.matches)
    ) {
      return existing;
    }
    const without = current.filter((item) => item.id !== id);
    const next = [remote, ...without].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
    setCache(next);
    return remote;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const local = loadTournaments();
      memoryCache = local;
      emit();
      const server = await fetchServerTournaments();
      if (cancelled) return;
      setCache(mergeServerAndLocal(local, server));
      setReady(true);
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (tournament: Tournament): Promise<TournamentSaveResult> => {
      const optimistic = upsertLocal(tournament);
      memoryCache = optimistic;
      emit();

      // Seed demos stay local-only.
      if (!tournament.ownerUsername || tournament.id.startsWith("demo-")) {
        return { ok: true };
      }

      try {
        const existing = await fetch(`/api/tournaments/${tournament.id}`, {
          credentials: "include",
        });
        if (existing.status === 404) {
          const created = await fetch("/api/tournaments", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tournament }),
          });
          if (created.status === 401) {
            return { ok: false, error: "unauthorized" };
          }
          if (created.status === 403) {
            return { ok: false, error: "forbidden" };
          }
          if (!created.ok) {
            return { ok: false, error: "sync_failed" };
          }
          const data = (await created.json()) as { tournament: Tournament };
          const next = upsertLocal(data.tournament);
          memoryCache = next;
          emit();
          return { ok: true };
        }
        if (existing.status === 401) {
          return { ok: false, error: "unauthorized" };
        }
        if (!existing.ok) {
          return { ok: false, error: "sync_failed" };
        }

        const patched = await fetch(`/api/tournaments/${tournament.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tournament }),
        });
        if (patched.status === 401) {
          return { ok: false, error: "unauthorized" };
        }
        if (patched.status === 403) {
          return { ok: false, error: "forbidden" };
        }
        if (!patched.ok) {
          return { ok: false, error: "sync_failed" };
        }
        const data = (await patched.json()) as { tournament: Tournament };
        const next = upsertLocal(data.tournament);
        memoryCache = next;
        emit();
        return { ok: true };
      } catch {
        return { ok: false, error: "sync_failed" };
      }
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    const next = deleteFromLocal(id);
    memoryCache = next;
    emit();
    if (id.startsWith("demo-")) {
      return;
    }
    try {
      await fetch(`/api/tournaments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // Local already removed.
    }
  }, []);

  const reset = useCallback(() => {
    const seed = resetToSeed();
    memoryCache = seed;
    emit();
    void refresh();
  }, [refresh]);

  const getById = useCallback(
    (id: string) => tournaments.find((t) => t.id === id),
    [tournaments],
  );

  const value = useMemo(
    () => ({
      tournaments,
      ready,
      save,
      remove,
      reset,
      getById,
      refresh,
      refreshTournament,
    }),
    [
      tournaments,
      ready,
      save,
      remove,
      reset,
      getById,
      refresh,
      refreshTournament,
    ],
  );

  return (
    <TournamentStoreContext.Provider value={value}>
      {children}
    </TournamentStoreContext.Provider>
  );
}

export function useTournamentStore(): TournamentStoreValue {
  const ctx = useContext(TournamentStoreContext);
  if (!ctx) {
    throw new Error(
      "useTournamentStore must be used within TournamentStoreProvider",
    );
  }
  return ctx;
}
