import { describe, it, expect } from "vitest";
import { buildWordPressWXR } from "@/lib/exports/wordpress-xml";
import { buildGhostJson } from "@/lib/exports/ghost";
import { buildWebflowCsv } from "@/lib/exports/webflow-csv";
import { buildHugoMarkdown } from "@/lib/exports/hugo";
import type { ExportPost } from "@/lib/exports/common";

const sample: ExportPost = {
  id: "p1",
  title: "How to Bake Bread",
  slug: "how-to-bake-bread",
  metaTitle: "How to Bake Bread in 2026",
  metaDescription: "A short description.",
  primaryKeyword: "bake bread",
  draftMarkdown: "# Title\n\n## H2\n\nA paragraph with **bold** and a [link](https://e.com).",
  schemaJsonLd: '{"@context":"https://schema.org","@type":"Article"}',
  publishDateISO: "2026-06-01T09:00:00.000Z",
  cluster: "baking",
  brandName: "Brand",
  siteUrl: "https://example.com"
};

describe("CMS exporters", () => {
  it("WordPress WXR is well-formed XML and includes content", () => {
    const xml = buildWordPressWXR([sample]);
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<wp:post_name>how-to-bake-bread</wp:post_name>");
    expect(xml).toContain("How to Bake Bread");
    expect(xml).toContain("<wp:status>draft</wp:status>");
    expect(xml).toContain("_yoast_wpseo_title");
  });

  it("Ghost JSON has required structure", () => {
    const json = JSON.parse(buildGhostJson([sample]));
    expect(json.data.posts[0].title).toBe("How to Bake Bread");
    expect(json.data.posts[0].status).toBe("draft");
    expect(json.data.posts[0].slug).toBe("how-to-bake-bread");
    expect(json.data.tags[0].name).toBe("baking");
  });

  it("Webflow CSV has correct header and one row", () => {
    const csv = buildWebflowCsv([sample]);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("SEO Title");
    expect(lines.length).toBe(2);
    expect(lines[1]).toContain("how-to-bake-bread");
  });

  it("Hugo Markdown has TOML front-matter", () => {
    const md = buildHugoMarkdown(sample);
    expect(md.startsWith("+++")).toBe(true);
    expect(md).toContain('title = "How to Bake Bread"');
    expect(md).toContain("draft = true");
    expect(md).toContain("# Title");
  });
});
