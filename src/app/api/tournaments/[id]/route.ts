import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/request-guards";
import { getSession } from "@/lib/auth/session";
import { isTournamentPayload, coerceParticipantType } from "@/lib/api/tournament-payload";
import {
  deleteStoredTournament,
  getStoredTournament,
  updateTournamentPayload,
} from "@/lib/db/tournaments";
import { findUserByUsername } from "@/lib/db/users";
import type { Tournament } from "@/lib/tournament/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const stored = await getStoredTournament(id);
  if (!stored) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ tournament: stored.tournament });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const stored = await getStoredTournament(id);
  if (!stored) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const user = await findUserByUsername(session.username);
  if (!user || stored.row.ownerUserId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
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

  const next: Tournament = {
    ...body.tournament,
    id,
    participantType: coerceParticipantType(body.tournament.participantType),
    ownerUsername: user.username,
    createdAt: stored.tournament.createdAt,
  };

  const saved = await updateTournamentPayload(id, next);
  return NextResponse.json({ tournament: saved });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const stored = await getStoredTournament(id);
  if (!stored) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const user = await findUserByUsername(session.username);
  if (!user || stored.row.ownerUserId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await deleteStoredTournament(id);
  return NextResponse.json({ ok: true });
}
