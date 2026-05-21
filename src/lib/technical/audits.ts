// All technical-SEO audit rules. Each function takes a CrawledPage and returns Findings.
// Deterministic — no AI. Returns are appended to a shared array.

import type { CheerioAPI } from "cheerio";

export type Severity = "critical" | "high" | "medium" | "low";
export type Category =
  | "crawlability"
  | "on-page"
  | "content"
  | "images"
  | "schema"
  | "security"
  | "sitemap";

export interface Finding {
  id: string;
  url: string;
  severity: Severity;
  category: Category;
  message: string;
  fix: string;
  evidence?: string;
}

export interface CrawledPage {
  url: string;
  finalUrl: string;
  statusChain: number[];      // redirect chain status codes
  status: number;
  html: string;
  $: CheerioAPI;
  headers: Record<string, string>;
  bodyText: string;
  wordCount: number;
}

const finding = (
  id: string,
  url: string,
  severity: Severity,
  category: Category,
  message: string,
  fix: string,
  evidence?: string
): Finding => ({ id, url, severity, category, message, fix, evidence });

/* ---------- On-page basics ---------- */

export function auditTitle(p: CrawledPage, out: Finding[]) {
  const title = p.$("title").first().text().trim();
  if (!title) {
    out.push(finding("title-missing", p.url, "high", "on-page",
      "Title tag is missing or empty",
      "Add a unique <title> 30-60 characters that includes the primary keyword.",
      "<title></title>"));
    return;
  }
  if (title.length > 65) {
    out.push(finding("title-too-long", p.url, "medium", "on-page",
      `Title is ${title.length} chars (likely truncated in SERPs)`,
      "Keep title under 60 characters.",
      title));
  } else if (title.length < 10) {
    out.push(finding("title-too-short", p.url, "medium", "on-page",
      `Title is only ${title.length} chars`,
      "Expand title to 30-60 chars with the primary keyword.",
      title));
  }
}

export function auditMetaDescription(p: CrawledPage, out: Finding[]) {
  const m = p.$('meta[name="description"]').attr("content")?.trim() ?? "";
  if (!m) {
    out.push(finding("meta-description-missing", p.url, "medium", "on-page",
      "Meta description is missing",
      "Add a 120-160 char meta description that summarizes the page and includes the primary keyword."));
    return;
  }
  if (m.length > 175) {
    out.push(finding("meta-description-too-long", p.url, "low", "on-page",
      `Meta description is ${m.length} chars`,
      "Trim to 160 chars to avoid truncation.",
      m));
  }
}

export function auditH1(p: CrawledPage, out: Finding[]) {
  const h1s = p.$("h1");
  if (h1s.length === 0) {
    out.push(finding("h1-missing", p.url, "high", "on-page",
      "Page has no H1 heading",
      "Add a single H1 that matches the page's primary topic."));
  } else if (h1s.length > 1) {
    out.push(finding("h1-multiple", p.url, "medium", "on-page",
      `Page has ${h1s.length} H1 tags`,
      "Use one H1 per page; convert extras to H2/H3."));
  }
}

export function auditHeadingHierarchy(p: CrawledPage, out: Finding[]) {
  const seq: number[] = [];
  p.$("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? "";
    seq.push(Number(tag.slice(1)));
  });
  for (let i = 1; i < seq.length; i++) {
    if (seq[i] > seq[i - 1] + 1) {
      out.push(finding("heading-skip", p.url, "low", "on-page",
        `Heading level jumps from H${seq[i - 1]} to H${seq[i]}`,
        "Use sequential heading levels. Avoid skipping H2 between H1 and H3."));
      return;
    }
  }
}

/* ---------- Crawlability ---------- */

export function auditNoindex(p: CrawledPage, out: Finding[]) {
  const robots = p.$('meta[name="robots"]').attr("content") ?? "";
  if (/noindex/i.test(robots)) {
    out.push(finding("meta-noindex", p.url, "critical", "crawlability",
      "Page is marked noindex",
      "Remove the noindex directive if the page should appear in search.",
      `<meta name="robots" content="${robots}">`));
  }
}

export function auditRedirectChain(p: CrawledPage, out: Finding[]) {
  const hops = p.statusChain.filter((s) => s >= 300 && s < 400).length;
  if (hops > 2) {
    out.push(finding("redirect-chain", p.url, "high", "crawlability",
      `Redirect chain of ${hops} hops`,
      "Update internal links to point directly at the final URL."));
  }
}

