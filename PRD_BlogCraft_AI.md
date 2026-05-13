# 📋 Product Requirements Document
## BlogCraft AI — Open-Source AI-Powered SEO Content Studio

**Version:** 1.0  
**Date:** May 2026  
**Status:** Draft  
**License:** MIT (Open Source)  
**Repo:** github.com/[your-username]/blogcraft-ai  

---

## 1. Executive Summary

BlogCraft AI is a 100% free, open-source, self-hostable AI blog writing studio. Users bring only one thing: an **AI API key** (Anthropic Claude or OpenAI). The tool crawls their existing website or blog, learns its style, tone, content structure, and niche — then guides them through a complete content workflow: keyword research → topic ideation → content calendar → outline approval → full blog post generation, all optimized for Google rankings, human readability, and AI search visibility (ChatGPT, Perplexity, Gemini).

**No subscriptions. No SaaS fees. No third-party tool required. Just an API key.**

---

## 2. Problem Statement

- Top AI blog writing tools (Jasper at $59–69/month, Writesonic at $20–45/month, Surfer SEO at $89/month) cost money and require multiple subscriptions for full SEO capability.
- Bloggers have no free, all-in-one tool that: (a) understands their existing blog's style and structure, (b) builds a full content calendar, and (c) produces publish-ready SEO-optimized posts with zero SaaS dependency.
- 2025–2026 SEO requires simultaneous optimization for Google traditional search, AI Overviews, and LLM citation engines — no free tool addresses all three.

---

## 3. Target Users

| User Type | Description |
|---|---|
| Solo Bloggers | Personal finance, travel, food, tech — running blogs on WordPress, Ghost, or static sites |
| Niche Site Owners | SEO-focused publishers growing affiliate or ad revenue |
| Small Agencies | Managing blogs for 5–20 clients without paying per seat |
| Indie Developers | Developers who want a self-hosted content pipeline |
| Non-English Bloggers | Any language; tool inherits the blog's language automatically |

---

## 4. Core Philosophy & Differentiators

| Feature | BlogCraft AI | Jasper | Writesonic | Surfer SEO |
|---|---|---|---|---|
| Price | **Free (just API key)** | $59/mo | $20/mo | $89/mo |
| Open Source | ✅ | ❌ | ❌ | ❌ |
| Self-Hostable | ✅ | ❌ | ❌ | ❌ |
| Blog Style Cloning | ✅ Auto | Manual | Manual | ❌ |
| Content Calendar | ✅ | Partial | ✅ | Partial |
| 1-by-1 Post Approval Flow | ✅ | ❌ | ❌ | ❌ |
| Multi-AI Support (Claude/OpenAI/Gemini) | ✅ | ❌ | ❌ | ❌ |
| GEO / AI Search Optimization | ✅ | ❌ | Partial | Partial |

---

## 5. Tech Stack Recommendation

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | File-based routing, SSR, easy GitHub deployment |
| Backend | Node.js + Express (or Next.js API routes) | Lightweight, JS across the stack |
| AI Engine | Anthropic Claude API / OpenAI API | User provides own key |
| Web Crawler | Playwright or Cheerio | Parse existing blog structure |
| Storage | LocalStorage + JSON files (no database) | Zero-infrastructure requirement |
| Deployment | Vercel / Netlify (one-click) OR `npm run dev` local | Works both ways |
| Config | `.env` file for API key only | No accounts needed |

**The entire tool runs locally or on a free Vercel account. Zero backend cost.**

---

## 6. User Journey (Full Flow)

```
[ONBOARDING]
  └── Enter Blog/Website URL
      └── AI crawls site (pages, posts, headings, FAQ style, writing tone)
          └── Auto-detects: niche, language, avg word count, heading structure,
                           FAQ usage, CTA style, image alt text usage, post frequency

[SETUP]
  └── User confirms/edits detected settings
      └── Select calendar length: 10 / 20 / 30 / 60 / 90 days
          └── Choose content goals: Traffic growth / Topical authority /
                                    Product promotion / Local SEO

[CONTENT CALENDAR]
  └── AI suggests full list of blog post titles (with target keyword per title)
      └── User approves, edits, reorders, or removes titles
          └── Calendar locked → begin writing phase

[WRITING PHASE — 1 Post at a Time]
  └── For each approved title:
      └── AI generates outline (H1, H2s, H3s, FAQs, estimated word count)
          └── User approves/edits outline
              └── AI writes full post following the blog's detected style
                  └── User reviews → Export (Markdown / HTML / plain text)
                      └── Move to next post
```

