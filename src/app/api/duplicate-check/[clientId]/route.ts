import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { findDuplicates } from "@/lib/seo/duplicate-checker";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  await ensureMigrated();
  const { clientId } = await params;
  const db = getDb();
  const posts = await db.select().from(schema.posts).where(eq(schema.posts.clientId, clientId)).all();
  const withText = posts.filter((p) => p.draftMarkdown);
  if (withText.length < 2) return NextResponse.json({ pairs: [] });

  const pairs: Array<{ a: { id: string; title: string }; b: { id: string; title: string }; similarity: number; signal: string }> = [];
  const seen = new Set<string>();
  for (const target of withText) {
    const matches = findDuplicates(
      { id: target.id, title: target.title ?? "", text: target.draftMarkdown ?? "" },
      withText.map((o) => ({ id: o.id, title: o.title ?? "", text: o.draftMarkdown ?? "" }))
    );
    for (const m of matches) {
      const key = [target.id, m.postId].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({
        a: { id: target.id, title: target.title ?? "" },
        b: { id: m.postId, title: m.title },
        similarity: m.similarity,
        signal: m.signal
      });
    }
  }
  return NextResponse.json({ pairs });
}
