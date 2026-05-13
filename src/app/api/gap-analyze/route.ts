import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { analyzeGap } from "@/lib/seo/gap-analyzer";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId, keyword } = (await req.json()) as { clientId: string; keyword: string };
  if (!keyword) return NextResponse.json({ error: "keyword required" }, { status: 400 });
  const db = getDb();
  const posts = await db.select().from(schema.posts).where(eq(schema.posts.clientId, clientId)).all();
  const titles = posts.map((p) => p.title ?? "").filter(Boolean);
  const result = await analyzeGap(keyword, titles);
  return NextResponse.json(result);
}
