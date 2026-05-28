<div align="center">

<img src="public/blogpilot-logo.svg" alt="BlogPilot AI logo" width="80" />

# BlogPilot AI — Open-Source AI SEO Content Studio

### Free, self-hostable AI tool for SEO content writing, keyword research, technical site audits, and AI Overview optimization. Replaces Surfer SEO, Ahrefs, Clearscope, Screaming Frog, AlsoAsked, and MarketMuse — all with one AI API key.

[![License: MIT](https://img.shields.io/badge/license-MIT-3B82F6.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A518.17-3B82F6.svg)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-158%2F158%20passing-84CC16.svg)](#tests)
[![Methodologies](https://img.shields.io/badge/methodologies-45-84CC16.svg)](src/lib/methodologies)
[![Modules](https://img.shields.io/badge/modules-39-84CC16.svg)](#7-hubs--39-modules)
[![Stars](https://img.shields.io/github/stars/IamRamgarhia/blogpilot-ai?style=flat&color=84CC16)](https://github.com/IamRamgarhia/blogpilot-ai/stargazers)
[![Built by Dice Codes](https://img.shields.io/badge/built%20by-Dice%20Codes-84CC16.svg)](https://dicecodes.com)

[Quick start](#-quick-start) · [Features](#-features) · [What it replaces](#-what-it-replaces) · [Methodology Library](#-methodology-library) · [FAQ](#-faq) · [Deploy](DEPLOY.md)

</div>

---

## Why BlogPilot AI

**Premium SEO tools cost $400+/month and lock content in their cloud.** Surfer SEO ($89), Ahrefs ($129), Clearscope ($170), MarketMuse ($149), Screaming Frog ($21), AlsoAsked ($15) — each owns one part of the workflow. None talk to each other.

**BlogPilot AI is free, open-source, and self-hostable.** Bring your own AI key — free Google Gemini works (1,500 requests/day). Run it on your laptop, on a free Vercel tier, or in Docker. All client data stays in a single SQLite file you own.

Built for solo bloggers, niche-site owners, SEO agencies, marketing teams, and indie developers managing 1-50 client sites at agency-grade output without subscription fees.

**Keywords**: open source SEO tool · AI content writer · SEO content studio · Surfer SEO alternative · Clearscope alternative · MarketMuse alternative · Screaming Frog alternative · AlsoAsked alternative · self-hosted SEO · Next.js SEO app · AI Overviews optimization · GEO (generative engine optimization) · llms.txt generator · technical SEO audit · content cannibalization · topic authority scoring · TF-IDF content scoring · Google E-E-A-T compliance · keyword research without API · free SEO software

---

## 🏆 What it replaces

| Premium tool | Monthly price | Replaced by |
|---|---:|---|
| Surfer SEO | $89 | ✅ Real-time content score editor (TF-IDF vs top-10 SERP) |
| Clearscope | $170 | ✅ Grade A-F term coverage scoring |
| Ahrefs Site Audit | $129 | ✅ Technical SEO crawler (28 audit rules) |
| Screaming Frog | $21 | ✅ Recursive crawler + audit findings + CSV export |
| MarketMuse | $149 | ✅ Topic authority scorer (Wikipedia entity coverage) |
| AlsoAsked | $15 | ✅ PAA tree explorer (3 levels deep) |
| Frase | $45 | ✅ SERP-grounded outline + writer |
| Jasper | $59 | ✅ AI writer with brand voice trainer |
| Writesonic | $20 | ✅ AI content + social repurposer |
| SEMrush SERP features | (part of $139) | ✅ 9-feature detector |
| Yoast Premium | $99/yr | ✅ Schema generation + meta + readability |
| Pretty Links Pro | $99/yr | ⏳ (sibling app on roadmap) |
| **Total saved** | **$700+/month** | **Free, open-source, MIT-licensed** |

---

## ✨ Features

### Discover
- **One-URL auto-discovery** — paste any URL, BlogPilot crawls identity, sitemap, Core Web Vitals, social profiles in 30-60 seconds
- **Brand voice trainer** — paste 3-5 sample posts, AI extracts tone, voice, sentence length, heading case, em-dash use

### Research
- **Free keyword research** — Google Autocomplete + People-Also-Ask + Bing SERP top-10
- **Content gap analyzer** — scrape competitor headings, return missing topics
- **Competitor blog scanner** — map competitor clusters from their sitemap
- **PAA tree explorer** — recursive 3-level People-Also-Ask scraping

### Plan
- **Content calendar generator** — pillar + spoke clusters, intent-classified
- **Posting scheduler** — niche-aware best day + time recommendations
- **"What to write next" recommender** — rank data + decay + gaps + cluster coverage

### Write
- **Methodology-driven post writer** — every generation loads structured SEO playbooks (E-E-A-T, Skyscraper, featured snippet, PAA, GEO) before the AI call
- **Outline approval gate** — review structure before AI writes 2,000 words
- **Auto meta + schema JSON-LD** — Article, FAQ, HowTo, Breadcrumb, Person, Organization, Product
- **Internal linking assistant** — Jaccard + cluster + pillar scoring across all client posts
- **Image briefs** — alt text, AI generation prompts, stock search terms
- **Readability dashboard** — Flesch-Kincaid, passive voice, paragraph length
- **Existing post refresher** — paste a URL, AI rewrites with 2026 freshness

### Score (the Surfer / Clearscope killer)
- **Real-time content score editor** — TF-IDF grading against top-10 SERP terms, debounced 800ms keystroke updates
- **0-100 grade with A-F card** — gradient progress bars per category
- **Term coverage chips** — required vs recommended terms, over-optimization warnings
- **Topic authority scorer** — Wikipedia-anchored niche entity coverage
- **SERP feature detector** — featured snippet, PAA, shopping, map pack, video, image, knowledge panel, news, X

### Distribute
- **Social repurposer** — native variants for X / LinkedIn / Instagram / Pinterest / WhatsApp
- **Newsletter excerpts** — short (240 char) + long (200 word)
- **CMS exports** — Markdown, HTML, JSON, WordPress XML, Ghost JSON, Webflow CSV, Hugo TOML
- **Client portal share links** — signed, expiring, no-auth public URLs

### Measure
- **Rank tracker** — free SERP scraping (Bing + DuckDuckGo fallback), throttled, rotating UA
- **GSC + GA4 CSV import** — paste CSV, no OAuth required
- **Content decay monitor** — 4-week trailing avg vs prior 4-week, severity-graded alerts
- **Hreflang manager** — 31 BCP 47 language presets + return-tag symmetry validation
- **llms.txt generator** — spec-compliant `llms.txt` + `llms-full.txt` for AI search crawlers

### Technical SEO audit (Screaming Frog killer)
- **Recursive crawler** with 28 deterministic audit rules
- Categories: crawlability · on-page · content · images · schema · security headers
- Severity-graded findings (critical / high / medium / low) with concrete fix suggestions
- **Cannibalization detector** — exact keyword + similar title signals
- CSV export with formula-injection guard

---

## 🤖 12+ AI providers, auto-failover

Configure any subset. **Free tier is enough for most users.**

| Provider | Type | Get key |
|---|---|---|
| Google Gemini | Free 1,500/day | https://aistudio.google.com/app/apikey |
| Groq | Free, very fast | https://console.groq.com/keys |
| OpenRouter | Free + paid models | https://openrouter.ai/keys |
| Mistral | Free tier | https://console.mistral.ai/ |
| Cerebras | Free, ultra-fast | https://cloud.cerebras.ai/ |
| Together AI | $1 free credit | https://api.together.xyz/ |
| Anthropic Claude | Paid premium | https://console.anthropic.com/ |
| OpenAI GPT-4o/5 | Paid | https://platform.openai.com/api-keys |
| DeepSeek | Cheap premium | https://platform.deepseek.com/ |
| Perplexity | Built-in web search | https://www.perplexity.ai/settings/api |
| Ollama | Fully local, no key | https://ollama.com/download |
| LM Studio | Fully local, no key | https://lmstudio.ai/ |

---

## 📚 Methodology Library

**45 versioned playbook files** at [`src/lib/methodologies/`](src/lib/methodologies/). Every AI generation loads the relevant methodology files first — the AI follows proven SEO patterns instead of guessing.

Highlight methodologies:

| File | What it codifies |
|---|---|
| [content-formatting-google-likes.md](src/lib/methodologies/content-formatting-google-likes.md) | 12-section playbook of formatting patterns Google rewards |
| [google-helpful-content.md](src/lib/methodologies/google-helpful-content.md) | 22-item Helpful Content System compliance checklist |
| [ai-overviews-capture.md](src/lib/methodologies/ai-overviews-capture.md) | 6 cited-passage patterns for Google AI Overviews, ChatGPT, Perplexity |
| [passage-ranking-optimization.md](src/lib/methodologies/passage-ranking-optimization.md) | Standalone-citable H2/H3 passages |
| [eeat-author-bios.md](src/lib/methodologies/eeat-author-bios.md) | E-E-A-T bio templates Quality Raters accept |
| [serp-features-targeting.md](src/lib/methodologies/serp-features-targeting.md) | Per-feature capture strategy (9 SERP feature types) |
| [content-cannibalization-resolution.md](src/lib/methodologies/content-cannibalization-resolution.md) | 301-merge vs differentiate decision tree |
| [core-web-vitals-thresholds.md](src/lib/methodologies/core-web-vitals-thresholds.md) | 2026 LCP/INP/CLS targets with ranked fixes |
| [skyscraper-technique.md](src/lib/methodologies/skyscraper-technique.md) | Brian Dean's content depth methodology |
| [topic-cluster-model.md](src/lib/methodologies/topic-cluster-model.md) | HubSpot pillar + spoke structure |

Plus 35 more covering schema (Article, FAQ, HowTo, Product, Organization, Person), readability, internal linking, image briefs, social repurposing, newsletter excerpts, CMS exports, rank tracking, GSC decay, hreflang, llms.txt, and more.

**Fork the playbooks, edit them, add your own.**

---

## 🚀 Quick start

### One-command install

**macOS / Linux**
```bash
git clone https://github.com/IamRamgarhia/blogpilot-ai
cd blogpilot-ai
./install.sh
./start.sh
```

**Windows (PowerShell)**
```powershell
git clone https://github.com/IamRamgarhia/blogpilot-ai
cd blogpilot-ai
.\install.ps1
.\start.ps1
```

Open http://localhost:3000.

### Manual install

```bash
npm install
npm run setup       # creates ./data/, copies .env.example -> .env, generates migrations
npm run dev         # http://localhost:3000
```

### Useful commands

```bash
npm run dev         # start dev server
npm run stop        # kill the server (cross-platform)
npm run clean       # wipe .next, data/, tsbuildinfo, test artifacts
npm run doctor      # health check (Node, libsql, Playwright, write perms)
npm test            # 158 unit tests
npm run typecheck   # TypeScript validation
```

All user data lives in `./data/blogpilot.db`. Nothing is created outside the project directory.

---

## 🔧 Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui-inspired components |
| Database | `@libsql/client` SQLite (prebuilt napi-rs binaries for every platform) |
| ORM | Drizzle ORM with full type safety |
| Crawler | Playwright + Cheerio static fallback |
| Tests | Vitest (unit) + Playwright (e2e) |
| Deployment | Vercel free tier · Docker · or `npm run dev` locally |

---

## 🌍 Cross-platform support

Tested on:

| OS | Node 18 | Node 20 | Node 22 | Node 24 |
|---|---|---|---|---|
| Ubuntu | ✅ | ✅ | ✅ | ✅ |
| macOS | ✅ | ✅ | ✅ | ✅ |
| Windows | ✅ | ✅ | ✅ | ✅ |

No Python, no Docker, no Redis, no Visual Studio Build Tools required. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the matrix.

---

## ❓ FAQ

### Is BlogPilot AI really free?
Yes. MIT licensed. No subscriptions, no usage limits we impose, no telemetry. The only thing you pay for is your AI provider — and Google Gemini's free tier (1,500 requests/day) is enough for most users.

### Do I need any API keys besides AI?
No. Bing SERP, Google Autocomplete, PageSpeed Insights v5, Wikipedia, OpenStreetMap — all used without keys. Free public endpoints only. **An AI key is the single thing you configure.**

### Does it work without an AI key at all?
Most features yes. Every generator has a deterministic rule-based fallback. Content scoring, technical audits, hreflang, schema, llms.txt, internal linking, rank tracking — all pure local code.

### How does this compare to Surfer SEO?
Same real-time content score against top-10 SERP. Same term-coverage chips. Same A-F grading. Built with pure TypeScript TF-IDF — no Surfer subscription, runs on your machine.

### How does this compare to Ahrefs Site Audit?
Same technical crawler. 28 audit rules across crawlability, on-page, content, images, schema, security headers. Severity-graded findings with concrete fix suggestions. Plus cannibalization detector Ahrefs charges extra for.

### Does it work for non-English content?
Yes. The crawler detects the site's language automatically. The post writer respects the detected language. 31 BCP 47 language presets in the hreflang manager. `multi-language-writing` methodology covers locale-specific punctuation and number formatting.

### Can I use this commercially?
MIT license. Use it for client work, fork it for an agency, build a SaaS on top — all permitted. Attribution appreciated but not required (Dice Codes branding is toggle-able in OSS mode).

### What's the difference between BlogPilot and Jasper / Writesonic?
Those are pure AI writers. BlogPilot is a full SEO content studio — research, planning, writing, scoring, distribution, measurement, and technical audits in one app. The writer is just one of 39 modules.

### Does it support WordPress / Ghost / Webflow?
Yes via export — WordPress WXR, Ghost JSON, Webflow CSV, Hugo TOML, plus generic Markdown / HTML / JSON. Imports the same way any standard CMS importer would.

### Can I self-host on Vercel free tier?
Yes. See [DEPLOY.md](DEPLOY.md). For persistent storage, pair with Turso (free libSQL tier) — same client we use locally.

### How accurate is the rank tracker?
Free Bing + DuckDuckGo SERP scraping, throttled 5s between requests. Position 100+ reports as "not in top 100" rather than guessing. For Google-specific tracking, use the GSC CSV import — that's real Google data.

### Where's the AI Overviews / ChatGPT search optimization?
[`ai-overviews-capture.md`](src/lib/methodologies/ai-overviews-capture.md) ships with 6 verified passage patterns. [`passage-ranking-optimization.md`](src/lib/methodologies/passage-ranking-optimization.md) enforces standalone citability. [`llms-txt-spec.md`](src/lib/methodologies/llms-txt-spec.md) generates the `llms.txt` AI crawlers consume.

### What about Core Web Vitals?
PageSpeed Insights v5 (free, no key) pulls real CrUX field data during auto-discovery. [`core-web-vitals-thresholds.md`](src/lib/methodologies/core-web-vitals-thresholds.md) ships 2026 thresholds with ranked fixes.

### What's on the roadmap?
Common Crawl backlink index (Ahrefs replacement), local SEO audit, image SEO at scale, programmatic SEO template engine, brand mention monitor, HARO scraper. See [`docs/strategy/COMPETITIVE_ROADMAP.md`](docs/strategy/COMPETITIVE_ROADMAP.md).

---

## 📊 Status

| | |
|---|---|
| **Spec modules** | 38 of 38 (100%) + Score editor |
| **API routes** | 35+ |
| **Pages** | 17 |
| **CMS exporters** | 7 (Markdown, HTML, JSON, WordPress XML, Ghost, Webflow, Hugo) |
| **Methodology playbooks** | 45 |
| **Database tables** | 10 |
| **Unit tests** | 158 across 27 files |
| **E2E tests** | 3 (Playwright) |
| **Lines of TypeScript** | ~7,500 |

---

## 🗺️ Roadmap

Built and shipping. Future waves (PRs welcome):

- **Wave 9 — Compete with Ahrefs for $0**: Common Crawl ingestion → backlink discovery + anchor distribution + local Domain Authority
- **Wave 10 — Sibling apps**: OGForge (OG images), ReviewMiner (testimonials), SubjectLab (email subjects), CopyAtlas (conversion copy briefs)
- Google Search Console + GA4 OAuth (currently CSV-import only)
- Multi-user workspaces with roles
- Realtime collaborative editing

See [`docs/strategy/COMPETITIVE_ROADMAP.md`](docs/strategy/COMPETITIVE_ROADMAP.md) for the full 25+ item backlog.

---

## 🤝 Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

- Add a methodology → drop a markdown file in `src/lib/methodologies/` (see existing files for the frontmatter format)
- Add an AI provider → implement the `AIProvider` interface in `src/lib/ai/providers/`
- Add a CMS exporter → create `src/lib/exports/<platform>.ts` and wire it into `/api/export-cms`

---

## 📜 License

MIT — free for commercial use, modification, and distribution. See [LICENSE](LICENSE).

---

## 🏗️ Built by Dice Codes

<a href="https://dicecodes.com">
<img src="public/dice-codes-logo.svg" alt="Dice Codes" width="40" align="left" />
</a>

[**Dice Codes**](https://dicecodes.com) builds custom web apps, SaaS, mobile apps, e-commerce stores, and SEO-ready websites for startups and SMEs worldwide — at startup-friendly prices.

**Need a custom SaaS like BlogPilot for your industry?**

📱 [WhatsApp +91 9888404991](https://wa.me/919888404991) · 📧 [Contact@dicecodes.com](mailto:Contact@dicecodes.com) · 🌐 [dicecodes.com](https://dicecodes.com)

Selected work: Oceglow US · Marby · Anahat Exclusive · Bravo Pizza NYC.

---

<div align="center">

**If BlogPilot saved you a $400+/month subscription, ⭐ this repo.**

[⭐ Star this project](https://github.com/IamRamgarhia/blogpilot-ai/stargazers) · [🐛 Report issue](https://github.com/IamRamgarhia/blogpilot-ai/issues/new?template=bug_report.md) · [💡 Request feature](https://github.com/IamRamgarhia/blogpilot-ai/issues/new?template=feature_request.md) · [📰 Changelog](CHANGELOG.md)

</div>
