import { load } from "./cheerio-fetcher";

export interface SiteIdentity {
  title: string;
  description: string;
  language: string;
  favicon?: string;
  ogImage?: string;
  social: Record<string, string>;
  generator?: string;
}

const SOCIAL_DOMAINS = [
  "twitter.com",
  "x.com",
  "facebook.com",
  "linkedin.com",
  "instagram.com",
  "youtube.com",
  "github.com",
  "tiktok.com",
  "pinterest.com"
];

function toAbsolute(u: string | undefined, baseUrl: string): string | undefined {
  if (!u) return undefined;
  if (u.startsWith("http")) return u;
  try {
    return new URL(u, baseUrl).toString();
  } catch {
    return u;
  }
}

export function parseSiteIdentity(html: string, baseUrl: string): SiteIdentity {
  const $ = load(html);
  const title =
    $("title").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    "";
  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";
  const language = $("html").attr("lang") || "en";
  const favicon = toAbsolute($('link[rel~="icon"]').attr("href") || "/favicon.ico", baseUrl);
  const ogImage = toAbsolute($('meta[property="og:image"]').attr("content"), baseUrl);
  const generator = $('meta[name="generator"]').attr("content") || undefined;

  const social: Record<string, string> = {};
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const net of SOCIAL_DOMAINS) {
      if (href.includes(net) && !social[net]) social[net] = href;
    }
  });

  return { title, description, language, favicon, ogImage, social, generator };
}
