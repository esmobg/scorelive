import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";
import { users, type DbUser } from "@/lib/db/schema";
import { createId } from "@/lib/tournament/id";
import { randomBytes } from "node:crypto";

export async function findUserByUsername(
  username: string,
): Promise<DbUser | null> {
  await ensureSchema();
  const normalized = username.trim().toLowerCase();
  const rows = await getDb()
    .select()
    .from(users)
    .where(eq(users.username, normalized))
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  await ensureSchema();
  const rows = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  await ensureSchema();
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  const rows = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  return rows[0] ?? null;
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  email?: string | null;
}): Promise<DbUser> {
  await ensureSchema();
  const now = new Date().toISOString();
  const email =
    typeof input.email === "string" && input.email.trim()
      ? input.email.trim().toLowerCase()
      : null;
  const row: DbUser = {
    id: createId("usr"),
    username: input.username.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    email,
    createdAt: now,
  };
  await getDb().insert(users).values(row);
  return row;
}

export async function updateUserPasswordHash(
  username: string,
  passwordHash: string,
): Promise<boolean> {
  await ensureSchema();
  const result = await getDb()
    .update(users)
    .set({ passwordHash })
    .where(eq(users.username, username.trim().toLowerCase()));
  return (result.rowsAffected ?? 0) > 0;
}

export async function usernameExists(username: string): Promise<boolean> {
  return (await findUserByUsername(username)) !== null;
}

/**
 * Ensure a users row exists for a session username (e.g. demo admin).
 * Password hash is random — demo admin still authenticates via env hash.
 */
export async function ensureUserRow(username: string): Promise<DbUser> {
  const existing = await findUserByUsername(username);
  if (existing) {
    return existing;
  }
  const passwordHash = await bcrypt.hash(randomBytes(24).toString("hex"), 10);
  return createUser({ username, passwordHash });
}
