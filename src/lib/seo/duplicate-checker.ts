// Local Jaccard-based duplicate / near-duplicate detection across posts.

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 3)
  );
}

function shingles(text: string, n = 4): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i <= tokens.length - n; i++) {
    out.add(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export interface DuplicateMatch {
  postId: string;
  title: string;
  similarity: number;
  signal: "near-duplicate" | "high-overlap" | "moderate-overlap";
}

export function findDuplicates(
  target: { id: string; title: string; text: string },
  others: Array<{ id: string; title: string; text: string }>,
  threshold = 0.3
): DuplicateMatch[] {
  const targetSh = shingles(target.text);
  const matches: DuplicateMatch[] = [];
  for (const o of others) {
    if (o.id === target.id || !o.text) continue;
    const sim = jaccard(targetSh, shingles(o.text));
    if (sim >= threshold) {
      matches.push({
        postId: o.id,
        title: o.title,
        similarity: Number(sim.toFixed(3)),
        signal: sim >= 0.7 ? "near-duplicate" : sim >= 0.5 ? "high-overlap" : "moderate-overlap"
      });
    }
  }
  return matches.sort((a, b) => b.similarity - a.similarity);
}

export function titleSimilarity(a: string, b: string): number {
  return jaccard(tokenize(a), tokenize(b));
}
