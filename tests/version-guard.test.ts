import { describe, it, expect } from "vitest";
import { checkNodeVersion } from "@/lib/version-guard";

describe("checkNodeVersion", () => {
  it("accepts node 18.17", () => {
    expect(checkNodeVersion("18.17.0").ok).toBe(true);
  });
  it("accepts node 22", () => {
    expect(checkNodeVersion("22.0.0").ok).toBe(true);
  });
  it("accepts node 24", () => {
    expect(checkNodeVersion("24.15.0").ok).toBe(true);
  });
  it("rejects node 16", () => {
    const r = checkNodeVersion("16.20.0");
    expect(r.ok).toBe(false);
    expect(r.message).toContain("18");
  });
  it("rejects node 18.10 (below minor)", () => {
    const r = checkNodeVersion("18.10.0");
    expect(r.ok).toBe(false);
  });
  it("rejects malformed input", () => {
    expect(checkNodeVersion("hello").ok).toBe(false);
  });
});
