---
id: multi-language-writing
title: Multi-language Writing
when: Writing or refreshing a post in a non-English language
inputs: target language code, optional region code
outputs: instructions added to the writer prompt
source: BCP 47 language codes + native-speaker style guides per language
---

# Multi-language Writing

## Rules

1. **Write fully in the target language.** No mixing unless quoting a proper noun or technical term that has no native equivalent.
2. **Use native idioms**, not literal translations. "How to bake bread" in Spanish is "Cómo hornear pan", not "Cómo a hornear pan".
3. **Heading case** matches the target language convention:
   - English: title case or sentence case (per blog style)
   - French, Spanish, Portuguese, German, Italian: sentence case (only first word capitalized)
   - Chinese, Japanese, Korean: no case concept
4. **Numbers and dates** match the locale:
   - en-US: 1,000.50 / May 13, 2026
   - de-DE: 1.000,50 / 13. Mai 2026
   - fr-FR: 1 000,50 / 13 mai 2026
5. **Punctuation rules** are locale-specific:
   - French: space before `:`, `;`, `?`, `!`
   - Spanish: opening `¿` and `¡`
   - Chinese, Japanese: full-width punctuation (。、！？)
6. **Quotation marks** match locale:
   - English: "smart double" or 'smart single'
   - French: « guillemets » with non-breaking spaces
   - German: „inner" or »outer«
7. **Keyword research** should use the same target language. Do not write a French post optimized for English search terms.

## Validation

- Output must not contain English filler ("Let's start with..." in a French post).
- Headings must be in the target language.
- Slug should use the target language transliterated to ASCII.