---

## 7. Feature Specifications

### 7.1 — Onboarding & Blog Crawling

- **URL input**: Accept any publicly accessible URL (WordPress, Ghost, Webflow, Wix, custom blogs)
- **Auto-crawl** (using Playwright/Cheerio):
  - Detect post structure (H1 / H2 / H3 patterns)
  - Detect if FAQ sections exist
  - Detect average post length (word count)
  - Detect tone (formal / conversational / technical)
  - Detect language
  - Detect niche/topic cluster (tech, food, finance, etc.)
  - Detect CTA patterns (newsletter, affiliate links, product plugs)
  - Detect image usage patterns (alt text, inline image frequency)
  - Detect internal linking style
  - Detect meta description patterns (if accessible in HTML)
- **Manual override**: User can correct any detected setting
- **Style profile saved locally** as a JSON config — reusable across sessions

### 7.2 — Content Calendar Generator

- Input: niche, blog style, target keyword set (or AI-generated)
- Output: a table of N blog titles (10 / 20 / 30 / 60 / 90 posts)
- Each title includes:
  - Primary keyword
  - Search intent (informational / commercial / navigational / transactional)
  - Estimated monthly search volume label (Low / Medium / High — derived from AI knowledge)
  - Content type (How-to, Listicle, Comparison, Opinion, Case Study, Roundup, etc.)
  - Recommended post length
  - Topic cluster assignment (for internal linking plan)
- User can: approve, reject, regenerate individual titles, or shuffle
- Calendar exported as CSV or JSON

### 7.3 — SEO Implementation Engine (Built-in)

Every generated post follows these SEO principles (2025/2026 standards):

**On-Page SEO:**
- Primary keyword in H1 title (front-loaded)
- Keyword in first 100 words of intro
- LSI (Latent Semantic Indexing) keywords distributed naturally
- Optimal keyword density (1–2%, never stuffed)
- H2 / H3 structure matching blog's detected pattern
- Meta title (under 60 chars) and meta description (under 160 chars) auto-generated
- Internal linking suggestions (placeholders with [INTERNAL LINK: topic] markers)
- Image placement suggestions with alt text recommendations
- Estimated read time added

**Content Depth & E-E-A-T:**
- Minimum word count enforced based on blog niche and competition level
- "Experience" signals: first-person voice where blog uses it
- Expert-level detail: AI generates content with authority signals
- Source citation placeholders: [CITE: statistic claim] markers for user to fill
- Author bio prompt added at end of each post

**Topic Clusters & Internal Linking:**
- Posts in same cluster get cross-link suggestions to each other
- Pillar page detection and linking
- Orphan post prevention — every post linked to at least one other

**Structured Data (Schema):**
- Auto-generates JSON-LD schema markup for:
  - Article schema
  - FAQ schema (if FAQs detected/generated)
  - HowTo schema (for tutorial posts)
  - BreadcrumbList schema

**Zero-Click & AI Search (GEO) Optimization:**
- Direct-answer paragraphs for featured snippet targeting
- FAQ section generated for "People Also Ask" targeting
- Structured, scannable formatting (numbered lists, tables) for AI citation
- Conversational Q&A blocks for LLM readability
- TL;DR summary at top of posts (for AI overview capture)

**Readability:**
- Flesch-Kincaid grade level targeting (adjustable: 6th grade / 8th grade / 10th grade)
- Short paragraphs (max 3–4 sentences)
- Transition sentences between sections
- Active voice enforcement

### 7.4 — Blog Post Writer

For each approved outline, the AI writes:

1. **SEO Title** (H1) — keyword front-loaded
2. **Meta Title** — under 60 characters
3. **Meta Description** — under 160 characters
4. **TL;DR / Quick Summary** — 2–3 bullet points (for AI overview capture)
5. **Introduction** — hook + problem statement + keyword in first 100 words
6. **Body Sections** (H2/H3 per approved outline)
7. **FAQ Section** (if blog uses FAQs — auto-detected)
8. **Conclusion** — summary + CTA matching blog's detected CTA style
9. **Schema Markup block** — JSON-LD ready to paste into site
10. **Social Captions** — Twitter/X thread starter + LinkedIn post + short Instagram caption

