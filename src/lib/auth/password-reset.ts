import bcrypt from "bcryptjs";
import {
  invalidateResetTokensForUsername,
  insertPasswordResetToken,
  findActiveResetToken,
  markResetTokenUsed,
  newRawResetToken,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/db/password-reset";
import { revokeSessionsForUsername } from "@/lib/db/sessions";
import {
  findUserByEmail,
  findUserByUsername,
  updateUserPasswordHash,
} from "@/lib/db/users";
import { sendPasswordResetEmail } from "@/lib/auth/send-reset-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function siteBaseUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");
  if (host) {
    return `${proto}://${host}`;
  }
  return "http://127.0.0.1:43123";
}

/**
 * Start a password reset for a username or email identifier.
 * Always succeeds from the caller's perspective (no user enumeration).
 */
export async function requestPasswordReset(input: {
  identifier: string;
  request: Request;
}): Promise<{ ok: true }> {
  const identifier = input.identifier.trim();
  if (!identifier) {
    return { ok: true };
  }

  const user = identifier.includes("@")
    ? await findUserByEmail(identifier)
    : await findUserByUsername(identifier);

  if (!user) {
    return { ok: true };
  }

  const rawToken = newRawResetToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await insertPasswordResetToken({
    username: user.username,
    rawToken,
    expiresAt,
  });

  const resetUrl = `${siteBaseUrl(input.request)}/reset-password?token=${encodeURIComponent(rawToken)}`;

  if (user.email) {
    await sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      resetUrl,
    });
  } else {
    // No recovery email on file — log the link for local/ops fallback.
    console.info(
      JSON.stringify({
        level: "info",
        source: "scorelive-password-reset",
        channel: "log",
        username: user.username,
        to: null,
        resetUrl,
        note: "user_has_no_email",
      }),
    );
  }

  return { ok: true };
}

export type ResetPasswordResult =
  | { ok: true; username: string }
  | {
      ok: false;
      error: "invalid_token" | "invalid_password" | "password_mismatch";
    };

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ResetPasswordResult> {
  const token = input.token.trim();
  if (!token) {
    return { ok: false, error: "invalid_token" };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "invalid_password" };
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false, error: "password_mismatch" };
  }

  const row = await findActiveResetToken(token);
  if (!row) {
    return { ok: false, error: "invalid_token" };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const updated = await updateUserPasswordHash(row.username, passwordHash);
  if (!updated) {
    return { ok: false, error: "invalid_token" };
  }

  await markResetTokenUsed(row.id);
  await invalidateResetTokensForUsername(row.username);
  await revokeSessionsForUsername(row.username);

  return { ok: true, username: row.username };
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
