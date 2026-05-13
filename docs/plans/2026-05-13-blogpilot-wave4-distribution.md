# BlogPilot AI — Wave 4 (Distribution) Implementation Plan

**Goal:** Ship distribution layer — repurpose every post into social posts, newsletter excerpts, publish-scheduler with best-time recommendations, CMS exports (WordPress XML / Ghost API / Webflow CSV / Hugo / Jekyll / Astro), and Client Portal share links for client approval.

**Architecture:** All built on Wave 1+2+3 primitives. Methodology-driven AI for repurposing (graceful rule-based fallbacks). Schema changes: add `share_links` table + `publishDate` column on `posts`.

## Modules

1. **Social Repurposer** — X thread (5-8 tweets), LinkedIn post, Instagram caption + hashtags, Pinterest description, WhatsApp/Telegram broadcast.
2. **Newsletter Excerpt** — short (Twitter-length intro) + long (200-word) variants.
3. **Publishing Scheduler** — assigns each post a `publishDate` based on niche + day-of-week best practices, calendar view.
4. **CMS Exports** — additional formats beyond Markdown:
   - WordPress WXR (XML) bulk export
   - Ghost JSON API import format
   - Webflow CSV
   - Hugo (TOML front-matter)
   - Jekyll/Astro (YAML front-matter — already supported by Wave 2 markdown export, adding explicit endpoint)
5. **Client Portal Share Link** — generate signed token; `/p/<token>` shows a read-only client view of the calendar + drafts for client approval.

## Files

- methodologies/{social-repurposing, newsletter-excerpt, posting-schedule, cms-export-mapping}.md
- src/lib/seo/{social, newsletter, schedule}.ts
- src/lib/exports/{wordpress-xml, ghost, webflow-csv, hugo, common}.ts
- src/lib/portal.ts
- src/lib/db/schema.ts (extend with `share_links`, add `publishDate` to `posts`)
- src/app/api/{social/[postId], newsletter/[postId], schedule, export-cms/[postId], share/create, share/[token]}/route.ts
- src/app/clients/[id]/schedule/page.tsx
- src/app/clients/[id]/posts/[postId]/distribute/page.tsx
- src/app/p/[token]/page.tsx (public portal view)
- tests/{social.test.ts, schedule.test.ts, wordpress-xml.test.ts, portal.test.ts}

## Acceptance

- Each drafted post has a "Distribute" panel: social, newsletter, schedule date, CMS export buttons.
- Scheduler shows calendar with auto-assigned dates and lets user reorder.
- Share link works in incognito (no auth, time-limited token).
- WordPress XML imports cleanly into a fresh WP install (deterministic, no AI).
- Tests + typecheck clean.
