import { NextResponse } from "next/server";
import {
  createSessionToken,
  FAVORITES_COOKIE,
  mergeFavoriteIds,
  parseFavoriteIds,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  let body: { username?: string; password?: string; favorites?: string[] };
  try {
    body = (await request.json()) as {
      username?: string;
      password?: string;
      favorites?: string[];
    };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const ok = await verifyAdminCredentials(username, password);
  if (!ok) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const response = NextResponse.json({ ok: true, username });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

  const clientFavorites = Array.isArray(body.favorites)
    ? body.favorites.filter((id): id is string => typeof id === "string")
    : [];
  const cookieHeader = request.headers.get("cookie") ?? "";
  const existing = parseFavoriteIds(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${FAVORITES_COOKIE}=`))
      ?.slice(FAVORITES_COOKIE.length + 1),
  );
  const merged = mergeFavoriteIds(existing, clientFavorites);
  response.cookies.set(
    FAVORITES_COOKIE,
    JSON.stringify(merged),
    sessionCookieOptions(),
  );

  return response;
}
