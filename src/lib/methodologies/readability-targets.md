---
id: readability-targets
title: Readability Targets by Niche
when: After draft generation, scoring readability
inputs: post text, niche
outputs: target band (grade level) + checks
source: Yoast readability + Hemingway editor + Flesch-Kincaid 1948 study
---

# Readability Targets by Niche

Aim for a Flesch-Kincaid Grade Level appropriate to the niche. Going lower than the band is fine; going higher fails.

| Niche | Target FK grade | Notes |
|---|---|---|
| Consumer / lifestyle / cooking / travel | 6-8 | Short sentences, simple words |
| Personal finance / general blog | 7-9 | Some technical terms OK |
| SaaS / B2B / marketing | 9-11 | Industry terms expected |
| Legal / medical / academic | 10-12 | Precision over simplicity |
| Default if niche unknown | 8 | Safe middle |

## Checks (deterministic, no AI)

- **FK grade level** computed via standard formula: `0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59`.
- **Average sentence length** in words. Flag if > 25.
- **Passive voice %** — count sentences with `was|were|been|being|is being|are being` + past participle. Flag if > 10%.
- **Long paragraphs** — flag any paragraph with > 4 sentences.
- **Transition words** — at least 30% of paragraphs should start with a transition (However, In contrast, Beyond, Moreover, etc.).
