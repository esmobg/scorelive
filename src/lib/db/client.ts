import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/lib/db/schema";
import path from "node:path";

export type AppDatabase = LibSQLDatabase<typeof schema>;

type GlobalDb = {
  __scoreliveLibsql?: Client;
  __scoreliveDb?: AppDatabase;
  /** Schema migration generation — bump when MIGRATION_SQL gains tables. */
  __scoreliveDbMigrated?: number;
};

function resolveDatabaseUrl(): string {
  const configured = process.env.TURSO_DATABASE_URL?.trim();
  if (configured) {
    return configured;
  }
  // Local / test fallback — file-backed libSQL (not for multi-instance prod).
  const filePath = path.join(process.cwd(), ".data", "scorelive.db");
  return `file:${filePath}`;
}

export function getLibsqlClient(): Client {
  const g = globalThis as typeof globalThis & GlobalDb;
  if (!g.__scoreliveLibsql) {
    const url = resolveDatabaseUrl();
    const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
    g.__scoreliveLibsql = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    });
  }
  return g.__scoreliveLibsql;
}

export function getDb(): AppDatabase {
  const g = globalThis as typeof globalThis & GlobalDb;
  if (!g.__scoreliveDb) {
    g.__scoreliveDb = drizzle(getLibsqlClient(), { schema });
  }
  return g.__scoreliveDb;
}

export function isRemoteTursoConfigured(): boolean {
  const url = process.env.TURSO_DATABASE_URL?.trim() ?? "";
  return url.startsWith("libsql://") || url.startsWith("https://");
}

/** Reset cached clients — used by unit tests. */
export function resetDbClientsForTests(): void {
  const g = globalThis as typeof globalThis & GlobalDb;
  g.__scoreliveLibsql?.close();
  delete g.__scoreliveLibsql;
  delete g.__scoreliveDb;
  delete g.__scoreliveDbMigrated;
}

export const SCHEMA_GENERATION = 3;
