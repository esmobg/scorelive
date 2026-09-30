import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/request-guards";
import { getSession } from "@/lib/auth/session";
import { isTournamentPayload } from "@/lib/api/tournament-payload";
import {
  insertTournament,
  listStoredTournaments,
} from "@/lib/db/tournaments";
import { ensureUserRow, findUserByUsername } from "@/lib/db/users";
import { isDemoAdminEnabled } from "@/lib/auth/demo-admin";
import { DEMO_ADMIN_USERNAME } from "@/lib/auth/session";
import { createId } from "@/lib/tournament/id";
import type { Tournament } from "@/lib/tournament/types";

export async function GET() {
  const rows = await listStoredTournaments();
  const tournaments = rows.map((r) => r.tournament);
  return NextResponse.json({ tournaments });
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let user = await findUserByUsername(session.username);
  if (
    !user &&
    isDemoAdminEnabled() &&
    session.username === DEMO_ADMIN_USERNAME
  ) {
    user = await ensureUserRow(session.username);
  }
  if (!user) {
    return NextResponse.json(
      { error: "register_required" },
      { status: 403 },
    );
  }

  let body: { tournament?: unknown };
  try {
    body = (await request.json()) as { tournament?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!isTournamentPayload(body.tournament)) {
    return NextResponse.json({ error: "invalid_tournament" }, { status: 400 });
  }

  const incoming = body.tournament;
  const id =
    typeof incoming.id === "string" && incoming.id.trim()
      ? incoming.id.trim()
      : createId("t");

  const tournament: Tournament = {
    ...incoming,
    id,
    ownerUsername: user.username,
  };

  const saved = await insertTournament({
    id,
    ownerUserId: user.id,
    tournament,
  });

  return NextResponse.json({ tournament: saved }, { status: 201 });
}
