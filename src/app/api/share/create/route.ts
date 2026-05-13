import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { newShareToken, defaultExpiry } from "@/lib/portal";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId, scope, days } = (await req.json()) as {
    clientId: string;
    scope?: string;
    days?: number;
  };
  const db = getDb();
  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, clientId)).get();
  if (!client) return NextResponse.json({ error: "not found" }, { status: 404 });

  const token = newShareToken();
  const id = randomUUID();
  await db
    .insert(schema.shareLinks)
    .values({
      id,
      clientId,
      token,
      scope: scope ?? "calendar",
      expiresAt: defaultExpiry(days ?? 30)
    })
    .run();
  return NextResponse.json({
    ok: true,
    token,
    url: `/p/${token}`
  });
}
