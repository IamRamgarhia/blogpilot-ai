import { titleSimilarity } from "./duplicate-checker";

export interface PostRef {
  id: string;
  title: string;
  primaryKeyword: string;
  isPillar?: boolean;
  cluster?: string;
}

export interface LinkSuggestion {
  postId: string;
  title: string;
  score: number;
  anchor_options: string[];
  rationale: string;
}

function anchorVariations(target: PostRef): string[] {
  const kw = target.primaryKeyword || target.title.toLowerCase();
  const title = target.title.trim();
  return [
    kw,
    `our guide to ${kw}`,
    `learn more about ${kw}`,
    title.length < 80 ? title : kw + " explained"
  ];
}

export function suggestInternalLinks(
  source: PostRef,
  candidates: PostRef[],
  max = 5
): LinkSuggestion[] {
  const kwSource = source.primaryKeyword || source.title;
  return candidates
    .filter((c) => c.id !== source.id)
    .map((c) => {
      const kwScore = titleSimilarity(
        kwSource,
        `${c.primaryKeyword ?? ""} ${c.title}`
      );
      let score = kwScore * 0.5;
      const reasons: string[] = [`keyword overlap ${(kwScore * 100).toFixed(0)}%`];
      if (c.cluster && source.cluster && c.cluster === source.cluster) {
        score += 0.3;
        reasons.push("same cluster");
      }
      if (c.isPillar) {
        score += 0.2;
        reasons.push("pillar");
      }
      return {
        postId: c.id,
        title: c.title,
        score: Number(score.toFixed(3)),
        anchor_options: anchorVariations(c),
        rationale: reasons.join(" + ")
      };
    })
    .filter((s) => s.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}
