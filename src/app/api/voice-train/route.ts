import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { trainBrandVoice } from "@/lib/seo/brand-voice";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId, samples } = (await req.json()) as { clientId: string; samples: string[] };
  if (!Array.isArray(samples) || samples.length === 0) {
    return NextResponse.json({ error: "samples required" }, { status: 400 });
  }
  const profile = await trainBrandVoice(samples);
  const db = getDb();
  await db
    .update(schema.clients)
    .set({ styleProfile: JSON.stringify(profile), updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(schema.clients.id, clientId))
    .run();
  return NextResponse.json({ ok: true, profile });
}
