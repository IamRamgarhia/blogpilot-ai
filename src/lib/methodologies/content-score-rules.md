---
id: content-score-rules
title: Real-Time Content Score Rules
when: Grading a draft against the top-10 SERP for a target keyword
inputs: post markdown, top-10 SERP pages (titles + body text + headings)
outputs: 0-100 score with weighted breakdown
source: Surfer SEO grading patterns + Clearscope term-coverage methodology + Google On-Page docs
---

# Real-Time Content Score Rules

The Surfer / Clearscope-style score answers: "if I publish this draft as-is, how well does it match what Google currently rewards for this keyword?"

## Weights

| Component | Weight | What it measures |
|---|---|---|
| Required-term coverage | 50% | Terms appearing in **5+ of top 10** competitors. These are table-stakes. |
| Recommended-term coverage | 20% | Terms appearing in **3-4 of top 10**. Differentiators. |
| Word count vs SERP median | 15% | Within 0.7x - 1.5x of SERP median wins; outside = penalty. |
| Heading parity | 10% | How many top-3 competitor H2 topics the draft covers. |
| Question coverage (PAA hits) | 5% | Each PAA question answered = +1 point. |

## Term extraction (TF-IDF)

1. Tokenize each top-10 page's body text. Lowercase. Strip HTML / punctuation / stop words / digits-only / single chars.
2. Stem with simple Porter-style rules (drop `s`, `es`, `ed`, `ing`).
3. Per document: compute term-frequency (raw count / doc length).
4. Across documents: compute inverse-document-frequency (`log(N / df)` where `df` = doc count containing the term).
5. Per term: `score = avg(tf across docs containing it) × idf`.
6. Keep top 100 terms.
7. **Bigrams + trigrams** — repeat the same with 2-word and 3-word phrases. Phrase TF-IDF gets a 1.5x weight (phrases are more valuable for ranking than single tokens).

## Required vs Recommended

- **Required:** term/phrase appears in ≥ 5 of the top-10 documents
- **Recommended:** appears in 3-4 of the top-10
- **Nice-to-have:** appears in 2 — listed but not scored
- Single-document terms are noise; ignore.

## Coverage scoring per term

- Term appears 0 times in draft → 0 points (missed)
- Term appears 1+ times → full points
- Term appears > 2x its density in top-10 → flag as **over-optimization** (subtle penalty: -10% per over-stuffed term)

## Word count band

- median = median word count of top 10
- If draft is within `[0.7 × median, 1.5 × median]` → full 15 points
- Outside that band → 15 × (1 − distance/median) points, minimum 0

## Heading parity

- Extract top-3 SERP results' H2s (we already have the crawler).
- Cluster them by lexical similarity (jaccard ≥ 0.4 → same topic).
- Each cluster the draft H2s cover = +33% of the 10 points.

## Output JSON

```json
{
  "score": 76,
  "grade": "B",
  "breakdown": {
    "required_terms": { "points": 40, "max": 50, "covered": 18, "total": 22 },
    "recommended_terms": { "points": 14, "max": 20, "covered": 12, "total": 18 },
    "word_count": { "points": 12, "max": 15, "actual": 1450, "median": 1800 },
    "headings": { "points": 7, "max": 10, "covered": 2, "total": 3 },
    "questions": { "points": 3, "max": 5, "covered": 3, "total": 5 }
  },
  "required": [
    { "term": "...", "in_competitors": 8, "in_draft": 1, "status": "ok" },
    { "term": "...", "in_competitors": 7, "in_draft": 0, "status": "missing" }
  ],
  "recommended": [...],
  "over_optimized": [
    { "term": "wordpress seo", "draft_count": 28, "median_count": 6 }
  ],
  "warnings": [...]
}
```

Letter grade: A ≥ 85, B ≥ 75, C ≥ 65, D ≥ 55, F < 55.
