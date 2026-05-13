import * as cheerio from "cheerio";

export async function peopleAlsoAsk(query: string): Promise<string[]> {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  try {
    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
      }
    });
    if (!r.ok) return [];
    const html = await r.text();
    const $ = cheerio.load(html);
    const questions = new Set<string>();
    $(".df_qntext, .b_secondaryFocus, .b_rich .b_subModule li, .df_qntxt").each((_, el) => {
      const t = $(el).text().trim();
      if (t.endsWith("?") && t.length < 200) questions.add(t);
    });
    return [...questions].slice(0, 8);
  } catch {
    return [];
  }
}
