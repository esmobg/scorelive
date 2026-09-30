import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";
import {
  passwordResetTokens,
  type DbPasswordResetToken,
} from "@/lib/db/schema";
import { createId } from "@/lib/tournament/id";

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export function hashResetToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function newRawResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function insertPasswordResetToken(input: {
  username: string;
  rawToken: string;
  expiresAt: Date;
}): Promise<DbPasswordResetToken> {
  await ensureSchema();
  const row: DbPasswordResetToken = {
    id: createId("prt"),
    tokenHash: hashResetToken(input.rawToken),
    username: input.username.trim().toLowerCase(),
    expiresAt: input.expiresAt.toISOString(),
    usedAt: null,
  };
  await getDb().insert(passwordResetTokens).values(row);
  return row;
}

export async function findActiveResetToken(
  rawToken: string,
): Promise<DbPasswordResetToken | null> {
  await ensureSchema();
  const tokenHash = hashResetToken(rawToken);
  const now = new Date().toISOString();
  const rows = await getDb()
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function markResetTokenUsed(id: string): Promise<boolean> {
  await ensureSchema();
  const now = new Date().toISOString();
  const result = await getDb()
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(
      and(eq(passwordResetTokens.id, id), isNull(passwordResetTokens.usedAt)),
    );
  return (result.rowsAffected ?? 0) > 0;
}

/** Invalidate unused tokens for a username (e.g. after a successful reset). */
export async function invalidateResetTokensForUsername(
  username: string,
): Promise<void> {
  await ensureSchema();
  const now = new Date().toISOString();
  await getDb()
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(passwordResetTokens.username, username.trim().toLowerCase()),
        isNull(passwordResetTokens.usedAt),
      ),
    );
}
