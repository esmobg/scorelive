import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";
import { favorites } from "@/lib/db/schema";
import {
  MAX_FAVORITES,
  normalizeFavoriteIds,
} from "@/lib/auth/session-token";

export async function listFavoriteIds(userId: string): Promise<string[]> {
  await ensureSchema();
  const rows = await getDb()
    .select({ tournamentId: favorites.tournamentId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  return normalizeFavoriteIds(rows.map((r) => r.tournamentId));
}

export async function replaceFavoriteIds(
  userId: string,
  ids: string[],
): Promise<string[]> {
  await ensureSchema();
  const unique = normalizeFavoriteIds(ids).slice(0, MAX_FAVORITES);
  await getDb().delete(favorites).where(eq(favorites.userId, userId));
  if (unique.length > 0) {
    await getDb()
      .insert(favorites)
      .values(unique.map((tournamentId) => ({ userId, tournamentId })));
  }
  return unique;
}

export async function mergeFavoriteIdsForUser(
  userId: string,
  incoming: string[],
): Promise<string[]> {
  const existing = await listFavoriteIds(userId);
  return replaceFavoriteIds(userId, [...existing, ...incoming]);
}

export async function addFavorite(
  userId: string,
  tournamentId: string,
): Promise<void> {
  await ensureSchema();
  const current = await listFavoriteIds(userId);
  if (current.includes(tournamentId) || current.length >= MAX_FAVORITES) {
    return;
  }
  await getDb().insert(favorites).values({ userId, tournamentId });
}

export async function removeFavorite(
  userId: string,
  tournamentId: string,
): Promise<void> {
  await ensureSchema();
  await getDb()
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.tournamentId, tournamentId),
      ),
    );
}
