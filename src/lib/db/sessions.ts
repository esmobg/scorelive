import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";
import { sessions, type DbSession } from "@/lib/db/schema";
import { createId } from "@/lib/tournament/id";

export function newSessionId(): string {
  return createId("ses");
}

export async function insertSession(input: {
  id: string;
  username: string;
  expiresAt: Date;
}): Promise<DbSession> {
  await ensureSchema();
  const row: DbSession = {
    id: input.id,
    username: input.username.trim().toLowerCase(),
    expiresAt: input.expiresAt.toISOString(),
    revokedAt: null,
  };
  await getDb().insert(sessions).values(row);
  return row;
}

export async function findActiveSession(
  id: string,
): Promise<DbSession | null> {
  await ensureSchema();
  const now = new Date().toISOString();
  const rows = await getDb()
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, id),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function isSessionActive(id: string): Promise<boolean> {
  return (await findActiveSession(id)) !== null;
}

export async function revokeSession(id: string): Promise<boolean> {
  await ensureSchema();
  const now = new Date().toISOString();
  const result = await getDb()
    .update(sessions)
    .set({ revokedAt: now })
    .where(and(eq(sessions.id, id), isNull(sessions.revokedAt)));
  return (result.rowsAffected ?? 0) > 0;
}

/** Revoke every active session for a username (e.g. after password reset). */
export async function revokeSessionsForUsername(
  username: string,
): Promise<number> {
  await ensureSchema();
  const now = new Date().toISOString();
  const result = await getDb()
    .update(sessions)
    .set({ revokedAt: now })
    .where(
      and(
        eq(sessions.username, username.trim().toLowerCase()),
        isNull(sessions.revokedAt),
      ),
    );
  return result.rowsAffected ?? 0;
}
