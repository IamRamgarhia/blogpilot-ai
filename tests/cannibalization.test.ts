import { describe, it, expect } from "vitest";
import { detectCannibalization } from "@/lib/technical/cannibalization";

describe("detectCannibalization", () => {
  it("groups posts that share an exact primary keyword", () => {
    const groups = detectCannibalization([
      { id: "1", title: "Best WordPress SEO Plugins 2026", primaryKeyword: "wordpress seo plugins" },
      { id: "2", title: "Top WordPress SEO Tools Reviewed", primaryKeyword: "wordpress seo plugins" },
      { id: "3", title: "How to Use Schema Markup", primaryKeyword: "schema markup" }
    ]);
    expect(groups.length).toBe(1);
    expect(groups[0].signal).toBe("exact_keyword");
    expect(groups[0].post_ids).toEqual(["1", "2"]);
    expect(groups[0].severity).toBe("high");
  });

  it("flags similar titles even without matching keywords", () => {
    const groups = detectCannibalization([
      { id: "a", title: "How to Bake Sourdough Bread at Home", primaryKeyword: "sourdough" },
      { id: "b", title: "How to Bake Sourdough Bread at Home Easily", primaryKeyword: "easy sourdough" }
    ]);
    expect(groups.some((g) => g.signal === "similar_title")).toBe(true);
  });

  it("returns empty when no overlap", () => {
    expect(detectCannibalization([
      { id: "1", title: "Lions of Africa", primaryKeyword: "lions" },
      { id: "2", title: "WordPress Hosting Guide", primaryKeyword: "wordpress hosting" }
    ])).toEqual([]);
  });

  it("ignores posts with empty primary keyword for the exact-keyword check", () => {
    const groups = detectCannibalization([
      { id: "1", title: "A", primaryKeyword: "" },
      { id: "2", title: "B", primaryKeyword: "" }
    ]);
    expect(groups.filter((g) => g.signal === "exact_keyword").length).toBe(0);
  });
});
