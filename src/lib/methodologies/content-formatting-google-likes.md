---
id: content-formatting-google-likes
title: Content Formatting Google Rewards
when: Every post, before final review — the single highest-leverage formatting playbook
inputs: post draft
outputs: structural + typographic + semantic rules
source: Google Search Central + Quality Rater Guidelines + 2024-2026 AI Overview citation studies + Backlinko SERP rank correlation studies
---

# Content Formatting Google Rewards

These are the formatting patterns Google's quality systems consistently reward — verified across the Helpful Content Update, Core Updates 2023-2026, and AI Overview citation samples.

## 1. Document structure

- **One H1**, exact-keyword-aware, 30-65 chars. Page = topic; H1 = topic; do not split topics.
- **H2s every 200-300 words** of body content. Long unbroken text dies in pogo-stick metrics.
- **H3s when an H2 has 3+ distinct sub-points.** Never skip levels (H1 → H3 without H2).
- **Heading text answers the question or describes the section.** Not clever — clear. "Why this matters" beats "The Why" every time.

## 2. Above-the-fold (first 100 words)

The first 100 words decide indexation and AI Overview citation. They must contain:

- Primary keyword in the **first sentence**.
- A **direct answer** to the implied question (40-55 words ideal — fits featured-snippet box).
- **No filler.** Banned openers: "In today's world", "In this article", "Welcome", "Let's dive in", "Have you ever wondered".
- A specific outcome or stat the reader gets if they keep reading.

## 3. Paragraph rhythm

- **2-4 sentences per paragraph max.** Mobile screens punish walls of text.
- **Sentence length:** mix. ≥1 short sentence (≤8 words) every 3 paragraphs to control pace.
- **No paragraph longer than 60 words.**
- **Lead each paragraph with the topic sentence.** Don't bury the lede.

## 4. Lists, tables, callouts

Google rewards skimmability. AI Overviews extract these elements first.

- **Numbered list** when order matters (steps, ranked items). Each item starts with an **action verb in present tense** ("Configure…", "Verify…", "Export…").
- **Bulleted list** when order doesn't matter. Items are **parallel grammar** — all noun phrases, or all imperatives, never mixed.
- **List item ≤ 25 words.** If longer, split into sub-bullets or convert to prose.
- **Tables** for comparison (3+ options across 3+ attributes). Headers in the first row. No merged cells.
- **Callout box** for warnings, tips, and notes — use a `> ` blockquote with a leading **bold label** (`> **Tip:** ...`).

## 5. Internal cues for AI Overview / Featured Snippet capture

Every section that targets a snippet must have:

- **Question as H2 or H3 verbatim.** "What is X?" → `## What is X?` not `## All About X`.
- **First paragraph 40-55 words**, answering the question directly. No "Let's see." or "Great question!"
- **Numbered or bulleted list immediately after** for steps/items if applicable.
- **Definition sentence** in the form `<Subject> is <category that> <distinguishing feature>.` ("Schema markup is structured data that helps search engines understand a page's content.")

## 6. Typography & punctuation

- **Bold** for the single most important phrase in a paragraph. Never bold full sentences.
- *Italic* for titles, foreign terms, and emphasis on one word. Never for whole sentences.
- **Em-dash** for parenthetical asides. **Period** for full stops. Never `...` for trailing thought.
- **Curly quotes**, not straight, in narrative prose. Code blocks stay straight.
- **Title case** for H1/H2 if the brand uses it; **sentence case** otherwise. Be consistent.
- **No ALL CAPS** in headings or body. Reserved for accessibility-recognized acronyms only.

## 7. Links + anchors

- **Internal link anchor** = descriptive, 2-4 words, partial-match the target's keyword. Never "click here" or "this article."
- **Outbound links** to a recognized authority once per ~500 words. Open with `target` only if user-experience matters; don't force `target="_blank"`.
- **No more than 1 outbound link per paragraph.** Two = link soup.
- **Affiliate links** get `rel="sponsored"`; user-generated content gets `rel="ugc"`; trust signal gets nothing or `rel="nofollow"` only for outbound to spam-prone domains.

## 8. Images

- **One image per 300-500 words.**
- **Real images, not stock.** Original beats stock by a wide margin for E-E-A-T.
- **Hero image** below H1, before the first body paragraph.
- **Alt text** 8-15 words, primary keyword if natural, never stuffed.
- **`width` + `height` attributes** to prevent Cumulative Layout Shift.
- **WebP or AVIF**, never raw JPG/PNG > 50KB.
- **Caption** when the image adds info beyond decoration.

## 9. Quotes & citations

Every claim that includes a number, percentage, or "studies show" must be cited:

- **Inline citation:** "according to [Source, year]."
- **Quote block** for direct quotes > 1 sentence, with attribution.
- **Citations live near the claim**, not at the bottom. Wikipedia-style is fine.
- **Placeholder for unverified data:** `[CITE: claim]` — never publish a placeholder; the writer flags it for the editor.

## 10. End-of-post elements

In order:

1. **Conclusion** (2-4 sentences) that re-states the post's promise and what the reader learned.
2. **CTA** matching brand voice (newsletter / product / next-read).
3. **Author bio block** with name, role, sameAs links (LinkedIn / X / personal site).
4. **Updated date** when material changes were made.
5. **Schema JSON-LD** block (auto-generated, not authored).
6. **Related posts** (3-5 internal links, descriptive anchors).

## 11. Mobile-first checks

- **Tap-target size:** any button/link ≥ 44 × 44px.
- **No horizontal scroll** on a 360px viewport.
- **Code blocks scroll inside the page**, not push layout.
- **Sticky headers ≤ 60px tall.**

## 12. Page-level signals beyond text

- **Reading time** displayed near the top, e.g. "8 min read".
- **Updated date** visible (not just `dateModified` in schema).
- **TOC** for posts > 1500 words.

---

## Output

For every post, return:

```json
{
  "formatting_score": 0,
  "max": 100,
  "checks": [
    { "id": "h1-present", "pass": true },
    { "id": "first-100-keyword", "pass": true },
    { "id": "paragraph-len-ok", "pass": false, "evidence": "para 3 is 92 words" },
    { "id": "list-item-grammar-parallel", "pass": true },
    { "id": "snippet-target-format", "pass": false, "evidence": "## What is X has a 200-word first paragraph; needs 40-55 for snippet capture" }
  ]
}
```

A post that fails any "high" check should not be published.
