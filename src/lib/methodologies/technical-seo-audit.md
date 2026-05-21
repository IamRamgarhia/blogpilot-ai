---
id: technical-seo-audit
title: Technical SEO Audit
when: Auditing a site's technical health before / during / after a content push
inputs: client URL, optional sitemap, optional crawl depth
outputs: list of findings with severity + URL + fix suggestion
source: Screaming Frog audit catalog + Google Search Central + Mozilla MDN security headers
---

# Technical SEO Audit

A consolidated checklist of issues that affect indexation, ranking, or user experience. Each finding has a deterministic detection rule (no AI guesswork) and a concrete fix.

## Severity definitions

- **critical** — blocks indexation or breaks the page (e.g., noindex, broken canonical loop, 500 on key URLs)
- **high** — measurably hurts ranking (e.g., missing H1, duplicate titles, redirect chains)
- **medium** — degrades user experience or partial signal (e.g., missing meta description, alt text)
- **low** — best practice (e.g., missing security header, image not WebP)

## Rules

### Crawlability
- `robots-blocks-page` — robots.txt Disallows a URL that returns 200. **critical.**
- `meta-noindex` — `<meta name="robots" content="noindex">` on a page reachable by crawl. **critical** if unintentional.
- `redirect-chain` — More than 2 hops between final URL and request URL. **high.**
- `broken-link-internal` — Internal `<a href>` returns 4xx/5xx. **high.**
- `broken-link-external` — External `<a href>` returns 4xx/5xx. **low.**
- `mixed-content` — HTTPS page loads HTTP resource. **high.**
- `canonical-loop` — Page A canonical points to B, B canonical points to A. **critical.**
- `canonical-non-self` — Page's canonical URL differs from its own. **medium** unless intentional.

### On-page basics
- `title-missing` — Empty or absent `<title>`. **high.**
- `title-too-long` — `<title>` > 65 chars (likely truncated). **medium.**
- `title-too-short` — `<title>` < 10 chars. **medium.**
- `meta-description-missing` — No `<meta name="description">`. **medium.**
- `meta-description-too-long` — > 175 chars. **low.**
- `h1-missing` — No `<h1>`. **high.**
- `h1-multiple` — More than one `<h1>`. **medium.**
- `heading-skip` — H1 → H3 with no H2. **low.**
- `duplicate-title` — Same `<title>` on 2+ crawled URLs. **high.**
- `duplicate-meta-description` — Same meta description on 2+ URLs. **medium.**

### Content
- `thin-content` — < 200 words of body text. **high** (helpful-content algo target).
- `near-duplicate-body` — > 70% body content overlap between 2 URLs (cannibalization). **high.**
- `missing-faq-on-listicle` — Title says "best X" or "top X" but no FAQ section. **low.**

### Images
- `alt-missing` — `<img>` without `alt`. **medium** (or **high** if it's the hero/feature image).
- `alt-too-long` — `alt` > 125 chars. **low.**
- `image-no-dimensions` — No `width`/`height` attributes (causes CLS). **medium.**
- `image-too-large` — image file > 250KB. **medium.**
- `image-not-webp` — image > 50KB and not WebP/AVIF. **low.**

### Schema
- `schema-invalid-json` — `<script type="application/ld+json">` doesn't parse. **high.**
- `schema-missing-required` — Article schema missing `headline`/`author`/`datePublished`. **medium.**
- `schema-no-article-on-blog` — A blog post URL with no Article/BlogPosting schema. **medium.**

### Security headers (signals Google trusts for E-E-A-T)
- `header-missing-hsts` — No `Strict-Transport-Security`. **low.**
- `header-missing-csp` — No `Content-Security-Policy`. **low.**
- `header-missing-xframe` — No `X-Frame-Options` or `frame-ancestors` in CSP. **low.**
- `header-missing-xcontent` — No `X-Content-Type-Options: nosniff`. **low.**
- `header-missing-referrer` — No `Referrer-Policy`. **low.**

### Sitemap + robots
- `sitemap-missing` — No `/sitemap.xml` discovered. **medium.**
- `sitemap-drift-404` — URL in sitemap returns 404. **high.**
- `sitemap-drift-orphan` — Crawled URL not in any sitemap. **low.**
- `robots-txt-missing` — No `/robots.txt`. **low.**

## Output JSON

```json
{
  "findings": [
    {
      "id": "title-missing",
      "url": "https://example.com/page",
      "severity": "high",
      "category": "on-page",
      "message": "Title tag is missing or empty",
      "fix": "Add a unique <title> 30-60 characters that includes the primary keyword.",
      "evidence": "<title></title>"
    }
  ],
  "summary": {
    "pages_crawled": 42,
    "critical": 1,
    "high": 7,
    "medium": 12,
    "low": 18
  }
}
```
