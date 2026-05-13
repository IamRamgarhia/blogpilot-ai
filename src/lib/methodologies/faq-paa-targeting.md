---
id: faq-paa-targeting
title: FAQ + PAA Targeting
when: Generating the FAQ section of a post
inputs: primary keyword, scraped People-Also-Ask questions, post intent
outputs: array of { q, a } pairs
source: Google PAA + Ahrefs FAQ optimization study
---

# FAQ + PAA Targeting

Generate 4-6 FAQ items optimized for People-Also-Ask, Featured Snippets, and AI Overview citation.

## Rules per FAQ item

1. **Question** matches a real PAA query phrasing (use the scraped PAA list when provided). If no PAA data, synthesize realistic questions a searcher would type.
2. **Answer** is 40-55 words — the sweet spot for featured snippet capture.
3. Answer's first sentence directly answers the question (no preamble).
4. Each answer is self-contained — no "see above" or "as mentioned earlier".
5. At least one question must include the primary keyword.
6. Avoid yes/no answers without elaboration.

## Output JSON

```json
{
  "faqs": [
    { "q": "...", "a": "40-55 word answer..." }
  ]
}
```
