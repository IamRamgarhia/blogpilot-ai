import { describe, it, expect } from "vitest";
import { parseSiteIdentity } from "@/lib/crawler/parse-site-identity";

const html = `
<html lang="en">
<head>
  <title>Example Blog</title>
  <meta name="description" content="A blog about example things.">
  <meta property="og:image" content="/img.png">
  <meta name="generator" content="WordPress 6.5">
  <link rel="icon" href="/favicon.ico">
</head>
<body>
  <a href="https://twitter.com/example">tw</a>
  <a href="https://linkedin.com/in/example">li</a>
  <a href="https://github.com/example">gh</a>
</body></html>
`;

describe("parseSiteIdentity", () => {
  it("extracts title, description, lang, generator", () => {
    const id = parseSiteIdentity(html, "https://example.com");
    expect(id.title).toBe("Example Blog");
    expect(id.description).toContain("example things");
    expect(id.language).toBe("en");
    expect(id.generator).toContain("WordPress");
  });
  it("resolves relative og:image and favicon", () => {
    const id = parseSiteIdentity(html, "https://example.com");
    expect(id.ogImage).toBe("https://example.com/img.png");
    expect(id.favicon).toBe("https://example.com/favicon.ico");
  });
  it("extracts social profiles", () => {
    const id = parseSiteIdentity(html, "https://example.com");
    expect(id.social["twitter.com"]).toContain("twitter.com/example");
    expect(id.social["linkedin.com"]).toContain("linkedin.com/in/example");
    expect(id.social["github.com"]).toContain("github.com/example");
  });
  it("handles empty html", () => {
    const id = parseSiteIdentity("<html><body></body></html>", "https://example.com");
    expect(id.title).toBe("");
    expect(id.language).toBe("en");
  });
});
