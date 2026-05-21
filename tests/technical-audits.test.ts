import { describe, it, expect } from "vitest";
import * as cheerio from "cheerio";
import {
  auditTitle,
  auditMetaDescription,
  auditH1,
  auditHeadingHierarchy,
  auditNoindex,
  auditRedirectChain,
  auditMixedContent,
  auditThinContent,
  auditImages,
  auditSchema,
  auditSecurityHeaders,
  auditDuplicates,
  type Finding,
  type CrawledPage
} from "@/lib/technical/audits";

function pageFrom(html: string, opts: Partial<Omit<CrawledPage, "$" | "html" | "url" | "finalUrl">> & { url?: string; bodyText?: string } = {}): CrawledPage {
  const $ = cheerio.load(html);
  return {
    url: opts.url ?? "https://example.com/p",
    finalUrl: opts.url ?? "https://example.com/p",
    statusChain: opts.statusChain ?? [200],
    status: opts.status ?? 200,
    html,
    $,
    headers: opts.headers ?? {},
    bodyText: opts.bodyText ?? $("body").text(),
    wordCount: opts.wordCount ?? $("body").text().split(/\s+/).filter(Boolean).length
  };
}

describe("audits", () => {
  it("flags missing title", () => {
    const out: Finding[] = [];
    auditTitle(pageFrom(`<html><head></head><body></body></html>`), out);
    expect(out.find((f) => f.id === "title-missing")).toBeDefined();
  });

  it("flags too-long title", () => {
    const out: Finding[] = [];
    auditTitle(pageFrom(`<html><head><title>${"X".repeat(80)}</title></head><body></body></html>`), out);
    expect(out.find((f) => f.id === "title-too-long")).toBeDefined();
  });

  it("flags missing meta description", () => {
    const out: Finding[] = [];
    auditMetaDescription(pageFrom(`<html><head></head><body></body></html>`), out);
    expect(out.find((f) => f.id === "meta-description-missing")).toBeDefined();
  });

  it("flags missing H1", () => {
    const out: Finding[] = [];
    auditH1(pageFrom(`<html><body><h2>sub</h2></body></html>`), out);
    expect(out.find((f) => f.id === "h1-missing")).toBeDefined();
  });

  it("flags multiple H1s", () => {
    const out: Finding[] = [];
    auditH1(pageFrom(`<html><body><h1>a</h1><h1>b</h1></body></html>`), out);
    expect(out.find((f) => f.id === "h1-multiple")).toBeDefined();
  });

  it("flags heading skip", () => {
    const out: Finding[] = [];
    auditHeadingHierarchy(pageFrom(`<html><body><h1>a</h1><h3>c</h3></body></html>`), out);
    expect(out.find((f) => f.id === "heading-skip")).toBeDefined();
  });

  it("flags meta noindex as critical", () => {
    const out: Finding[] = [];
    auditNoindex(pageFrom(`<html><head><meta name="robots" content="noindex,nofollow"></head><body></body></html>`), out);
    const f = out.find((x) => x.id === "meta-noindex");
    expect(f).toBeDefined();
    expect(f?.severity).toBe("critical");
  });

  it("flags long redirect chains", () => {
    const out: Finding[] = [];
    auditRedirectChain(pageFrom(`<html><body></body></html>`, { statusChain: [301, 302, 301, 200] }), out);
    expect(out.find((f) => f.id === "redirect-chain")).toBeDefined();
  });

  it("flags mixed content", () => {
    const out: Finding[] = [];
    auditMixedContent(pageFrom(`<html><body><img src="http://x.com/img.png"></body></html>`, { url: "https://e.com/x", statusChain: [200] }), out);
    expect(out.find((f) => f.id === "mixed-content")).toBeDefined();
  });

  it("flags thin content", () => {
    const out: Finding[] = [];
    auditThinContent(pageFrom(`<html><body>short</body></html>`, { wordCount: 50 }), out);
    expect(out.find((f) => f.id === "thin-content")).toBeDefined();
  });

  it("flags image without alt", () => {
    const out: Finding[] = [];
    auditImages(pageFrom(`<html><body><img src="/a.jpg" width="100" height="100"></body></html>`), out);
    expect(out.find((f) => f.id === "alt-missing")).toBeDefined();
  });

  it("flags image without dimensions", () => {
    const out: Finding[] = [];
    auditImages(pageFrom(`<html><body><img src="/a.jpg" alt="ok"></body></html>`), out);
    expect(out.find((f) => f.id === "image-no-dimensions")).toBeDefined();
  });

  it("flags invalid JSON-LD", () => {
    const out: Finding[] = [];
    auditSchema(pageFrom(`<html><head><script type="application/ld+json">not valid json</script></head><body></body></html>`), out);
    expect(out.find((f) => f.id === "schema-invalid-json")).toBeDefined();
  });

  it("flags missing Article required fields", () => {
    const ld = JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "x" });
    const out: Finding[] = [];
    auditSchema(pageFrom(`<html><head><script type="application/ld+json">${ld}</script></head><body></body></html>`), out);
    expect(out.find((f) => f.id === "schema-missing-required")).toBeDefined();
  });

  it("flags missing security headers", () => {
    const out: Finding[] = [];
    auditSecurityHeaders(pageFrom(`<html></html>`, { headers: {} }), out);
    expect(out.find((f) => f.id === "header-missing-hsts")).toBeDefined();
    expect(out.find((f) => f.id === "header-missing-csp")).toBeDefined();
  });

  it("auditDuplicates flags duplicate titles across pages", () => {
    const a = pageFrom(`<html><head><title>Same Title</title></head><body></body></html>`, { url: "https://e.com/a" });
    const b = pageFrom(`<html><head><title>Same Title</title></head><body></body></html>`, { url: "https://e.com/b" });
    const out: Finding[] = [];
    auditDuplicates([a, b], out);
    expect(out.filter((f) => f.id === "duplicate-title").length).toBe(2);
  });

  it("passes a clean page", () => {
    const clean = pageFrom(
      `<html lang="en">
       <head>
         <title>Clean and Useful Page Title Within Limits</title>
         <meta name="description" content="A concise, keyword-rich meta description that is between 120 and 160 characters long. Just enough to satisfy the audit rules.">
       </head>
       <body>
         <h1>Single Heading</h1>
         <h2>Section</h2>
         <h3>Detail</h3>
         <p>${"word ".repeat(300)}</p>
         <img src="/a.webp" alt="describes the image fully" width="100" height="100">
       </body>
       </html>`,
      { url: "https://e.com/clean", wordCount: 320, headers: {
        "strict-transport-security": "max-age=63072000",
        "content-security-policy": "default-src 'self'",
        "x-frame-options": "SAMEORIGIN",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin"
      }}
    );
    const out: Finding[] = [];
    auditTitle(clean, out);
    auditMetaDescription(clean, out);
    auditH1(clean, out);
    auditHeadingHierarchy(clean, out);
    auditNoindex(clean, out);
    auditMixedContent(clean, out);
    auditThinContent(clean, out);
    auditImages(clean, out);
    auditSecurityHeaders(clean, out);
    // Clean page should produce zero findings (or only "schema-no-article-on-blog" which we didn't run).
    expect(out.length).toBe(0);
  });
});
