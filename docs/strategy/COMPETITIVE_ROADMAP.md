# Competitive Landscape + Open-Source Roadmap

> What premium SEO/marketing tools deliver that Google specifically rewards, where BlogPilot AI has gaps, and what we should build next using **only free APIs and free AI tiers**.

---

## 1. What the premium tools actually deliver

| Tool | Price/mo | Their moat (what they uniquely do well) |
|---|---|---|
| **Ahrefs** | $129+ | 25T-page backlink index, keyword DB, content gap, top-pages by traffic, anchor text analysis |
| **Semrush** | $139+ | Position tracking + keyword magic tool + on-page checker + topic research + PPC toolkit |
| **Surfer SEO** | $89+ | Real-time content score against top-10 SERP terms; outline builder |
| **Clearscope** | $170+ | Grade A-F content score; term frequency vs top 30 |
| **MarketMuse** | $149+ | Topic modeling, semantic relevance score |
| **Frase** | $45+ | SERP-grounded AI writer, FAQ research |
| **Screaming Frog** | $21+ | 170+ technical SEO issues from a recursive crawl |
| **AlsoAsked** | $15+ | PAA-tree visualization |
| **AnswerThePublic** | $99+ | Autocomplete + question visualization |
| **Moz** | $99+ | DA/PA scores, link explorer |
| **SimilarWeb** | $125+ | Competitor traffic + audience |
| **HARO / Connectively** | Free→paid | Journalist requests for backlink building |

### What Google actually rewards in 2026

Verified from Google's [Search Quality Rater Guidelines](https://services.google.com/fh/files/misc/hsw-sqrg.pdf), Helpful Content updates, and AI Overviews documentation:

1. **E-E-A-T signals** — Experience, Expertise, Authoritativeness, Trust
2. **Topical depth** (cluster authority > single posts)
3. **Original research** (data, screenshots, primary-source content)
4. **People-first content** (helpful, not just "for SEO")
5. **Strong internal linking** with topical relevance
6. **Featured snippet + PAA capture** (40-55 word paragraph format)
7. **Schema.org rich-result eligibility**
8. **Core Web Vitals** (LCP, INP, CLS)
9. **Mobile-first responsive**
10. **Fresh `dateModified`** + content updates
11. **Author entity** (Person schema, sameAs to LinkedIn / X / verified profiles)
12. **Authoritative outbound citations** to .gov / .edu / known publications
13. **AI Overview citability** — passage-level structure, clear Q&A blocks
14. **Engagement signals** — low pogo-sticking, satisfying dwell time
15. **Helpful-content compliance** — no thin / templated / AI-firehosed pages

---

## 2. BlogPilot AI — what we already have vs the gap

### ✅ Already built (Waves 1-6, 38 modules, all free)

- Multi-AI provider abstraction (12 providers, free + paid, auto-failover)
- Methodology Library (31 versioned playbooks)
- Free keyword research (Google Autocomplete + PAA + Bing SERP)
- Content gap analyzer
- Competitor blog scanner
- Content calendar with niche-aware scheduling
- Outline generator with approval gate
- Post writer matching brand voice
- Auto meta + schema (Article / FAQ / HowTo / Breadcrumb)
- Internal linking assistant
- Image briefs
- Readability scoring (local, no AI)
- Post refresher
- Duplicate checker
- Social repurposer (5 platforms)
- Newsletter excerpts
- 7 CMS exporters (Markdown / HTML / JSON / WordPress XML / Ghost / Webflow CSV / Hugo)
- Client portal share links
- Rank tracker (free Bing + DuckDuckGo)
- GSC + GA4 CSV import
- Decay monitor
- "What to write next" recommender
- Hreflang manager
- llms.txt generator

### 🔴 Gaps vs premium tools (free-API achievable)

