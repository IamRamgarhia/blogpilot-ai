export interface RecommenderInput {
  posts: Array<{
    id: string;
    title: string;
    primaryKeyword: string;
    status: string;
    isPillar?: boolean;
    cluster?: string;
    rankPosition?: number | null;
  }>;
  decayingPostIds?: string[];
  gapTopics?: Array<{ topic: string; priority: number }>;
  clusterCoverage?: Record<string, { pillarPostId?: string; spokeCount: number }>;
}

export interface RecommendItem {
  postId: string | null;
  title: string;
  score: number;
  signals: string[];
  rationale: string;
}

export function recommendNext(input: RecommenderInput, limit = 10): RecommendItem[] {
  const items: RecommendItem[] = [];

  for (const p of input.posts) {
    if (p.status === "ready") continue;
    const signals: string[] = [];
    let score = 0;
    let rationale: string[] = [];

    // Quick win: ranks 11-30
    if (p.rankPosition != null && p.rankPosition >= 11 && p.rankPosition <= 30) {
      score += 30;
      signals.push("quick_win");
      rationale.push(`ranks #${p.rankPosition}; push to page 1`);
    }

    // Pillar dependency
    if (p.isPillar && p.cluster && input.clusterCoverage) {
      const c = input.clusterCoverage[p.cluster];
      if (c && !c.pillarPostId && c.spokeCount >= 3) {
        score += 25;
        signals.push("pillar_dependency");
        rationale.push(`pillar missing for cluster ${p.cluster} (${c.spokeCount} spokes ready)`);
      }
    }

    // Decay rescue
    if (input.decayingPostIds?.includes(p.id)) {
      score += 20;
      signals.push("decay_rescue");
      rationale.push("decaying — refresh recommended");
    }

    // No-data fallback: any "idea" status gets a small base score so they appear
    if (p.status === "idea") {
      score += 5;
      rationale.push("backlog item");
    }

    if (score > 0) {
      items.push({
        postId: p.id,
        title: p.title,
        score,
        signals,
        rationale: rationale.join(" · ")
      });
    }
  }

  // Gap-based new-post recommendations
  if (input.gapTopics) {
    for (const g of input.gapTopics) {
      const score = g.priority === 1 ? 15 : g.priority === 2 ? 8 : 3;
      items.push({
        postId: null,
        title: g.topic,
        score,
        signals: ["gap_coverage"],
        rationale: `competitor gap (priority ${g.priority})`
      });
    }
  }

  return items.sort((a, b) => b.score - a.score).slice(0, limit);
}
