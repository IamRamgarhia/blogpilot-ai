// Keyword + content cannibalization detector. Two posts that target the same
// primary keyword fight each other in the SERP — penalize and flag.

import { titleSimilarity } from "@/lib/seo/duplicate-checker";

export interface CannibalGroup {
  primary_keyword: string;
  post_ids: string[];
  post_titles: string[];
  signal: "exact_keyword" | "similar_title";
  severity: "high" | "medium";
}

export interface PostForCannibal {
  id: string;
  title: string;
  primaryKeyword: string;
}

export function detectCannibalization(posts: PostForCannibal[]): CannibalGroup[] {
  const groups: CannibalGroup[] = [];

  // 1. Exact same primary keyword
  const byKeyword = new Map<string, PostForCannibal[]>();
  for (const p of posts) {
    const k = (p.primaryKeyword ?? "").toLowerCase().trim();
    if (!k) continue;
    const arr = byKeyword.get(k) ?? [];
    arr.push(p);
    byKeyword.set(k, arr);
  }
  for (const [k, list] of byKeyword) {
    if (list.length < 2) continue;
    groups.push({
      primary_keyword: k,
      post_ids: list.map((p) => p.id),
      post_titles: list.map((p) => p.title),
      signal: "exact_keyword",
      severity: "high"
    });
  }

  // 2. Highly-similar titles (catches near-duplicates with different keyword strings)
  const flaggedIds = new Set(groups.flatMap((g) => g.post_ids));
  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const a = posts[i];
      const b = posts[j];
      if (flaggedIds.has(a.id) && flaggedIds.has(b.id)) continue;
      const sim = titleSimilarity(a.title, b.title);
      if (sim >= 0.6) {
        groups.push({
          primary_keyword: a.primaryKeyword || b.primaryKeyword || "(no keyword)",
          post_ids: [a.id, b.id],
          post_titles: [a.title, b.title],
          signal: "similar_title",
          severity: "medium"
        });
      }
    }
  }

  return groups;
}
