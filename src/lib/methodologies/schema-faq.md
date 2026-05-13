---
id: schema-faq
title: FAQ Schema (JSON-LD)
when: When a post has a FAQ section
inputs: array of { q, a }
outputs: JSON-LD FAQPage schema
source: schema.org/FAQPage + Google FAQ rich results docs
---

# FAQ Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "QUESTION",
      "acceptedAnswer": { "@type": "Answer", "text": "ANSWER" }
    }
  ]
}
```

## Rules
- Only include FAQs that visibly appear on the page. Hidden FAQs violate Google's structured-data policy.
- Answer must match the visible text. No keyword stuffing in the schema.
- Strip Markdown from answer text before serializing.
