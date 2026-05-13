import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { repurposeSocial } from "@/lib/seo/social";
import type { Outline } from "@/lib/seo/outline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  await ensureMigrated();
  const { postId } = await params;
  const db = getDb();
  const post = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, post.clientId)).get();
  const outline: Outline | null = post.outlineJson ? JSON.parse(post.outlineJson) : null;
  const intro = (post.draftMarkdown ?? "").split("\n\n").find((p) => p.length > 60) ?? "";
  const url = client ? new URL(`/blog/${outline?.slug ?? "post"}`, client.url).toString() : "";

  const pack = await repurposeSocial({
    title: post.title ?? "Post",
    primary_keyword: post.primaryKeyword ?? "",
    intro,
    tldr_bullets: outline?.tldr_bullets ?? [],
    conclusion_cta: outline?.conclusion_cta ?? "",
    url
  });

  await db
    .update(schema.posts)
    .set({ socialJson: JSON.stringify(pack), updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(schema.posts.id, postId))
    .run();

  return NextResponse.json({ ok: true, social: pack });
}
