import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { suggestInternalLinks, type PostRef } from "@/lib/seo/internal-linking";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  await ensureMigrated();
  const { postId } = await params;
  const db = getDb();
  const target = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });
  const candidates = await db.select().from(schema.posts).where(eq(schema.posts.clientId, target.clientId)).all();

  const ref = (p: typeof target): PostRef => {
    let extra: { cluster?: string; is_pillar?: boolean } = {};
    try {
      if (p.outlineJson) {
        const o = JSON.parse(p.outlineJson) as { cluster?: string; is_pillar?: boolean };
        extra = { cluster: o.cluster, is_pillar: o.is_pillar };
      }
    } catch {}
    return {
      id: p.id,
      title: p.title ?? "",
      primaryKeyword: p.primaryKeyword ?? "",
      isPillar: extra.is_pillar,
      cluster: extra.cluster
    };
  };

  const suggestions = suggestInternalLinks(
    ref(target),
    candidates.map(ref)
  );
  return NextResponse.json({ suggestions });
}
