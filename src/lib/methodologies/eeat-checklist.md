---
id: eeat-checklist
title: E-E-A-T Checklist
when: Before finalizing any post; during outline review
inputs: post draft or outline, author profile
outputs: pass/fail per item with suggested fix
source: Google Search Quality Rater Guidelines (2024-2026 refresh)
---

# E-E-A-T Checklist

For every post, verify ALL of the following. Mark each PASS or FIX-NEEDED.

## Experience (first-hand)
- [ ] Post includes at least one first-person observation, anecdote, or "I tested / I used / I observed" statement when the topic permits.
- [ ] Original screenshots, photos, or data referenced where claims are made.

## Expertise (subject-matter)
- [ ] Author bio with credentials, role, and years of experience is linked at top or bottom.
- [ ] Technical terms used correctly; no surface-level summaries of complex topics.
- [ ] At least 2 specific data points, statistics, or named tools cited (each with `[CITE: source]` if not verified).

## Authoritativeness (recognized voice)
- [ ] Author has Person schema with `sameAs` to LinkedIn / X / personal site.
- [ ] At least 1 outbound link to a high-authority source (gov, edu, recognized industry publication).
- [ ] Brand mentioned naturally; not keyword-stuffed.

## Trust (signals of reliability)
- [ ] Updated date visible and recent (or content explicitly evergreen).
- [ ] No unsourced statistics. Every number has a citation or a `[CITE: ...]` placeholder.
- [ ] Affiliate / sponsored disclosure present if applicable.
- [ ] Comments / reviews enabled where the site supports them.

Return a JSON object:
```json
{ "checks": [{ "id": "...", "status": "pass" | "fix", "note": "..." }], "overall": "pass" | "fix" }
```
