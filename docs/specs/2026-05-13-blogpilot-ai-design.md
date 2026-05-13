# BlogPilot AI — Design Specification

**Version:** 1.0
**Date:** 2026-05-13
**Status:** Approved scope, pending spec review
**Built by:** Dice Codes ([dicecodes.com](https://dicecodes.com))
**License:** MIT (Open Source) + Managed Cloud (paid tier)
**Supersedes:** `PRD_BlogCraft_AI.md`

---

## 1. Product Summary

BlogPilot AI is an **agency-grade, multi-client, AI-powered SEO content studio**. Users add one or many client websites; the tool auto-discovers each site's identity, niche, voice, and competitors, then runs the full content pipeline: research → calendar → outline → write → optimize → schedule → publish → measure.

**Positioning vs. PRD original:** This is a strict superset of `BlogCraft AI`. Same OSS + API-key-only ethos for solo bloggers, plus a Client Hub that turns it into an agency platform.

**Distribution:** Self-hosted, MIT-licensed OSS. User runs it locally or on Vercel free tier. SQLite file holds all data. No payment integration, no accounts required, no Cloud tier in v1 — Dice Codes brand placement and "hire us" CTA fund growth.

---

## 2. Goals & Non-Goals

### Goals
- Single tool replaces Jasper + Surfer + Writesonic for solo bloggers AND small agencies.
- One-URL onboarding: paste a client site, get a content engine running in <2 minutes.
- Every post optimized for Google + AI search (ChatGPT, Perplexity, Gemini, AI Overviews) simultaneously.
- Dice Codes brand prominently surfaced as the builder, with clear "build me a custom SaaS" CTA on every screen.
- Free OSS forever; managed Cloud tier funds development.

### Non-Goals (v1.0)
- Mobile native apps (web responsive only).
- Real-time collaborative editing (single-user-at-a-time per client, with read-only share links).
- Custom ML model training (we use Claude/OpenAI/Gemini APIs only).
- Paid keyword data sources by default (free APIs first; DataForSEO is an optional plug-in).

---

## 3. Target Users

| Segment | Use case |
|---|---|
| Solo blogger | One client = themselves; uses OSS local install |
| Niche site owner | 2–10 client sites in a single dashboard |
| Small SEO agency | 10–50 client sites, with client-portal share links |
| Indie developer | Self-hosts; forks; integrates custom AI providers |
| Dice Codes leads | Sees the tool, signs up for the managed Cloud, or hires Dice Codes to build a custom variant |

---

## 4. Brand & Identity

- **Product name:** BlogPilot AI
- **Tagline:** *"Your autopilot from blank page to first-page rank."*
- **Sub-brand line:** *"Built by Dice Codes — Custom SaaS at startup prices."*
- **Primary colors:** Slate-900 base, Electric-Blue accent (`#3B82F6`), Lime success (`#84CC16`).
- **Typography:** Inter (UI), JetBrains Mono (code/exports), Lora (preview reading view).
- **Logo concept:** Stylized paper-plane forming a rising line graph; Dice Codes monogram in the corner of the app shell.

### Dice Codes placement (non-removable in Cloud, toggle-able in OSS)
- Top-bar: small "by Dice Codes" badge with link to dicecodes.com.
- Persistent right-rail card (collapsible): *"Need a custom tool like this? Talk to Dice Codes."* → opens WhatsApp (`9888404991`) or `Contact@dicecodes.com`.
- About page (dedicated): Dice Codes story, services, portfolio (Oceglow, Marby, Anahat, Bravo Pizza), free-consultation CTA.
- Footer of every exported post (toggle, defaults ON in OSS, mandatory in Cloud free plan): *"Generated with BlogPilot AI by Dice Codes."*

---

## 5. Architecture

### 5.1 Stack
| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 15 (App Router) + React 19 | SSR, file-routing, easy Vercel deploy |
| Styling | Tailwind CSS v4 + shadcn/ui + **21st.dev components** | Modern, accessible, ship-fast UI |
| State | Zustand + TanStack Query | Light, framework-agnostic |
| Backend | Next.js API routes + a long-running worker (BullMQ on Cloud, in-process on OSS) | Same code, two modes |
| Database | **SQLite (better-sqlite3)** for OSS; **PostgreSQL** for Cloud | One file locally; managed Postgres on Cloud |
| ORM | Drizzle ORM | Same schema, both DBs |
| Auth | None for OSS (single user); NextAuth (email magic links + Google) for Cloud |
| AI Providers | **All major providers** via a single adapter (see §5.4) | Multi-provider, user keys, free + paid |
| Crawler | Playwright (server) + Cheerio (light parsing) | Handles JS-rendered + static sites |
| SERP / Keywords | Free: Google Trends unofficial API, Google Autocomplete, PAA scrape, Bing SERP, DuckDuckGo. Optional paid: DataForSEO MCP. | Free defaults, pluggable |
| Web Vitals | PageSpeed Insights v5 (free, no key needed) | Real CrUX data |
| Search Console / GA4 | OAuth, optional per client | For measurement hub |
| Image gen (optional) | Gemini Imagen via nanobanana MCP, OpenAI Images | For OG/hero |
| Background jobs | In-process queue with SQLite-backed persistence | Crawl, write, rank-check — works offline |
| Deployment | Vercel free tier OR `npm run dev` OR `docker run` | Zero-cost hosting paths |

### 5.2 Multi-tenancy model
- Single-user, multi-client. All data scoped by `client_id`.
- No accounts, no auth in v1. Local-first.
- Future-proofed: schema includes nullable `workspace_id` so multi-user Cloud can be bolted on later without migration.

### 5.4 AI Provider Adapter (full list)

A single `AIProvider` interface (`chat`, `complete`, `embed`, `stream`) wraps all of these. User picks any combination, sets keys per-provider. Per-task model routing is configurable (e.g., "use cheap model for outlines, premium for final draft").

**Free / Free-tier providers (default-on):**
| Provider | Models | Free quota |
|---|---|---|
| Google Gemini | 2.5 Flash, 2.5 Pro | 1,500 req/day free |
| Groq | Llama 3.3 70B, Mixtral 8x7B, DeepSeek R1 distill | Generous free tier, very fast |
| OpenRouter | 100+ models incl. free Llama/Qwen/Mistral variants | Free models route through |
| Mistral | Mistral Small, Codestral | Free tier |
| Cohere | Command R, Command R+ | 1,000 calls/month free |
| HuggingFace Inference | Llama, Mixtral, Qwen, etc. | Free serverless |
| Together AI | Llama, Qwen, DeepSeek | $1 free credit |
| Cerebras | Llama 3.3 70B (ultra-fast) | Free tier |
| SambaNova | Llama, Qwen | Free tier |
| **Ollama (local)** | Any GGUF model (Llama, Qwen, Mistral, Phi) | Fully local, no key needed |
| **LM Studio (local)** | OpenAI-compatible local server | Fully local |

**Paid (premium quality):**
| Provider | Models |
|---|---|
| Anthropic | Claude Opus 4.7, Sonnet 4.6, Haiku 4.5 |
| OpenAI | GPT-5, GPT-4o, o-series |
| Google (paid) | Gemini 2.5 Pro paid tier |
| Azure OpenAI | Same as OpenAI |
| AWS Bedrock | Claude, Llama, Mistral via Bedrock |
| Perplexity API | Sonar (with built-in web search) |
| DeepSeek | DeepSeek V3, R1 (cheapest premium) |
| xAI | Grok-4 |

**Adapter features:**
- OpenAI-compatible endpoint mode (so most providers go through one code path).
- Per-task routing (Outline → cheap; Final draft → premium; Embeddings → free Cohere).
- Streaming everywhere.
- Auto-fallback chain (if Gemini free hits limit → fall to Groq → fall to Ollama).
- Token + cost meter per request.
- "Test connection" button per provider.

### 5.5 Methodology Library (this is what makes the AI not guess)

A versioned, file-based library of structured prompts, checklists, and frameworks. The AI is wrapped by a thin executor that **always** loads the relevant methodology before generating. Each methodology is a `.md` file with frontmatter (name, when-to-use, inputs, outputs, references) plus a step-by-step playbook the AI must follow. Stored in `lib/methodologies/`, hot-reloadable.

The library v1.0 ships with these baked-in playbooks (all derived from published, well-known SEO + writing methodologies — sources cited in each file):

**SEO methodologies:**
- `eeat-checklist.md` — Google Quality Rater Guidelines, mapped to post elements
- `helpful-content-system.md` — Google's Helpful Content guidelines, 2024-2026 refresh
- `skyscraper-technique.md` — Brian Dean / Backlinko
- `topic-cluster-model.md` — HubSpot pillar + spoke
- `serp-intent-classification.md` — Informational / Navigational / Commercial / Transactional
- `featured-snippet-targeting.md` — paragraph / list / table snippet formats
- `paa-optimization.md` — People Also Ask harvesting + answering
- `schema-org-playbook.md` — JSON-LD types + validator rules
- `internal-linking-graph.md` — orphan prevention, anchor variation, pillar density
- `keyword-clustering-by-serp.md` — SERP-overlap clustering (vs. text similarity)
- `gsc-decay-detection.md` — impressions-down / clicks-down / position-drift signals

**GEO / AI search methodologies:**
- `geo-citation-readiness.md` — passage-level structure for LLM citation
- `ai-overviews-targeting.md` — Google AI Overviews capture patterns
- `chatgpt-search-optimization.md` — what ChatGPT cites + how
- `perplexity-source-patterns.md` — Perplexity ranking signals
- `llms-txt-spec.md` — llmstxt.org spec, generator + validator

**Writing & UX methodologies:**
- `aida-pas-bab-frameworks.md` — copywriting structures for intros/CTAs
- `flesch-kincaid-targets-by-niche.md` — readability bands per vertical
- `active-voice-rewriter.md` — passive→active transformations
- `transition-words-library.md`
- `hook-formulas.md` — 7 proven blog intro hooks
- `cta-patterns-by-intent.md` — match CTA style to search intent

**Technical SEO methodologies:**
- `core-web-vitals-thresholds.md` — LCP/INP/CLS targets (2026 standards)
- `crawlability-checklist.md` — robots.txt + sitemap + canonical rules
- `hreflang-implementation.md` — multi-language tag patterns
- `image-seo-checklist.md` — alt text, WebP/AVIF, dimensions, lazy load

**Execution flow:**
```
user clicks "Generate outline"
  → executor loads: serp-intent-classification + featured-snippet-targeting
                    + paa-optimization + topic-cluster-model + skyscraper-technique
  → builds a structured prompt embedding the methodologies verbatim
  → calls AI provider with the layered prompt
  → AI returns outline guaranteed to follow the playbooks
  → SEO check engine validates output against checklists, asks AI to fix gaps
```

The library is **forkable** — users can add their own methodologies in `lib/methodologies/custom/`. Dice Codes ships periodic updates as the SEO landscape shifts.

### 5.3 Data model (high-level)

```
workspaces (Cloud only)
  └── users
       └── memberships (role: owner / editor / viewer)
clients
  ├── style_profile (JSONB)
  ├── discovery_snapshot (JSONB)
  ├── authors
  ├── keyword_research_runs
  ├── content_clusters
  ├── calendar_entries
  ├── posts
  │     ├── outlines
  │     ├── drafts
  │     ├── seo_checks
  │     ├── schema_blocks
  │     ├── social_repurposes
  │     └── exports
  ├── internal_link_graph
  ├── publish_schedule
  ├── rank_tracking_runs
  ├── gsc_connections
  ├── ga4_connections
  └── share_links (read-only client portal)
ai_keys (encrypted at rest, per-workspace in Cloud, in .env for OSS)
usage_events (token + cost tracking)
```

---

## 6. The Six Hubs (Modules)

### A. Client Hub
1. **Add Client** — paste one URL → 1-click auto-discover.
2. **Auto-Discovery Crawler** (60–90s) pulls:
   - Identity: brand name, logo, favicon, colors, language, country, contact info, social profiles
   - Tech stack detection (WordPress / Shopify / Ghost / Webflow / custom)
   - Sitemap.xml + robots.txt parse
   - Top 50 posts: titles, headings, dates, word counts, tone signals
   - Internal link graph
   - Existing schema markup
   - Core Web Vitals (PageSpeed Insights)
   - Indexed page count estimate
   - Detected competitors (from outbound links + niche SERPs)
3. **Client Dashboard** — one per client, fully isolated.
4. **Client Switcher** — top-bar dropdown.
5. **Client Portal Share Link** — read-only signed URL; client approves outlines/drafts without an account.
6. **Style Profile editor** — user can override any auto-detected setting.

### B. Strategy Hub
7. **Keyword Research** — Google Trends + Autocomplete + PAA + Bing/DDG SERP.
8. **Content Gap Analyzer** — scrape top 10 Google results for a keyword vs. client's existing coverage.
9. **Competitor Blog Scanner** — map competitor's clusters; suggest steal-able topics.
10. **Topic Cluster Designer** — pillar + spokes; SERP-overlap clustering.
11. **Content Calendar Generator** — 10/20/30/60/90 days; intent + cluster + difficulty per title.
12. **Posting Schedule Recommender** — niche-aware best day + time, time-zone localized.
13. **"What to write next" Recommender** — priority queue (quick wins first, pillars later).

### C. Writing Hub
14. **Outline Generator** with explicit approval gate.
15. **Brand Voice Trainer** — paste 3–5 best posts → richer voice profile than crawler-only.
16. **Full Post Writer** — style-matched, EEAT-loaded.
17. **FAQ + PAA Generator** — pulled from live SERP.
18. **Meta Title/Description Generator** — character-counted live.
19. **Schema Markup Generator** — Article / FAQ / HowTo / Breadcrumb / Person / Product.
20. **Internal Linking Assistant** — runs against entire client post graph.
21. **Image Brief + Alt Text Generator** + optional OG/hero image gen.
22. **Readability Scorer** — Flesch-Kincaid, passive voice %, sentence-length distribution.
23. **Duplicate Content Checker** — local similarity vs. all prior posts in the client.
24. **Existing Post Refresher** — paste old URL → updated post + schema.

### D. Distribution Hub
25. **Social Repurposer** — X thread, LinkedIn post, Instagram, Pinterest, WhatsApp/Telegram.
26. **Newsletter Excerpt Generator** — short and long variants.
27. **Publishing Scheduler** — kanban + calendar; best-time suggestions integrated.
28. **CMS Export** — Markdown, HTML, WordPress XML, Ghost API, Webflow CSV, Jekyll/Hugo/Astro front-matter.

### E. Measurement Hub (opt-in per client)
29. **Google Search Console connector** — per-post impressions / clicks / position.
30. **GA4 connector** — organic sessions per post.
31. **Rank Tracker** — free SERP scraping (throttled, rotating UA).
32. **Content Decay Monitor** — flags posts losing traffic; auto-queues refresher tasks.

### F. Platform & Settings
33. **API Key Manager** — Claude / OpenAI / Gemini / DeepSeek; cost-per-post estimator.
34. **Authors & E-E-A-T Profiles** — Person schema, sameAs links, bios.
35. **Hreflang / Multi-language Manager**.
36. **Team & Roles** (Cloud) — Owner / Editor / Client-Viewer.
37. **Usage & Cost Tracker** — token + dollar burn per client per month.
38. **About / Built-by-Dice-Codes** page with services + portfolio + CTA.

---

## 7. End-to-End User Journey

```
[ONBOARDING]
  Workspace created → Add first client (paste URL)
    → Auto-discover (60–90s) → Style profile + competitors + Web Vitals ready

[STRATEGY]
  Run Keyword Research → Pick seed keywords
    → Content Gap + Cluster Designer → Generate Calendar (30 posts)
      → Posting Schedule Recommender lays calendar on best days/times

[WRITE — per post]
  Outline → User approves → Full draft (style-matched)
    → SEO check (meta, schema, internal links, alt text, readability)
      → Optional image gen → User reviews → Marked "Ready"

[DISTRIBUTE]
  Export to CMS → Auto-generate social repurposes → Newsletter excerpt
    → Schedule publish date

[MEASURE]
  GSC + GA4 + Rank tracker run weekly
    → Decay monitor flags posts → Auto-queue Refresher task

[REPEAT]
  Recommender suggests next 5 posts based on what's working
```

---

## 8. SEO Engine (consolidated from PRD §7.3 + new additions)

Every generated post is checked against:

**Core on-page**
- Primary keyword in H1 (front-loaded), first 100 words, URL slug, meta title, meta description
- LSI / NLP-related keyword coverage (extracted from top-10 SERP)
- Heading hierarchy matches client style profile
- Image alt text + lazy-loading hints + WebP/AVIF format hints

**Content depth & E-E-A-T**
- Word-count target derived from top-10 average × niche multiplier
- Author bio with Person schema + sameAs
- Citation placeholders `[CITE: claim]` for user to fill
- First-person experience signals where client style uses them

**Topic clusters & internal links**
- Every post linked to ≥1 sibling and ≥1 pillar
- Orphan detection
- Anchor-text variation guard (avoid exact-match over-use)

**Structured data**
- Auto JSON-LD: Article, FAQ, HowTo, Breadcrumb, Person, Product
- Schema validator runs before "Ready"

**Zero-click + GEO (AI search)**
- TL;DR at top
- Direct-answer paragraphs sized for featured snippet (40–55 words)
- FAQ block for PAA
- Numbered/tabled data for AI citation
- llms.txt generator for the client site (optional export)

**Readability**
- Flesch-Kincaid target band (configurable 6/8/10/12)
- Passive voice %, average sentence length
- Active voice nudge, transition-word check

**Technical hints (exported as a checklist with each post)**
- Canonical URL recommendation
- Hreflang block if multi-language
- OG + Twitter Card meta
- Estimated read time

---

## 9. Client Portal (Share Link) Design

- Signed URL: `/p/<client>/share/<token>` — no auth required.
- Read-only by default; optional "Approve / Request changes" buttons.
- Branded with client's logo and BlogPilot/Dice Codes footer.
- Token revocable, expires in N days (configurable, default 30).

---

## 10. Pricing & Monetization

**Free forever, no payment integration in v1.** OSS, MIT-licensed. Monetization happens off-platform:

- Dice Codes brand placement → lead-gen for custom SaaS builds (the real revenue stream)
- GitHub Sponsors (passive)
- Paid Dice Codes services pitched in About + right-rail card

No Stripe, no Paddle, no billing code, no subscription state, no tiered features. Every user gets everything. (A future managed Cloud may add payments later, but that's out of scope for v1.)

---

## 11. Dice Codes Lead Generation (built into the product)

- Every page: small "Built by Dice Codes" badge.
- Right-rail collapsible card: *"Want a custom SaaS like this for your industry? Free consult with Dice Codes →"* (WhatsApp + email).
- About page is a dedicated landing for Dice Codes services + portfolio.
- Onboarding empty-state shows: *"Don't have a website to add? Dice Codes builds them too — free consult, startup-friendly pricing."*
- Every exported post carries an opt-out footer credit.
- Server-side `/api/lead` endpoint captures interest clicks → forwards to Dice Codes inbox + WhatsApp Business webhook.

---

## 12. MVP Sequencing

User requested "build all features." We'll still ship in waves to keep each release shippable, but **the spec covers all 38 modules**. The implementation plan (next step) will sequence them:

- **Wave 1 (foundation):** App shell, Auth (Cloud) or single-user (OSS), DB schema, API key manager, Add-Client + Auto-Discover, Client Dashboard, About/Dice Codes pages.
- **Wave 2 (write loop):** Keyword Research, Calendar Generator, Outline, Post Writer, SEO Engine, Schema, FAQ, Meta, Readability, Markdown/HTML export.
- **Wave 3 (strategy depth):** Gap Analyzer, Competitor Scanner, Cluster Designer, Brand Voice Trainer, Internal Linking, Image Brief, Refresher, Duplicate Checker.
- **Wave 4 (distribution):** Social Repurposer, Newsletter, Publishing Scheduler, all CMS exports, Client Portal share link.
- **Wave 5 (measurement):** GSC, GA4, Rank Tracker, Decay Monitor, "What-to-write-next" Recommender.
- **Wave 6 (Cloud + polish):** Workspaces, teams, billing (Stripe), white-label, llms.txt, hreflang manager, multi-language.

---

## 13. Success Metrics (12 months post-launch)

| Metric | Target |
|---|---|
| GitHub Stars | 5,000+ |
| OSS self-hosted installs | 2,000+ |
| Cloud paying customers | 300+ |
| Posts generated platform-wide | 200,000+ |
| Dice Codes leads attributed to BlogPilot | 100+ |
| Closed Dice Codes service deals from leads | 20+ |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Free SERP scraping gets blocked | Rotating UA, Bing+DDG fallback, optional DataForSEO plug-in |
| API costs surprise users | Pre-flight cost estimator before every long run; hard cap per client per month |
| Client data leak via share links | Signed, scoped, revocable, expiring tokens; rate-limited |
| AI hallucinated stats | Mandatory `[CITE: ...]` placeholders; never auto-fill numbers |
| Multi-client schema drift between SQLite and Postgres | Single Drizzle schema, CI runs both backends |
| Dice Codes branding feels spammy | Collapsible, dismissible per session; about page is opt-in click |
| Node version chaos on user machines | See §15. Runtime guard, doctor command, cross-version CI matrix |
| AI provider hallucinates SEO "facts" | Methodology Library (§5.5) forces structured, sourced playbooks |
| Free AI tier hits rate limits mid-run | Auto-fail-over chain Gemini → Groq → Ollama → wait-and-retry |

---

## 15. Compatibility & Robustness (CRITICAL — non-negotiable)

The tool must work on **any user machine**, regardless of what's installed. The user should not have to upgrade Node, install Python, install Docker, or troubleshoot dependencies.

### 15.1 Node.js version policy
- **Minimum:** Node 18 LTS (released April 2022). Anything older logs a friendly upgrade message and exits.
- **Tested on:** Node 18, 20, 22, 24 — CI runs all four.
- **Detected at install:** `package.json` declares `"engines": { "node": ">=18" }` AND a runtime guard in `bin/blogpilot.js` checks `process.versions.node` and prints a clear upgrade link if too old. We do **not** rely solely on `engines` (npm only warns by default).
- **No Node-version-specific syntax** that older 18.x can't parse (e.g., no `using` declarations, no top-level await without ESM guard).

### 15.2 Package manager agnostic
- Works with npm, pnpm, yarn, bun.
- README documents all four commands.
- No pnpm-only or yarn-only features (e.g., no `workspace:*` protocol if pnpm-only).
- Lockfile committed for npm (`package-lock.json`) — most universal.

### 15.3 OS coverage
- **Windows, macOS, Linux** all first-class.
- All file paths use Node's `path.join` / `path.resolve` — never hardcoded `/` or `\`.
- Shell scripts forbidden in npm scripts — use `cross-env`, `rimraf`, `mkdirp` for cross-platform.
- Playwright bundles its own browsers; no system Chrome required.
- SQLite via `better-sqlite3` ships prebuilt binaries for Win/macOS/Linux × x64/arm64.

### 15.4 Zero non-Node runtime dependencies
- No Python required.
- No Docker required (Docker is optional convenience).
- No Redis required (use SQLite-backed queue).
- No system libraries (avoid `node-canvas` etc.; use pure-JS alternatives like `sharp` which has prebuilt binaries).

### 15.5 Dependency conservatism
- Pin all dependencies to **caret ranges of stable majors** (no `*`, no `latest`).
- Renovate config to auto-bump weekly with CI gating.
- Avoid bleeding-edge packages with < 1 year history.
- Prefer packages with > 100k weekly downloads when alternatives exist.
- All AI SDK calls go through our adapter, NOT direct SDK use, so a breaking SDK release only touches one file.

### 15.6 Graceful degradation
- Playwright not installed (e.g., user blocked the browser download)? → fall back to Cheerio static fetch and warn.
- SQLite native binding fails to load? → fall back to `sql.js` (pure-WASM SQLite).
- AI provider down? → auto-fail-over chain (§5.4).
- No internet for SERP scrape? → skip and continue, mark post as "needs SERP enrichment".
- User on corporate proxy? → respect `HTTP_PROXY` / `HTTPS_PROXY` env vars everywhere.

### 15.7 Browser support (frontend)
- Last 2 versions of Chrome, Firefox, Safari, Edge.
- No browser-only APIs without polyfills.
- Mobile browsers (iOS Safari, Chrome Android) — fully responsive.

### 15.8 First-run experience
- `npx blogpilot-ai` (no install) — runs the latest release.
- `git clone && npm install && npm run dev` — works offline after deps cached.
- A doctor command: `npx blogpilot-ai doctor` — checks Node version, free disk, write perms, optional Playwright, and prints a green/red report.

### 15.9 Errors are friendly, not stack traces
- Every error caught at the boundary is mapped to a `KnownError` with: title, what happened, why, fix-it steps.
- Stack traces only behind `--verbose` flag.

---

## 16. Resolved Questions (previously open)

1. ~~Cloud billing~~ → **No payments in v1.** Confirmed.
2. License → **MIT** (maximally adoption-friendly; we monetize via Dice Codes services, not gatekeeping).
3. Default AI model → **Google Gemini 2.5 Flash** for free-tier users (best free quality/quota); **Claude Haiku 4.5** if user adds Anthropic key (best price/perf premium); **Claude Opus 4.7** auto-suggested for final-draft step on long-form pillar posts.
4. Client portal → **Approve / reject + threaded comments**. Comments stored locally, no auth.
5. WhatsApp `9888404991` → assumed OK (matches the public number on dicecodes.com). User can disable in settings.

---

*BlogPilot AI — Your autopilot from blank page to first-page rank. Built by Dice Codes.*
