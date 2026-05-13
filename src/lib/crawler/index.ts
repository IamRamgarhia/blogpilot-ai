import { fetchHtmlSmart } from "./playwright-fetcher";
import { parseSiteIdentity, type SiteIdentity } from "./parse-site-identity";
import { parseSitemap } from "./parse-sitemap";
import { pageSpeed, type PageSpeedResult } from "./pagespeed";

export interface DiscoverySnapshot {
  url: string;
  finalUrl: string;
  identity: SiteIdentity;
  sitemap: { count: number; sample: string[] };
  webVitals: PageSpeedResult;
  renderedWithPlaywright: boolean;
  fetchedAt: number;
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function discover(url: string): Promise<DiscoverySnapshot> {
  const u = normalizeUrl(url);
  const fetched = await fetchHtmlSmart(u);
  const identity = parseSiteIdentity(fetched.html, fetched.finalUrl);

  const [sm, vitals] = await Promise.all([
    parseSitemap(fetched.finalUrl).catch(() => ({ urls: [], count: 0 })),
    pageSpeed(fetched.finalUrl).catch(() => ({}))
  ]);

  return {
    url: u,
    finalUrl: fetched.finalUrl,
    identity,
    sitemap: { count: sm.count, sample: sm.urls.slice(0, 20) },
    webVitals: vitals,
    renderedWithPlaywright: fetched.rendered,
    fetchedAt: Date.now()
  };
}