**Writing style matching:**
- Tone: copied from detected blog profile (formal / casual / technical)
- Sentence length: matched to blog average
- Use of "you" vs "one" vs first person: matched
- Heading formatting: matched (Title Case / Sentence case)

### 7.5 — Social Media Content Generator

For every blog post, auto-generate:
- Twitter/X thread (5–8 tweets)
- LinkedIn article intro (200 words)
- Instagram caption with hashtags
- Pinterest description
- WhatsApp/Telegram broadcast message (short summary)

### 7.6 — Content Calendar Dashboard

A simple Kanban-style board:
- Columns: Idea → Outline Approved → Writing → Review → Done
- Each card = one blog post with title, keyword, target date
- Export full calendar as CSV
- Visual progress tracker (e.g., 3/30 posts done)

### 7.7 — API Key Manager (Settings)

- Paste in Anthropic or OpenAI API key
- Key stored in browser localStorage or `.env` (never sent to any server)
- Model selector: Claude Sonnet / Claude Opus / GPT-4o / GPT-4o-mini
- Token usage tracker (shows estimated cost per post)

---

## 8. SEO Strategy Embedded (Research Summary)

Based on research of top-ranking sites and leading SEO tools:

### Top 10 SEO Skills Built Into BlogCraft AI

| # | SEO Skill | How BlogCraft AI Implements It |
|---|---|---|
| 1 | **E-E-A-T (Experience, Expertise, Authoritativeness, Trust)** | Expert-level writing, author bio prompts, citation placeholders, first-person experience signals |
| 2 | **Topical Authority & Cluster Strategy** | Calendar groups posts into topic clusters; pillar + spoke structure enforced |
| 3 | **Keyword Research & Intent Matching** | AI classifies each title by search intent; long-tail keyword integration |
| 4 | **On-Page SEO Optimization** | Title tags, meta descriptions, H1/H2 structure, keyword placement, internal links |
| 5 | **Content Depth & Comprehensiveness** | Word count targets, NLP/LSI keyword coverage, FAQ sections, multi-angle coverage |
| 6 | **Structured Data / Schema Markup** | Auto-generated JSON-LD for Article, FAQ, HowTo, Breadcrumb |
| 7 | **Featured Snippet & Zero-Click Optimization** | Direct-answer paragraphs, TL;DR summaries, numbered step lists |
| 8 | **GEO — Generative Engine Optimization** | AI-citable structure, clear Q&A blocks, authoritative statements for LLM indexing |
| 9 | **Readability & UX Signals** | Short paragraphs, transition sentences, Flesch-Kincaid scoring, scannable format |
| 10 | **Content Freshness Strategy** | Calendar built around seasonal updates; "update this post" reminder flags added per post |

---

## 9. What Competitors Charge For (That We Give For Free)

| Feature | Jasper | Writesonic | Surfer SEO | BlogCraft AI |
|---|---|---|---|---|
| Blog post generation | $59/mo | $20/mo | — | **Free** |
| Topic clustering / calendar | $69/mo | $45/mo | $89/mo | **Free** |
| SEO optimization scoring | + Surfer add-on | Built-in | $89/mo | **Free** |
| Schema markup generation | ❌ | ❌ | ❌ | **Free** |
| Social media repurposing | $69/mo | $45/mo | ❌ | **Free** |
| Blog style cloning | $69/mo | Manual | ❌ | **Free** |
| GEO / AI search optimization | ❌ | Partial | Partial | **Free** |
| FAQ / PAA optimization | ❌ | Partial | ❌ | **Free** |

---

## 10. Things the Founder Might Have Missed (Suggestions)

These are features strongly recommended to add, discovered during competitive research:

### 10.1 — Content Gap Analyzer
Crawl the top 5 Google results for any target keyword, identify topics they cover that the user's blog doesn't. Show "gap report" before writing.

### 10.2 — Existing Content Refresher
Input an old blog post URL → AI rewrites/refreshes it with updated keywords, modern structure, added FAQ, and new schema. Critical because content decay is a major ranking loss driver in 2026.

### 10.3 — Competitor Blog Scanner
Enter a competitor's blog URL → AI maps their content clusters → suggests posts to write that they rank for.

