import { describe, it, expect } from "vitest";
import { articleSchema, faqSchema, breadcrumbSchema, combineSchemas } from "@/lib/seo/schema";

describe("schema generators", () => {
  it("articleSchema produces required fields", () => {
    const s = articleSchema({
      title: "How to Bake Bread",
      description: "A guide.",
      slug: "how-to-bake-bread",
      siteUrl: "https://example.com",
      authorName: "Jane",
      publisherName: "Example",
      image: "https://example.com/img.jpg"
    });
    expect(s["@context"]).toBe("https://schema.org");
    expect(s["@type"]).toBe("Article");
    expect((s as { headline: string }).headline).toBe("How to Bake Bread");
    expect((s as { mainEntityOfPage: { "@id": string } }).mainEntityOfPage["@id"]).toBe("https://example.com/blog/how-to-bake-bread");
  });

  it("truncates headline over 110 chars", () => {
    const long = "x".repeat(150);
    const s = articleSchema({ title: long, description: "d", slug: "x", siteUrl: "https://e.com" });
    expect(((s as { headline: string }).headline).length).toBeLessThanOrEqual(110);
  });

  it("faqSchema wraps Q+A pairs", () => {
    const s = faqSchema([{ q: "Q1?", a: "A1." }, { q: "Q2?", a: "A2." }]);
    const main = (s as { mainEntity: Array<{ name: string }> }).mainEntity;
    expect(main.length).toBe(2);
    expect(main[0].name).toBe("Q1?");
  });

  it("breadcrumbSchema enumerates positions", () => {
    const s = breadcrumbSchema([
      { name: "Home", url: "https://e.com/" },
      { name: "Blog", url: "https://e.com/blog/" }
    ]);
    const items = (s as { itemListElement: Array<{ position: number }> }).itemListElement;
    expect(items[0].position).toBe(1);
    expect(items[1].position).toBe(2);
  });

  it("combineSchemas wraps multiple in @graph", () => {
    const s = articleSchema({ title: "t", description: "d", slug: "s", siteUrl: "https://e.com" });
    const f = faqSchema([{ q: "Q?", a: "A." }]);
    const combined = combineSchemas(s, f);
    const parsed = JSON.parse(combined) as { "@graph": unknown[] };
    expect(parsed["@graph"].length).toBe(2);
  });
});
