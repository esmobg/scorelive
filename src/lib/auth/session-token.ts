import {
  fromBase64Url,
  getSessionSecret,
  hmacSignBase64Url,
  timingSafeEqualString,
  toBase64Url,
} from "@/lib/auth/crypto-seal";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export const SESSION_COOKIE = "turnyfly_session";
export const FAVORITES_COOKIE = "turnyfly_favorites";

/** Soft cap for favorites cookie / local sync (M6). */
export const MAX_FAVORITES = 50;
export const MAX_FAVORITE_ID_LENGTH = 64;

export interface SessionPayload {
  username: string;
  exp: number;
}

export async function createSessionToken(username: string): Promise<string> {
  // Touch secret early so production misconfig fails closed on mint.
  getSessionSecret();
  const payload: SessionPayload = {
    username,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = toBase64Url(JSON.stringify(payload));
  const signature = await hmacSignBase64Url(body);
  return `${body}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }
  try {
    getSessionSecret();
    const expected = await hmacSignBase64Url(body);
    if (!timingSafeEqualString(expected, signature)) {
      return null;
    }
    const json = new TextDecoder().decode(fromBase64Url(body));
    const payload = JSON.parse(json) as SessionPayload;
    if (
      typeof payload.username !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSeconds = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function normalizeFavoriteIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of raw) {
    if (typeof id !== "string") {
      continue;
    }
    const trimmed = id.trim();
    if (
      !trimmed ||
      trimmed.length > MAX_FAVORITE_ID_LENGTH ||
      seen.has(trimmed)
    ) {
      continue;
    }
    seen.add(trimmed);
    out.push(trimmed);
    if (out.length >= MAX_FAVORITES) {
      break;
    }
  }
  return out;
}

export function parseFavoriteIds(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  try {
    return normalizeFavoriteIds(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function mergeFavoriteIds(...lists: string[][]): string[] {
  return normalizeFavoriteIds(lists.flat());
}

export { SESSION_TTL_MS };
