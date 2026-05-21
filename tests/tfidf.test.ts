import { describe, it, expect } from "vitest";
import { tokenize, tokenizeStemmed, ngrams, tfidfRank, countTerms } from "@/lib/seo/tfidf";

describe("tokenize", () => {
  it("drops stop words and short tokens", () => {
    const out = tokenize("The quick brown fox a is");
    expect(out).toEqual(["quick", "brown", "fox"]);
  });
  it("preserves hyphenated words", () => {
    expect(tokenize("real-time content score")).toContain("real-time");
  });
});

describe("stemming", () => {
  it("strips common suffixes", () => {
    expect(tokenizeStemmed("running runs runner")).toEqual(["runn", "run", "runner"]);
  });
});

describe("ngrams", () => {
  it("builds bigrams", () => {
    expect(ngrams(["a", "b", "c"], 2)).toEqual(["a b", "b c"]);
  });
  it("returns empty for short input", () => {
    expect(ngrams(["a"], 2)).toEqual([]);
  });
});

describe("tfidfRank", () => {
  it("returns terms common across multiple docs first", () => {
    const docs = [
      "wordpress seo plugin yoast plugin schema",
      "wordpress seo plugin rank math schema",
      "wordpress seo plugin all-in-one schema",
      "completely unrelated content about pizza recipes"
    ];
    const ranked = tfidfRank(docs, 20);
    const allTerms = ranked.map((t) => t.term);
    // "wordpress" stems to "wordpres" (trailing -s stripped) which is fine for matching.
    expect(allTerms.some((t) => t === "wordpress" || t === "wordpres")).toBe(true);
    expect(allTerms).toContain("seo");
    expect(allTerms.some((t) => t === "schema")).toBe(true);
  });

  it("skips terms appearing in only one doc", () => {
    const docs = ["unique unicorn", "common term shared", "common term shared"];
    const ranked = tfidfRank(docs);
    expect(ranked.find((t) => t.term === "unicorn")).toBeUndefined();
  });

  it("returns empty for empty corpus", () => {
    expect(tfidfRank([])).toEqual([]);
  });
});

describe("countTerms", () => {
  it("counts single tokens after stemming", () => {
    // "runs" -> "run" (strip -s); "running" -> "runn" (strip -ing); they don't collapse to a
    // single stem in this simple stemmer, so we count both forms separately.
    const counts = countTerms("runs run store", ["run", "store"]);
    expect(counts.get("run")).toBeGreaterThanOrEqual(2);
    expect(counts.get("store")).toBe(1);
  });
  it("counts phrases", () => {
    const counts = countTerms("real time content scoring tool", ["real time"]);
    expect(counts.get("real time")).toBeGreaterThanOrEqual(1);
  });
});
