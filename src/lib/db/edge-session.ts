import { createClient } from "@libsql/client/web";

/**
 * Edge-safe active-session probe for middleware (Turso HTTP only).
 * Returns:
 * - true / false when a remote Turso URL is configured
 * - "skip" for local file DB (Node API routes still enforce revoke)
 */
export async function isSessionActiveEdge(
  jti: string,
): Promise<boolean | "skip"> {
  const url = process.env.TURSO_DATABASE_URL?.trim() ?? "";
  if (!url || url.startsWith("file:")) {
    return "skip";
  }

  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  const client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });

  try {
    const now = new Date().toISOString();
    const result = await client.execute({
      sql: `SELECT id FROM sessions
            WHERE id = ?
              AND revoked_at IS NULL
              AND expires_at > ?
            LIMIT 1`,
      args: [jti, now],
    });
    return result.rows.length > 0;
  } catch (error) {
    console.error("[scorelive-session-edge]", error);
    // Fail closed on Turso errors in production middleware.
    return false;
  } finally {
    client.close();
  }
}
