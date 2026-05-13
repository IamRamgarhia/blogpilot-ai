import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { generateOutline } from "@/lib/seo/outline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  await ensureMigrated();
  const { postId } = (await req.json()) as { postId: string };
  const db = getDb();
  const post = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  const outline = await generateOutline({
    title: post.title ?? "Untitled",
    primary_keyword: post.primaryKeyword ?? "",
    intent: post.intent ?? "informational",
    format: "long-form-guide",
    word_count_target: 1500
  });

  await db
    .update(schema.posts)
    .set({
      outlineJson: JSON.stringify(outline),
      updatedAt: Math.floor(Date.now() / 1000)
    })
    .where(eq(schema.posts.id, postId))
    .run();

  return NextResponse.json({ ok: true, outline });
}
