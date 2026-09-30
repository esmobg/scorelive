import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth/password-reset";
import {
  assertSameOrigin,
  consumeAuthRateLimit,
} from "@/lib/auth/request-guards";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  const limited = await consumeAuthRateLimit(request, "forgot");
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let body: { username?: string; email?: string; identifier?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    // Still return generic success shape for invalid JSON to avoid probing noise.
    return NextResponse.json({ ok: true });
  }

  const identifier =
    (typeof body.identifier === "string" && body.identifier.trim()) ||
    (typeof body.username === "string" && body.username.trim()) ||
    (typeof body.email === "string" && body.email.trim()) ||
    "";

  try {
    await requestPasswordReset({ identifier, request });
  } catch (error) {
    console.error("[scorelive-forgot-password]", error);
    // Generic success even on DB errors — do not leak availability.
  }

  return NextResponse.json({ ok: true });
}
