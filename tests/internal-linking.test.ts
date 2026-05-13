import { describe, it, expect } from "vitest";
import { suggestInternalLinks } from "@/lib/seo/internal-linking";

describe("internal-linking", () => {
  it("excludes self", () => {
    const self = { id: "a", title: "Best WordPress Plugins", primaryKeyword: "wordpress plugins" };
    const others = [
      { id: "a", title: "Best WordPress Plugins", primaryKeyword: "wordpress plugins" },
      { id: "b", title: "Top SEO Tools", primaryKeyword: "seo tools" }
    ];
    const out = suggestInternalLinks(self, others);
    expect(out.find((s) => s.postId === "a")).toBeUndefined();
  });
  it("ranks same-cluster + pillar higher", () => {
    const self = { id: "a", title: "Best WordPress SEO Plugins", primaryKeyword: "wordpress seo plugins", cluster: "wordpress" };
    const others = [
      { id: "b", title: "WordPress SEO Guide", primaryKeyword: "wordpress seo", cluster: "wordpress", isPillar: true },
      { id: "c", title: "Shopify Apps Roundup", primaryKeyword: "shopify apps", cluster: "shopify" }
    ];
    const out = suggestInternalLinks(self, others);
    expect(out[0].postId).toBe("b");
    expect(out[0].rationale).toContain("pillar");
  });
  it("returns at most max suggestions", () => {
    const self = { id: "a", title: "A", primaryKeyword: "a" };
    const others = Array.from({ length: 20 }, (_, i) => ({
      id: `p${i}`,
      title: `Post ${i} about a`,
      primaryKeyword: "a"
    }));
    const out = suggestInternalLinks(self, others, 3);
    expect(out.length).toBeLessThanOrEqual(3);
  });
});
