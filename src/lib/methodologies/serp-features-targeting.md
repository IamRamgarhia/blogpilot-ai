---
id: serp-features-targeting
title: SERP Features Targeting
when: For every target keyword that surfaces a SERP feature
inputs: keyword, list of features detected on the SERP
outputs: per-feature targeting strategy
source: SEMrush SERP feature study + Backlinko snippet research + Google Search Central rich results docs
---

# SERP Features Targeting

The detector finds 9 SERP features. Each has a specific capture strategy. Run the relevant tactic for every feature present on the target keyword's SERP.

## Featured snippet (paragraph)

**Capture format:**
- H2 = exact question phrasing
- First paragraph after the H2 = 40-55 words
- First sentence directly answers, no preamble
- Definition form: `Subject is category that has X, Y, Z properties.`

**Avoid:**
- Lead with "Yes" or "No" without a 2-3 sentence elaboration
- Use "we" or "our" — Google prefers third-person neutral

## Featured snippet (list)

**Capture format:**
- H2 = "How to X" or "Steps to X" or "X ways to Y"
- Intro sentence (1-2 sentences, ≤ 30 words)
- 4-8 numbered list items
- Each item: action verb + ≤ 25 words

## Featured snippet (table)

**Capture format:**
- H2 = "X vs Y" or "Best X by Y" or "X comparison"
- Intro sentence (1 sentence)
- 3-5 column table with header row
- Cells short, no merged cells, no nested elements

## People Also Ask (PAA)

**Capture format:**
- FAQ section at end of post OR question-as-H3 sections throughout
- 4-8 questions, each from the scraped PAA list (use exact phrasing)
- Answer paragraph: 40-55 words
- First sentence directly answers
- Tag with FAQPage JSON-LD schema

## Shopping carousel

**Capture format:**
- Only relevant for commercial/transactional intent
- Product schema with: name, image, price, priceCurrency, availability, aggregateRating
- Merchant Center feed if you operate the store
- Article-style review post WILL NOT capture shopping carousel; pivot to product page

## Map pack / local 3-pack

**Capture format:**
- Local intent only (`X near me`, `X in [city]`, business type queries)
- LocalBusiness or appropriate sub-type schema
- Verified Google Business Profile
- NAP consistency across web (Name, Address, Phone)
- Reviews ≥ 10 ideally
- Article-only content WILL NOT capture map pack; create a Locations page with the schema

## Video carousel

**Capture format:**
- Embed a video (YouTube or self-hosted) above the fold
- VideoObject JSON-LD with name, description, thumbnailUrl, uploadDate, duration
- Title of video matches the keyword phrasing
- Article + Video schema together perform best

## Image pack / image carousel

**Capture format:**
- 1+ original image with primary keyword in filename AND alt text
- WebP/AVIF (faster fetch = better signal)
- Width/height attributes
- ImageObject schema (optional but helps)
- Image captioned beneath in body

## Knowledge panel

**Capture format:**
- Only entity queries (brand, person, place)
- Wikipedia page + Wikidata entry are the strongest signal
- Organization or Person schema on the entity's home page with `sameAs` to Wikipedia + verified social

## Top stories / news

**Capture format:**
- NewsArticle schema (not Article)
- Recent `datePublished` (within ~48 hours)
- Author with Person schema and verifiable bio
- AMP or fast mobile page (LCP < 1.5s)
- News publisher status (Google News inclusion)

## Twitter / X box

**Capture format:**
- Brand or topic with active X presence
- Recent posts (last 24-72 hours) from a verified-or-popular account
- Not directly controllable from the SEO side; covered by social-repurposing methodology

## Output JSON

```json
{
  "keyword": "...",
  "features_present": ["featured_snippet", "paa"],
  "tactics": [
    { "feature": "featured_snippet", "format": "paragraph", "section_h2": "What is X?", "first_paragraph_target_words": 50 },
    { "feature": "paa", "section_added": "FAQ", "questions": ["...", "..."] }
  ],
  "skipped": ["shopping", "map_pack"],
  "rationale": "Skipped shopping + map pack — article intent, not transactional/local."
}
```
