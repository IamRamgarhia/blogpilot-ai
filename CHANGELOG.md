# Changelog

All notable changes to BlogPilot AI. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-05-13

The first stable release. **39 modules · 45 methodologies · 158 tests · MIT licensed · built by [Dice Codes](https://dicecodes.com).**

### Added — Discover
- Auto-discovery crawler (Playwright + Cheerio fallback) — pulls identity, sitemap, Core Web Vitals, social profiles in under 60 seconds
- Brand voice trainer — extracts tone, voice, sentence length, heading case, em-dash use, contractions from 3-5 sample posts

### Added — Research
- Keyword research using Google Autocomplete + Bing SERP + People Also Ask (no API keys)
- Content gap analyzer — scrapes competitor headings to find missing topics
- Competitor blog scanner — maps competitor's content clusters from their sitemap
- **PAA Tree explorer** — recursive People-Also-Ask scrape, 3 levels deep

### Added — Plan
- Content calendar generator with pillar + spoke cluster structure
- Niche-aware publishing scheduler (best day + time per industry)
- "What to write next" recommender (rank data + decay + gaps + cluster coverage)

### Added — Write
- Methodology-driven post writer matching client brand voice
- Outline generator with explicit approval gate
- Meta title + description (character-counted, intent-matched CTA)
- Schema JSON-LD auto-generation (Article, FAQ, HowTo, BreadcrumbList, Person, Organization, Product)
- Internal linking assistant — Jaccard + cluster + pillar scoring
- Image briefs — alt text, AI generation prompts, stock search terms
- Readability scoring (Flesch-Kincaid, passive voice, paragraph length)
- Duplicate content checker (4-gram shingle Jaccard)
- Existing-post refresher — fetches URL, AI rewrites with 2026 freshness

### Added — Score (the Surfer-killer)
- **Real-time content score editor** — TF-IDF grading against top-10 SERP terms, debounced 800ms
- 0-100 weighted score with A-F grade card
- Required + recommended term coverage chips
- Over-optimization warnings
- **Topic authority scorer** — Wikipedia-anchored niche entity coverage
- **SERP feature detector** — 9 features (snippet, PAA, shopping, map pack, video, image, knowledge panel, news, X)

### Added — Distribute
- Social repurposer — X thread / LinkedIn / Instagram / Pinterest / WhatsApp
- Newsletter excerpts (short 240-char + long 200-word)
- CMS exports: Markdown, HTML, JSON, WordPress XML, Ghost JSON, Webflow CSV, Hugo TOML
- Client portal share links (signed, expiring, no-auth public URL)

### Added — Measure
- Rank tracker (free Bing + DuckDuckGo SERP scraping, throttled)
- GSC + GA4 CSV import (no OAuth required)
- Content decay monitor (4-week trailing vs prior 4-week comparison)
- Hreflang manager with 31 BCP 47 language presets + return-tag validation
- llms.txt + llms-full.txt generator (spec-compliant for AI search crawlers)

### Added — Technical SEO
- **Recursive crawler** with 28 audit rules across crawlability, on-page, content, images, schema, security headers
- Cannibalization detector (exact keyword + similar title signals)
- Severity-graded findings (critical / high / medium / low) with concrete fix suggestions
- CSV export with formula-injection guard

### Added — AI providers (12+)
- Free / free-tier: Google Gemini, Groq, OpenRouter, Mistral, Cerebras, Together AI, Ollama (local), LM Studio (local)
- Paid premium: Anthropic Claude, OpenAI, DeepSeek, Perplexity, xAI Grok, Azure OpenAI, AWS Bedrock
- Auto-failover chain across configured providers

### Added — Methodology Library (45 playbooks)
Every AI generation loads structured methodologies before calling the LLM. The AI follows proven SEO patterns instead of guessing.

Top-priority methodologies:
- `content-formatting-google-likes` — 12-section playbook of patterns Google rewards
- `google-helpful-content` — 22-item compliance checklist mirroring Google's official doc
- `ai-overviews-capture` — 6 cited-passage patterns across Google AI Overviews / ChatGPT / Perplexity
- `passage-ranking-optimization` — make every H2/H3 standalone-citable
- `serp-features-targeting` — per-feature capture strategy
- `content-cannibalization-resolution` — 301-merge vs differentiate decision tree
- `eeat-author-bios` — bio templates Quality Raters accept
- `core-web-vitals-thresholds` — 2026 LCP/INP/CLS targets + ranked fixes

### Security
- SSRF guard on every user-URL ingress point (crawler, refresher, rank tracker, competitor scanner)
- CSV formula-injection neutralization (OWASP guidance)
- Share-link tokens: 190 bits of entropy, base64url, revocable, time-limited
- Drizzle parameterized queries throughout — no SQL injection surface

### Cross-platform
- Node 18, 20, 22, 24 supported on Windows, macOS, Linux
- `@libsql/client` (napi-rs prebuilds for every platform) — no native compilation
- No Python, no Docker, no Redis, no Visual Studio Build Tools required
- `npm run doctor` health check
- `npm run setup` idempotent post-install bootstrap
- `npm run clean` wipes all generated state

### Tests
- 158 unit tests across 27 files
- 3 Playwright end-to-end tests
- CI matrix: Node 18/20/22/24 × Ubuntu/macOS/Windows = 12 cells

---

[1.0.0]: https://github.com/IamRamgarhia/blogpilot-ai/releases/tag/v1.0.0
