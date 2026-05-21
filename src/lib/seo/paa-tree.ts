// Recursive People-Also-Ask explorer.
// Bing PAA scraping is throttled and depth-capped to be respectful + fast.

import { peopleAlsoAsk } from "./paa";

export interface PaaNode {
  question: string;
  depth: number;
  children: PaaNode[];
}

export interface PaaTreeOptions {
  maxDepth?: number;       // default 3
  maxChildrenPerNode?: number; // default 4
  totalQuestionsCap?: number;  // hard cap on total nodes
}

const DEFAULTS: Required<PaaTreeOptions> = {
  maxDepth: 3,
  maxChildrenPerNode: 4,
  totalQuestionsCap: 40
};

export async function buildPaaTree(seed: string, options: PaaTreeOptions = {}): Promise<PaaNode> {
  const opts = { ...DEFAULTS, ...options };
  const visited = new Set<string>();

  async function expand(question: string, depth: number): Promise<PaaNode> {
    const key = question.toLowerCase().trim();
    visited.add(key);
    const node: PaaNode = { question, depth, children: [] };
    if (depth >= opts.maxDepth || visited.size >= opts.totalQuestionsCap) return node;

    const cleaned = question.replace(/\?$/, "").trim();
    let sub: string[] = [];
    try {
      sub = await peopleAlsoAsk(cleaned);
    } catch {
      return node;
    }
    const filtered = sub
      .filter((q) => {
        const k = q.toLowerCase().trim();
        if (visited.has(k)) return false;
        return true;
      })
      .slice(0, opts.maxChildrenPerNode);

    for (const q of filtered) {
      if (visited.size >= opts.totalQuestionsCap) break;
      const child = await expand(q, depth + 1);
      node.children.push(child);
    }
    return node;
  }

  return expand(seed, 0);
}

export function flattenTree(root: PaaNode): string[] {
  const out: string[] = [];
  const stack: PaaNode[] = [root];
  while (stack.length) {
    const n = stack.pop()!;
    out.push(n.question);
    for (const c of n.children) stack.push(c);
  }
  return out;
}
