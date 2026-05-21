---
id: eeat-author-bios
title: E-E-A-T Author Bios
when: Constructing author bios for every post — the single most overlooked E-E-A-T signal
inputs: author name + role + experience + verifiable links
outputs: bio block (markdown + Person schema)
source: Google QRG section on "Reputation" + Search Engine Journal author-bio CTR studies
---

# E-E-A-T Author Bios

A weak author bio invalidates the rest of the post's E-E-A-T work. The bio is the proof. Google's Search Quality Raters explicitly look it up.

## Required elements

1. **Real name** (no pen names for YMYL content).
2. **Specific job title or role** — "Content writer" is weak; "Senior SEO Strategist, 8 years in B2B SaaS" is strong.
3. **Credentials / experience hook** — degree, certification, years, notable employer, published work, conference talks.
4. **Beat description** — the 2-4 specific topics this author writes about.
5. **Profile photo** — real, not stock, not AI-generated. Same photo across sameAs profiles.
6. **`sameAs` links** ≥ 3:
   - LinkedIn (mandatory)
   - X / Twitter OR equivalent industry network
   - Personal site OR Muck Rack OR GitHub OR Substack OR equivalent
7. **Contact / "talk to me about X"** invitation (lowers trust threshold).
8. **Last updated date** when the author's role changed.

## Anti-patterns to avoid

- "Jane is passionate about..." — passion isn't expertise.
- Generic stock photo.
- Bio links to social profile that is itself empty.
- Bio claims expertise the author cannot demonstrate (auto-generated bios for AI content).
- Same bio across 30 different niches.

## Two formats

### Long bio (200-300 words) — author page

```markdown
**Jane Doe** is a Senior SEO Strategist at [Brand], where she leads organic acquisition for B2B SaaS clients. Over 8 years she has built content programs that grew traffic from 10K to 1.2M monthly sessions at companies like [A], [B], [C].

Jane writes about technical SEO, content strategy, and the changing role of AI in search. Her work has appeared in Search Engine Journal, Backlinko, and Moz. She has spoken at MozCon 2024 and BrightonSEO 2025.

Before [Brand], Jane led SEO at [Prior Co.] and built her first niche site in 2017 (grew to 200K monthly visits, sold 2021).

Talk to Jane about: technical audits, content cluster strategy, helpful-content recoveries.

LinkedIn · X · Muck Rack
```

### Short bio (40-60 words) — end-of-post

```markdown
By **Jane Doe**, Senior SEO Strategist at Brand. 8 years in B2B SaaS SEO; has grown sites from 10K to 1M+ monthly sessions. Writes about technical SEO and content clusters. [LinkedIn](https://...) · [X](https://...) · [More posts](/authors/jane)
```

## Person schema reinforcement

Every author has a `/authors/<slug>` page with:
- Full bio
- Profile photo
- List of posts
- Person JSON-LD with `sameAs`, `knowsAbout`, `worksFor`
- Article author links to this URL

## Output JSON

```json
{
  "bio_long": "...",
  "bio_short": "...",
  "person_schema": { ... },
  "verification_checks": {
    "linkedin_url_valid": true,
    "twitter_url_valid": true,
    "personal_site_valid": true,
    "photo_provided": true,
    "credentials_specific": true
  }
}
```
