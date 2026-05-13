---
id: content-gap-analysis
title: Content Gap Analysis
when: Before writing a new post on a competitive keyword
inputs: target keyword, top-10 SERP results (titles + headings if scraped), client's existing post coverage
outputs: ranked list of gap topics
source: Ahrefs Content Gap report + Backlinko Skyscraper
---

# Content Gap Analysis

Compare what the top 10 ranking posts cover vs what the client currently covers. Return what to add.

## Process

1. **Extract topics** covered by each top-10 result (titles + scraped H2/H3 if available).
2. **Cluster topics** that appear in 3+ competitors — these are table stakes.
3. **Identify unique angles** in only 1-2 competitors — these are differentiators.
4. **Cross-reference** with client's existing post titles. Mark each topic as:
   - `covered` — client already has a post on this
   - `missing` — no client post exists yet
   - `weak` — client touches it but not a dedicated post
5. **Rank gaps** by:
   - Priority 1: covered by 5+ competitors but missing on client (must-have)
   - Priority 2: covered by 3-4 competitors but missing (should-have)
   - Priority 3: unique angle in 1-2 competitors (differentiator)

## Output JSON

```json
{
  "gaps": [
    {
      "topic": "...",
      "competitor_count": 5,
      "status": "missing | weak",
      "priority": 1,
      "suggested_post_title": "...",
      "rationale": "..."
    }
  ],
  "table_stakes": ["..."],
  "differentiators": ["..."]
}
```
