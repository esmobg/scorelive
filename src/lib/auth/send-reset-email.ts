/**
 * Deliver a password-reset link via Resend when configured; otherwise log it.
 * Never throws to the caller — delivery failures must not block the API response.
 */

export type ResetEmailResult =
  | { channel: "resend"; ok: true }
  | { channel: "resend"; ok: false; error: string }
  | { channel: "log"; ok: true };

/**
 * Resend is optional. Production ships without keys — reset links go to
 * server logs until RESEND_API_KEY and a from address are configured.
 * From address aliases (first match wins): RESEND_FROM_EMAIL, RESEND_FROM, EMAIL_FROM.
 */
function resendConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "";
  if (!apiKey || !from) {
    return null;
  }
  return { apiKey, from };
}

export async function sendPasswordResetEmail(input: {
  to: string;
  username: string;
  resetUrl: string;
}): Promise<ResetEmailResult> {
  const config = resendConfig();
  if (!config) {
    console.info(
      JSON.stringify({
        level: "info",
        source: "scorelive-password-reset",
        channel: "log",
        username: input.username,
        to: input.to,
        resetUrl: input.resetUrl,
      }),
    );
    return { channel: "log", ok: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [input.to],
        subject: "ScoreLive password reset",
        text: [
          `Hi ${input.username},`,
          "",
          "Use this link to reset your ScoreLive password (valid for 1 hour):",
          input.resetUrl,
          "",
          "If you did not request this, you can ignore this email.",
        ].join("\n"),
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[scorelive-password-reset-resend]", response.status, detail);
      // Fallback: still log the link so local/ops recovery works.
      console.info(
        JSON.stringify({
          level: "info",
          source: "scorelive-password-reset",
          channel: "log-fallback",
          username: input.username,
          to: input.to,
          resetUrl: input.resetUrl,
        }),
      );
      return { channel: "resend", ok: false, error: `http_${response.status}` };
    }
    return { channel: "resend", ok: true };
  } catch (error) {
    console.error("[scorelive-password-reset-resend]", error);
    console.info(
      JSON.stringify({
        level: "info",
        source: "scorelive-password-reset",
        channel: "log-fallback",
        username: input.username,
        to: input.to,
        resetUrl: input.resetUrl,
      }),
    );
    return { channel: "resend", ok: false, error: "network" };
  }
}

/** True when Resend delivery is configured (not whether a user has email). */
export function isResendConfigured(): boolean {
  return resendConfig() !== null;
}
