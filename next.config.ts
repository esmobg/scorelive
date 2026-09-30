import type { NextConfig } from "next";

/**
 * Production CSP for Next.js App Router.
 * - No 'unsafe-eval' (verified).
 * - script-src keeps 'unsafe-inline': Next injects inline bootstrap/hydration
 *   scripts; removing it breaks the app. Nonce wiring is a larger rewrite and
 *   was not adopted for this pass.
 * - style-src uses 'self' only: Tailwind/CSS files cover styles without
 *   requiring 'unsafe-inline' for this app.
 */
export const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
].join("; ");

export const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
