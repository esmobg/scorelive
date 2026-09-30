import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { isDemoAdminEnabled } from "@/lib/auth/demo-admin";
import { verifyOrganizerCredentials } from "@/lib/auth/organizers";
import { findUserByUsername } from "@/lib/db/users";
import {
  SESSION_COOKIE,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/session-token";

export {
  SESSION_COOKIE,
  FAVORITES_COOKIE,
  MAX_FAVORITES,
  createSessionToken,
  verifySessionToken,
  sessionCookieOptions,
  parseFavoriteIds,
  mergeFavoriteIds,
  normalizeFavoriteIds,
  type SessionPayload,
} from "@/lib/auth/session-token";

export { isDemoAdminEnabled } from "@/lib/auth/demo-admin";

/** Demo admin username — local/demo only unless DEMO_ADMIN_ENABLED=true. */
export const DEMO_ADMIN_USERNAME =
  process.env.TURNYFLY_ADMIN_USERNAME?.trim() || "admin";

const DEMO_PASSWORD_HASH =
  process.env.TURNYFLY_ADMIN_PASSWORD_HASH?.trim() ||
  "$2b$10$zvo0yEdJtl7Mn.pxp.NgTOvrJQcPFoJCDz8gWXGXGrYYppmH44yei";

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  if (!isDemoAdminEnabled()) {
    return false;
  }
  if (username !== DEMO_ADMIN_USERNAME) {
    return false;
  }
  return bcrypt.compare(password, DEMO_PASSWORD_HASH);
}

/** Demo admin (when enabled) or a Turso-backed registered organizer. */
export async function verifyLoginCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  if (await verifyAdminCredentials(username, password)) {
    return true;
  }
  return verifyOrganizerCredentials(username, password);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Resolve DB user id for the current session username (null for demo admin). */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }
  const user = await findUserByUsername(session.username);
  return user?.id ?? null;
}
