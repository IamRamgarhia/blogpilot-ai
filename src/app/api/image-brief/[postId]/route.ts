import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { generateImageBrief } from "@/lib/seo/image-brief";
import type { Outline } from "@/lib/seo/outline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  await ensureMigrated();
  const { postId } = await params;
  const db = getDb();
  const post = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!post.outlineJson) return NextResponse.json({ error: "outline missing" }, { status: 400 });
  const outline = JSON.parse(post.outlineJson) as Outline;
  const images = await generateImageBrief(outline, post.primaryKeyword ?? "");
  return NextResponse.json({ images });
}
