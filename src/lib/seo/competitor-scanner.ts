import { parseSitemap } from "@/lib/crawler/parse-sitemap";
import { fetchHtml, load } from "@/lib/crawler/cheerio-fetcher";

export interface CompetitorPostBrief {
  url: string;
  title: string;
}

export interface CompetitorScanResult {
  competitorUrl: string;
  posts: CompetitorPostBrief[];
  inferredClusters: Array<{ name: string; posts: string[] }>;
}

function inferClusters(posts: CompetitorPostBrief[]): Array<{ name: string; posts: string[] }> {
  // Lightweight clustering by leading non-stopword token in the title.
  const STOP = new Set(["the", "a", "an", "of", "for", "to", "in", "on", "and", "or", "best", "top", "your", "you", "guide", "how"]);
  const buckets = new Map<string, string[]>();
  for (const p of posts) {
    const words = p.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w && !STOP.has(w));
    const key = words[0] ?? "misc";
    const arr = buckets.get(key) ?? [];
    arr.push(p.title);
    buckets.set(key, arr);
  }
  return [...buckets.entries()]
    .filter(([, v]) => v.length >= 2)
    .map(([k, v]) => ({ name: k, posts: v }))
    .sort((a, b) => b.posts.length - a.posts.length)
    .slice(0, 12);
}

export async function scanCompetitor(url: string): Promise<CompetitorScanResult> {
  const base = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  let posts: CompetitorPostBrief[] = [];

  // Try sitemap first
  const sm = await parseSitemap(base);
  if (sm.count > 0) {
    const candidates = sm.urls.filter((u) =>
      /\/(blog|posts|article|articles|guides|news)\//i.test(u)
    );
    const pool = candidates.length >= 5 ? candidates : sm.urls;
    posts = pool.slice(0, 40).map((u) => ({
      url: u,
      title: u.replace(/.*\//, "").replace(/[-_]/g, " ").replace(/\..+$/, "").trim() || u
    }));
  }

  // If sitemap missed, scan /blog
  if (posts.length === 0) {
    try {
      const r = await fetchHtml(new URL("/blog", base).toString());
      if (r.status < 400) {
        const $ = load(r.html);
        $("a[href]").each((_, el) => {
          const href = $(el).attr("href") ?? "";
          const text = $(el).text().trim();
          if (text.length > 15 && text.length < 150 && /\/(blog|post|article)/i.test(href) && !/(category|tag|author)/i.test(href)) {
            try {
              const abs = new URL(href, base).toString();
              if (!posts.find((p) => p.url === abs)) posts.push({ url: abs, title: text });
            } catch {}
          }
        });
      }
    } catch {}
    posts = posts.slice(0, 40);
  }

  // Enrich titles by fetching first 10 pages
  for (const p of posts.slice(0, 10)) {
    if (p.title.length < 20) {
      try {
        const r = await fetchHtml(p.url);
        if (r.status < 400) {
          const $ = load(r.html);
          const t = $("title").text().trim() || $("h1").first().text().trim();
          if (t) p.title = t;
        }
      } catch {}
    }
  }

  return {
    competitorUrl: base,
    posts,
    inferredClusters: inferClusters(posts)
  };
}
