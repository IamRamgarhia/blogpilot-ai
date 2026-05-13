---
id: brand-voice-extraction
title: Brand Voice Extraction
when: User pastes 3-5 sample posts to train a richer voice profile
inputs: 3-5 plain text or markdown sample posts
outputs: structured voice profile JSON
source: Nielsen Norman Group "Tone of Voice" framework + Mailchimp Voice and Tone Guide
---

# Brand Voice Extraction

Analyze the samples and return a voice profile the post writer can consistently match.

## What to extract

- **Tone**: formal | conversational | technical | playful | authoritative | empathetic
- **Voice**: first-person | second-person | third-person (pick the dominant)
- **Sentence length**: average words per sentence (round to nearest 5)
- **Heading case**: title | sentence (look at H2 patterns)
- **CTA style**: newsletter | affiliate | product-plug | inline-link | none
- **Vocabulary level**: simple | mixed | technical
- **Hedge words usage**: low | medium | high ("perhaps", "might", "could")
- **Contractions**: yes | no (do they use "don't", "we're"?)
- **Em-dashes / parentheses**: rare | moderate | frequent
- **Lists vs prose**: prose-heavy | balanced | list-heavy
- **Author persona**: e.g. "industry expert", "friendly mentor", "data-driven analyst"
- **Phrases to keep**: 3-5 distinctive turns of phrase to reuse
- **Phrases to avoid**: 3-5 cliches or generic phrases the brand never uses

## Output JSON

```json
{
  "tone": "...",
  "voice": "...",
  "avgSentenceLength": 18,
  "headingCase": "title",
  "ctaStyle": "...",
  "vocabularyLevel": "...",
  "hedgeWords": "low",
  "contractions": true,
  "emDashes": "moderate",
  "listsVsProse": "balanced",
  "authorPersona": "...",
  "phrasesToKeep": ["..."],
  "phrasesToAvoid": ["..."]
}
```
