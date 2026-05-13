---
id: schema-howto
title: HowTo Schema (JSON-LD)
when: When a post format is "tutorial" or "how-to"
inputs: title, steps (each with name + text), totalTime, supplies, tools
outputs: JSON-LD HowTo schema
source: schema.org/HowTo + Google HowTo rich results
---

# HowTo Schema

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "TITLE",
  "totalTime": "PT15M",
  "step": [
    { "@type": "HowToStep", "name": "STEP NAME", "text": "STEP TEXT" }
  ]
}
```

## Rules
- Steps must match visible H2/H3 in the post.
- `totalTime` uses ISO 8601 duration format (PT15M = 15 minutes).
- Only apply when content is genuinely how-to. Do NOT add HowTo to a listicle.
