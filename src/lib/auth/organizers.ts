import bcrypt from "bcryptjs";
import { sessionCookieOptions } from "@/lib/auth/session-token";

/** Cookie holds registered organizers for demo persistence across serverless invokes. */
export const ORGANIZERS_COOKIE = "turnyfly_organizers";

const DEMO_ADMIN_USERNAME =
  process.env.TURNYFLY_ADMIN_USERNAME?.trim() || "admin";

export interface StoredOrganizer {
  username: string;
  passwordHash: string;
}

type GlobalOrganizers = {
  __scoreliveOrganizers?: Map<string, string>;
};

function memoryStore(): Map<string, string> {
  const g = globalThis as typeof globalThis & GlobalOrganizers;
  if (!g.__scoreliveOrganizers) {
    g.__scoreliveOrganizers = new Map();
  }
  return g.__scoreliveOrganizers;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(out);
}

function decodeCookiePayload(raw: string): string {
  try {
    return fromBase64Url(raw);
  } catch {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
}

export function parseOrganizersCookie(raw: string | undefined): StoredOrganizer[] {
  if (!raw) {
    return [];
  }
  try {
    const decoded = decodeCookiePayload(raw);
    const parsed = JSON.parse(decoded) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is StoredOrganizer =>
        !!item &&
        typeof item === "object" &&
        typeof (item as StoredOrganizer).username === "string" &&
        typeof (item as StoredOrganizer).passwordHash === "string",
    );
  } catch {
    return [];
  }
}

export function serializeOrganizersCookie(users: StoredOrganizer[]): string {
  return toBase64Url(JSON.stringify(users));
}

export function organizersCookieOptions() {
  return sessionCookieOptions();
}

export function hydrateOrganizersFromCookie(raw: string | undefined): void {
  const store = memoryStore();
  for (const user of parseOrganizersCookie(raw)) {
    const key = user.username.toLowerCase();
    if (!store.has(key)) {
      store.set(key, user.passwordHash);
    }
  }
}

export function listOrganizers(): StoredOrganizer[] {
  return [...memoryStore().entries()].map(([username, passwordHash]) => ({
    username,
    passwordHash,
  }));
}

export function isUsernameTaken(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  if (normalized === DEMO_ADMIN_USERNAME.toLowerCase()) {
    return true;
  }
  return memoryStore().has(normalized);
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

export type RegisterResult =
  | { ok: true; username: string; organizers: StoredOrganizer[] }
  | {
      ok: false;
      error:
        | "invalid_username"
        | "invalid_password"
        | "password_mismatch"
        | "username_taken";
    };

export async function registerOrganizer(input: {
  username: string;
  password: string;
  confirmPassword: string;
  cookieRaw?: string;
}): Promise<RegisterResult> {
  hydrateOrganizersFromCookie(input.cookieRaw);

  const username = input.username.trim();
  if (!USERNAME_RE.test(username)) {
    return { ok: false, error: "invalid_username" };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "invalid_password" };
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false, error: "password_mismatch" };
  }
  if (isUsernameTaken(username)) {
    return { ok: false, error: "username_taken" };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  memoryStore().set(username.toLowerCase(), passwordHash);

  return {
    ok: true,
    username,
    organizers: listOrganizers(),
  };
}

export async function verifyOrganizerCredentials(
  username: string,
  password: string,
  cookieRaw?: string,
): Promise<boolean> {
  hydrateOrganizersFromCookie(cookieRaw);
  const hash = memoryStore().get(username.trim().toLowerCase());
  if (!hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}