export function auditCanonical(p: CrawledPage, out: Finding[]) {
  const canon = p.$('link[rel="canonical"]').attr("href")?.trim();
  if (!canon) return;
  try {
    const canonAbs = new URL(canon, p.finalUrl).toString();
    if (canonAbs !== p.finalUrl) {
      out.push(finding("canonical-non-self", p.url, "medium", "crawlability",
        "Canonical URL differs from page URL",
        "If unintentional, point canonical to the page itself.",
        `${p.finalUrl} → canonical ${canonAbs}`));
    }
  } catch {
    // bad URL
  }
}

export function auditMixedContent(p: CrawledPage, out: Finding[]) {
  if (!/^https:/i.test(p.finalUrl)) return;
  const httpAssets: string[] = [];
  p.$("img[src], script[src], link[href], iframe[src], source[src], video[src], audio[src]").each((_, el) => {
    const $el = p.$(el);
    const attr = el.tagName === "link" ? "href" : "src";
    const val = $el.attr(attr) ?? "";
    if (/^http:/i.test(val)) httpAssets.push(val);
  });
  if (httpAssets.length > 0) {
    out.push(finding("mixed-content", p.url, "high", "crawlability",
      `Page loads ${httpAssets.length} HTTP resource(s) over HTTPS`,
      "Update resource URLs to https:// or //.",
      httpAssets.slice(0, 3).join(", ")));
  }
}

/* ---------- Content ---------- */

export function auditThinContent(p: CrawledPage, out: Finding[]) {
  if (p.wordCount > 0 && p.wordCount < 200) {
    out.push(finding("thin-content", p.url, "high", "content",
      `Only ${p.wordCount} words of body text`,
      "Expand to at least 600 words with original substance. Helpful Content algorithm penalizes thin pages."));
  }
}

/* ---------- Images ---------- */

export function auditImages(p: CrawledPage, out: Finding[]) {
  p.$("img").each((_, el) => {
    const $img = p.$(el);
    const src = $img.attr("src") ?? "";
    const alt = $img.attr("alt");
    const w = $img.attr("width");
    const h = $img.attr("height");
    if (alt == null) {
      out.push(finding("alt-missing", p.url, "medium", "images",
        "Image missing alt attribute",
        "Add descriptive alt text (8-15 words) that conveys the image's role.",
        src));
    } else if (alt.length > 125) {
      out.push(finding("alt-too-long", p.url, "low", "images",
        `Image alt text is ${alt.length} chars`,
        "Keep alt text under 125 characters.",
        alt));
    }
    if (!w || !h) {
      out.push(finding("image-no-dimensions", p.url, "medium", "images",
        "Image missing width/height (causes Cumulative Layout Shift)",
        "Add width and height attributes to reserve layout space.",
        src));
    }
    if (src && /\.(jpg|jpeg|png)(\?|$)/i.test(src) && !/\.(webp|avif)/i.test(src)) {
      // Recommend WebP only if we can guess the file is "large" — we can't measure size here,
      // so emit as low severity for any non-WebP/AVIF jpg/png.
      out.push(finding("image-not-webp", p.url, "low", "images",
        "Image is JPG/PNG, not WebP/AVIF",
        "Convert to WebP or AVIF for ~30% smaller file size.",
        src));
    }
  });
}

/* ---------- Schema ---------- */

