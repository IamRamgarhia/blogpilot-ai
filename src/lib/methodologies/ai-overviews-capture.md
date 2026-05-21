---
id: ai-overviews-capture
title: AI Overviews Citation Capture
when: Optimizing a post for AI Overview citation (Google), ChatGPT search, Perplexity, Bing Copilot
outputs: per-section citation-readiness checks
source: Google AI Overviews documentation + Perplexity ranking signals (Sept 2025 study) + ChatGPT search citation patterns (Nov 2025 study)
---

# AI Overviews Citation Capture

AI Overview engines (Google AI Overviews, ChatGPT search, Perplexity, Bing Copilot) cite pages that match a specific structural pattern. This methodology codifies those patterns.

## What gets cited

Studies of citations across all four engines (2025) found **6 common patterns** in cited passages:

1. **Direct-answer paragraph** sized 40-55 words.
2. **Definition sentence** in canonical form: `Subject is category that distinguishing-feature.`
3. **Numbered step list** with verb-led, present-tense items.
4. **Comparison table** for `X vs Y` queries.
5. **Quote-with-attribution** for opinion or evaluation queries.
6. **Stat callout** for factual numeric claims (`According to [source], X% of...`).

If a passage matches one of these patterns AND scores high on E-E-A-T, it has a measurable citation lift.

## Rules per post

### Passage isolation
- **Every H2 section's first paragraph is a citable unit.** Treat it as a standalone snippet — it must make sense out of context.
- **Refer back sparingly.** Do not say "as we mentioned above" or "as shown earlier." AI engines extract single passages without context.
- **Each section answers ONE question.** Multi-question sections get partial citations or none.

### Per-passage formatting
- First sentence: **direct answer** in 15-25 words.
- Sentences 2-4: supporting detail, 40-55 total words for the paragraph.
- Avoid hedging language at the start (`Maybe`, `Perhaps`, `It depends`). Hedging-led passages get cited less.
- Avoid first-person plurals (`we`, `our`) in citable paragraphs — engines prefer third-person neutral.

### Schema reinforcement
- **Article + Author + Organization** Person schema with verifiable `sameAs` URLs (LinkedIn, X, personal site).
- **FAQ schema** for the FAQ section — each Q&A pair gets independent citation potential.
- **HowTo schema** for tutorial posts.
- **Quotation schema** for embedded quotes (optional, helps ChatGPT).

### Entity anchoring
- Mention canonical entity names with their **Wikipedia anchor** as the first internal link.
- e.g., first time you mention "Schema markup" → link to schema.org definition page or your own pillar page about it.
- AI engines build their answer by joining entity facts; canonical anchoring helps them treat your page as a source.

### Update frequency
- AI Overviews favor posts updated within **90 days** for non-evergreen topics.
- Static evergreen posts must show `dateModified` ≥ 365 days even if no content change, to signal freshness check.

### llms.txt
- Site should have a root `llms.txt` listing top resources. Direct AI-crawler signal.

## Output JSON

```json
{
  "ai_overview_score": 78,
  "max": 100,
  "passage_audits": [
    {
      "h2": "What is X?",
      "first_paragraph_words": 52,
      "pattern": "direct_answer",
      "hedging_words": 0,
      "first_person_plural": false,
      "citable": true
    }
  ],
  "warnings": ["FAQ schema missing — each FAQ Q&A is independently citable"],
  "recommended_action": "..."
}
```
