---
id: llms-txt-spec
title: llms.txt Specification
when: Generating a site's llms.txt and llms-full.txt
inputs: site name, brief description, list of important resources (pages, docs, posts)
outputs: spec-compliant llms.txt and optional llms-full.txt
source: llmstxt.org (Jeremy Howard, 2024)
---

# llms.txt Specification

`/llms.txt` is a Markdown file at the root of a site that helps LLMs find the most relevant context efficiently.

## Required structure

```
# Site Name

> One-paragraph site description. What this site is, who it's for, what kind of content it contains.

## Section heading

- [Resource title](URL): one-line summary
- [Another resource](URL): one-line summary

## Optional section heading
```

## Rules

1. **`# H1`** = site name. Exactly one.
2. **`>` blockquote** immediately after H1 = description. One paragraph.
3. **`## H2`** sections group resources. "Docs", "Blog", "API", etc.
4. **List items** are `[Title](URL): description` — pipe-style summaries.
5. Optional H2 named "Optional" — these are deprioritized; LLMs may skip if context budget is tight.
6. Keep total file under 50 KB; if longer, split into `llms-full.txt`.

## Output

Two files when requested:
- `llms.txt` — concise (top 20-50 resources)
- `llms-full.txt` — full content of all listed resources concatenated

## Example

```
# BlogPilot AI

> Open-source AI-powered SEO content studio built by Dice Codes. Bring your own AI key, auto-discover any client site, plan and write SEO-optimized posts.

## Docs

- [Quick start](https://example.com/docs/start): install in 60 seconds
- [Architecture](https://example.com/docs/arch): how the methodology library works

## Blog

- [Why we built BlogPilot](https://example.com/blog/why): the origin story
```
