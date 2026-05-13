import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { throttledCheckRank } from "@/lib/measurement/rank-tracker";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId, postId, keyword, url } = (await req.json()) as {
    clientId: string;
    postId?: string;
    keyword: string;
    url: string;
  };
  if (!keyword || !url) return NextResponse.json({ error: "keyword + url required" }, { status: 400 });
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
