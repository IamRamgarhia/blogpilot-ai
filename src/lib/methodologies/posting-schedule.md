---
id: posting-schedule
title: Posting Schedule by Niche
when: Auto-assigning publish dates to calendar posts
inputs: client niche, list of unscheduled posts, target cadence (1/week, 2/week, etc.)
outputs: assigned publishDate per post (ISO)
source: HubSpot 2024 Best Time to Post + CoSchedule blog publishing study
---

# Posting Schedule by Niche

Best DAY of week to publish, by niche:

| Niche | Best day (primary) | Best day (secondary) | Best time (local) |
|---|---|---|---|
| B2B / SaaS / marketing | Tuesday | Thursday | 09:00-11:00 |
| Personal finance | Monday | Sunday | 06:00-08:00 |
| Food / recipe | Friday | Sunday | 11:00-13:00 |
| Travel | Wednesday | Sunday | 18:00-21:00 |
| Tech / dev | Tuesday | Thursday | 10:00-12:00 |
| Health / fitness | Monday | Wednesday | 06:00-08:00 |
| Lifestyle / fashion | Wednesday | Saturday | 12:00-14:00 |
| News / commentary | Tuesday | Wednesday | 07:00-09:00 |
| Default | Tuesday | Thursday | 09:00-11:00 |

## Rules

1. **Pillar posts publish first.** Always assign pillars before spokes.
2. **Spokes follow pillars by 1-3 days.** Internal link from pillar to spokes works best when the spokes exist.
3. **Never publish 2 posts on the same day** unless cadence > 1/day requested.
4. **Skip weekends for B2B niches.** Allow weekends for consumer niches.
5. **Time zone:** use client country if known, else default UTC.
6. **First post** publishes 2 business days from "today" to give the user review time.

## Output JSON

```json
{
  "schedule": [
    { "postId": "...", "publishDateISO": "2026-05-18T09:00:00Z", "rationale": "..." }
  ]
}
```
