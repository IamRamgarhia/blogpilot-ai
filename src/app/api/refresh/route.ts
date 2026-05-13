import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { refreshPost } from "@/lib/seo/refresher";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId, url } = (await req.json()) as { clientId: string; url: string };
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  let result;
  try {
    result = await refreshPost(url);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
  const db = getDb();
  const postId = randomUUID();
  await db
    .insert(schema.posts)
    .values({
      id: postId,
      clientId,
      status: "draft",
      title: result.original_title,
      primaryKeyword: "",
      intent: "informational",
      draftMarkdown: result.refreshed_markdown,
      metaTitle: result.meta_title,
      metaDescription: result.meta_description,
      outlineJson: JSON.stringify({ source: "refresh", source_url: result.source_url, change_log: result.change_log })
    })
    .run();
  return NextResponse.json({ ok: true, postId, change_log: result.change_log });
}
