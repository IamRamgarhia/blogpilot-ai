# BlogPilot AI — Wave 3 (Strategy Depth) Implementation Plan

**Goal:** Add strategy-layer tools — Content Gap Analyzer, Competitor Scanner, Brand Voice Trainer, Internal Linking Assistant, Image Brief Generator, Post Refresher, and Duplicate Content Checker.

**Architecture:** All run on top of Wave 1+2 primitives. Reuse the AI executor + methodologies. Free-API only (Bing SERP, crawl competitor sitemaps). Add 5 new methodologies, 7 SEO modules, 5 API routes, 3 pages.

**Spec reference:** Hub B + Hub C remaining modules.

## Modules

1. **Brand Voice Trainer** — paste 3-5 best posts → AI extracts voice profile (tone, voice, sentence length, heading case, CTA style). Saves to client's styleProfile.
2. **Content Gap Analyzer** — given keyword + your client, scrape top-10, parse headings, return gap topics.
3. **Competitor Blog Scanner** — given competitor URL, crawl /blog or sitemap, return their cluster map.
4. **Internal Linking Assistant** — for a post, suggest links to sibling and pillar posts in the same client based on keyword overlap.
5. **Image Brief Generator** — for each post in draft, generate alt text + caption + image prompt suggestions for each H2.
6. **Existing Post Refresher** — paste old URL → fetch, AI rewrites with 2026 freshness, regenerates schema and meta.
7. **Duplicate Content Checker** — local Jaccard similarity of post drafts within a client; flags any > 70% overlap.

## Files

- methodologies/{brand-voice-extraction, content-gap-analysis, internal-linking-graph, image-brief-generation, content-refresh-rules}.md
- src/lib/seo/{gap-analyzer, competitor-scanner, brand-voice, internal-linking, image-brief, refresher, duplicate-checker}.ts
- src/app/api/{voice-train, gap-analyze, competitor-scan, internal-links/[postId], image-brief/[postId], refresh, duplicate-check/[clientId]}/route.ts
- src/app/clients/[id]/{competitors, voice, refresh}/page.tsx
- tests/{duplicate-checker, gap-analyzer, internal-linking}.test.ts

## Acceptance

- Each module accessible from client dashboard.
- Brand voice training updates client.styleProfile; later writer calls use it.
- Internal linking surfaces on draft page as a new sidebar card.
- Refresher creates a new "draft" post from an existing URL and runs through the same SEO check pipeline.
- All deterministic (duplicate, internal linking) work without AI keys.
- Tests pass; typecheck clean.
