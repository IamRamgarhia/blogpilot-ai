import { fetchHtml, load } from "./cheerio-fetcher";

export interface SitemapResult {
  urls: string[];
  count: number;
}

const TRIES = ["/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml"];

export async function parseSitemap(baseUrl: string): Promise<SitemapResult> {
  for (const path of TRIES) {
    try {
      const u = new URL(path, baseUrl).toString();
      const r = await fetchHtml(u);
      if (r.status >= 400) continue;
      const $ = load(r.html);
      const urls: string[] = [];
      $("loc").each((_, el) => {
        urls.push($(el).text().trim());
      });
      if (urls.length === 0) continue;

      // If this is a sitemap index of nested xml files, drill in once.
      if (urls[0].endsWith(".xml") && urls.length < 50) {
        const all: string[] = [];
        for (const sm of urls.slice(0, 5)) {
          try {
            const rr = await fetchHtml(sm);
            const $$ = load(rr.html);
            $$("loc").each((_, el) => {
              all.push($$(el).text().trim());
            });
          } catch {
            // ignore single sitemap failures
          }
        }
        if (all.length > 0) return { urls: all, count: all.length };
      }
      return { urls, count: urls.length };
    } catch {
      // try next
    }
  }
  return { urls: [], count: 0 };
}
