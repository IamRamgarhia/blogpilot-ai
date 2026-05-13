---
id: hreflang-implementation
title: Hreflang Implementation
when: Generating hreflang tags for multi-language or multi-region sites
inputs: list of language/region variants per page, canonical URL
outputs: <link rel="alternate"> set
source: Google Search Central hreflang docs + RFC 5646 (BCP 47)
---

# Hreflang Implementation

## When to use hreflang

- Translated content (same topic, different language)
- Regional variants (same language, different region — e.g. en-US vs en-GB)

NOT for:
- Same content in same language across multiple URLs (use canonical)
- Different products for different regions (those are different pages)

## Rules

1. **Every variant in a set MUST list every other variant**, including itself. This is the "return tag" rule. Google ignores one-way hreflang.
2. **Use BCP 47 codes**: `en`, `en-US`, `fr-CA`, `zh-Hans-CN`. Lowercase language, uppercase region. Hyphen, not underscore.
3. **x-default** is recommended — the version Google should fall back to when no other language matches the user.
4. **Place in `<head>`** of each page, OR in the XML sitemap, OR in HTTP headers (pick ONE consistently).
5. **Self-referencing tag** is mandatory — page must list itself.
6. **Canonical and hreflang interact:** each variant should be self-canonical. NEVER point canonical from `/fr/page` to `/page`.

## Output (head tags)

```html
<link rel="alternate" hreflang="en" href="https://example.com/page">
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page">
<link rel="alternate" hreflang="es-ES" href="https://example.com/es-es/page">
<link rel="alternate" hreflang="x-default" href="https://example.com/page">
```

## Validation rules (programmatic)

- Lang code matches `/^[a-z]{2,3}(-[A-Z]{2})?(-[A-Z][a-z]{3})?$/` or is `x-default`.
- URL is absolute and starts with `http`.
- Every variant lists every other variant (set symmetry).
- At most one `x-default`.
