"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  loadLocalFavorites,
  mergeIds,
  saveLocalFavorites,
} from "@/lib/favorites";

interface FavoritesState {
  ready: boolean;
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { authenticated, ready: authReady } = useAuth();
  const [ready, setReady] = useState(false);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    let cancelled = false;

    async function hydrate() {
      const local = loadLocalFavorites();
      if (!authenticated) {
        if (!cancelled) {
          setIds(local);
          setReady(true);
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/favorites", {
          credentials: "include",
        });
        const data = (await res.json()) as { favorites?: string[] };
        const server = Array.isArray(data.favorites) ? data.favorites : [];
        const merged = mergeIds(local, server);
        saveLocalFavorites(merged);
        await fetch("/api/auth/favorites", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favorites: merged }),
        });
        if (!cancelled) {
          setIds(merged);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setIds(local);
          setReady(true);
        }
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [authenticated, authReady]);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const next = ids.includes(id)
        ? ids.filter((item) => item !== id)
        : [...ids, id];
      setIds(next);
      saveLocalFavorites(next);
      if (authenticated) {
        try {
          await fetch("/api/auth/favorites", {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favorites: next }),
          });
        } catch {
          // Local state already updated.
        }
      }
    },
    [authenticated, ids],
  );

  const value = useMemo(
    () => ({ ready, ids, isFavorite, toggleFavorite }),
    [ready, ids, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
