import { describe, it, expect } from "vitest";
import { readability } from "@/lib/seo/readability";

describe("readability", () => {
  it("computes basic metrics on simple text", () => {
    const md = "# Title\n\nThis is one. This is two. This is three.\n\nA second paragraph here.";
    const r = readability(md);
    expect(r.wordCount).toBeGreaterThan(5);
    expect(r.sentenceCount).toBeGreaterThanOrEqual(3);
    expect(r.paragraphCount).toBe(3);
  });

  it("flags long sentences", () => {
    const md = "This is a really really really really really really really really long sentence that goes on and on and on.";
    const r = readability(md);
    expect(r.avgSentenceLength).toBeGreaterThan(15);
  });

  it("strips markdown for analysis", () => {
    const md = "# H1\n\n`code block ignored` and **bold** text here.";
    const r = readability(md);
    // "code block ignored" replaced; should not have hashes counted
    expect(r.wordCount).toBeGreaterThan(0);
  });

  it("computes passive voice ratio", () => {
    const md = "The cat was chased. The dog was bitten. They ran fast.";
    const r = readability(md);
    expect(r.passiveVoicePercent).toBeGreaterThan(0);
  });
});
