import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { discover } from "@/lib/crawler";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId } = (await req.json()) as { clientId: string };
  const db = getDb();
  const row = await db.select().from(schema.clients).where(eq(schema.clients.id, clientId)).get();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const snap = await discover(row.url);
    await db
      .update(schema.clients)
      .set({
        name: snap.identity.title || row.name,
        language: snap.identity.language,
        discoverySnapshot: JSON.stringify(snap),
        updatedAt: Math.floor(Date.now() / 1000)
      })
      .where(eq(schema.clients.id, clientId))
      .run();
    return NextResponse.json({ ok: true, snapshot: snap });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
