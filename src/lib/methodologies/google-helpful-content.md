---
id: google-helpful-content
title: Google Helpful Content Compliance
when: Final review before publish; also run when traffic decays
inputs: post draft + site context
outputs: per-item pass/fix with severity
source: Google Helpful Content System docs + Quality Rater Guidelines + Search Central "people-first content" guidance
---

# Google Helpful Content Compliance

The Helpful Content System demotes content that fails these patterns. Run this check before every publish.

## Self-assessment questions Google publishes

For each, the post must answer YES.

### Content quality
- [ ] Does the content provide **original information**, reporting, research, or analysis?
- [ ] Does the content provide a **substantial, complete, or comprehensive** description of the topic?
- [ ] Does the content provide **insightful analysis or interesting information beyond the obvious**?
- [ ] If the content is based on other sources, does it provide **substantial added value and originality** (not just copying or rewriting)?
- [ ] Does the headline avoid being **exaggerating or shocking** in nature?
- [ ] Is this the sort of page you would want to **bookmark, share, or recommend**?
- [ ] Would you expect to see this content in or referenced by a **printed magazine, encyclopedia, or book**?

### Expertise
- [ ] Is the content presented in a **trustworthy way** — clear sourcing, evidence of expertise, background of author or site?
- [ ] If you research the site producing the content, would you come away with the impression that it is **well-trusted or widely-recognized** in its topic?
- [ ] Is this written by an **expert or enthusiast** who demonstrably knows the topic well?
- [ ] Does the content have any **easily-verified factual errors**?
- [ ] Would you feel **comfortable trusting this content for issues relating to your money or your life** (YMYL)?

### Presentation & production
- [ ] Is the content free from spelling or stylistic issues?
- [ ] Was the content **produced well, or does it appear sloppy or hastily-produced**?
- [ ] Is the content mass-produced by or outsourced to a large number of creators, or spread across a large network, such that pages or sites don't get as much attention or care?
- [ ] Does the content have an **excessive amount of ads** that distract from or interfere with the main content?

### Made-for-search-engines red flags
- [ ] Is the content **primarily to attract people from search engines**, rather than made for humans?
- [ ] Are you producing lots of content on **different topics** in hopes that some of it might rank?
- [ ] Are you using **extensive automation** to produce content on many topics?
- [ ] Are you **mainly summarizing** what others say without adding much value?
- [ ] Are you writing about things simply because they seem trending, not because of audience interest?
- [ ] Does your content leave readers feeling they need to **search again to get better information**?
- [ ] Are you writing to a **particular word count** because you've heard Google has a preferred word count? (There isn't one.)
- [ ] Did you decide to enter some **niche topic area without any real expertise**, but mainly because you thought you'd get search traffic?
- [ ] Does your content **promise to answer a question that actually has no answer**, such as "release date of a product that hasn't been announced"?

## Output JSON

```json
{
  "helpful_content_score": 18,
  "max": 22,
  "compliance": "pass" | "review" | "fail",
  "failed_items": [
    { "id": "original-information", "severity": "high", "note": "Post is a summary of 3 competitor articles; add primary research, data, or experience." }
  ]
}
```

Threshold: ≥ 20/22 = pass; 17-19 = review (refresh recommended); ≤ 16 = fail (do not publish or unpublish).
