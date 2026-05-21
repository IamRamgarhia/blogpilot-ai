# BlogPilot AI — Wave 7 (Surfer-killer) Implementation Plan

**Goal:** Ship the content-score editor + PAA tree + SERP feature detector + topic authority scorer. Replaces Surfer ($89/mo) + Clearscope ($170/mo) + AlsoAsked ($15/mo) + MarketMuse ($149/mo). User needs only an AI key (or none — fallback works); everything else uses free public endpoints.

## Modules

1. **SERP page text extractor** — pulls main content text from each of the top-10 Bing SERP results.
2. **TF-IDF term extractor** — pure TS implementation, no external deps. Extracts must-have + recommended + nice-to-have terms based on cross-document frequency.
3. **Content Score engine** — scores a draft 0-100 on:
   - Required-term coverage (50%)
   - Recommended-term coverage (20%)
   - Word-count vs SERP median (15%)
   - Heading parity (10%)
   - Question coverage / PAA hits (5%)
4. **Live editor UI** — debounced auto-scoring with shadcn/21st.dev-styled progress bars + term-coverage chips.
5. **PAA Tree Explorer** — recursive PAA scrape, collapsible tree view.
6. **SERP Feature Detector** — flags featured snippet / PAA / shopping / map pack / video / image carousel / knowledge panel per keyword.
7. **Topic Authority Scorer** — Wikipedia/Wikidata-based entity coverage check.

## Files

- methodologies/{content-score-rules, topic-authority-scoring}.md
- src/lib/seo/serp-content.ts (page-text extractor)
- src/lib/seo/tfidf.ts
- src/lib/seo/content-score.ts
- src/lib/seo/paa-tree.ts
- src/lib/seo/serp-features.ts
- src/lib/seo/topic-authority.ts (Wikipedia/Wikidata)
- src/app/api/content-score/route.ts
- src/app/api/paa-tree/route.ts
- src/app/api/serp-features/route.ts
- src/app/api/topic-authority/route.ts
- src/app/clients/[id]/posts/[postId]/score/page.tsx (live editor)
- src/app/clients/[id]/tools/page.tsx (PAA + SERP features + topic authority hub)
- tests/tfidf.test.ts
- tests/content-score.test.ts

## No-extra-API contract

- Bing SERP scrape: no key needed
- Google Autocomplete: no key needed
- Wikipedia + Wikidata: no key needed
- PAA: same Bing scrape we already have
- Everything else: local computation

## Acceptance

- Paste any draft on the Score page → see real-time 0-100 score + per-term coverage chips
- Live update under 1s after typing pause (debounced)
- PAA tree expands 3 levels deep on demand
- SERP features detected from a Bing result page
- Topic authority returns entity-coverage % for a niche
