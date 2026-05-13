---
id: schema-article
title: Article Schema (JSON-LD)
when: For every blog post export
inputs: post title, slug, author, datePublished, dateModified, image, description
outputs: JSON-LD Article schema string
source: schema.org/Article + Google Rich Results guidelines
---

# Article Schema

Generated deterministically — NOT via AI. This methodology documents the contract.

## Required fields
- `@context`: `"https://schema.org"`
- `@type`: `"Article"` (or `"BlogPosting"` if blog detected)
- `headline`: must match the H1, max 110 chars
- `description`: meta description
- `image`: array of full URLs (1-4)
- `datePublished`: ISO 8601
- `dateModified`: ISO 8601 (same as datePublished if first publish)
- `author`: `{ "@type": "Person", "name": "...", "url": "...", "sameAs": ["..."] }`
- `publisher`: `{ "@type": "Organization", "name": "...", "logo": { "@type": "ImageObject", "url": "..." } }`
- `mainEntityOfPage`: `{ "@type": "WebPage", "@id": "post-url" }`

## Validation
- All URLs must be absolute (start with `http`).
- `headline` <= 110 chars.
- `dateModified` >= `datePublished`.
