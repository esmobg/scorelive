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
  count INTEGER NOT NULL,
  reset_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tournaments_owner ON tournaments(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_username ON sessions(username);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
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

  g.__scoreliveDbMigrated = SCHEMA_GENERATION;
}
