import { NextResponse } from "next/server";
import {
  FAVORITES_COOKIE,
  getSession,
  parseFavoriteIds,
} from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  const jar = await cookies();
  const favorites = parseFavoriteIds(jar.get(FAVORITES_COOKIE)?.value);
  return NextResponse.json({
    authenticated: true,
    username: session.username,
    favorites,
  });
}