| Premium tool capability | What BlogPilot is missing | Free API/source we can use |
|---|---|---|
| **Surfer real-time content score** | Live grading of draft against top-10 SERP terms | Bing SERP + local TF-IDF (Wink-NLP or Natural — zero cost) |
| **Clearscope grade A-F** | Term-coverage score for ranking probability | Same (TF-IDF + entity extraction) |
| **MarketMuse topic modeling** | Topic graph for niche depth analysis | Wikipedia + Wikidata SPARQL (free) |
| **Ahrefs backlinks** | Backlink discovery + anchor analysis | **Common Crawl** web graph (free, petabyte-scale), Moz Link API free tier (10 queries/mo), [openlinkprofiler.org](https://openlinkprofiler.org) |
| **Screaming Frog audit** | Site-wide technical crawl (broken links, redirect chains, dup content, missing alt, h1 issues, schema errors) | Playwright + Cheerio recursive crawl (we already have it; just need the audit rules) |
| **AlsoAsked PAA tree** | Visual recursive PAA explorer | Bing PAA scraping (already in code, just needs recursion + viz) |
| **SERP feature detection** | Snippet/PAA/shopping/map-pack/video presence per keyword | Bing SERP parser extension |
| **SimilarWeb traffic estimate** | Competitor traffic insight | Cloudflare Radar (free), CrUX Report, Common Crawl |
| **Moz DA/PA** | Domain authority signal | Calculate locally via Common Crawl link graph |
| **HARO journalist requests** | Backlink opportunities | Connectively (free tier) scrape or RSS |
| **Local SEO audit** | GBP, NAP consistency, citations | OpenStreetMap Overpass API (free), Nominatim |
| **Image optimization at scale** | Bulk WebP/AVIF + alt text + metadata | Sharp (already shipped with libsql), local processing |
| **Programmatic SEO templates** | CSV-in → N posts out | Pure code, no external service |
| **Accessibility audit** | WCAG 2.2 compliance check | axe-core (free OSS) |
| **Security headers audit** | CSP, HSTS, X-Frame-Options, etc. | Mozilla Observatory API (free) |
| **Brand mention monitor** | Track unlinked brand mentions | Google Alerts RSS + DDG scrape |
| **AI Overview citation simulation** | Will this post get cited in AI Overview? | Local rules from `geo-citation-readiness.md` methodology + actual ChatGPT/Perplexity scrape (free public endpoints) |

---

## 3. Recommended next builds — Tier 1 (highest ROI, all free)

These close the biggest competitive gap and ship outcomes Google explicitly rewards.

### A. Real-Time Content Score Editor (Surfer/Clearscope killer)
- Scrape top-10 SERP for the post's primary keyword
- Extract their headings + body text via Cheerio
- Run **TF-IDF + entity extraction** locally (Wink-NLP, Natural, or compromise — all free zero-dep)
- Score the draft on:
  - Required terms coverage (must-haves appearing in 5+ competitors)
  - Recommended terms (3-4 competitors)
  - Heading parity (does it cover the same H2s the top 3 cover)
  - Word count vs SERP median
  - Question coverage (PAA hits in the draft)
- Render as **live editor** that re-scores on keystroke (1s debounce)
- **No AI cost** — this is pure NLP math. Google rewards this directly.

### B. Technical SEO Crawler (Screaming Frog Lite)
- Recursive crawl with Playwright (depth cap, throttled)
- 30+ audits including:
  - Broken internal/external links
  - Redirect chains (>2 hops)
  - Duplicate titles + meta descriptions
  - Missing/empty H1
  - Multiple H1s on one page
  - Missing alt text
  - Image > 200KB
  - Pages > 100KB (uncompressed)
  - Schema.org validation errors
  - Hreflang errors (already have validator)
  - Orphan pages (linked from nowhere)
  - Mixed content (https page loading http resource)
  - Canonical loops / non-self canonicals
  - robots.txt blocks indexable content
  - Sitemap drift (URLs in sitemap but 404, URLs indexed but not in sitemap)
  - Large DOM (>1500 nodes)
  - First H2 lacks keyword
  - URL has stop words / underscores
  - Page has no internal outbound links
- Export as CSV / HTML report (no AI needed)

### C. Backlink Intelligence via Common Crawl
- Common Crawl publishes a [web graph dataset](https://commoncrawl.org/web-graphs) — free, monthly updates
- Download host-level + page-level link graphs (~10GB compressed)
- Query: who links to my client? what's the anchor text distribution? what posts have most links?
- Same data Ahrefs uses (they fork CC + crawl their own); we use CC directly
- Calculate a local **Domain Authority equivalent** (PageRank on the host graph)

### D. PAA Tree Explorer
- Take a seed keyword
- Scrape PAA (we already do)
- For each PAA question, recursively scrape its PAA (3 levels deep, throttled)
- Render as collapsible D3 / Mermaid tree
- One-click "add all leaves to content calendar"

### E. SERP Feature Detector
- For every tracked keyword, detect:
  - Featured snippet (paragraph / list / table)
  - PAA box
  - Shopping carousel
  - Map pack (local intent)
  - Video carousel
  - Image pack
  - Knowledge panel
  - Top stories
- Tell the user which features they can realistically capture for that keyword

### F. Topic Authority Scorer
- Use Wikipedia + Wikidata as the entity graph for the client's niche
- Pull all client posts
- Calculate how much of the niche's entity space they cover
- Show as a percentage + missing entities (gap topics to write)

### G. AI Overview Citation Simulator
- For a published URL, query Perplexity / ChatGPT (free with our existing adapter) with niche keywords
- Detect if URL is cited
- Track over time
- Suggest rewrites based on what IS cited (sourced via `geo-citation-readiness.md`)

---

## 4. Tier 2 builds (still high-value, all free)

| Build | Free APIs | Why Google rewards it |
|---|---|---|
| **Local SEO audit pack** | OpenStreetMap Overpass + Nominatim + Bing Places | Map pack rankings, NAP consistency = trust signal |
| **Image SEO bulk processor** | Sharp (local) | Faster LCP + better image carousel ranking |
| **Programmatic SEO template engine** | CSV + AI | High-volume long-tail capture |
| **Accessibility audit** | axe-core | WCAG 2.2 is a ranking signal (mobile UX) |
| **Security headers audit** | Mozilla Observatory | Trust factor in E-E-A-T |
| **Sitemap doctor** | Local validator | Crawl efficiency = better indexation |
| **Robots.txt analyzer** | Local | Same |
| **Page experience monitor** | PSI + CrUX | Core Web Vitals + page experience signal |
| **Brand mention monitor** | Google Alerts RSS, DDG | Link reclamation, PR signals |
| **HARO request scraper** | Connectively free + Featured.com | Backlink building (E-E-A-T boost) |
| **Schema rich-results validator (bulk)** | Local + schema.org | Rich snippet eligibility |
| **Content cannibalization detector** | Local jaccard + SERP | Removes the #1 silent ranking killer |

---

## 5. Sibling open-source marketing tools (free for users, OS for us)

These are *separate apps* in the same family — open-source, dice codes branded, easy to build because BlogPilot's plumbing is already there.

| Tool | One-liner | Replaces premium |
|---|---|---|
| **OGForge** | Generate OG / Twitter card / Pinterest images from templates. SVG → PNG via Sharp. | Canva Pro ($13/mo), Bannerbear ($49/mo) |
| **SubjectLab** | Email subject line scorer + A/B brief generator. Local heuristics + spam-word detection. | SubjectLine.com Pro, CoSchedule Headline Studio |
| **UTMHub** | UTM builder + campaign memory + GA4 attribution stitching. | Bitly Pro ($35/mo) |
| **WireBrief** | Landing-page wireframe + copy structure generator by industry. | Unbounce Smart Builder ($90/mo) |
| **PriceRadar** | Scrape + alert on competitor pricing-page changes. | Prisync ($59/mo), Visualping ($13/mo) |
| **ReviewMiner** | Scrape Trustpilot/G2/Capterra/Google reviews. Extract features + objections. Generate testimonials + FAQ. | Birdeye ($299/mo), Pretty Links ($79/yr for the simple link cloak feature) |
| **MentionWatch** | Track brand mentions across web; flag unlinked = link-reclamation opportunities. | Mention.com ($41/mo), BrandMentions ($99/mo) |
| **AdSpyOSS** | Scrape Facebook Ad Library + Google Ads Transparency Center for any brand. | AdSpy ($149/mo), SpyFu ($39/mo) |
| **PostHeat** | Best time-to-publish heatmap from GA4 + GSC import. Per-niche, per-region. | Sprout Social ($249/mo) |
| **SplitMath** | Bayesian + frequentist A/B test calculator + sample size planner. | VWO ($199/mo for the calculator feature) |
| **CopyAtlas** | Conversion copywriting brief generator (PAS / AIDA / BAB / 4U with examples per industry). | Copy.ai Pro ($49/mo) |
| **LinkVault** | Affiliate link cloaker + click tracker + 404 fallback. WordPress plugin alternative. | Pretty Links Pro ($99/yr), ThirstyAffiliates Pro ($79/yr) |
| **LeadForge** | Lead-magnet PDF generator from any blog post + landing page builder + email integration. | ConvertKit Pro ($25/mo), Beacon ($49/mo) |
| **ReviewSchema** | Generate Review + AggregateRating JSON-LD schema from imported reviews. | Yoast SEO Premium ($99/yr feature) |
| **GMBPilot** | Google Business Profile post scheduler + review-response AI + Q&A monitoring. | LocalBrand ($99/mo), Birdeye |
| **PodPilot** | Podcast episode → blog post + SEO schema + chapter markers + transcript. | Otter.ai Business ($30/mo), Castmagic ($23/mo) |
| **VideoPilot** | YouTube video → SEO blog post + chapter timestamps + Schema. | TubeBuddy Pro ($9/mo + AI add-ons), VidIQ |
| **CourseOutline** | Generate course curriculum + lesson outlines + sales-page copy from a niche. | Coach.me / Kajabi ($149/mo) |
| **OffPageOps** | Outreach email generator + sequence + reply tracking from a target site list. | Pitchbox ($165/mo), BuzzStream ($24/mo) |

---

## 6. Free APIs / data sources to mine

Reference list for future modules. All confirmed free + legal to use at small scale.

### SEO / SERP
- Bing Web Search API — 1,000 calls/mo free
- DuckDuckGo HTML (no API, scrape)
- Google Autocomplete (`suggestqueries.google.com`) — undocumented but stable
- Google Trends (unofficial)
- Common Crawl — petabyte web graph + content, free download
- Wayback Machine API — historical snapshots
- Cloudflare Radar — traffic trends API
- Chrome UX Report (CrUX) — via PageSpeed Insights v5 OR BigQuery public table

### Entity / NLP
- Wikipedia API — entity definitions
- Wikidata SPARQL — structured entity graph
- ConceptNet — common-sense graph
- WordNet — lexical relations
- Wink NLP, compromise, natural — TypeScript NLP libs (all free, MIT)

### Local / maps
- OpenStreetMap Overpass API
- Nominatim — geocoding
- Bing Maps API free tier
- Geoapify free tier — 3,000 requests/day

### Performance / accessibility
- PageSpeed Insights v5 — free, no key
- Mozilla Observatory — security headers
- axe-core — WCAG 2.2 audits, MIT licensed
- Lighthouse CI — free OSS

### Backlinks
- Common Crawl host graph + page graph
- Moz Link API — 10 free queries/mo
- OpenLinkProfiler — free
- Majestic free tier — limited
- Webis Web Archive

### Social / PR
- HARO / Connectively — free tier
- Featured.com — free tier
- Reddit JSON API — free
- Hacker News Algolia API — free
- LinkedIn embed (no API for scraping, but RSS for company pages)
- Mastodon — federated, free
- Bluesky AT Protocol — free public API

### Marketplace / commerce
- Facebook Ad Library — free public
- Google Ads Transparency Center — free public
- Amazon product page scrape (legal at low rates)

### AI (free tiers, already in our adapter)
- Google Gemini — 1,500/day free
- Groq — free, very fast
- Cerebras — free, ultra-fast
- Mistral — free tier
- HuggingFace Inference — free serverless
- OpenRouter — many free models
- Cohere — 1,000 calls/mo
- Together AI — $1 free credit
- DeepSeek — cheap premium (almost-free)
- **Ollama / LM Studio** — fully local, free forever

---

## 7. Recommended sequencing

If we built these next, in order, each ships a real outcome users can feel:

### Wave 7 — "Compete with Surfer for $0"
1. Real-time content score editor (the headline feature)
2. PAA tree explorer
3. SERP feature detector
4. Topic authority scorer (Wikipedia/Wikidata)

### Wave 8 — "Compete with Screaming Frog for $0"
5. Technical SEO crawler with 30+ audit rules
6. Schema rich-results bulk validator
7. Accessibility audit (axe-core integration)
8. Security headers audit (Mozilla Observatory)
9. Sitemap doctor + robots.txt analyzer
10. Cannibalization detector

### Wave 9 — "Compete with Ahrefs for $0"
11. Common Crawl ingestion pipeline
12. Backlink discovery + anchor distribution + DA-equivalent score
13. Brand mention monitor + link reclamation
14. AI Overview citation simulator (Perplexity / ChatGPT scrape)

### Wave 10 — Sibling apps
15. OGForge (OG images)
16. ReviewMiner (review scraping + testimonial gen)
17. SubjectLab (email subject scorer)
18. PostHeat (best-time-to-publish heatmap)
19. CopyAtlas (conversion copy briefs)
20. LinkVault (affiliate link cloaker)

---

## 8. What I recommend you build first

If I had to pick **one thing** that gives the biggest "wow" vs the cost: **Real-Time Content Score Editor**. Surfer charges $89/mo for this exact feature. It's the most-requested AI-content workflow. Pure NLP, zero API cost, ships in a focused 1-2 day build, and it's the screenshot that sells the rest of BlogPilot.

If I had to pick **three things** to build next:

1. **Real-Time Content Score Editor** (Wave 7.1) — biggest competitive win
2. **Technical SEO Crawler** (Wave 8.5) — biggest "actionable insights" volume
3. **Backlink Intelligence via Common Crawl** (Wave 9.11-12) — closes Ahrefs gap

These three alone replace ~$300/mo of subscriptions for an agency.

**Tell me which wave to start.**
