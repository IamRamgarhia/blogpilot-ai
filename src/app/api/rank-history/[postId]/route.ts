import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  await ensureMigrated();
  const { postId } = await params;
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.rankHistory)
    .where(eq(schema.rankHistory.postId, postId))
    .all();
  return NextResponse.json({ history: rows });
}
