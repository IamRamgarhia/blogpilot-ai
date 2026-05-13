import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { parseGSCCsv } from "@/lib/measurement/gsc-import";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId, csv } = (await req.json()) as { clientId: string; csv: string };
  if (!csv) return NextResponse.json({ error: "csv required" }, { status: 400 });
  const { rows, rejected } = parseGSCCsv(csv);
  const db = getDb();
  for (const r of rows) {
    await db
      .insert(schema.gscData)
      .values({
        id: randomUUID(),
        clientId,
        date: r.date,
        url: r.url,
        query: null,
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position != null ? Math.round(r.position * 10) : null,
        ctr: r.impressions > 0 ? Math.round((r.clicks / r.impressions) * 1_000_000) : 0
      })
      .run();
  }
  return NextResponse.json({ ok: true, imported: rows.length, rejected });
}
