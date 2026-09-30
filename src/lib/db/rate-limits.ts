import { getLibsqlClient } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";

/**
 * Atomically increment a durable IP/minute counter via libSQL upsert.
 * Returns the new count and when the window resets.
 */
export async function incrementAuthRateLimit(input: {
  key: string;
  windowMs: number;
  now?: number;
}): Promise<{ count: number; resetAt: number }> {
  await ensureSchema();
  const client = getLibsqlClient();
  const now = input.now ?? Date.now();
  const nowIso = new Date(now).toISOString();
  const resetAt = now + input.windowMs;
  const resetIso = new Date(resetAt).toISOString();

  await client.execute({
    sql: `INSERT INTO auth_rate_limits (key, hit_count, reset_at)
          VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET
            hit_count = CASE
              WHEN auth_rate_limits.reset_at <= ? THEN 1
              ELSE auth_rate_limits.hit_count + 1
            END,
            reset_at = CASE
              WHEN auth_rate_limits.reset_at <= ? THEN excluded.reset_at
              ELSE auth_rate_limits.reset_at
            END`,
    args: [input.key, resetIso, nowIso, nowIso],
  });

  const row = await client.execute({
    sql: `SELECT hit_count AS hits, reset_at AS resets FROM auth_rate_limits WHERE key = ? LIMIT 1`,
    args: [input.key],
  });
  const selected = row.rows[0];
  if (!selected) {
    throw new Error("auth_rate_limits upsert did not persist a row");
  }
  const hits = Number(selected.hits ?? selected[0]);
  const resetRaw = String(selected.resets ?? selected[1] ?? "");
  if (!Number.isFinite(hits) || !resetRaw) {
    throw new Error("auth_rate_limits row malformed");
  }
  return {
    count: hits,
    resetAt: Date.parse(resetRaw),
  };
}
