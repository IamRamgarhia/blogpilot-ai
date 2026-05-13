---
id: serp-intent-classification
title: SERP Intent Classification
when: For every target keyword, before outline generation
inputs: keyword string, top 10 SERP titles/snippets if available
outputs: { intent, sub_intent, recommended_format, confidence, rationale }
source: Google Search Central; Ahrefs intent taxonomy
---

# SERP Intent Classification

Classify the keyword into exactly ONE of:

1. **Informational** — "what is X", "how does X work", "X explained"
   - Sub-types: definitional, explanatory, how-to, comparison, beginner-guide
2. **Navigational** — user is looking for a specific brand/site
3. **Commercial Investigation** — "best X", "X vs Y", "X reviews", "top X"
4. **Transactional** — "buy X", "X coupon", "X discount", "X near me", "free X tool"

Output format JSON:
```json
{
  "intent": "informational | navigational | commercial | transactional",
  "sub_intent": "how-to | listicle | comparison | review | definition | tool | service",
  "recommended_format": "long-form-guide | listicle | comparison-table | tutorial | case-study",
  "confidence": 0.0,
  "rationale": "one sentence"
}
```

Rules:
- If keyword contains "best", "vs", "review", "alternative" → commercial.
- If keyword starts with "how to", "why", "what is" → informational.
- If keyword contains "buy", "price", "near me", "discount", "free download" → transactional.
- Brand-only queries → navigational.
- When SERP data is provided, prioritize SERP format over keyword guess.
