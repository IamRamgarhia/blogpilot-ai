import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { detectDecay, type GSCRow } from "@/lib/measurement/decay-monitor";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  await ensureMigrated();
  const { clientId } = await params;
  const db = getDb();
  const raw = await db
    .select()
    .from(schema.gscData)
    .where(eq(schema.gscData.clientId, clientId))
    .all();
  const rows: GSCRow[] = raw.map((r) => ({
    date: r.date,
    url: r.url,
    clicks: r.clicks,
    impressions: r.impressions,
    position: r.position != null ? r.position / 10 : null
  }));
  const alerts = detectDecay(rows);

  // Persist alerts (overwriting unresolved ones for the same URL+signal).
  for (const a of alerts) {
    await db
      .insert(schema.decayAlerts)
      .values({
        id: randomUUID(),
        clientId,
        url: a.url,
        signal: a.signal,
        severity: a.severity,
        detailJson: JSON.stringify(a)
      })
      .run();
  }

  return NextResponse.json({ alerts, sampledUrls: new Set(rows.map((r) => r.url)).size });
}
