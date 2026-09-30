import { getLibsqlClient, SCHEMA_GENERATION } from "@/lib/db/client";

type GlobalDb = {
  __scoreliveDbMigrated?: number;
};

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL REFERENCES users(id),
  tournament_id TEXT NOT NULL,
  PRIMARY KEY (user_id, tournament_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  key TEXT PRIMARY KEY NOT NULL,
  hit_count INTEGER NOT NULL,
  reset_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tournaments_owner ON tournaments(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_username ON sessions(username);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_username ON password_reset_tokens(username);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
`;

/**
 * Idempotent schema bootstrap for Turso / local libSQL.
 * Safe to call on every request; caches success on the process.
 */
export async function ensureSchema(): Promise<void> {
  const g = globalThis as typeof globalThis & GlobalDb;
  if (g.__scoreliveDbMigrated === SCHEMA_GENERATION) {
    return;
  }

  const client = getLibsqlClient();
  const statements = MIGRATION_SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const sql of statements) {
    await client.execute(sql);
  }

  // Rename legacy `count` column if an older schema generation created it.
  try {
    const cols = await client.execute(`PRAGMA table_info(auth_rate_limits)`);
    const names = new Set(
      cols.rows.map((row) => String(row.name ?? row[1] ?? "")),
    );
    if (names.has("count") && !names.has("hit_count")) {
      await client.execute(
        `ALTER TABLE auth_rate_limits RENAME COLUMN count TO hit_count`,
      );
    }
  } catch (error) {
    console.error("[scorelive-migrate-rate-limits]", error);
  }

  // Add users.email for accounts created before password-reset support.
  try {
    const cols = await client.execute(`PRAGMA table_info(users)`);
    const names = new Set(
      cols.rows.map((row) => String(row.name ?? row[1] ?? "")),
    );
    if (!names.has("email")) {
      await client.execute(`ALTER TABLE users ADD COLUMN email TEXT`);
    }
  } catch (error) {
    console.error("[scorelive-migrate-users-email]", error);
  }

  g.__scoreliveDbMigrated = SCHEMA_GENERATION;
}
