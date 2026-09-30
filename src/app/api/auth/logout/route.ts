import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/request-guards";
import {
  revokeCurrentSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }
  try {
    await revokeCurrentSession();
  } catch (error) {
    console.error("[scorelive-db]", error);
    // Still clear the cookie so the browser drops the session.
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(0),
    maxAge: 0,
  });
  return response;
}
