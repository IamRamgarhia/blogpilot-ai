import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { discover } from "@/lib/crawler";
import { assertExternalUrl, UnsafeUrlError } from "@/lib/net/ssrf-guard";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  await ensureMigrated();
  let body: { clientId?: string };
  try {
    body = (await req.json()) as { clientId?: string };
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { clientId } = body;
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
  const db = getDb();
  const row = await db.select().from(schema.clients).where(eq(schema.clients.id, clientId)).get();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const url = /^https?:\/\//i.test(row.url) ? row.url : `https://${row.url}`;
  try {
    assertExternalUrl(url);
  } catch (e) {
    if (e instanceof UnsafeUrlError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
    throw e;
  }

  try {
    const snap = await discover(url);
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
