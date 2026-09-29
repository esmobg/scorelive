import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { verifyOrganizerCredentials } from "@/lib/auth/organizers";
import {
  SESSION_COOKIE,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/session-token";

export {
  SESSION_COOKIE,
  FAVORITES_COOKIE,
  createSessionToken,
  verifySessionToken,
  sessionCookieOptions,
  parseFavoriteIds,
  mergeFavoriteIds,
  type SessionPayload,
} from "@/lib/auth/session-token";

/** Demo admin — credentials documented in README only. */
export const DEMO_ADMIN_USERNAME =
  process.env.TURNYFLY_ADMIN_USERNAME?.trim() || "admin";

const DEMO_PASSWORD_HASH =
  process.env.TURNYFLY_ADMIN_PASSWORD_HASH?.trim() ||
  "$2b$10$zvo0yEdJtl7Mn.pxp.NgTOvrJQcPFoJCDz8gWXGXGrYYppmH44yei";

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  if (username !== DEMO_ADMIN_USERNAME) {
    return false;
  }
  return bcrypt.compare(password, DEMO_PASSWORD_HASH);
}

/** Demo admin or a registered organizer (cookie-backed registry). */
export async function verifyLoginCredentials(
  username: string,
  password: string,
  organizersCookie?: string,
): Promise<boolean> {
  if (await verifyAdminCredentials(username, password)) {
    return true;
  }
  return verifyOrganizerCredentials(username, password, organizersCookie);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}
