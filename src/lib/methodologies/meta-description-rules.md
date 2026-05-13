---
id: meta-description-rules
title: Meta Description Rules
when: Generating the meta description for a post
inputs: post title, primary keyword, intro paragraph, intent
outputs: "{ metaDescription: string, length: number, warnings: string[] }"
source: Google Search Central + Search Engine Journal CTR studies
---

# Meta Description Rules

Generate the meta description.

## Rules

1. **Length:** 140-160 characters. Under 120 wastes space; over 160 truncates.
2. **Primary keyword appears** — Google bolds it in SERPs, improving CTR.
3. **Answers the searcher's intent** in one sentence.
4. **Includes a soft CTA** matching the intent:
   - Informational: "Learn how to ..." / "Find out why ..."
   - Commercial: "Compare top ..." / "See our pick for ..."
   - Transactional: "Get started today" / "Try free ..."
5. **No quotes** (they get escaped weirdly).
6. **No truncated sentences.** Must be a complete thought.

## Output JSON

```json
{
  "metaDescription": "...",
  "length": 0,
  "warnings": ["..."]
}
```
