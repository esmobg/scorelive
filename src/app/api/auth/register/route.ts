import { NextResponse } from "next/server";
import { isProductionRuntime } from "@/lib/auth/crypto-seal";
import {
  ORGANIZERS_COOKIE,
  organizersCookieOptions,
  registerOrganizer,
  sealOrganizersCookie,
} from "@/lib/auth/organizers";
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

  const cookieHeader = request.headers.get("cookie") ?? "";
  const organizersRaw = cookieValue(cookieHeader, ORGANIZERS_COOKIE);

  const result = await registerOrganizer({
    username: typeof body.username === "string" ? body.username : "",
    password: typeof body.password === "string" ? body.password : "",
    confirmPassword:
      typeof body.confirmPassword === "string" ? body.confirmPassword : "",
    cookieRaw: organizersRaw,
  });

  if (!result.ok) {
    if (result.error === "username_taken" && isProductionRuntime()) {
      // Soften username enumeration in production (H2).
      return NextResponse.json(
        { error: "registration_failed" },
        { status: 400 },
      );
    }
    const status =
      result.error === "username_taken"
        ? 409
        : result.error === "password_mismatch" ||
            result.error === "invalid_username" ||
            result.error === "invalid_password"
          ? 400
          : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  const token = await createSessionToken(result.username);
  const response = NextResponse.json({ ok: true, username: result.username });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  response.cookies.set(
    ORGANIZERS_COOKIE,
    await sealOrganizersCookie(result.organizers),
    organizersCookieOptions(),
  );

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