### 10.4 — Image Alt Text Generator
For each post, after writing, prompt: "Paste your image filenames" → AI generates SEO-optimized alt text for each.

### 10.5 — Internal Linking Assistant
After 5+ posts are written, the tool builds a suggested internal linking map between all posts automatically.

### 10.6 — Multi-Language Support
Since the tool detects blog language from crawling, it should write posts in that same language by default. Explicitly support: English, Hindi, Spanish, French, Portuguese, German, Arabic.

### 10.7 — Readability Scorer (Post-Generation)
After writing, show a readability dashboard:
- Flesch-Kincaid Grade Level
- Average sentence length
- Passive voice % 
- Keyword density
- Estimated read time

### 10.8 — CMS Export Integrations (Optional)
Export generated posts directly to:
- WordPress (via XML import file)
- Ghost (via Ghost API — optional plugin)
- Markdown files for Jekyll/Hugo/Astro

### 10.9 — Brand Voice Trainer
User can paste 3–5 of their best blog posts → AI extracts a "voice profile" that gets applied to all future writing (richer than just crawling structure).

### 10.10 — Duplicate Content Checker
Before finalizing, run a simple similarity check against previously generated posts in the same session to flag near-duplicate content.

---

## 11. What "Only an API Key" Means — Technical Architecture

```
User's Browser / Local Machine
    │
    ├── Next.js App (runs locally or on Vercel free tier)
    │       ├── Crawler module (Cheerio/Playwright — client or server-side)
    │       ├── Blog Style Analyzer (AI-powered)
    │       ├── Calendar Generator (AI-powered)
    │       ├── Post Writer (AI-powered)
    │       └── Export Module (Markdown / HTML / JSON / CSV)
    │
    └── API calls go directly to:
            ├── Anthropic API (user's key)
            └── OpenAI API (user's key)

NO DATABASE. NO SERVER. NO ACCOUNTS. NO TRACKING.
All data lives in the user's browser (localStorage) or local file system.
```

---

## 12. Open Source Strategy

- **License:** MIT — anyone can fork, self-host, modify
- **GitHub Repo:** Full source code, no obfuscation
- **Contribution:** CONTRIBUTING.md with clear guide for adding new AI providers, new export formats, new languages
- **Star Growth Strategy:** Post on Hacker News, Reddit r/SEO, r/blogging, r/opensource, Product Hunt, IndieHackers
- **Documentation:** README with one-command setup (`npx blogcraft-ai` or `npm run dev`)
- **No Telemetry:** Zero analytics or user tracking — clearly stated in README

---

## 13. Monetization (Optional, Non-Intrusive)

Since the tool is fully open source and free, optional monetization could include:

| Model | Details |
|---|---|
| **GitHub Sponsors** | Accept donations from power users |
| **Managed Cloud Version** | Optional paid hosted version (BlogCraft Cloud) — user doesn't have to self-host |
| **Priority Support / Discord** | Free tool + paid community tier for premium support |
| **White-Label for Agencies** | Agencies can pay for a branded version for their clients |

**The core open-source tool remains 100% free. Always.**

---

## 14. MVP Scope (v1.0)

For the first release, focus on:

- [x] Onboarding (URL crawler + blog style detection)
- [x] Content calendar generator (title + keyword + intent)
- [x] Single post outline generation with approval step
- [x] Full blog post writer (matching detected style)
- [x] Meta title + meta description generator
- [x] FAQ section generator
- [x] Basic schema markup (Article + FAQ JSON-LD)
- [x] Social captions (Twitter, LinkedIn)
- [x] Markdown + HTML export
- [x] API key settings panel (Claude / OpenAI)
- [x] Kanban content calendar dashboard

**Defer to v1.1+:**
- Content gap analyzer
- Existing post refresher
- Competitor blog scanner
- WordPress direct export
- Readability scorer dashboard
- Multi-language explicit support (works implicitly via AI)

---

## 15. Success Metrics

| Metric | Target (6 months post-launch) |
|---|---|
| GitHub Stars | 2,000+ |
| Active Installations | 500+ |
| Blog posts generated | 10,000+ |
| Community Contributors | 20+ |
| Product Hunt rank | Top 5 on launch day |

---

*BlogCraft AI — Built for bloggers, by builders. Free. Forever. Open Source.*
