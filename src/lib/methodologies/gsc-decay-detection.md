---
id: gsc-decay-detection
title: GSC Decay Detection
when: After importing 4+ weeks of Search Console data
inputs: GSC rows (date, query, page, clicks, impressions, position)
outputs: decay alerts per URL
source: Search Engine Land "Content Decay" + Ahrefs Content Drop study
---

# GSC Decay Detection

A post is decaying when the 4-week trailing average is materially worse than the previous 4-week window.

## Thresholds (per URL)

| Signal | Trigger | Severity |
|---|---|---|
| Impressions down > 30% week-over-week (4-week avg vs prior 4 weeks) | flag | high |
| Clicks down > 25% (same comparison) | flag | high |
| Position dropped > 5 places (4-week avg vs prior 4 weeks) | flag | medium |
| Position dropped > 3 places AND impressions down > 15% | flag | high |
| Position dropped > 10 places | flag | critical |

## Output JSON

```json
{
  "alerts": [
    {
      "url": "...",
      "signal": "impressions_drop | clicks_drop | position_drop | combined",
      "severity": "low | medium | high | critical",
      "current_value": 0,
      "previous_value": 0,
      "percent_change": -32.5,
      "recommended_action": "refresh | rewrite | redirect | monitor"
    }
  ]
}
```

## Recommended action mapping

- **Impressions drop + position drop** → refresh (content-refresh-rules)
- **Clicks drop only** (impressions stable) → meta title + description rewrite
- **Position drop > 10** → full rewrite (likely query intent shifted)
- **Steady decline over 12+ weeks** → consider redirect to a stronger pillar
