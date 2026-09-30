import bcrypt from "bcryptjs";
import { sealJson, unsealJson } from "@/lib/auth/crypto-seal";
import { sessionCookieOptions } from "@/lib/auth/session-token";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  usernameExists,
} from "@/lib/db/users";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** Legacy cookie name — no longer the source of truth (Turso users table is). */
export const ORGANIZERS_COOKIE = "turnyfly_organizers";

const DEMO_ADMIN_USERNAME =
  process.env.TURNYFLY_ADMIN_USERNAME?.trim() || "admin";

export interface StoredOrganizer {
  username: string;
  passwordHash: string;
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
 * Kept for crypto unit tests and any leftover cookies; registration no longer writes this.
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

const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

export type RegisterResult =
  | { ok: true; username: string; userId: string }
  | {
      ok: false;
      error:
        | "invalid_username"
        | "invalid_password"
        | "password_mismatch"
        | "username_taken"
        | "invalid_email"
        | "email_taken";
    };

export async function registerOrganizer(input: {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
}): Promise<RegisterResult> {
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

  const emailRaw = typeof input.email === "string" ? input.email.trim() : "";
  // Email is optional but required for password-reset email delivery.
  if (emailRaw && !isValidEmail(emailRaw)) {
    return { ok: false, error: "invalid_email" };
  }
  if (emailRaw && (await findUserByEmail(emailRaw))) {
    return { ok: false, error: "email_taken" };
  }

  if (
    username.toLowerCase() === DEMO_ADMIN_USERNAME.toLowerCase() ||
    (await usernameExists(username))
  ) {
    return { ok: false, error: "username_taken" };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    const user = await createUser({
      username,
      passwordHash,
      email: emailRaw || null,
    });
    return {
      ok: true,
      username: user.username,
      userId: user.id,
    };
  } catch {
    // Unique constraint race
    return { ok: false, error: "username_taken" };
  }
}

export async function verifyOrganizerCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const user = await findUserByUsername(username);
  if (!user) {
    return false;
  }
  return bcrypt.compare(password, user.passwordHash);
}
