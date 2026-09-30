import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth/session-token";
import { isSessionActiveEdge } from "@/lib/db/edge-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/organize")) {
    const payload = await verifySessionToken(
      request.cookies.get(SESSION_COOKIE)?.value,
    );
    if (!payload) {
      return redirectToLogin(request, pathname);
    }

    const active = await isSessionActiveEdge(payload.jti);
    if (active === false) {
      return redirectToLogin(request, pathname);
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/organize/:path*"],
};
