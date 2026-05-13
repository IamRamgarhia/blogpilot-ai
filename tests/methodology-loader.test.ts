import { describe, it, expect } from "vitest";
import { loadMethodologies, getMethodology, methodologyAsPrompt, clearCache } from "@/lib/methodologies/loader";

describe("methodology loader", () => {
  it("loads bundled methodologies", () => {
    clearCache();
    const all = loadMethodologies();
    expect(all.length).toBeGreaterThanOrEqual(3);
    expect(all.find((m) => m.id === "eeat-checklist")).toBeDefined();
    expect(all.find((m) => m.id === "serp-intent-classification")).toBeDefined();
    expect(all.find((m) => m.id === "skyscraper-technique")).toBeDefined();
  });
  it("retrieves by id", () => {
    const m = getMethodology("serp-intent-classification");
    expect(m).toBeDefined();
    expect(m!.title).toBeTruthy();
    expect(m!.body.length).toBeGreaterThan(50);
    expect(m!.source).toContain("Google");
  });
  it("formats as prompt", () => {
    const p = methodologyAsPrompt("eeat-checklist");
    expect(p).toContain("# Methodology:");
    expect(p).toContain("Experience");
  });
  it("throws for unknown id", () => {
    expect(() => methodologyAsPrompt("nope")).toThrow();
  });
});
