import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/request-guards";
import {
  FAVORITES_COOKIE,
  getSession,
  normalizeFavoriteIds,
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

  const response = NextResponse.json({ favorites: unique });
  response.cookies.set(
    FAVORITES_COOKIE,
    JSON.stringify(unique),
    sessionCookieOptions(),
  );
  return response;
}
