---
id: passage-ranking-optimization
title: Passage Ranking Optimization
when: Long-form posts (1500+ words) targeting multiple sub-queries
inputs: post draft
outputs: per-section passage-ranking checks
source: Google Passage Ranking announcement (2020) + 2024-2026 follow-up studies + AI Overview citation patterns
---

# Passage Ranking Optimization

Google can rank a single passage of a long page for a specific query, separately from the page as a whole. AI engines do the same. Structure long posts so individual passages are independently citable.

## Passage = a coherent chunk

A passage is typically: one H2 section, or one H3, or one definition + example pair.

## Rules per passage

1. **Each H2/H3 starts a citable unit.** The first paragraph after the heading must be self-sufficient.
2. **Heading IS the query the passage answers.** Phrase the heading the way a searcher would type the query.
3. **Passage has its own intro + body + (optional) conclusion sentence.** Mini-articles inside the article.
4. **No back-references.** No "as discussed above" or "we'll see later". Each passage stands alone.
5. **Anchor links to each passage.** Use `id` attributes on H2/H3 so deep-links work (`<h2 id="what-is-x">`).
6. **TOC links to each passage** — Google often shows TOC excerpts in SERP.
7. **Each passage ≤ 300 words.** Longer = less likely to be extracted.
8. **Passage has at least one structured element** — a list, table, callout, or formatted definition. Pure prose passages get cited less.

## Validation checks

- Every H2 has a passage that could stand alone if quoted.
- Every passage starts with the topic sentence (no "let me explain…" lead-ins).
- Every passage either answers a question or completes a clear definition.
- Page-level TOC links to each passage with `#anchor`.
- No two passages cover the same question.

## Output JSON

```json
{
  "passage_audit": [
    {
      "h2": "What is X?",
      "words": 240,
      "starts_with_topic_sentence": true,
      "back_references": 0,
      "has_structured_element": true,
      "anchor_id_present": true,
      "citable": true
    },
    {
      "h2": "Why X matters",
      "words": 520,
      "starts_with_topic_sentence": false,
      "back_references": 3,
      "has_structured_element": false,
      "anchor_id_present": false,
      "citable": false,
      "fix": "Trim to ≤ 300 words, lead with topic sentence, remove back-references, add a 3-item list."
    }
  ]
}
```
