import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";
import { authRateLimits } from "@/lib/db/schema";

/**
 * Atomically increment a durable IP/minute counter.
 * Returns the new count and when the window resets.
 */
export async function incrementAuthRateLimit(input: {
  key: string;
  windowMs: number;
  now?: number;
}): Promise<{ count: number; resetAt: number }> {
  await ensureSchema();
  const now = input.now ?? Date.now();
  const db = getDb();
  const existing = await db
    .select()
    .from(authRateLimits)
    .where(eq(authRateLimits.key, input.key))
    .limit(1);

  const row = existing[0];
  if (!row || Date.parse(row.resetAt) <= now) {
    const resetAt = now + input.windowMs;
    await db
      .insert(authRateLimits)
      .values({
        key: input.key,
        count: 1,
        resetAt: new Date(resetAt).toISOString(),
      })
      .onConflictDoUpdate({
        target: authRateLimits.key,
        set: {
          count: 1,
          resetAt: new Date(resetAt).toISOString(),
        },
      });
    return { count: 1, resetAt };
  }

  const nextCount = row.count + 1;
  await db
    .update(authRateLimits)
    .set({ count: nextCount })
    .where(eq(authRateLimits.key, input.key));
  return { count: nextCount, resetAt: Date.parse(row.resetAt) };
}
