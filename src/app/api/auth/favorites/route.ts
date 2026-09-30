import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/request-guards";
import {
  FAVORITES_COOKIE,
  getSession,
  normalizeFavoriteIds,
  parseFavoriteIds,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { findUserByUsername } from "@/lib/db/users";
import {
  listFavoriteIds,
  replaceFavoriteIds,
} from "@/lib/db/favorites";
import { cookies } from "next/headers";

export async function GET() {
  const jar = await cookies();
  const session = await getSession();
  if (session) {
    const user = await findUserByUsername(session.username);
    if (user) {
      const favorites = await listFavoriteIds(user.id);
      return NextResponse.json({ favorites });
    }
  }
  const favorites = parseFavoriteIds(jar.get(FAVORITES_COOKIE)?.value);
  return NextResponse.json({ favorites });
}

export async function PUT(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

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

  const unique = normalizeFavoriteIds(body.favorites);
  const user = await findUserByUsername(session.username);
  const persisted = user
    ? await replaceFavoriteIds(user.id, unique)
    : unique;

  const response = NextResponse.json({ favorites: persisted });
  response.cookies.set(
    FAVORITES_COOKIE,
    JSON.stringify(persisted),
    sessionCookieOptions(),
  );
  return response;
}
