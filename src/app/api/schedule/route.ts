import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { buildSchedule } from "@/lib/seo/schedule";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId } = (await req.json()) as { clientId: string };
  const db = getDb();
  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, clientId)).get();
  if (!client) return NextResponse.json({ error: "not found" }, { status: 404 });

  const posts = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.clientId, clientId))
    .all();

  const scheduleInput = posts
    .filter((p) => !p.publishDate)
    .map((p) => {
      let cluster: string | undefined;
      let isPillar = false;
      let priority: number | undefined;
      try {
        if (p.outlineJson) {
          const o = JSON.parse(p.outlineJson) as { cluster?: string; is_pillar?: boolean; priority?: number };
          cluster = o.cluster;
          isPillar = !!o.is_pillar;
          priority = o.priority;
        }
      } catch {}
      return { id: p.id, title: p.title ?? "", isPillar, cluster, priority };
    });

  const result = buildSchedule({
    niche: client.niche ?? client.name,
    posts: scheduleInput
  });

  for (const item of result) {
    await db
      .update(schema.posts)
      .set({ publishDate: Math.floor(new Date(item.publishDateISO).getTime() / 1000) })
      .where(eq(schema.posts.id, item.postId))
      .run();
  }

  return NextResponse.json({ ok: true, scheduled: result.length });
}
