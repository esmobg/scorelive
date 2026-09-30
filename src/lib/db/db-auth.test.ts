import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { resetDbClientsForTests } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";
import {
  createUser,
  findUserByUsername,
  usernameExists,
} from "@/lib/db/users";
import {
  insertTournament,
  getStoredTournament,
  listStoredTournaments,
  deleteStoredTournament,
} from "@/lib/db/tournaments";
import {
  listFavoriteIds,
  replaceFavoriteIds,
} from "@/lib/db/favorites";
import { createEmptyTournament } from "@/lib/tournament";
import { registerOrganizer, verifyOrganizerCredentials } from "@/lib/auth/organizers";

const dbPath = path.join(process.cwd(), ".data", "scorelive-test.db");

beforeEach(() => {
  process.env.TURSO_DATABASE_URL = `file:${dbPath}`;
  delete process.env.TURSO_AUTH_TOKEN;
  resetDbClientsForTests();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});

afterEach(() => {
  resetDbClientsForTests();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});

describe("turso users auth", () => {
  it("registers and verifies organizer credentials", async () => {
    await ensureSchema();
    const result = await registerOrganizer({
      username: "alice_org",
      password: "securepass1",
      confirmPassword: "securepass1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(await usernameExists("alice_org")).toBe(true);
    expect(await verifyOrganizerCredentials("alice_org", "securepass1")).toBe(
      true,
    );
    expect(await verifyOrganizerCredentials("alice_org", "wrongpass1")).toBe(
      false,
    );
  });

  it("stores tournaments and favorites for a user", async () => {
    await ensureSchema();
    const user = await createUser({
      username: "bob",
      passwordHash: "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUV",
    });
    const tournament = createEmptyTournament({
      name: "Cup",
      sport: "Chess",
      startDate: "2026-01-01",
      endDate: "2026-01-02",
      format: "swiss",
      ownerUsername: user.username,
    });
    await insertTournament({
      id: tournament.id,
      ownerUserId: user.id,
      tournament,
    });
    const listed = await listStoredTournaments();
    expect(listed).toHaveLength(1);
    expect(listed[0].tournament.name).toBe("Cup");
    const fetched = await getStoredTournament(tournament.id);
    expect(fetched?.ownerUsername).toBe("bob");

    await replaceFavoriteIds(user.id, [tournament.id, "demo-swiss"]);
    const favs = await listFavoriteIds(user.id);
    expect(favs).toHaveLength(2);
    expect(favs).toEqual(expect.arrayContaining([tournament.id, "demo-swiss"]));

    await deleteStoredTournament(tournament.id);
    expect(await getStoredTournament(tournament.id)).toBeNull();
    expect(await findUserByUsername("bob")).not.toBeNull();
  });
});
