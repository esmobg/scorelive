import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/request-guards";
import { getSession } from "@/lib/auth/session";

/**
 * Score mutations require an authenticated session.
 * Client organize UI posts here before applying local score updates.
 * Soft ownership ACL still lives client-side until server tournaments exist (C4).
 */
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, username: session.username });
}
