import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const tournaments = sqliteTable("tournaments", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id),
  payload: text("payload").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const favorites = sqliteTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    tournamentId: text("tournament_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.tournamentId] })],
);

/** Revocable auth sessions — id is the JWT-style jti embedded in the HMAC cookie. */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  expiresAt: text("expires_at").notNull(),
  revokedAt: text("revoked_at"),
});

/** Durable IP/minute auth rate-limit counters (shared across Vercel isolates). */
export const authRateLimits = sqliteTable("auth_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: text("reset_at").notNull(),
});

export type DbUser = typeof users.$inferSelect;
export type DbTournament = typeof tournaments.$inferSelect;
export type DbSession = typeof sessions.$inferSelect;
