import { isProductionRuntime } from "@/lib/auth/crypto-seal";
import { incrementAuthRateLimit } from "@/lib/db/rate-limits";

const RATE_WINDOW_MS = 60_000;
const LOGIN_REGISTER_LIMIT = 10;

/**
 * Durable per-IP token bucket for auth routes (Turso-backed).
 * Shared across Vercel isolates — 10 attempts / minute / IP for login+register.
 */
export async function consumeAuthRateLimit(
  request: Request,
  route: "login" | "register",
): Promise<
  | { ok: true; count: number; ip: string }
  | { ok: false; retryAfterSec: number; count: number; ip: string }
> {
  const ip = clientIp(request);
  const minuteBucket = Math.floor(Date.now() / RATE_WINDOW_MS);
  const key = `${route}:${ip}:${minuteBucket}`;
  const now = Date.now();

  try {
    const { count, resetAt } = await incrementAuthRateLimit({
      key,
      windowMs: RATE_WINDOW_MS,
      now,
    });
    if (count > LOGIN_REGISTER_LIMIT) {
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((resetAt - now) / 1000)),
        count,
        ip,
      };
    }
    return { ok: true, count, ip };
  } catch (error) {
    console.error("[scorelive-rate-limit]", error);
    // Fail open only on unexpected DB errors so auth stays available.
    return { ok: true, count: 0, ip };
  }
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Same-origin check for state-changing auth APIs (Origin, else Referer).
 * In non-production, missing both headers is allowed (CLI / unit probes).
 */
export function assertSameOrigin(request: Request): boolean {
  const host = request.headers.get("host");
  if (!host) {
    return false;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  return !isProductionRuntime();
}

export { safeRedirectPath } from "@/lib/auth/safe-redirect";

export const AUTH_RATE_LIMIT = LOGIN_REGISTER_LIMIT;
export const AUTH_RATE_WINDOW_MS = RATE_WINDOW_MS;
