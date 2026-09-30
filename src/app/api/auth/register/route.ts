import { NextResponse } from "next/server";
import { isProductionRuntime } from "@/lib/auth/crypto-seal";
import { registerOrganizer } from "@/lib/auth/organizers";
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
} from "@/lib/auth/session";
import { replaceFavoriteIds } from "@/lib/db/favorites";

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

  const limited = consumeAuthRateLimit(request, "register");
  if (!limited.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  let body: {
    username?: string;
    password?: string;
    confirmPassword?: string;
    favorites?: string[];
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  let result;
  try {
    result = await registerOrganizer({
      username: typeof body.username === "string" ? body.username : "",
      password: typeof body.password === "string" ? body.password : "",
      confirmPassword:
        typeof body.confirmPassword === "string" ? body.confirmPassword : "",
    });
  } catch (error) {
    console.error("[scorelive-db]", error);
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 503 },
    );
  }

  if (!result.ok) {
    if (result.error === "username_taken" && isProductionRuntime()) {
      return NextResponse.json(
        { error: "registration_failed" },
        { status: 400 },
      );
    }
    const status = result.error === "username_taken" ? 409 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  let token: string;
  try {
    token = await mintSession(result.username);
  } catch (error) {
    console.error("[scorelive-db]", error);
    return NextResponse.json(
      { error: "database_unavailable" },
      { status: 503 },
    );
  }
  const response = NextResponse.json({ ok: true, username: result.username });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

  const cookieHeader = request.headers.get("cookie") ?? "";
  const clientFavorites = normalizeFavoriteIds(body.favorites);
  const existing = parseFavoriteIds(
    cookieValue(cookieHeader, FAVORITES_COOKIE),
  );
  const merged = normalizeFavoriteIds([...existing, ...clientFavorites]);
  await replaceFavoriteIds(result.userId, merged);

  response.cookies.set(
    FAVORITES_COOKIE,
    JSON.stringify(merged),
    sessionCookieOptions(),
  );

  return response;
}