export function auditSchema(p: CrawledPage, out: Finding[]) {
  let foundArticle = false;
  p.$('script[type="application/ld+json"]').each((_, el) => {
    const text = p.$(el).text().trim();
    if (!text) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      out.push(finding("schema-invalid-json", p.url, "high", "schema",
        "JSON-LD block does not parse",
        "Validate with Google Rich Results Test and fix the JSON.",
        text.slice(0, 120) + "…"));
      return;
    }
    const blocks = Array.isArray(parsed) ? parsed : [parsed];
    for (const block of blocks) {
      if (typeof block !== "object" || block === null) continue;
      const type = (block as { "@type"?: string | string[] })["@type"];
      const types = Array.isArray(type) ? type : type ? [type] : [];
      if (types.some((t) => t === "Article" || t === "BlogPosting" || t === "NewsArticle")) {
        foundArticle = true;
        const b = block as Record<string, unknown>;
        const missing: string[] = [];
        if (!b.headline) missing.push("headline");
        if (!b.author) missing.push("author");
        if (!b.datePublished) missing.push("datePublished");
        if (missing.length > 0) {
          out.push(finding("schema-missing-required", p.url, "medium", "schema",
            `Article schema missing: ${missing.join(", ")}`,
            "Add required Article fields per schema.org/Article."));
        }
      }
    }
  });

  // Article schema expected on blog-post-shaped URLs
  if (!foundArticle && /\/(blog|post|article|news|guides?)\//i.test(p.url)) {
    out.push(finding("schema-no-article-on-blog", p.url, "medium", "schema",
      "Blog-post URL has no Article/BlogPosting JSON-LD",
      "Add Article schema with headline, author, datePublished."));
  }
}

/* ---------- Security headers ---------- */

export function auditSecurityHeaders(p: CrawledPage, out: Finding[]) {
  const h = (name: string) => p.headers[name.toLowerCase()] ?? "";
  if (!h("strict-transport-security")) {
    out.push(finding("header-missing-hsts", p.url, "low", "security",
      "Missing Strict-Transport-Security header",
      "Send `Strict-Transport-Security: max-age=63072000; includeSubDomains` to enforce HTTPS."));
  }
  if (!h("content-security-policy") && !h("content-security-policy-report-only")) {
    out.push(finding("header-missing-csp", p.url, "low", "security",
      "Missing Content-Security-Policy header",
      "Add a CSP to mitigate XSS. Start with `default-src 'self'` and tighten."));
  }
  if (!h("x-frame-options") && !/frame-ancestors/i.test(h("content-security-policy"))) {
    out.push(finding("header-missing-xframe", p.url, "low", "security",
      "Missing X-Frame-Options (clickjacking)",
      "Send `X-Frame-Options: SAMEORIGIN` or `Content-Security-Policy: frame-ancestors 'self'`."));
  }
  if (!h("x-content-type-options")) {
    out.push(finding("header-missing-xcontent", p.url, "low", "security",
      "Missing X-Content-Type-Options",
      "Send `X-Content-Type-Options: nosniff`."));
  }
  if (!h("referrer-policy")) {
    out.push(finding("header-missing-referrer", p.url, "low", "security",
      "Missing Referrer-Policy",
      "Send `Referrer-Policy: strict-origin-when-cross-origin`."));
  }
}

/* ---------- Cross-page audits ---------- */

export function auditDuplicates(pages: CrawledPage[], out: Finding[]) {
  const byTitle = new Map<string, string[]>();
  const byMeta = new Map<string, string[]>();
  for (const p of pages) {
    const t = p.$("title").first().text().trim();
    if (t) {
      const arr = byTitle.get(t) ?? [];
      arr.push(p.url);
      byTitle.set(t, arr);
    }
    const m = p.$('meta[name="description"]').attr("content")?.trim();
    if (m) {
      const arr = byMeta.get(m) ?? [];
      arr.push(p.url);
      byMeta.set(m, arr);
    }
  }
  for (const [title, urls] of byTitle) {
    if (urls.length > 1) {
      for (const url of urls) {
        out.push(finding("duplicate-title", url, "high", "on-page",
          `Title duplicated across ${urls.length} URLs`,
          "Make every page's <title> unique.",
          title));
      }
    }
  }
  for (const [m, urls] of byMeta) {
    if (urls.length > 1) {
      for (const url of urls) {
        out.push(finding("duplicate-meta-description", url, "medium", "on-page",
          `Meta description duplicated across ${urls.length} URLs`,
          "Write a unique meta description per page.",
          m));
      }
    }
  }
}

/* ---------- Master runner ---------- */

export function runAllPageAudits(p: CrawledPage): Finding[] {
  const out: Finding[] = [];
  auditTitle(p, out);
  auditMetaDescription(p, out);
  auditH1(p, out);
  auditHeadingHierarchy(p, out);
  auditNoindex(p, out);
  auditRedirectChain(p, out);
  auditCanonical(p, out);
  auditMixedContent(p, out);
  auditThinContent(p, out);
  auditImages(p, out);
  auditSchema(p, out);
  auditSecurityHeaders(p, out);
  return out;
}
