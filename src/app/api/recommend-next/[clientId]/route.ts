import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { recommendNext } from "@/lib/measurement/recommender";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  await ensureMigrated();
  const { clientId } = await params;
  const db = getDb();

  const posts = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.clientId, clientId))
    .all();

  const alerts = await db
    .select()
    .from(schema.decayAlerts)
    .where(eq(schema.decayAlerts.clientId, clientId))
    .all();
  const decayingPostIds = posts
    .filter((p) => alerts.some((a) => p.title && a.url.includes(p.title.toLowerCase().slice(0, 20))))
    .map((p) => p.id);

  // Latest rank per post — pull all then dedupe by postId keeping latest.
  const ranks = await db
    .select()
    .from(schema.rankHistory)
    .where(eq(schema.rankHistory.clientId, clientId))
    .orderBy(desc(schema.rankHistory.checkedAt))
    .all();
  const latest = new Map<string, number | null>();
  for (const r of ranks) {
    if (r.postId && !latest.has(r.postId)) latest.set(r.postId, r.position);
  }

  // Cluster coverage map
  const clusterCoverage: Record<string, { pillarPostId?: string; spokeCount: number }> = {};
  for (const p of posts) {
    let cluster: string | undefined;
    let isPillar = false;
    try {
      if (p.outlineJson) {
        const o = JSON.parse(p.outlineJson) as { cluster?: string; is_pillar?: boolean };
        cluster = o.cluster;
        isPillar = !!o.is_pillar;
      }
    } catch {}
    if (!cluster) continue;
    const c = clusterCoverage[cluster] ?? { spokeCount: 0 };
    if (isPillar) c.pillarPostId = p.id;
    else c.spokeCount++;
    clusterCoverage[cluster] = c;
  }

  const items = recommendNext({
    posts: posts.map((p) => {
      let cluster: string | undefined;
      let isPillar = false;
      try {
        if (p.outlineJson) {
          const o = JSON.parse(p.outlineJson) as { cluster?: string; is_pillar?: boolean };
          cluster = o.cluster;
          isPillar = !!o.is_pillar;
        }
      } catch {}
      return {
        id: p.id,
        title: p.title ?? "",
        primaryKeyword: p.primaryKeyword ?? "",
        status: p.status,
        isPillar,
        cluster,
        rankPosition: latest.get(p.id) ?? null
      };
    }),
    decayingPostIds,
    clusterCoverage
  });

  return NextResponse.json({ items });
}
