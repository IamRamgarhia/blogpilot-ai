import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { parseGA4Csv } from "@/lib/measurement/ga4-import";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId, csv } = (await req.json()) as { clientId: string; csv: string };
  if (!csv) return NextResponse.json({ error: "csv required" }, { status: 400 });
  const { rows, rejected } = parseGA4Csv(csv);
  const db = getDb();
  for (const r of rows) {
    await db
      .insert(schema.ga4Data)
      .values({
        id: randomUUID(),
        clientId,
        date: r.date,
        url: r.url,
        organicSessions: r.organicSessions,
        organicUsers: r.organicUsers,
        bounceRate: Math.round(r.bounceRate * 1_000_000),
        avgSessionDurationSec: Math.round(r.avgSessionDurationSec)
      })
      .run();
  }
  return NextResponse.json({ ok: true, imported: rows.length, rejected });
}
