# BlogPilot AI — Wave 2 (Write Loop) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship the end-to-end write loop. User picks a client → researches keywords with free APIs → generates a content calendar → approves outlines → writes full posts following the Methodology Library → exports as Markdown/HTML/JSON.

**Architecture:** Adds 4 new tables (`keywords`, `clusters`, `calendar_entries`, `post_drafts`), 10 new methodology files, a free-API keyword research module (Google Autocomplete + PAA + Bing SERP scraping), and pages for keyword research, calendar, outline approval, post writing, and export. All AI generation goes through `lib/ai/executor.ts` which loads methodologies before every call.

**Tech Stack:** Same as Wave 1 — Next.js 15, libsql, Drizzle, Cheerio for SERP scraping, the existing AI adapter.

**Spec reference:** [docs/specs/2026-05-13-blogpilot-ai-design.md](../specs/2026-05-13-blogpilot-ai-design.md) §6 Hub B + Hub C

---

## File Structure (additions only)

```
src/
├── app/
│   ├── clients/[id]/
│   │   ├── research/page.tsx          # Keyword research
│   │   ├── calendar/page.tsx          # Generated calendar + status
│   │   └── posts/
│   │       ├── [postId]/outline/page.tsx   # Outline review + approval
│   │       └── [postId]/draft/page.tsx     # Full post editor + export
│   └── api/
│       ├── research/route.ts          # POST { clientId, seed } → returns keyword set
│       ├── calendar/route.ts          # POST { clientId, keywords[], length } → creates calendar entries + posts
│       ├── outline/route.ts           # POST { postId } → generates outline JSON
│       ├── outline/approve/route.ts   # POST { postId, outline } → saves approved outline
│       ├── draft/route.ts             # POST { postId } → writes full post using approved outline
│       ├── seo-check/route.ts         # POST { postId } → returns checks pass/fix
│       └── export/[postId]/route.ts   # GET ?format=md|html|json → downloadable
├── lib/
│   ├── seo/
│   │   ├── research.ts                # Free-API keyword research orchestrator
│   │   ├── autocomplete.ts            # Google Autocomplete
│   │   ├── paa.ts                     # People Also Ask scraper
│   │   ├── bing-serp.ts               # Bing SERP scraper
│   │   ├── intent.ts                  # Wraps executor with serp-intent-classification
│   │   ├── outline.ts                 # Outline generator
│   │   ├── writer.ts                  # Post writer
│   │   ├── meta.ts                    # Meta title + description
│   │   ├── schema.ts                  # JSON-LD generators
│   │   ├── readability.ts             # Flesch-Kincaid + checks
│   │   └── seo-check.ts               # E-E-A-T + on-page check orchestrator
│   └── methodologies/
│       ├── content-calendar-design.md
│       ├── outline-structure.md
│       ├── post-writer-style-matching.md
│       ├── meta-title-rules.md
│       ├── meta-description-rules.md
│       ├── faq-paa-targeting.md
│       ├── schema-article.md
│       ├── schema-faq.md
│       ├── schema-howto.md
│       └── readability-targets.md
└── ...
tests/
├── seo-research.test.ts
├── seo-readability.test.ts
├── seo-schema.test.ts
└── seo-export.test.ts
```

Schema additions: `posts` table already exists in Wave 1. Add `keywords` and `clusters` columns to `clients.styleProfile` JSON. Reuse `posts.outlineJson`, `draftMarkdown`, `metaTitle`, `metaDescription`, `schemaJsonLd`. No new tables required for v2; everything fits in existing schema.

---

## Task 1: New methodology files (10 files)

Drop the 10 markdown files listed above into `src/lib/methodologies/`. Each follows the same frontmatter pattern as Wave 1 (id, title, when, inputs, outputs, source).

After: `npm test` — methodology-loader test should now see >= 13 methodologies (3 from Wave 1 + 10 new). Update test assertion.

## Task 2: Free-API keyword research module

`autocomplete.ts` → `https://suggestqueries.google.com/complete/search?client=firefox&q=<seed>` returns 10 suggestions.
`paa.ts` → fetch Google search results page, extract PAA via Cheerio.
`bing-serp.ts` → fetch `https://www.bing.com/search?q=<q>` and parse top-10 titles + snippets.
`research.ts` orchestrates: takes seed keyword → returns `{ autocomplete: [], paa: [], serpTop10: [], suggested: [] }`.

## Task 3: AI-driven intent classification + difficulty estimate

`intent.ts` calls `execute({ methodologies: ["serp-intent-classification"], task: "classify", input: { keyword, serpTop10 }, jsonMode: true })`.
Returns parsed JSON. Falls back to keyword-rule classifier if AI not configured.

## Task 4: Research UI

`/clients/[id]/research/page.tsx` — seed input, run button, results table (keyword, intent, format, difficulty), checkboxes to "add to calendar".

## Task 5: Calendar generator

POST `/api/calendar` → for each selected keyword, calls executor with `["content-calendar-design", "topic-cluster-model", "skyscraper-technique"]` to produce title, sub-intent, recommended format, target word count. Inserts one row per post into `posts` table with `status="idea"`.

## Task 6: Calendar UI

`/clients/[id]/calendar/page.tsx` — Kanban columns: Idea / Outline / Draft / Ready. Reorder, delete, regenerate per post. Click a post → outline page.

## Task 7: Outline generator + approval

POST `/api/outline` → executor with `["outline-structure", "skyscraper-technique", "featured-snippet-targeting", "paa-optimization"]` → JSON outline.
`/clients/[id]/posts/[postId]/outline/page.tsx` — shows outline (editable), "Approve" button sets `status="outline_approved"`.

## Task 8: Full post writer

POST `/api/draft` → executor with `["post-writer-style-matching", "eeat-checklist", "geo-citation-readiness", "readability-targets", "skyscraper-technique"]` and the client's style profile + approved outline → returns markdown.
Saves to `posts.draftMarkdown`, sets `status="draft"`.
`/clients/[id]/posts/[postId]/draft/page.tsx` — split view: preview + checks.

## Task 9: Meta + Schema generators

`meta.ts` calls executor with `["meta-title-rules", "meta-description-rules"]` → `{ metaTitle, metaDescription }`.
`schema.ts` generates Article + FAQ + Breadcrumb JSON-LD deterministically from post data + outline.
Both run automatically when post is drafted; results stored on the post row.

## Task 10: Readability + SEO check

`readability.ts` computes Flesch-Kincaid, average sentence length, passive voice ratio, keyword density — all locally, no AI.
`seo-check.ts` runs methodology checks via executor: returns `{ checks: [], overall }`.
Shown on draft page.

## Task 11: Export

GET `/api/export/[postId]?format=md|html|json` → downloadable file with: front-matter (title, date, meta, slug), body markdown or HTML, schema JSON-LD block.

## Task 12: Tests + smoke

- Unit test readability (Flesch-Kincaid math against known sentences).
- Unit test schema generation (valid JSON-LD shapes).
- Unit test research module with mocked fetch.
- Unit test export formats round-trip.
- E2E manual: pick a client, run research, generate calendar, approve outline, draft post, export. Verify Dice Codes branding on the export footer (toggle-able).

---

Plan complete. Executing in waves with checkpoints after Task 2 (research works), Task 8 (full write loop works), Task 11 (export works).
