---
id: skyscraper-technique
title: Skyscraper Technique
when: When writing a competitive long-form post on an established keyword
inputs: target keyword, top 5-10 ranking post titles + headings
outputs: outline that beats the best of the SERP on depth, structure, and freshness
source: Brian Dean / Backlinko
---

# Skyscraper Technique

Goal: produce content that is **measurably better** than what currently ranks.

## Steps

1. **Find the tallest:** Identify the best of the top 10. Note its word count, heading count, unique angles, year of last update.
2. **Find what's missing:** List 3-5 things competitors lack — recent data, original visuals, expert quotes, deeper sub-topics, more examples, clearer structure, better intro.
3. **Build taller:**
   - Word count at least 1.3x the median of top 5 (cap at 4000 unless topic warrants more).
   - More H2s with more specific H3s (one level deeper than median).
   - At least 1 element no competitor has: original data, calculator, downloadable, infographic, interview quote.
   - Update with 2026 references where competitors used 2023 or older.
4. **Hook harder:** Open with a counter-intuitive stat, a specific outcome, or a contrarian claim (NOT "In today's world...").
5. **Add citation placeholders:** Every claim gets `[CITE: ...]` if not from primary source.

## Output

Return JSON:
```json
{
  "title": "...",
  "h2s": [{ "heading": "...", "h3s": ["..."], "notes": "..." }],
  "unique_assets": ["..."],
  "word_count_target": 0,
  "hooks": ["hook option 1", "hook option 2", "hook option 3"]
}
```
