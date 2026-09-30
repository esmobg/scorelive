import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  consumeAuthRateLimit,
} from "@/lib/auth/request-guards";
import {
  FAVORITES_COOKIE,
  mintSession,
  normalizeFavoriteIds,
  parseFavoriteIds,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyLoginCredentials,
} from "@/lib/auth/session";
import { ensureUserRow, findUserByUsername } from "@/lib/db/users";
import { mergeFavoriteIdsForUser } from "@/lib/db/favorites";
import { isDemoAdminEnabled } from "@/lib/auth/demo-admin";
import { DEMO_ADMIN_USERNAME } from "@/lib/auth/session";

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

  const limited = await consumeAuthRateLimit(request, "login");
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "Retry-After": String(limited.retryAfterSec),
          "X-ScoreLive-RL": String(limited.count),
        },
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

  let ok = false;
  try {
    ok = await verifyLoginCredentials(username, password);
  } catch (error) {
    console.error("[scorelive-db]", error);
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 503 },
    );
  }
  if (!ok) {
    return NextResponse.json(
      { error: "invalid_credentials" },
      {
        status: 401,
        headers: { "X-ScoreLive-RL": String(limited.count) },
      },
    );
  }

  let token: string;
  try {
    token = await mintSession(username);
  } catch (error) {
    console.error("[scorelive-db]", error);
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 503 },
    );
  }
  const response = NextResponse.json({ ok: true, username });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

  const clientFavorites = normalizeFavoriteIds(body.favorites);
  const cookieHeader = request.headers.get("cookie") ?? "";
  const existingCookie = parseFavoriteIds(
    cookieValue(cookieHeader, FAVORITES_COOKIE),
  );

  let dbUser = await findUserByUsername(username);
  if (
    !dbUser &&
    isDemoAdminEnabled() &&
    username === DEMO_ADMIN_USERNAME
  ) {
    dbUser = await ensureUserRow(username);
  }
  let merged = normalizeFavoriteIds([...existingCookie, ...clientFavorites]);
  if (dbUser) {
    merged = await mergeFavoriteIdsForUser(dbUser.id, merged);
  }

  response.cookies.set(
    FAVORITES_COOKIE,
    JSON.stringify(merged),
    sessionCookieOptions(),
  );

  return response;
}
