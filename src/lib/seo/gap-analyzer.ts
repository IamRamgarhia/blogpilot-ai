import { bingSerp } from "./bing-serp";
import { fetchHtml, load } from "@/lib/crawler/cheerio-fetcher";
import { execute } from "@/lib/ai/executor";
import { buildRegistry, chainFor } from "@/lib/ai/registry";

export interface CompetitorPage {
  url: string;
  title: string;
  headings: string[];
}

export interface GapResult {
  keyword: string;
  competitors: CompetitorPage[];
  gaps: Array<{
    topic: string;
    competitor_count: number;
    status: "missing" | "weak";
    priority: number;
    suggested_post_title: string;
    rationale: string;
  }>;
  table_stakes: string[];
  differentiators: string[];
}

async function scrapeHeadings(url: string): Promise<string[]> {
  try {
    const r = await fetchHtml(url);
    if (r.status >= 400) return [];
    const $ = load(r.html);
    const headings: string[] = [];
    $("h1, h2, h3").each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length < 200) headings.push(t);
    });
    return headings.slice(0, 30);
  } catch {
    return [];
  }
}

function ruleBasedGaps(competitors: CompetitorPage[], clientTitles: string[]): GapResult["gaps"] {
  // Count topic frequency across competitor headings (case-insensitive lowercased substrings)
  const counts = new Map<string, number>();
  for (const c of competitors) {
    const seen = new Set<string>();
    for (const h of c.headings) {
      const norm = h.toLowerCase().trim();
      if (norm.length < 4 || norm.length > 80) continue;
      if (seen.has(norm)) continue;
      seen.add(norm);
      counts.set(norm, (counts.get(norm) ?? 0) + 1);
    }
  }
  const clientLow = clientTitles.map((t) => t.toLowerCase());
  const gaps: GapResult["gaps"] = [];
  for (const [topic, count] of counts) {
    if (count < 2) continue;
    const covered = clientLow.some((t) => t.includes(topic) || topic.includes(t));
    if (covered) continue;
    gaps.push({
      topic,
      competitor_count: count,
      status: "missing",
      priority: count >= 5 ? 1 : count >= 3 ? 2 : 3,
      suggested_post_title: topic.replace(/^./, (c) => c.toUpperCase()),
      rationale: `${count} of ${competitors.length} competitors cover this; client does not`
    });
  }
  return gaps.sort((a, b) => a.priority - b.priority || b.competitor_count - a.competitor_count).slice(0, 20);
}

export async function analyzeGap(
  keyword: string,
  clientTitles: string[]
): Promise<GapResult> {
  const serp = await bingSerp(keyword);
  const top = serp.slice(0, 8);
  const competitors: CompetitorPage[] = [];
  for (const r of top) {
    const headings = await scrapeHeadings(r.url);
    competitors.push({ url: r.url, title: r.title, headings });
  }

  const providers = chainFor(buildRegistry(process.env as Record<string, string | undefined>));
  if (providers.length === 0 || competitors.every((c) => c.headings.length === 0)) {
    return {
      keyword,
      competitors,
      gaps: ruleBasedGaps(competitors, clientTitles),
      table_stakes: [],
      differentiators: []
    };
  }

  try {
    const resp = await execute({
      methodologies: ["content-gap-analysis"],
      task: "Run gap analysis using these competitor pages and client titles.",
      input: { keyword, competitors, client_titles: clientTitles },
      providers,
      jsonMode: true,
      temperature: 0.4
    });
    const text = resp.text.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const sliced = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    const parsed = JSON.parse(sliced) as {
      gaps?: GapResult["gaps"];
      table_stakes?: string[];
      differentiators?: string[];
    };
    return {
      keyword,
      competitors,
      gaps: parsed.gaps ?? ruleBasedGaps(competitors, clientTitles),
      table_stakes: parsed.table_stakes ?? [],
      differentiators: parsed.differentiators ?? []
    };
  } catch {
    return {
      keyword,
      competitors,
      gaps: ruleBasedGaps(competitors, clientTitles),
      table_stakes: [],
      differentiators: []
    };
  }
}
