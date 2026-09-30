import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";
import { tournaments, users, type DbTournament } from "@/lib/db/schema";
import type { Tournament } from "@/lib/tournament/types";

function parsePayload(raw: string): Tournament | null {
  try {
    const parsed = JSON.parse(raw) as Tournament;
    if (!parsed || typeof parsed !== "object" || typeof parsed.id !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export interface StoredTournamentRow {
  row: DbTournament;
  tournament: Tournament;
  ownerUsername: string;
}

export async function listStoredTournaments(): Promise<StoredTournamentRow[]> {
  await ensureSchema();
  const rows = await getDb()
    .select({
      tournament: tournaments,
      ownerUsername: users.username,
    })
    .from(tournaments)
    .innerJoin(users, eq(tournaments.ownerUserId, users.id))
    .orderBy(desc(tournaments.updatedAt));

  const out: StoredTournamentRow[] = [];
  for (const item of rows) {
    const tournament = parsePayload(item.tournament.payload);
    if (!tournament) continue;
    out.push({
      row: item.tournament,
      tournament: {
        ...tournament,
        id: item.tournament.id,
        ownerUsername: item.ownerUsername,
      },
      ownerUsername: item.ownerUsername,
    });
  }
  return out;
}

export async function getStoredTournament(
  id: string,
): Promise<StoredTournamentRow | null> {
  await ensureSchema();
  const rows = await getDb()
    .select({
      tournament: tournaments,
      ownerUsername: users.username,
    })
    .from(tournaments)
    .innerJoin(users, eq(tournaments.ownerUserId, users.id))
    .where(eq(tournaments.id, id))
    .limit(1);
  const item = rows[0];
  if (!item) return null;
  const tournament = parsePayload(item.tournament.payload);
  if (!tournament) return null;
  return {
    row: item.tournament,
    tournament: {
      ...tournament,
      id: item.tournament.id,
      ownerUsername: item.ownerUsername,
    },
    ownerUsername: item.ownerUsername,
  };
}

export async function insertTournament(input: {
  id: string;
  ownerUserId: string;
  tournament: Tournament;
}): Promise<Tournament> {
  await ensureSchema();
  const now = new Date().toISOString();
  const payload: Tournament = {
    ...input.tournament,
    id: input.id,
    updatedAt: now,
    createdAt: input.tournament.createdAt || now,
  };
  await getDb().insert(tournaments).values({
    id: input.id,
    ownerUserId: input.ownerUserId,
    payload: JSON.stringify(payload),
    createdAt: payload.createdAt,
    updatedAt: now,
  });
  return payload;
}

export async function updateTournamentPayload(
  id: string,
  tournament: Tournament,
): Promise<Tournament> {
  await ensureSchema();
  const now = new Date().toISOString();
  const payload: Tournament = {
    ...tournament,
    id,
    updatedAt: now,
  };
  await getDb()
    .update(tournaments)
    .set({
      payload: JSON.stringify(payload),
      updatedAt: now,
    })
    .where(eq(tournaments.id, id));
  return payload;
}

export async function deleteStoredTournament(id: string): Promise<void> {
  await ensureSchema();
  await getDb().delete(tournaments).where(eq(tournaments.id, id));
}
