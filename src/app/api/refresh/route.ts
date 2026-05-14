import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { refreshPost } from "@/lib/seo/refresher";
import { assertExternalUrl, UnsafeUrlError } from "@/lib/net/ssrf-guard";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  await ensureMigrated();
  let body: { clientId?: string; url?: string };
  try {
    body = (await req.json()) as { clientId?: string; url?: string };
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { clientId, url } = body;
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    assertExternalUrl(normalized);
  } catch (e) {
    if (e instanceof UnsafeUrlError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
    throw e;
  }

  const db = getDb();
  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, clientId)).get();
  if (!client) return NextResponse.json({ error: "client not found" }, { status: 404 });

  let result;
  try {
    result = await refreshPost(normalized);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
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
