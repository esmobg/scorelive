const MIN_SECRET_LENGTH = 32;

/** Local/dev fallback only — never used when NODE_ENV or VERCEL_ENV is production. */
const LOCAL_DEV_SECRET = "local-dev-only-turnyfly-session-secret!";

export function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

/**
 * Session / seal HMAC secret.
 * Production fails closed if TURNYFLY_SESSION_SECRET is missing or shorter than 32 chars.
 */
export function getSessionSecret(): string {
  const configured = process.env.TURNYFLY_SESSION_SECRET?.trim() ?? "";
  if (configured.length >= MIN_SECRET_LENGTH) {
    return configured;
  }
  if (isProductionRuntime()) {
    throw new Error(
      `TURNYFLY_SESSION_SECRET must be set (min ${MIN_SECRET_LENGTH} chars) in production`,
    );
  }
  return LOCAL_DEV_SECRET;
}

export function toBase64Url(bytes: ArrayBuffer | Uint8Array | string): string {
  const view =
    typeof bytes === "string"
      ? new TextEncoder().encode(bytes)
      : bytes instanceof Uint8Array
        ? bytes
        : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = new TextEncoder().encode(getSessionSecret());
  return crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function hmacSignBase64Url(body: string): Promise<string> {
  const key = await hmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  return toBase64Url(signature);
}

export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Seal arbitrary JSON as `body.signature` (HMAC-SHA256). */
export async function sealJson(value: unknown): Promise<string> {
  const body = toBase64Url(JSON.stringify(value));
  const signature = await hmacSignBase64Url(body);
  return `${body}.${signature}`;
}

/** Verify and parse a sealed cookie. Returns null if missing, malformed, or forged. */
export async function unsealJson<T>(token: string | undefined): Promise<T | null> {
  if (!token) {
    return null;
  }
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }
  try {
    const expected = await hmacSignBase64Url(body);
    if (!timingSafeEqualString(expected, signature)) {
      return null;
    }
    const json = new TextDecoder().decode(fromBase64Url(body));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export { MIN_SECRET_LENGTH };
