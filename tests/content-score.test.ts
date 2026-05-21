import { describe, it, expect } from "vitest";
import { scoreDraft } from "@/lib/seo/content-score";
import type { SerpPageContent } from "@/lib/seo/serp-content";

function makePage(url: string, body: string, wordCount: number, headings: string[] = []): SerpPageContent {
  return { url, title: url, headings, body, wordCount, fetched: true };
}

describe("scoreDraft", () => {
  it("scores 0-100 against the corpus", () => {
    const pages = [
      makePage("u1", "wordpress seo plugin yoast schema markup ranking", 1500, ["What is wordpress seo", "Best plugins"]),
      makePage("u2", "wordpress seo plugin rank math schema markup ranking", 1500, ["What is wordpress seo", "Top tools"]),
      makePage("u3", "wordpress seo plugin all in one schema markup ranking", 1500, ["What is wordpress seo", "Reviews"]),
      makePage("u4", "wordpress seo plugin yoast schema ranking factors", 1500, ["wordpress seo guide"]),
      makePage("u5", "wordpress seo plugin schema markup ranking guide", 1500, [])
    ];
    const draft = `# Best WordPress SEO Plugins

## What is wordpress seo

A complete guide to wordpress seo plugin choices. We compare yoast, rank math, and all in one.
Schema markup, ranking factors, and the top plugins for 2026.

Most readers want a plugin that handles schema and helps with ranking.
`;
    const report = scoreDraft(draft, ["What is wordpress seo"], { pages, paaQuestions: [] });
    expect(report.score).toBeGreaterThan(0);
    expect(report.score).toBeLessThanOrEqual(100);
    expect(["A", "B", "C", "D", "F"]).toContain(report.grade);
  });

  it("returns full word-count points for an empty corpus", () => {
    const report = scoreDraft("hello world", [], { pages: [], paaQuestions: [] });
    expect(report.breakdown.word_count.max).toBe(15);
  });

  it("flags PAA coverage", () => {
    const pages = [
      makePage("u1", "topic about coverage and answers", 500, []),
      makePage("u2", "topic about coverage and answers and more", 500, []),
      makePage("u3", "topic about coverage and answers more details", 500, [])
    ];
    const paaQuestions = ["What is coverage?", "How does scoring work?"];
    const draftHit = `# Coverage

## What is coverage
Yes, coverage is...

## How does scoring work
Scoring works by...`;
    const report = scoreDraft(draftHit, [], { pages, paaQuestions });
    expect(report.paa_questions_covered.length).toBe(2);
  });
});
