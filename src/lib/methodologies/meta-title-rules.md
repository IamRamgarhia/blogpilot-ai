---
id: meta-title-rules
title: Meta Title Rules
when: Generating the <title> tag for a post
inputs: post title, primary keyword, brand name
outputs: "{ metaTitle: string, length: number, warnings: string[] }"
source: Google Search Central + Moz title tag guidance
---

# Meta Title Rules

Generate the meta title (`<title>`) tag.

## Rules

1. **Length:** 50-60 characters max. Anything over 60 risks truncation in SERPs.
2. **Primary keyword must appear**, front-loaded if natural.
3. **Brand suffix:** end with ` | <Brand>` only if the total length stays under 60.
4. **No keyword stuffing.** Keyword appears once.
5. **No clickbait.** Match the post's actual content.
6. **Numbers help** when the post is a listicle ("7 ways to ...", "11 best ...").
7. **Year hints help** evergreen pages ("in 2026") — only when the post will be updated annually.
8. **Avoid** ALL CAPS, multiple exclamation marks, emojis (use sparingly only if brand style allows).

## Output JSON

```json
{
  "metaTitle": "...",
  "length": 0,
  "warnings": ["..."]
}
```

Warnings to emit if any rule is violated. If length > 60, the warning must be the first item.
