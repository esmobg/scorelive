const ALLOWED_NEXT_PREFIXES = [
  "/organize",
  "/favorites",
  "/tournaments",
  "/about",
  "/faq",
  "/how-it-works",
  "/accessibility",
  "/login",
  "/register",
  "/",
] as const;

/**
 * Safe post-login redirect: relative path only, no protocol-relative `//`,
 * no backslashes, allowlisted prefixes.
 */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback = "/organize",
): string {
  if (!next || typeof next !== "string") {
    return fallback;
  }
  let candidate = next.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }
  if (candidate.includes("\\") || candidate.includes("://")) {
    return fallback;
  }
  try {
    const decoded = decodeURIComponent(candidate);
    if (
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      /^[a-z][a-z0-9+.-]*:/i.test(decoded)
    ) {
      return fallback;
    }
    candidate = decoded.startsWith("/") ? decoded : candidate;
  } catch {
    return fallback;
  }

  const pathOnly = candidate.split("?")[0]?.split("#")[0] ?? candidate;
  const allowed = ALLOWED_NEXT_PREFIXES.some((prefix) => {
    if (prefix === "/") {
      return pathOnly === "/";
    }
    return pathOnly === prefix || pathOnly.startsWith(`${prefix}/`);
  });
  return allowed ? candidate : fallback;
}
