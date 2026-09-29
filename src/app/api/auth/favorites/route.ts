import { NextResponse } from "next/server";
import {
  FAVORITES_COOKIE,
  getSession,
  parseFavoriteIds,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function GET() {
  const jar = await cookies();
  const favorites = parseFavoriteIds(jar.get(FAVORITES_COOKIE)?.value);
  return NextResponse.json({ favorites });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { favorites?: string[] };
  try {
    body = (await request.json()) as { favorites?: string[] };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const incoming = Array.isArray(body.favorites)
    ? body.favorites.filter((id): id is string => typeof id === "string")
    : [];
  const unique = [...new Set(incoming)];

  const response = NextResponse.json({ favorites: unique });
  response.cookies.set(
    FAVORITES_COOKIE,
    JSON.stringify(unique),
    sessionCookieOptions(),
  );
  return response;
}
