import { describe, it, expect } from "vitest";
import { findDuplicates, titleSimilarity } from "@/lib/seo/duplicate-checker";

describe("duplicate-checker", () => {
  it("titleSimilarity is 1 for identical strings", () => {
    expect(titleSimilarity("how to bake bread", "how to bake bread")).toBe(1);
  });
  it("titleSimilarity is 0 for fully disjoint", () => {
    expect(titleSimilarity("apple orange pear", "lion tiger bear")).toBe(0);
  });
  it("findDuplicates flags near-duplicates", () => {
    const target = { id: "a", title: "A", text: "The quick brown fox jumps over the lazy dog. " .repeat(20) };
    const others = [
      { id: "b", title: "B", text: "The quick brown fox jumps over the lazy dog. " .repeat(20) },
      { id: "c", title: "C", text: "Completely different content about something else entirely. " .repeat(20) }
    ];
    const matches = findDuplicates(target, others);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].postId).toBe("b");
    expect(matches[0].signal).toBe("near-duplicate");
  });
  it("ignores empty text", () => {
    const target = { id: "a", title: "A", text: "" };
    const others = [{ id: "b", title: "B", text: "" }];
    expect(findDuplicates(target, others)).toEqual([]);
  });
});
