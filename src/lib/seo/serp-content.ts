// Fetches the main body text + headings from a list of SERP result URLs.
// Used by Content Score engine. Uses our existing Cheerio fetcher + SSRF guard.

import { fetchHtml, load } from "@/lib/crawler/cheerio-fetcher";
import { assertExternalUrl, UnsafeUrlError } from "@/lib/net/ssrf-guard";

export interface SerpPageContent {
  url: string;
  title: string;
  headings: string[];      // H2 + H3 text
  body: string;            // main article body, cleaned
  wordCount: number;
  fetched: boolean;
}

function extractMain($: ReturnType<typeof load>): string {
  // Prefer <article>, then <main>, then <body> minus nav/footer/aside.
  const candidates = ["article", "main", '[role="main"]', "#content", ".post", ".entry-content"];
  for (const sel of candidates) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 200) return el.text();
  }
  $("nav, footer, aside, header, script, style, noscript, form").remove();
  return $("body").text();
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export async function fetchSerpPages(urls: string[], cap = 10): Promise<SerpPageContent[]> {
  const out: SerpPageContent[] = [];
  for (const url of urls.slice(0, cap)) {
    try {
      assertExternalUrl(url);
    } catch (e) {
      if (e instanceof UnsafeUrlError) continue;
      throw e;
    }
    try {
      const r = await fetchHtml(url);
      if (r.status >= 400) {
        out.push({ url, title: "", headings: [], body: "", wordCount: 0, fetched: false });
        continue;
      }
      const $ = load(r.html);
      const title = $("title").first().text().trim() || $("h1").first().text().trim() || "";
      const headings: string[] = [];
      $("h2, h3").each((_, el) => {
        const t = $(el).text().trim();
        if (t && t.length < 200) headings.push(t);
      });
      const body = clean(extractMain($));
      out.push({
        url,
        title,
        headings: headings.slice(0, 30),
        body,
        wordCount: body.split(/\s+/).filter(Boolean).length,
        fetched: true
      });
    } catch {
      out.push({ url, title: "", headings: [], body: "", wordCount: 0, fetched: false });
    }
  }
  return out;
}
