import * as cheerio from "cheerio";

export interface SerpResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
}

export async function bingSerp(query: string): Promise<SerpResult[]> {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10`;
  try {
    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9"
      }
    });
    if (!r.ok) return [];
    const html = await r.text();
    const $ = cheerio.load(html);
    const results: SerpResult[] = [];
    $("li.b_algo").each((i, el) => {
      const title = $(el).find("h2").text().trim();
      const href = $(el).find("h2 a").attr("href") || "";
      const snippet = $(el).find(".b_caption p, .b_paractl").first().text().trim();
      if (title && href.startsWith("http")) {
        results.push({ position: i + 1, title, url: href, snippet });
      }
    });
    return results.slice(0, 10);
  } catch {
    return [];
  }
}
