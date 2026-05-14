import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { throttledCheckRank } from "@/lib/measurement/rank-tracker";
import { assertExternalUrl, UnsafeUrlError } from "@/lib/net/ssrf-guard";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  await ensureMigrated();
  let body: { clientId?: string; postId?: string; keyword?: string; url?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { clientId, postId, keyword, url } = body;
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
  if (!keyword || !url) {
    return NextResponse.json({ error: "keyword + url required" }, { status: 400 });
  }
  try {
    assertExternalUrl(/^https?:\/\//i.test(url) ? url : `https://${url}`);
  } catch (e) {
    if (e instanceof UnsafeUrlError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }
  const result = await throttledCheckRank(keyword, url);
  const db = getDb();
  await db
    .insert(schema.rankHistory)
    .values({
      id: randomUUID(),
      clientId,
      postId: postId ?? null,
      keyword,
      url,
      position: result.position,
      source: result.source
    })
    .run();
  return NextResponse.json({ ok: true, result });
}
