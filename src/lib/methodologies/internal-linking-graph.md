---
id: internal-linking-graph
title: Internal Linking Graph
when: After 3+ posts exist in a client, suggesting internal links per draft
inputs: target post (title + keyword + cluster), all other client posts
outputs: ranked link suggestions with anchor text
source: Backlinko Internal Linking + Ahrefs hub page study
---

# Internal Linking Graph

For every post, ensure:

1. **Outbound from this post**: 2-5 internal links to sibling posts or the pillar.
2. **Anchor variation**: never use exact-match keyword for more than 1 link to the same target. Vary anchors.
3. **Orphan prevention**: every post must be linked from at least one other post in the same client.
4. **Pillar density**: pillar pages SHOULD link to every spoke in their cluster.
5. **Cross-cluster links**: allowed when contextually relevant, but rare. Same-cluster links are the rule.

## Ranking rule

Score each candidate link by:
- **Keyword overlap** between target and candidate (Jaccard) — weight 0.5
- **Same cluster** boost — +0.3
- **Pillar candidate** boost — +0.2
- **Anchor diversity** — penalty if the same anchor text would be reused

Return top 5 candidates with suggested anchor text variations.

## Output JSON

```json
{
  "suggestions": [
    {
      "target_post_id": "...",
      "target_title": "...",
      "score": 0.85,
      "anchor_options": ["exact", "partial", "descriptive"],
      "rationale": "same cluster + 60% keyword overlap"
    }
  ]
}
```
