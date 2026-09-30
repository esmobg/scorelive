import { NextResponse } from "next/server";
import { getLibsqlClient, isRemoteTursoConfigured } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";
import { incrementAuthRateLimit } from "@/lib/db/rate-limits";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let db: "turso" | "local" | "down" = "down";
  let rateLimit: { ok: true; count: number } | { ok: false; error: string } = {
    ok: false,
    error: "not_checked",
  };

  try {
    await ensureSchema();
    const client = getLibsqlClient();
    await client.execute("SELECT 1 AS ok");
    db = isRemoteTursoConfigured() ? "turso" : "local";
  } catch (error) {
    console.error("[scorelive-health]", error);
    db = "down";
  }

  if (db !== "down") {
    try {
      const probe = await incrementAuthRateLimit({
        key: `health:probe:${Math.floor(Date.now() / 60_000)}`,
        windowMs: 60_000,
      });
      rateLimit = { ok: true, count: probe.count };
    } catch (error) {
      console.error("[scorelive-health-rate]", error);
      rateLimit = {
        ok: false,
        error: error instanceof Error ? error.message : "rate_limit_failed",
      };
    }
  }

  const ok = db !== "down";
  return NextResponse.json(
    {
      ok,
      app: "scorelive",
      db,
      rateLimit,
      latencyMs: Date.now() - started,
    },
    { status: ok ? 200 : 503 },
  );
}
