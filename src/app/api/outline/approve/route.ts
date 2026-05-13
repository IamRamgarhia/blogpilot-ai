import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await ensureMigrated();
  const { postId, outline } = (await req.json()) as { postId: string; outline: unknown };
  const db = getDb();
  await db
    .update(schema.posts)
    .set({
      outlineJson: JSON.stringify(outline),
      status: "outline_approved",
      updatedAt: Math.floor(Date.now() / 1000)
    })
    .where(eq(schema.posts.id, postId))
    .run();
  return NextResponse.json({ ok: true });
}
