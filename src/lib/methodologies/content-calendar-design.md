---
id: content-calendar-design
title: Content Calendar Design
when: Generating a content calendar from a list of keywords
inputs: client niche, language, list of target keywords with intent, optional cluster hints
outputs: array of post specs with title, slug, intent, format, cluster, word count, priority
source: HubSpot Topic Cluster Model + Ahrefs Editorial Calendar Patterns
---

# Content Calendar Design

Given a list of keywords, design a publishable content calendar. Optimize for:

1. **Topical depth before breadth** — group keywords into 1-3 clusters. Each cluster gets one pillar (long-form, broad-keyword) and 3-8 spokes (narrow, specific).
2. **Quick wins first** — order by ascending difficulty so the user ships low-competition posts first to build authority signals.
3. **Intent diversity** — within each cluster, mix informational + commercial + transactional posts. Pure informational clusters won't convert; pure commercial clusters won't rank.
4. **Title craft** — every title must:
   - Front-load the primary keyword
   - Promise a specific outcome, number, or year
   - Be under 60 characters when possible
   - Avoid clickbait ("You won't believe..." is banned)

## Output

JSON array. Each item:

```json
{
  "title": "...",
  "slug": "kebab-case-version",
  "primary_keyword": "...",
  "intent": "informational | commercial | transactional | navigational",
  "format": "long-form-guide | listicle | comparison-table | tutorial | case-study | review",
  "cluster": "cluster-name",
  "is_pillar": false,
  "word_count_target": 1500,
  "priority": 1,
  "rationale": "one sentence why this post matters"
}
```

Rules:
- `priority` is 1 (highest) to N (lowest). Pillar posts get highest priority within their cluster.
- `slug` is lowercase, hyphens only, no stop words at start.
- Do not duplicate primary keywords across posts.
