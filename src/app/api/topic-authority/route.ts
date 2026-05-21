import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { scoreTopicAuthority } from "@/lib/seo/topic-authority";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  await ensureMigrated();
  let body: { clientId?: string; niche?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { clientId, niche } = body;
  if (!niche) return NextResponse.json({ error: "niche required" }, { status: 400 });

  let clientText = "";
  if (clientId) {
    const db = getDb();
    const posts = await db.select().from(schema.posts).where(eq(schema.posts.clientId, clientId)).all();
    clientText = posts
      .map((p) => [p.title ?? "", p.draftMarkdown ?? "", p.primaryKeyword ?? ""].join(" "))
      .join("\n\n");
  }

  const result = await scoreTopicAuthority(niche, clientText);
  return NextResponse.json(result);
}
