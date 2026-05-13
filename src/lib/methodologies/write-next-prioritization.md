---
id: write-next-prioritization
title: What to Write Next — Prioritization
when: Generating the priority queue across all clients/clusters
inputs: post backlog, rank data, GSC data, gap analysis, cluster coverage map
outputs: ranked list with rationale per item
source: Ahrefs Content Strategy + HubSpot Cluster Maturity Model
---

# What to Write Next — Prioritization

Score every backlog item on a 0-100 scale by summing:

| Signal | Weight | How to score |
|---|---|---|
| Quick win — keyword currently ranks 11-30 (page 2-3, easy to push to page 1) | 30 | 30 if in band, 0 otherwise |
| Pillar dependency — pillar missing for a cluster that has 3+ spokes ready | 25 | 25 if true, 0 otherwise |
| Decay rescue — refreshes a decaying post | 20 | 20 if linked to decay alert, 0 otherwise |
| Gap coverage — fills a competitor gap with 5+ competitor coverage | 15 | 15 if priority-1 gap, 8 if priority-2, 0 otherwise |
| Search volume hint (AI-classified or autocomplete frequency) | 10 | scale 0-10 |

## Tie-breakers

1. Higher score wins.
2. Equal score: pillar first.
3. Equal pillar status: earlier cluster (alphabetical cluster name).

## Output JSON

```json
{
  "queue": [
    {
      "post_id": "... or null for new",
      "title": "...",
      "score": 87,
      "signals": ["quick_win", "decay_rescue"],
      "rationale": "Ranks #14 for primary keyword; small push lands it on page 1."
    }
  ]
}
```

Return top 10 items. If fewer than 10 exist, return what is available.
