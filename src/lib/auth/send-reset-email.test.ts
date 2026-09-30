import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isResendConfigured,
  sendPasswordResetEmail,
} from "@/lib/auth/send-reset-email";

describe("sendPasswordResetEmail", () => {
  const originalFetch = globalThis.fetch;
  const envKeys = [
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "RESEND_FROM",
    "EMAIL_FROM",
  ] as const;
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of envKeys) {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    for (const key of envKeys) {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    }
    vi.restoreAllMocks();
  });

  it("falls back to log channel when Resend env is missing", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as typeof fetch;
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const result = await sendPasswordResetEmail({
      to: "user@example.com",
      username: "alice",
      resetUrl: "https://scorelive-app.vercel.app/reset-password?token=abc",
    });

    expect(result).toEqual({ channel: "log", ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(isResendConfigured()).toBe(false);
    expect(info).toHaveBeenCalled();
  });

  it("POSTs to Resend when RESEND_API_KEY and RESEND_FROM are set", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "ScoreLive <noreply@example.com>";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await sendPasswordResetEmail({
      to: "user@example.com",
      username: "alice",
      resetUrl: "https://scorelive-app.vercel.app/reset-password?token=abc",
    });

    expect(result).toEqual({ channel: "resend", ok: true });
    expect(isResendConfigured()).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer re_test_key",
      "Content-Type": "application/json",
    });
    const body = JSON.parse(String(init.body)) as {
      from: string;
      to: string[];
      subject: string;
      text: string;
    };
    expect(body.from).toBe("ScoreLive <noreply@example.com>");
    expect(body.to).toEqual(["user@example.com"]);
    expect(body.subject).toContain("password reset");
    expect(body.text).toContain("alice");
    expect(body.text).toContain(
      "https://scorelive-app.vercel.app/reset-password?token=abc",
    );
  });

  it("accepts RESEND_FROM_EMAIL and EMAIL_FROM aliases for from", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "ops@example.com";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
    });
    globalThis.fetch = fetchMock as typeof fetch;

    await sendPasswordResetEmail({
      to: "user@example.com",
      username: "bob",
      resetUrl: "https://example.com/reset?token=1",
    });

    const body = JSON.parse(
      String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body),
    ) as { from: string };
    expect(body.from).toBe("ops@example.com");
  });

  it("logs fallback when Resend HTTP fails", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "ScoreLive <noreply@example.com>";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "unauthorized",
    });
    globalThis.fetch = fetchMock as typeof fetch;
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const result = await sendPasswordResetEmail({
      to: "user@example.com",
      username: "alice",
      resetUrl: "https://example.com/reset?token=1",
    });

    expect(result).toEqual({
      channel: "resend",
      ok: false,
      error: "http_401",
    });
    expect(info).toHaveBeenCalled();
    const logged = JSON.parse(String(info.mock.calls[0]?.[0])) as {
      channel: string;
      resetUrl: string;
    };
    expect(logged.channel).toBe("log-fallback");
    expect(logged.resetUrl).toContain("token=1");
  });
});
