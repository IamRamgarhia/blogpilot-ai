# BlogPilot AI — Wave 8 (Screaming Frog killer) Implementation Plan

**Goal:** Ship a technical SEO crawler with 25+ audit rules. Replaces Screaming Frog ($259/yr) and Sitebulb ($149/yr). All audits run locally on top of Cheerio + direct HTTP. No extra APIs.

## Modules

1. **Recursive crawler** — Cheerio-based, depth-capped, host-scoped, throttled, SSRF-guarded.
2. **Audit rules** — 25+ checks across 6 categories:
   - **Crawlability:** robots.txt blocks, redirect chains > 2, 404s, blocked by meta robots
   - **On-page:** missing/empty H1, multiple H1s, missing/long title, missing/short meta description, duplicate titles, duplicate meta descriptions
   - **Content:** thin content < 200 words, duplicate body content, missing FAQs on long posts
   - **Images:** missing alt, alt > 125 chars, no dimensions, non-WebP/AVIF for large images
   - **Schema:** invalid JSON-LD, type mismatches, missing required fields
   - **Security/headers:** missing HSTS, missing CSP, missing X-Frame-Options, X-Content-Type-Options, Referrer-Policy
   - **Hreflang:** validate any existing hreflang sets across the crawl
   - **Sitemap drift:** URLs in sitemap but 404; URLs crawled but missing from sitemap
3. **Cannibalization detector** — find multiple URLs targeting the same primary keyword.
4. **Report** — severity-grouped (critical / high / medium / low), exportable CSV.

## Files

- methodologies/technical-seo-audit.md
- src/lib/technical/crawler.ts (recursive crawler)
- src/lib/technical/audits.ts (all rules in one file, deterministic)
- src/lib/technical/security-headers.ts
- src/lib/technical/cannibalization.ts
- src/lib/technical/report.ts (severity grouping + CSV export)
- src/app/api/audit/route.ts (POST starts crawl, returns full report)
- src/app/clients/[id]/audit/page.tsx (audit dashboard with severity tabs)
- tests/technical-audits.test.ts
- tests/cannibalization.test.ts

## Acceptance

- Crawls up to N pages (default 50, configurable)
- Returns 25+ findings categorized by severity
- Each finding includes URL + rule id + severity + human-friendly message + fix suggestion
- Cannibalization detector finds duplicate keyword targets in client's existing posts
- All audits return pass for an ideal page; fail for known-bad fixtures
- Tests pass, typecheck clean
