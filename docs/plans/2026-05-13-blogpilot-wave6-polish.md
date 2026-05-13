# BlogPilot AI — Wave 6 (Polish) Implementation Plan

**Goal:** Ship the final polish layer — hreflang manager, llms.txt generator (the AI-search index file), explicit multi-language support, and a full Playwright e2e suite.

## Modules

1. **Hreflang Manager** — generate/validate hreflang link tags for multi-language sites.
2. **llms.txt Generator** — per-client llms.txt + llms-full.txt per the llmstxt.org spec.
3. **Multi-language Support** — language picker per post, post writer prompt switches language explicitly, language code validation.
4. **Playwright E2E** — clicks through Add Client → Research → Calendar → Outline → Draft → Distribute → Measure.

## Files

- methodologies/{hreflang-implementation, llms-txt-spec, multi-language-writing}.md
- src/lib/seo/{hreflang, llms-txt}.ts
- src/lib/i18n/languages.ts
- src/app/api/{hreflang/[clientId], llms-txt/[clientId]}/route.ts
- src/app/clients/[id]/hreflang/page.tsx
- playwright.config.ts
- tests/e2e/full-flow.spec.ts
- tests/{hreflang.test.ts, llms-txt.test.ts}

## Acceptance

- Hreflang generator produces valid `<link rel="alternate" hreflang="..."` tags for a multi-language site.
- llms.txt endpoint returns plain-text spec-compliant file when fetched by AI crawlers.
- Multi-language post writer respects language code.
- Playwright e2e completes the full pipeline against the local dev server.
- All 82 prior tests still pass; new tests added.
