---
id: image-brief-generation
title: Image Brief Generation
when: After draft is written, generating image briefs for each section
inputs: post outline, primary keyword, brand style hint
outputs: array of image specs per section
source: schema.org/ImageObject + Google Image SEO + accessibility guidelines (WCAG 2.2)
---

# Image Brief Generation

For each major section (H2) and the post hero, produce an image brief.

## Per image

- **placement**: hero | section-N | inline-callout
- **alt_text**: 8-15 words, descriptive, includes primary keyword if natural — NEVER stuffed
- **caption**: 1 short sentence the reader sees beneath the image (optional, only if blog uses captions)
- **filename_suggestion**: kebab-case slug from alt text, max 60 chars
- **width_height_ratio**: "16:9" for hero, "4:3" or "1:1" for inline
- **format**: prefer WebP/AVIF, fallback JPG. PNG only when transparency required.
- **ai_prompt**: a generation prompt suitable for Gemini Imagen / DALL-E / Stable Diffusion. Must avoid copyrighted characters and trademarked brands. Style guidance matches the post tone.
- **stock_search_terms**: 3-5 search queries to find a stock photo as fallback
- **on_page_role**: explain-with-image | break-up-text | enhance-mood | data-visualization

## Rules

1. Hero image is mandatory. One per post.
2. At least 1 image per 600 words.
3. Alt text NEVER starts with "Image of..." or "Picture of...".
4. AI prompts must be specific (subject + style + lighting + camera angle).
5. Image filenames are slugs, not random hashes.

## Output JSON

```json
{
  "images": [
    {
      "placement": "hero",
      "alt_text": "...",
      "caption": "...",
      "filename_suggestion": "...",
      "width_height_ratio": "16:9",
      "format": "webp",
      "ai_prompt": "...",
      "stock_search_terms": ["..."],
      "on_page_role": "..."
    }
  ]
}
```
