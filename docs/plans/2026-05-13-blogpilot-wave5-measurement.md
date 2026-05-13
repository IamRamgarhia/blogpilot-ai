# BlogPilot AI — Wave 5 (Measurement) Implementation Plan

**Goal:** Close the feedback loop. Track rankings, surface decay, and auto-prioritize what to write next based on what's actually working.

**Architecture:** Five modules built on existing primitives.
1. **Rank Tracker** — free SERP scraping (Bing primary, DuckDuckGo fallback), throttled, rotating UA. Stores history in new `rank_history` table.
2. **GSC Connector** — OAuth setup docs + API client + manual CSV import fallback (paste exported GSC CSV when OAuth not configured).
3. **GA4 Connector** — same dual mode: API client + CSV import fallback.
4. **Content Decay Monitor** — analyzes rank history + GSC traffic; flags posts with declining trajectory.
5. **What-to-Write-Next Recommender** — synthesizes rank data + gap analysis + cluster coverage to produce a priority queue.

**Schema additions:** `rank_history`, `gsc_data`, `ga4_data`, `decay_alerts` tables.

## Files

- methodologies/{rank-tracking-cadence, gsc-decay-detection, write-next-prioritization}.md
- src/lib/measurement/{rank-tracker, decay-monitor, recommender, gsc-import, ga4-import}.ts
- src/lib/db/schema.ts (extend)
- src/app/api/{rank-check, rank-history/[postId], gsc-import, ga4-import, decay/[clientId], recommend-next/[clientId]}/route.ts
- src/app/clients/[id]/measure/page.tsx (combined dashboard)
- tests/{rank-tracker.test.ts, decay-monitor.test.ts, recommender.test.ts}

## Acceptance

- Rank tracker scrapes a keyword + URL, returns position or null, stores history.
- Decay monitor compares last 4 weeks of rank history, flags drops > 5 positions or impressions drops > 30%.
- Recommender returns top 10 posts to write next, with rationale.
- All measurement runs in dry mode without external keys; OAuth setup documented.
- 62 existing tests still pass; new tests added.
