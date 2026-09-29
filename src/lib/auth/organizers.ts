import bcrypt from "bcryptjs";
import { sealJson, unsealJson } from "@/lib/auth/crypto-seal";
import { sessionCookieOptions } from "@/lib/auth/session-token";

/** Cookie holds HMAC-sealed registered organizers (demo persistence). */
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

function isOrganizerList(value: unknown): value is StoredOrganizer[] {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every(
    (item) =>
      !!item &&
      typeof item === "object" &&
      typeof (item as StoredOrganizer).username === "string" &&
      typeof (item as StoredOrganizer).passwordHash === "string",
  );
}

/**
 * Verify HMAC seal and return organizers. Unsigned or forged cookies are ignored.
 */
export async function unsealOrganizersCookie(
  raw: string | undefined,
): Promise<StoredOrganizer[]> {
  const parsed = await unsealJson<unknown>(raw);
  if (!isOrganizerList(parsed)) {
    return [];
  }
  return parsed;
}

export async function sealOrganizersCookie(
  users: StoredOrganizer[],
): Promise<string> {
  return sealJson(users);
}

export function organizersCookieOptions() {
  return sessionCookieOptions();
}

export async function hydrateOrganizersFromCookie(
  raw: string | undefined,
): Promise<void> {
  const store = memoryStore();
  for (const user of await unsealOrganizersCookie(raw)) {
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
  await hydrateOrganizersFromCookie(input.cookieRaw);

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
  await hydrateOrganizersFromCookie(cookieRaw);
  const hash = memoryStore().get(username.trim().toLowerCase());
  if (!hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}
