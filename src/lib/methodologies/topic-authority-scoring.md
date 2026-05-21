---
id: topic-authority-scoring
title: Topic Authority Scoring (Wikipedia/Wikidata)
when: Measuring how much of a niche's entity space a client has covered
inputs: niche or seed keyword, list of client post titles + bodies
outputs: 0-100 authority score with covered + missing entities
source: Google's "topical authority" criterion + MarketMuse topic-model patterns
---

# Topic Authority Scoring

Use Wikipedia's entity graph as the ground truth for a niche's "complete topic space."

## Method

1. Take the seed keyword. Query Wikipedia search API for top 5 articles.
2. For the top Wikipedia article on this topic, extract:
   - Section headings (these are the canonical sub-topics)
   - Linked entities in the article (these are the canonical related concepts)
3. The combined set is the **niche entity space**.
4. For each entity, check whether any client post body mentions it (case-insensitive, exact + plural).
5. Score = (covered entities / total entities) × 100.

## Severity tiers

- **>= 70%** — Strong topical authority. Likely ranking opportunity.
- **40-69%** — Moderate. Specific gaps to fill.
- **< 40%** — Surface coverage. Cluster needs depth before competing for head terms.

## Output JSON

```json
{
  "niche": "wordpress seo",
  "score": 64,
  "tier": "moderate",
  "wikipedia_anchor": "https://en.wikipedia.org/wiki/...",
  "covered": [
    { "entity": "schema markup", "post_count": 3 },
    { "entity": "core web vitals", "post_count": 2 }
  ],
  "missing": [
    { "entity": "internal linking", "suggested_post_title": "Internal Linking for WordPress SEO" },
    { "entity": "robots.txt", "suggested_post_title": "..." }
  ],
  "recommended_action": "Write posts for the 8 missing entities to reach Strong tier."
}
```
