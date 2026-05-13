---
id: content-refresh-rules
title: Content Refresh Rules
when: Updating an existing published post for freshness
inputs: original post Markdown or HTML, current year, client style profile
outputs: refreshed Markdown + change-log
source: Search Engine Journal "Content Decay" + Ahrefs Content Update study
---

# Content Refresh Rules

A refresh keeps the existing URL but materially improves the post. Goals:

1. **Freshness signals** — update all year references to current year. Replace outdated statistics with current data placeholders `[CITE: current stat]`.
2. **Re-rank the SERP** — re-classify intent (it may have shifted since original publish). If shifted, restructure.
3. **Add missing sections** — apply content-gap-analysis against current top-10.
4. **Improve E-E-A-T** — add author bio block if missing; add citation placeholders for unsourced claims.
5. **Tighten readability** — break long paragraphs, replace passive voice, simplify sentences if FK grade > niche target.
6. **Refresh meta** — regenerate metaTitle and metaDescription if intent shifted or year reference is stale.
7. **Refresh schema** — regenerate JSON-LD; update `dateModified` to today; keep `datePublished` unchanged.
8. **Preserve canonical URL** — never change the slug.
9. **Track changes** — return a change log of what was modified and why.

## Output JSON

```json
{
  "refreshed_markdown": "...",
  "meta_title": "...",
  "meta_description": "...",
  "schema_jsonld": "...",
  "change_log": [
    { "type": "year_update | intent_shift | section_added | passive_voice | eeat | meta", "detail": "..." }
  ]
}
```
