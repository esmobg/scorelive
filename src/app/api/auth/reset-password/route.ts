import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth/password-reset";
import {
  assertSameOrigin,
  consumeAuthRateLimit,
} from "@/lib/auth/request-guards";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  const limited = await consumeAuthRateLimit(request, "reset");
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let body: {
    token?: string;
    password?: string;
    confirmPassword?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  let result;
  try {
    result = await resetPasswordWithToken({
      token: typeof body.token === "string" ? body.token : "",
      password: typeof body.password === "string" ? body.password : "",
      confirmPassword:
        typeof body.confirmPassword === "string" ? body.confirmPassword : "",
    });
  } catch (error) {
    console.error("[scorelive-reset-password]", error);
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 503 },
    );
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
