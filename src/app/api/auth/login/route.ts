import { NextResponse } from "next/server";
import { ORGANIZERS_COOKIE } from "@/lib/auth/organizers";
import {
  assertSameOrigin,
  consumeAuthRateLimit,
} from "@/lib/auth/request-guards";
import {
  createSessionToken,
  FAVORITES_COOKIE,
  mergeFavoriteIds,
  normalizeFavoriteIds,
  parseFavoriteIds,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyLoginCredentials,
} from "@/lib/auth/session";

function cookieValue(header: string, name: string): string | undefined {
  return header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  const limited = consumeAuthRateLimit(request, "login");
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

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

  const cookieHeader = request.headers.get("cookie") ?? "";
  const organizersRaw = cookieValue(cookieHeader, ORGANIZERS_COOKIE);

  const ok = await verifyLoginCredentials(username, password, organizersRaw);
  if (!ok) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const response = NextResponse.json({ ok: true, username });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

  const clientFavorites = normalizeFavoriteIds(body.favorites);
  const existing = parseFavoriteIds(
    cookieValue(cookieHeader, FAVORITES_COOKIE),
  );
  const merged = mergeFavoriteIds(existing, clientFavorites);
  response.cookies.set(
    FAVORITES_COOKIE,
    JSON.stringify(merged),
    sessionCookieOptions(),
  );

  return response;
}
