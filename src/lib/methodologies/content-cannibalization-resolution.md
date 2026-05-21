---
id: content-cannibalization-resolution
title: Content Cannibalization Resolution
when: After cannibalization detector flags 2+ posts on the same intent
inputs: list of cannibalizing posts (URL, title, traffic, position)
outputs: resolution decision per group with rationale
source: Ahrefs Cannibalization study + Search Engine Land deduplication patterns + Yoast cornerstone content model
---

# Content Cannibalization Resolution

Two posts targeting the same query split internal-link equity and SERP CTR. The fix depends on which signals are present.

## Decision tree

For each cannibalization group, walk the tree top-down.

### Step 1 — Are both posts ranking?

- If **one ranks top-20** and the other doesn't: keep the ranking one, 301-redirect the loser to the winner.
- If **both rank**: continue to Step 2.

### Step 2 — Do they cover the same intent?

- If **same intent** (informational ≡ informational, commercial ≡ commercial, etc.): **merge**. Take the best parts of both, rewrite into one canonical post. Redirect the loser.
- If **different intent** despite the same keyword: keep both but **differentiate the H1, title, and meta** so each clearly targets one intent. Add a cross-link with descriptive anchor.

### Step 3 — Length & depth check (when merging)

- The **winner** is the post with more inbound links + better metrics.
- Move the loser's unique sections (not duplicated material) into the winner.
- Update the winner's H2/H3 structure to absorb new sub-topics.
- 301 redirect loser → winner. Never `noindex` the loser (loses link equity).

### Step 4 — Anchor + link cleanup

- Find all internal links pointing at the loser URL. Update them to the winner URL.
- Update sitemap.
- Submit winner URL to Google Search Console for re-indexing.

## Special cases

- **Pillar + spoke confusion:** if a "spoke" outranks its pillar, the spoke IS the pillar. Re-architect the cluster.
- **Brand + product:** brand-name page vs product-page for the same brand-name keyword — both can rank (different SERP slots). Add structured data so Google distinguishes (Organization on brand, Product on product).
- **Geo splits:** "Best X in NYC" vs "Best X in LA" are NOT cannibalization — different geographic intent.

## Output JSON

```json
{
  "group": "wordpress seo plugins",
  "winner": { "id": "post-a", "url": "...", "rationale": "ranks #14 + 12 internal links" },
  "actions": [
    { "type": "merge", "loser_id": "post-b", "absorb_sections": ["plugin comparison table"] },
    { "type": "redirect_301", "from": "/old-post-b", "to": "/post-a" },
    { "type": "rewire_internal_links", "count_expected": 8 },
    { "type": "gsc_inspect_winner", "url": "..." }
  ],
  "alternative": "If post-b targets transactional intent (buy / coupon), keep both and differentiate H1+meta instead of merging."
}
```
