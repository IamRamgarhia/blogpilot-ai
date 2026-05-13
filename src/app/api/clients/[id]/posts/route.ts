import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureMigrated();
  const { id } = await params;
  const db = getDb();
  const posts = await db
    .select({
      id: schema.posts.id,
      title: schema.posts.title,
      primaryKeyword: schema.posts.primaryKeyword,
      intent: schema.posts.intent,
      status: schema.posts.status,
      publishDate: schema.posts.publishDate,
      createdAt: schema.posts.createdAt
    })
    .from(schema.posts)
    .where(eq(schema.posts.clientId, id))
    .all();
  return NextResponse.json({ posts });
}
