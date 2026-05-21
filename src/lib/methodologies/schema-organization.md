---
id: schema-organization
title: Organization + Person Schema (for E-E-A-T)
when: Every site — Organization on homepage, Person on author bios
inputs: org name, logo, sameAs links, contact info; author name, role, bio, sameAs
outputs: JSON-LD that strengthens E-E-A-T signals
source: schema.org/Organization + schema.org/Person + Google Search Central E-E-A-T guidance
---

# Organization + Person Schema

## Why this matters

Person and Organization schemas with verifiable `sameAs` links to LinkedIn, X, Wikipedia, etc. are one of the strongest E-E-A-T signals Google has. AI Overview engines specifically prefer pages with this schema present.

## Organization (homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Brand",
  "url": "https://yourbrand.com",
  "logo": "https://yourbrand.com/logo.png",
  "description": "One-paragraph description of what you do.",
  "foundingDate": "2024-01-01",
  "founders": [{ "@type": "Person", "name": "Founder Name" }],
  "sameAs": [
    "https://linkedin.com/company/your-brand",
    "https://twitter.com/yourbrand",
    "https://github.com/yourbrand",
    "https://en.wikipedia.org/wiki/Your_Brand"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "hello@yourbrand.com",
    "telephone": "+1-555-0100"
  }
}
```

## Person (author bio block on every post)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Author Name",
  "url": "https://yourbrand.com/authors/author-slug",
  "image": "https://yourbrand.com/authors/author.webp",
  "jobTitle": "Senior SEO Strategist",
  "description": "Two-sentence bio with credentials and beat.",
  "worksFor": { "@type": "Organization", "name": "Your Brand", "url": "https://yourbrand.com" },
  "alumniOf": { "@type": "EducationalOrganization", "name": "..." },
  "knowsAbout": ["SEO", "Content marketing", "Schema markup"],
  "sameAs": [
    "https://linkedin.com/in/author",
    "https://twitter.com/author",
    "https://muckrack.com/author"
  ]
}
```

## Rules

- **At least 3 sameAs URLs** on Person. LinkedIn + X + one of (personal site / Muck Rack / GitHub / Substack).
- **Article schema's `author` property links to the Person URL** — not just a name.
- **Author URL is a real page** (`/authors/slug`) with bio + recent posts.
- **Organization `sameAs` includes Wikipedia** when the org has an article (massive trust signal).
- **`knowsAbout`** is 3-8 topics the author actually writes about. Don't pad.

## Output JSON for the generator

```json
{
  "organization": { ... },
  "author": { ... },
  "validation": {
    "person_sameAs_count": 3,
    "org_has_wikipedia": false,
    "warnings": []
  }
}
```
