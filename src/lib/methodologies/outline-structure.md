---
id: outline-structure
title: Outline Structure
when: Before writing any post; produces the H1/H2/H3 plan
inputs: title, primary keyword, intent, format, word count target, client style profile, SERP top-10 if available
outputs: structured outline JSON
source: Backlinko Skyscraper + Ahrefs On-Page Templates + Google AI Overviews patterns
---

# Outline Structure

Produce a post outline that:

1. Opens with a **TL;DR / key takeaways** block (3-5 bullets) — critical for AI Overview capture.
2. Has an introduction with the primary keyword in the first sentence and a specific hook (counter-intuitive stat, contrarian claim, or specific outcome promise). Never use generic openers like "In today's world".
3. Body H2s reflect the intent:
   - Informational → progressive depth (definition → details → examples → edge cases)
   - Commercial → "what" + "best for whom" + "pros/cons" + "alternatives"
   - Transactional → "why", "how to choose", "step-by-step", "next steps"
4. Each H2 has 2-4 H3s for scannability.
5. Includes a **FAQ section** with 4-6 questions sourced from PAA + SERP autocomplete.
6. Closes with a conclusion + CTA matching the client's detected CTA style.
7. Lists **internal link opportunities** with `[INTERNAL LINK: topic]` placeholders.
8. Lists **image suggestions** with alt text placeholders.

## Output JSON

```json
{
  "title": "...",
  "slug": "...",
  "tldr_bullets": ["..."],
  "intro_hook": "...",
  "h2s": [
    { "heading": "...", "h3s": [ "..." ], "notes": "what to cover", "snippet_target": false }
  ],
  "faqs": [{ "q": "...", "a_target_words": 50 }],
  "conclusion_cta": "...",
  "internal_link_topics": ["..."],
  "image_suggestions": [{ "placement": "intro | section-2 | ...", "alt": "..." }],
  "word_count_target": 1500
}
```

One H2 should target a featured snippet (set `snippet_target: true`). Its first paragraph must be 40-55 words and answer the section's question directly.
