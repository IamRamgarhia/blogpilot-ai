---
id: cms-export-mapping
title: CMS Export Field Mapping
when: Generating CMS-specific export files (deterministic, no AI)
inputs: post + meta + schema
outputs: documented mapping per platform
source: WordPress WXR schema + Ghost JSON API + Webflow CMS reference + Hugo content schema
---

# CMS Export Field Mapping

This is the source-of-truth contract for our exporters.

## WordPress (WXR / RSS-flavored XML)

- `<title>` → post.title
- `<link>` → empty until user maps
- `<wp:post_name>` → slug
- `<wp:status>` → "draft"
- `<wp:post_type>` → "post"
- `<content:encoded><![CDATA[...]]></content:encoded>` → markdown converted to HTML
- `<excerpt:encoded>` → metaDescription
- `<wp:postmeta>` → `_yoast_wpseo_title` = metaTitle, `_yoast_wpseo_metadesc` = metaDescription
- `<wp:postmeta>` → `schema_jsonld` (custom) = JSON-LD block

## Ghost (JSON import format)

- `posts[]`
  - `title`, `slug`, `status: "draft"`, `feature_image`, `html` (from markdown), `meta_title`, `meta_description`
  - `tags: [{ name }]` from cluster + keyword

## Webflow (CSV)

Required columns: `Name, Slug, Author, Post Body, Post Summary, Main Image, Thumbnail Image, Featured?, Draft?, SEO Title, SEO Meta Description`. We emit `Post Body` as HTML.

## Hugo (TOML front-matter + Markdown)

```toml
+++
title = "..."
date = 2026-05-13T00:00:00Z
draft = true
slug = "..."
description = "..."
keywords = ["..."]
+++
```

## Astro / Jekyll (YAML front-matter — already covered by Wave 2 default markdown export)
