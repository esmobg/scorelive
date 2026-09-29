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
  deleteTournament as deleteFromStore,
  loadTournaments,
  resetToSeed,
  upsertTournament,
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

interface TournamentStoreValue {
  tournaments: Tournament[];
  ready: boolean;
  save: (tournament: Tournament) => void;
  remove: (id: string) => void;
  reset: () => void;
  getById: (id: string) => Tournament | undefined;
}

const TournamentStoreContext = createContext<TournamentStoreValue | null>(
  null,
);

export function TournamentStoreProvider({ children }: { children: ReactNode }) {
  const tournaments = useSyncExternalStore(
    subscribe,
    readStore,
    getServerSnapshot,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    memoryCache = loadTournaments();
    setReady(true);
    emit();
  }, []);

  const save = useCallback((tournament: Tournament) => {
    upsertTournament(tournament);
    memoryCache = null;
    emit();
  }, []);

  const remove = useCallback((id: string) => {
    deleteFromStore(id);
    memoryCache = null;
    emit();
  }, []);

  const reset = useCallback(() => {
    resetToSeed();
    memoryCache = null;
    emit();
  }, []);

  const getById = useCallback(
    (id: string) => tournaments.find((t) => t.id === id),
    [tournaments],
  );

  const value = useMemo(
    () => ({ tournaments, ready, save, remove, reset, getById }),
    [tournaments, ready, save, remove, reset, getById],
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
