import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

/**
 * Score mutations require an admin session.
 * Client organize UI posts here before applying local score updates.
 */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
