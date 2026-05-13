import { bingSerp } from "@/lib/seo/bing-serp";

export interface RankCheck {
  keyword: string;
  url: string;
  position: number | null;
  source: "bing" | "ddg";
  checkedAt: number;
}

function hostname(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

async function ddgScrape(query: string): Promise<Array<{ position: number; url: string }>> {
  // DuckDuckGo HTML endpoint, low rate-limit. Used as a fallback.
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
      }
    });
    if (!r.ok) return [];
    const html = await r.text();
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);
    const out: Array<{ position: number; url: string }> = [];
    $("a.result__a").each((i, el) => {
      let href = $(el).attr("href") ?? "";
      // DDG wraps in /l/?uddg=ENCODED — unwrap.
      const m = /[?&]uddg=([^&]+)/.exec(href);
      if (m) href = decodeURIComponent(m[1]);
      if (href.startsWith("http")) out.push({ position: i + 1, url: href });
    });
    return out.slice(0, 30);
  } catch {
    return [];
  }
}

export async function checkRank(keyword: string, targetUrl: string): Promise<RankCheck> {
  const targetHost = hostname(targetUrl);

  // Try Bing first
  const bing = await bingSerp(keyword);
  if (bing.length > 0) {
    const match = bing.find((r) => hostname(r.url) === targetHost);
    return {
      keyword,
      url: targetUrl,
      position: match ? match.position : null,
      source: "bing",
      checkedAt: Date.now()
    };
  }

  // Fallback DDG
  const ddg = await ddgScrape(keyword);
  if (ddg.length > 0) {
    const match = ddg.find((r) => hostname(r.url) === targetHost);
    return {
      keyword,
      url: targetUrl,
      position: match ? match.position : null,
      source: "ddg",
      checkedAt: Date.now()
    };
  }

  return { keyword, url: targetUrl, position: null, source: "bing", checkedAt: Date.now() };
}

const RATE_LIMIT_MS = 5000;
let lastCheck = 0;

export async function throttledCheckRank(keyword: string, targetUrl: string): Promise<RankCheck> {
  const wait = Math.max(0, lastCheck + RATE_LIMIT_MS - Date.now());
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCheck = Date.now();
  return checkRank(keyword, targetUrl);
}

export function cadenceForAge(daysSincePublish: number): "daily" | "every-3-days" | "weekly" | "biweekly" | "monthly" {
  if (daysSincePublish <= 7) return "daily";
  if (daysSincePublish <= 30) return "every-3-days";
  if (daysSincePublish <= 90) return "weekly";
  if (daysSincePublish <= 365) return "biweekly";
  return "monthly";
}
