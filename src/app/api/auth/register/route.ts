import { NextResponse } from "next/server";
import {
  ORGANIZERS_COOKIE,
  organizersCookieOptions,
  registerOrganizer,
  serializeOrganizersCookie,
} from "@/lib/auth/organizers";
import {
  createSessionToken,
  FAVORITES_COOKIE,
  mergeFavoriteIds,
  parseFavoriteIds,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function POST(request: Request) {
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
  const organizersRaw = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ORGANIZERS_COOKIE}=`))
    ?.slice(ORGANIZERS_COOKIE.length + 1);

  const result = await registerOrganizer({
    username: typeof body.username === "string" ? body.username : "",
    password: typeof body.password === "string" ? body.password : "",
    confirmPassword:
      typeof body.confirmPassword === "string" ? body.confirmPassword : "",
    cookieRaw: organizersRaw,
  });

  if (!result.ok) {
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
    serializeOrganizersCookie(result.organizers),
    organizersCookieOptions(),
  );

  const clientFavorites = Array.isArray(body.favorites)
    ? body.favorites.filter((id): id is string => typeof id === "string")
    : [];
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
