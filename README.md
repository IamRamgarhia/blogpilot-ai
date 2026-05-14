<div align="center">

<img src="public/blogpilot-logo.svg" alt="BlogPilot AI" width="80" />

# BlogPilot AI

### Your autopilot from blank page to first-page rank.

**Open-source, agency-grade SEO content studio. Bring your own AI key — free providers work.**

[![License: MIT](https://img.shields.io/badge/license-MIT-3B82F6.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A518.17-3B82F6.svg)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-99%2F99%20passing-84CC16.svg)](#tests)
[![Built by Dice Codes](https://img.shields.io/badge/built%20by-Dice%20Codes-84CC16.svg)](https://dicecodes.com)

[Quick start](#-quick-start) · [Features](#-features) · [Methodology Library](#-methodology-library-the-anti-guessing-engine) · [Deploy](DEPLOY.md) · [Custom build by Dice Codes](https://dicecodes.com)

</div>

---

## Why BlogPilot AI

Top SEO tools — Jasper ($59/mo), Surfer ($89/mo), Writesonic ($45/mo) — gate the basics behind subscriptions and lock content into their cloud.

**BlogPilot is free, open-source, and self-hostable.** Bring your own AI key (Google Gemini is free, 1,500 requests/day). Run it on your laptop, on a free Vercel tier, or in Docker. All client data stays in a single SQLite file you own.

Built for solo bloggers, niche-site owners, and small agencies managing 1-50 client sites at agency-grade output without subscription fees.

---

## ✨ Features

### Discover
- **One-URL onboarding** — paste any URL, BlogPilot auto-crawls identity, sitemap, social profiles, tech stack, and Core Web Vitals (via free PageSpeed Insights v5)
- **Brand voice trainer** — paste 3-5 sample posts → AI extracts tone, voice, sentence length, heading case, CTA style

### Research
- **Free keyword research** — Google Autocomplete + People-Also-Ask scraping + Bing SERP top-10. No paid API needed.
- **Content gap analyzer** — scrape competitor headings, return topics your client is missing
- **Competitor blog scanner** — map a competitor's content clusters from their sitemap

### Plan
- **Content calendar generator** — pillars + spokes, intent-classified, prioritized for quick wins first
- **Posting scheduler** — niche-aware best day/time recommendations, deterministic and timezone-aware
- **"What to write next" recommender** — synthesizes rank data + gap analysis + decay signals into a priority queue

### Write
- **Methodology-driven post writer** — every generation loads structured SEO playbooks (E-E-A-T, Skyscraper, featured snippet, PAA, GEO) before the AI call. The AI follows proven patterns instead of guessing.
- **Outline approval gate** — review the structure before the AI writes 2,000 words
- **Auto meta title + description** — char-counted live, intent-matched CTA
- **Auto schema JSON-LD** — Article + FAQ + Breadcrumb + HowTo (where applicable)
- **Internal linking assistant** — Jaccard-scored cross-link suggestions across all client posts
- **Image briefs** — alt text + AI generation prompts + stock search terms per H2
- **Readability dashboard** — Flesch-Kincaid grade, passive voice %, paragraph length warnings
- **Duplicate content checker** — local 4-gram shingle similarity across all drafts
- **Existing post refresher** — paste a published URL → AI updates with 2026 freshness + regenerates meta + schema

### Distribute
- **Social repurposer** — native variants for X / LinkedIn / Instagram / Pinterest / WhatsApp
- **Newsletter excerpts** — short (240 char) + long (200 word) versions
- **CMS exports** — Markdown, HTML, JSON, WordPress XML, Ghost JSON, Webflow CSV, Hugo TOML
- **Client portal share links** — signed, expiring read-only URLs for client approval (no auth required)

### Measure
- **Rank tracker** — free SERP scraping (Bing + DuckDuckGo fallback), throttled, rotating UA
- **GSC + GA4 import** — paste CSV, no OAuth setup needed
- **Content decay monitor** — 4-week trailing avg vs prior 4-week, severity-graded alerts
- **Hreflang manager** — 31 BCP 47 language presets, return-tag symmetry validation
- **llms.txt generator** — spec-compliant `llms.txt` + `llms-full.txt` for AI search crawlers

---

## 🤖 Multi-AI provider support

Configure any subset. Auto-failovers in priority order. **Free tier is enough** for most users.

**Free / free-tier**
- Google Gemini · Groq · OpenRouter · Mistral · Cerebras · Together AI · Ollama (local) · LM Studio (local)

**Paid premium**
- Anthropic Claude · OpenAI · DeepSeek · Perplexity

Set keys in `.env`. Test connectivity from the Settings page.

---

## 📚 Methodology Library — the anti-guessing engine

The single most distinctive thing about BlogPilot. Instead of letting the AI freelance on SEO best practices, **every generation loads structured playbooks first**. The library currently ships with **31 versioned methodologies**, including:

- E-E-A-T Checklist (Google Quality Rater Guidelines)
- Skyscraper Technique (Backlinko)
- SERP Intent Classification
- Topic Cluster Model (HubSpot pillar + spoke)
- Featured Snippet Targeting (3 snippet formats)
- People Also Ask Optimization
- Schema.org Playbook (Article / FAQ / HowTo / Breadcrumb)
- GSC Decay Detection (4-week trailing comparison)
- Posting Schedule by Niche
- Hreflang Implementation (RFC 5646 / BCP 47)
- llms.txt Specification (llmstxt.org)
- Multi-language Writing (locale-aware)
- Brand Voice Extraction
- Content Gap Analysis
- Internal Linking Graph
- Image Brief Generation
- Content Refresh Rules
- Readability Targets by Niche
- Meta Title / Description Rules
- Social Repurposing
- Newsletter Excerpt
- CMS Export Field Mapping
- And more…

All methodologies live as markdown files in [`src/lib/methodologies/`](src/lib/methodologies/). **Fork them, edit them, add your own.**

---

## 🚀 Quick start

### One-command install

**macOS / Linux**
```bash
git clone https://github.com/dicecodes/blogpilot-ai
cd blogpilot-ai
./install.sh
./start.sh
```

**Windows (PowerShell)**
```powershell
git clone https://github.com/dicecodes/blogpilot-ai
cd blogpilot-ai
.\install.ps1
.\start.ps1
```

Open http://localhost:3000.

### Manual install (any platform)

```bash
npm install
npm run setup        # creates ./data/, copies .env.example -> .env, generates migrations
npm run dev          # http://localhost:3000
```

### Stop the server

```bash
npm run stop         # cross-platform; kills whatever's on port 3000
```

### Wipe everything generated (start fresh)

```bash
npm run clean        # removes .next, data/, tsbuildinfo, test artifacts
```

### Health check

```bash
npm run doctor       # checks Node, libsql, Playwright, write perms
```

All user data lives in `./data/blogpilot.db`. Nothing is created outside the project directory.

---

## 🔧 Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui-inspired components |
| Database | `@libsql/client` (SQLite with prebuilt napi-rs binaries for every platform) |
| ORM | Drizzle ORM with first-class type safety |
| Crawler | Playwright + Cheerio static fallback |
| Tests | Vitest + Playwright e2e |
| Deployment | Vercel free tier · Docker · or `npm run dev` locally |

---

## 🌍 Cross-platform support

Built and tested on:

| OS | Node 18 | Node 20 | Node 22 | Node 24 |
|---|---|---|---|---|
| Ubuntu | ✅ | ✅ | ✅ | ✅ |
| macOS | ✅ | ✅ | ✅ | ✅ |
| Windows | ✅ | ✅ | ✅ | ✅ |

No Python, no Docker, no Redis, no Visual Studio Build Tools required. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the matrix.

---

## 📊 Status

| | |
|---|---|
| **Spec modules complete** | 38 of 38 |
| **API routes** | 35 |
| **Pages** | 16 |
| **CMS exporters** | 7 |
| **Methodology playbooks** | 31 |
| **Database tables** | 10 |
| **Test files** | 20 unit + 1 e2e |
| **Passing tests** | 99 unit + 3 e2e |

---

## 🗺️ Roadmap

Built. Shipping. Future ideas (PRs welcome):
- OAuth flow for Google Search Console + GA4 (currently CSV-import only)
- Stripe / Razorpay billing for managed Cloud tier
- Multi-user workspaces with roles (Owner / Editor / Viewer)
- Realtime co-edit on outline pages
- Mobile-first PWA shell

---

## 🤝 Contributing

PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md). Good first issues are tagged on the [Issues board](https://github.com/dicecodes/blogpilot-ai/issues).

Adding a new methodology? Drop a markdown file in `src/lib/methodologies/`. Adding a new AI provider? Implement the `AIProvider` interface in `src/lib/ai/providers/`.

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

**If BlogPilot saved you a $89/month Surfer SEO subscription, ⭐ the repo.**

</div>
