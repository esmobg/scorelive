import { afterEach, describe, expect, it } from "vitest";
import {
  hmacSignBase64Url,
  toBase64Url,
} from "@/lib/auth/crypto-seal";
import { isDemoAdminEnabled } from "@/lib/auth/demo-admin";
import {
  sealOrganizersCookie,
  unsealOrganizersCookie,
} from "@/lib/auth/organizers";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import {
  createSessionToken,
  mergeFavoriteIds,
  normalizeFavoriteIds,
  verifySessionToken,
} from "@/lib/auth/session-token";

const PREV_SECRET = process.env.TURNYFLY_SESSION_SECRET;
const PREV_DEMO = process.env.DEMO_ADMIN_ENABLED;
const PREV_VERCEL = process.env.VERCEL_ENV;

afterEach(() => {
  if (PREV_SECRET === undefined) {
    delete process.env.TURNYFLY_SESSION_SECRET;
  } else {
    process.env.TURNYFLY_SESSION_SECRET = PREV_SECRET;
  }
  if (PREV_DEMO === undefined) {
    delete process.env.DEMO_ADMIN_ENABLED;
  } else {
    process.env.DEMO_ADMIN_ENABLED = PREV_DEMO;
  }
  if (PREV_VERCEL === undefined) {
    delete process.env.VERCEL_ENV;
  } else {
    process.env.VERCEL_ENV = PREV_VERCEL;
  }
});

describe("safeRedirectPath", () => {
  it("blocks protocol-relative and external next params", () => {
    expect(safeRedirectPath("//evil.example")).toBe("/organize");
    expect(safeRedirectPath("https://evil.example")).toBe("/organize");
    expect(safeRedirectPath("/\\evil")).toBe("/organize");
    expect(safeRedirectPath("/%2F%2Fevil.example")).toBe("/organize");
  });

  it("allowslisted relative paths", () => {
    expect(safeRedirectPath("/organize/demo-volleyball")).toBe(
      "/organize/demo-volleyball",
    );
    expect(safeRedirectPath("/favorites")).toBe("/favorites");
    expect(safeRedirectPath("/not-allowed")).toBe("/organize");
  });
});

describe("sealed organizers cookie", () => {
  it("rejects unsigned forged registries", async () => {
    process.env.TURNYFLY_SESSION_SECRET =
      "unit-test-session-secret-32chars-min!!";
    const forged = btoa(
      JSON.stringify([
        {
          username: "forged_user",
          passwordHash:
            "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUV",
        },
      ]),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    expect(await unsealOrganizersCookie(forged)).toEqual([]);
  });

  it("round-trips sealed organizers", async () => {
    process.env.TURNYFLY_SESSION_SECRET =
      "unit-test-session-secret-32chars-min!!";
    const users = [
      { username: "alice", passwordHash: "$2b$10$abcdefghijklmnopqrstuu" },
    ];
    const sealed = await sealOrganizersCookie(users);
    expect(sealed.includes(".")).toBe(true);
    expect(await unsealOrganizersCookie(sealed)).toEqual(users);
  });
});

describe("session tokens", () => {
  it("mints and verifies with configured secret and jti", async () => {
    process.env.TURNYFLY_SESSION_SECRET =
      "unit-test-session-secret-32chars-min!!";
    const token = await createSessionToken("admin", "ses_testjti01");
    const payload = await verifySessionToken(token);
    expect(payload?.username).toBe("admin");
    expect(payload?.jti).toBe("ses_testjti01");
  });

  it("rejects tokens missing jti", async () => {
    process.env.TURNYFLY_SESSION_SECRET =
      "unit-test-session-secret-32chars-min!!";
    const body = toBase64Url(
      JSON.stringify({ username: "admin", exp: Date.now() + 60_000 }),
    );
    const signature = await hmacSignBase64Url(body);
    const forged = `${body}.${signature}`;
    expect(await verifySessionToken(forged)).toBeNull();
  });
});

describe("favorites cap", () => {
  it("caps unique favorite ids", () => {
    const many = Array.from({ length: 80 }, (_, i) => `id-${i}`);
    expect(normalizeFavoriteIds(many)).toHaveLength(50);
    expect(mergeFavoriteIds(many, ["extra"])).toHaveLength(50);
  });
});

describe("demo admin gate", () => {
  it("defaults off when VERCEL_ENV is production", () => {
    delete process.env.DEMO_ADMIN_ENABLED;
    process.env.VERCEL_ENV = "production";
    expect(isDemoAdminEnabled()).toBe(false);
  });

  it("can be re-enabled explicitly", () => {
    process.env.DEMO_ADMIN_ENABLED = "true";
    process.env.VERCEL_ENV = "production";
    expect(isDemoAdminEnabled()).toBe(true);
  });
});
