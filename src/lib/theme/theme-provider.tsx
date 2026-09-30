"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "turnyfly.theme";

interface ThemeContextValue {
  theme: ThemeMode;
  ready: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const listeners = new Set<() => void>();
let clientTheme: ThemeMode | null = null;

function applyThemeClass(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function readStoredTheme(): ThemeMode | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark") {
      return raw;
    }
  } catch {
    // ignore
  }
  return null;
}

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function getClientTheme(): ThemeMode {
  if (clientTheme) {
    return clientTheme;
  }
  const initial = readStoredTheme() ?? (systemPrefersDark() ? "dark" : "light");
  clientTheme = initial;
  applyThemeClass(initial);
  return initial;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getServerSnapshot(): ThemeMode {
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getClientTheme,
    getServerSnapshot,
  );
  const ready = typeof window !== "undefined";

  const setTheme = useCallback((next: ThemeMode) => {
    clientTheme = next;
    applyThemeClass(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore quota
    }
    emit();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, ready, setTheme, toggleTheme }),
    [theme, ready, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

/** Inline script to avoid flash of wrong theme before hydration. */
export const themeBootScript = `(function(){try{var k='turnyfly.theme';var s=localStorage.getItem(k);var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
