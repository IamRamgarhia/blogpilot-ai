---
id: rank-tracking-cadence
title: Rank Tracking Cadence
when: Scheduling rank checks for tracked posts
inputs: post count, time since publish
outputs: per-post check frequency
source: Ahrefs / SEMrush rank-tracking norms + Google Index update cadence
---

# Rank Tracking Cadence

Tracking every keyword every day is wasteful and gets you rate-limited. Use this schedule:

| Post age | Cadence | Rationale |
|---|---|---|
| 0-7 days since publish | Daily | Discover and index volatility window |
| 8-30 days | Every 3 days | Algorithm settling period |
| 31-90 days | Weekly | Stable monitoring |
| 91-365 days | Every 2 weeks | Slow drift |
| > 1 year | Monthly | Long-term decay monitoring |

## Rules

1. **Throttle:** Never more than 1 SERP fetch per 5 seconds globally.
2. **Rotate UA:** Use desktop + mobile UAs alternating.
3. **Source order:** Bing first (less aggressive bot detection) → DuckDuckGo fallback → manual mode if both fail.
4. **Position match:** A "match" is when the result URL hostname equals the client hostname. Path differences are ignored. Subdomain match is the same site.
5. **Position 100+ is "not in top 100"** — record as `null`, not `101`.
6. **Store every check** in rank_history with timestamp. Decay monitor reads this.
