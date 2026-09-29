import { isProductionRuntime } from "@/lib/auth/crypto-seal";

const RATE_WINDOW_MS = 60_000;
const LOGIN_REGISTER_LIMIT = 10;

type Bucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, Bucket>();

/**
 * In-memory per-IP token bucket for auth routes.
 * Limitation: counters are per serverless isolate / process — not global across
 * Vercel instances. Prefer Upstash / WAF when available.
 */
export function consumeAuthRateLimit(
  request: Request,
  route: "login" | "register",
): { ok: true } | { ok: false; retryAfterSec: number } {
  const ip = clientIp(request);
  const key = `${route}:${ip}`;
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > LOGIN_REGISTER_LIMIT) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true };
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
