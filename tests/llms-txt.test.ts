import { describe, it, expect } from "vitest";
import { buildLlmsTxt, buildLlmsFullTxt } from "@/lib/seo/llms-txt";

const input = {
  siteName: "Example Blog",
  description: "A blog about example things.",
  sections: [
    {
      heading: "Blog",
      resources: [
        { title: "First post", url: "https://e.com/first", summary: "Intro to topic" },
        { title: "Second post", url: "https://e.com/second", summary: "Deeper dive" }
      ]
    }
  ]
};

describe("buildLlmsTxt", () => {
  it("starts with H1 site name", () => {
    const out = buildLlmsTxt(input);
    expect(out.startsWith("# Example Blog")).toBe(true);
  });
  it("includes blockquote description", () => {
    const out = buildLlmsTxt(input);
    expect(out).toContain("> A blog about example things.");
  });
  it("lists resources with pipe summary", () => {
    const out = buildLlmsTxt(input);
    expect(out).toContain("- [First post](https://e.com/first): Intro to topic");
  });
  it("skips empty sections", () => {
    const out = buildLlmsTxt({ ...input, sections: [{ heading: "Empty", resources: [] }] });
    expect(out).not.toContain("## Empty");
  });
});

describe("buildLlmsFullTxt", () => {
  it("includes full bodies when provided", () => {
    const bodies = new Map([["https://e.com/first", "The full content of the first post."]]);
    const out = buildLlmsFullTxt(input, bodies);
    expect(out).toContain("The full content of the first post.");
    expect(out).toContain("### First post");
  });
  it("falls back to summary when body missing", () => {
    const out = buildLlmsFullTxt(input, new Map());
    expect(out).toContain("Intro to topic");
  });
});
