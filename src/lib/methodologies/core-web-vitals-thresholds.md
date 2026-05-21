---
id: core-web-vitals-thresholds
title: Core Web Vitals Thresholds (2026)
when: Auditing performance + page experience
inputs: LCP, INP, CLS measurements (from PageSpeed Insights / CrUX field data)
outputs: per-metric pass/needs-improvement/fail with concrete fixes
source: web.dev Core Web Vitals + Chrome UX Report definitions (2026)
---

# Core Web Vitals Thresholds (2026)

Google updated INP to replace FID in March 2024. Current thresholds:

| Metric | Good | Needs improvement | Poor |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.25 | > 0.25 |

A URL passes Core Web Vitals when **at least 75% of page loads at the 75th percentile** meet "Good" for ALL three metrics across mobile + desktop.

## Per-metric fixes (in order of impact)

### LCP fixes
1. **Compress hero image** — convert to WebP/AVIF, serve appropriately-sized variants via srcset.
2. **Preload hero image** — `<link rel="preload" as="image" href="...">` in <head>.
3. **Remove render-blocking JS/CSS** — defer non-critical, inline above-the-fold critical CSS.
4. **Use a CDN** for static assets (Cloudflare, Bunny, even cheap-tier).
5. **Server-side render** the hero element; client-rendered LCP penalizes by 1-3s.
6. **Upgrade hosting** if TTFB > 800ms.

### INP fixes
1. **Break up long JavaScript tasks** > 50ms with `scheduler.yield()` or `setTimeout(0)`.
2. **Defer third-party scripts** (analytics, chat widgets, ad tags) until after interaction.
3. **Code-split large bundles** (Next.js does this; verify chunks ≤ 200KB).
4. **Remove jQuery** if still in use; use vanilla DOM.
5. **Audit input handlers** — no synchronous network calls in `onClick`/`onInput`.

### CLS fixes
1. **`width` + `height` on every `<img>` and `<iframe>`.**
2. **Reserve space for ads** (CSS `min-height` on ad containers).
3. **`font-display: swap` + system font fallback** sized similarly to the web font.
4. **No content injected above existing content** after page load (e.g., dismissible banners pushing the article down).
5. **Use `aspect-ratio` CSS** for responsive media.

## Output JSON

```json
{
  "url": "https://example.com/page",
  "lcp": { "value_ms": 2300, "status": "good" },
  "inp": { "value_ms": 410, "status": "needs_improvement", "fix_priority": ["defer third-party scripts", "break up long tasks"] },
  "cls": { "value": 0.18, "status": "needs_improvement", "fix_priority": ["add width/height to images", "reserve ad space"] },
  "overall": "needs_improvement"
}
```
