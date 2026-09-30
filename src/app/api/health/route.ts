import { NextResponse } from "next/server";
import { getLibsqlClient, isRemoteTursoConfigured } from "@/lib/db/client";
import { ensureSchema } from "@/lib/db/migrate";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let db: "turso" | "local" | "down" = "down";

  try {
    await ensureSchema();
    const client = getLibsqlClient();
    await client.execute("SELECT 1 AS ok");
    db = isRemoteTursoConfigured() ? "turso" : "local";
  } catch (error) {
    console.error("[scorelive-health]", error);
    db = "down";
  }

  const ok = db !== "down";
  return NextResponse.json(
    {
      ok,
      app: "scorelive",
      db,
      latencyMs: Date.now() - started,
    },
    { status: ok ? 200 : 503 },
  );
}
