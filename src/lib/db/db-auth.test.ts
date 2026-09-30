import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
import {
  insertSession,
  isSessionActive,
  newSessionId,
  revokeSession,
} from "@/lib/db/sessions";
import { incrementAuthRateLimit } from "@/lib/db/rate-limits";
import {
  findActiveResetToken,
  hashResetToken,
  insertPasswordResetToken,
  newRawResetToken,
} from "@/lib/db/password-reset";
import { createEmptyTournament } from "@/lib/tournament";
import {
  requestPasswordReset,
  resetPasswordWithToken,
} from "@/lib/auth/password-reset";
import { registerOrganizer, verifyOrganizerCredentials } from "@/lib/auth/organizers";
import {
  AUTH_RATE_LIMIT,
  AUTH_RATE_WINDOW_MS,
  consumeAuthRateLimit,
} from "@/lib/auth/request-guards";
import {
  createSessionToken,
  resolveSession,
  mintSession,
  verifySessionToken,
} from "@/lib/auth/session";

const dbPath = path.join(process.cwd(), ".data", "scorelive-test.db");
const PREV_SECRET = process.env.TURNYFLY_SESSION_SECRET;

beforeEach(() => {
  process.env.TURSO_DATABASE_URL = `file:${dbPath}`;
  delete process.env.TURSO_AUTH_TOKEN;
  process.env.TURNYFLY_SESSION_SECRET =
    "unit-test-session-secret-32chars-min!!";
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
  if (PREV_SECRET === undefined) {
    delete process.env.TURNYFLY_SESSION_SECRET;
  } else {
    process.env.TURNYFLY_SESSION_SECRET = PREV_SECRET;
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

describe("revocable sessions", () => {
  it("mints a live session and rejects after revoke", async () => {
    await ensureSchema();
    const token = await mintSession("carol");
    const cryptoOk = await verifySessionToken(token);
    expect(cryptoOk?.username).toBe("carol");
    expect(cryptoOk?.jti).toBeTruthy();

    const live = await resolveSession(token);
    expect(live?.jti).toBe(cryptoOk?.jti);

    await revokeSession(cryptoOk!.jti);
    expect(await isSessionActive(cryptoOk!.jti)).toBe(false);
    expect(await resolveSession(token)).toBeNull();
  });

  it("rejects forged or missing jti even with valid HMAC shape", async () => {
    await ensureSchema();
    const token = await createSessionToken("dave", "ses_does_not_exist");
    const cryptoOk = await verifySessionToken(token);
    expect(cryptoOk?.username).toBe("dave");
    expect(await resolveSession(token)).toBeNull();
  });

  it("rejects expired session rows", async () => {
    await ensureSchema();
    const jti = newSessionId();
    await insertSession({
      id: jti,
      username: "erin",
      expiresAt: new Date(Date.now() - 1000),
    });
    const token = await createSessionToken("erin", jti);
    // Token exp is still in the future; row expiry must still fail.
    expect(await verifySessionToken(token)).not.toBeNull();
    expect(await isSessionActive(jti)).toBe(false);
    expect(await resolveSession(token)).toBeNull();
  });
});

describe("password reset tokens", () => {
  it("stores hashed tokens and completes a reset once", async () => {
    await ensureSchema();
    const registered = await registerOrganizer({
      username: "reset_user",
      password: "oldpass12",
      confirmPassword: "oldpass12",
      email: "reset_user@example.com",
    });
    expect(registered.ok).toBe(true);

    const raw = newRawResetToken();
    await insertPasswordResetToken({
      username: "reset_user",
      rawToken: raw,
      expiresAt: new Date(Date.now() + 60_000),
    });
    const active = await findActiveResetToken(raw);
    expect(active?.username).toBe("reset_user");
    expect(active?.tokenHash).toBe(hashResetToken(raw));
    expect(active?.tokenHash).not.toBe(raw);

    const sessionToken = await mintSession("reset_user");
    expect(await resolveSession(sessionToken)).not.toBeNull();

    const reset = await resetPasswordWithToken({
      token: raw,
      password: "newpass34",
      confirmPassword: "newpass34",
    });
    expect(reset.ok).toBe(true);
    expect(await verifyOrganizerCredentials("reset_user", "newpass34")).toBe(
      true,
    );
    expect(await verifyOrganizerCredentials("reset_user", "oldpass12")).toBe(
      false,
    );
    expect(await findActiveResetToken(raw)).toBeNull();
    expect(await resolveSession(sessionToken)).toBeNull();

    const reused = await resetPasswordWithToken({
      token: raw,
      password: "another99",
      confirmPassword: "another99",
    });
    expect(reused.ok).toBe(false);
    if (!reused.ok) {
      expect(reused.error).toBe("invalid_token");
    }
  });

  it("requestPasswordReset always succeeds and does not enumerate users", async () => {
    await ensureSchema();
    await registerOrganizer({
      username: "known_reset",
      password: "securepass1",
      confirmPassword: "securepass1",
      email: "known@example.com",
    });
    const request = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      headers: { host: "localhost" },
    });
    await expect(
      requestPasswordReset({ identifier: "known_reset", request }),
    ).resolves.toEqual({ ok: true });
    await expect(
      requestPasswordReset({ identifier: "missing_user_xyz", request }),
    ).resolves.toEqual({ ok: true });
    await expect(
      requestPasswordReset({ identifier: "known@example.com", request }),
    ).resolves.toEqual({ ok: true });
  });

  it("username-only accounts still get generic success without calling Resend", async () => {
    await ensureSchema();
    await registerOrganizer({
      username: "no_email_user",
      password: "securepass1",
      confirmPassword: "securepass1",
    });
    const fetchMock = vi.fn();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as typeof fetch;
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const request = new Request("http://localhost/api/auth/forgot-password", {
      method: "POST",
      headers: { host: "localhost" },
    });
    try {
      await expect(
        requestPasswordReset({ identifier: "no_email_user", request }),
      ).resolves.toEqual({ ok: true });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(info).toHaveBeenCalled();
      const logged = JSON.parse(String(info.mock.calls[0]?.[0])) as {
        note?: string;
        to: string | null;
      };
      expect(logged.note).toBe("user_has_no_email");
      expect(logged.to).toBeNull();
    } finally {
      globalThis.fetch = originalFetch;
      info.mockRestore();
    }
  });
});

describe("turso auth rate limits", () => {
  it("increments a durable counter and trips after the limit", async () => {
    await ensureSchema();
    const key = `login:203.0.113.9:${Math.floor(Date.now() / AUTH_RATE_WINDOW_MS)}`;
    for (let i = 1; i <= AUTH_RATE_LIMIT; i += 1) {
      const result = await incrementAuthRateLimit({
        key,
        windowMs: AUTH_RATE_WINDOW_MS,
      });
      expect(result.count).toBe(i);
    }
    const over = await incrementAuthRateLimit({
      key,
      windowMs: AUTH_RATE_WINDOW_MS,
    });
    expect(over.count).toBe(AUTH_RATE_LIMIT + 1);
  });

  it("returns rate_limited via consumeAuthRateLimit after 10 attempts", async () => {
    await ensureSchema();
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "x-forwarded-for": "198.51.100.44",
        host: "localhost",
      },
    });
    for (let i = 0; i < AUTH_RATE_LIMIT; i += 1) {
      const ok = await consumeAuthRateLimit(request, "login");
      expect(ok.ok).toBe(true);
    }
    const limited = await consumeAuthRateLimit(request, "login");
    expect(limited.ok).toBe(false);
    if (!limited.ok) {
      expect(limited.retryAfterSec).toBeGreaterThanOrEqual(1);
    }
  });
});
