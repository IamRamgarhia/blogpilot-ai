import { describe, it, expect } from "vitest";
import { newShareToken, isExpired, defaultExpiry } from "@/lib/portal";

describe("portal", () => {
  it("newShareToken returns url-safe string", () => {
    const t = newShareToken();
    expect(t.length).toBeGreaterThanOrEqual(30);
    expect(/^[A-Za-z0-9_-]+$/.test(t)).toBe(true);
  });
  it("two tokens are different", () => {
    expect(newShareToken()).not.toBe(newShareToken());
  });
  it("isExpired false when no expiry set", () => {
    expect(isExpired(null)).toBe(false);
    expect(isExpired(undefined)).toBe(false);
  });
  it("isExpired true for past timestamp", () => {
    expect(isExpired(Math.floor(Date.now() / 1000) - 60)).toBe(true);
  });
  it("isExpired false for future timestamp", () => {
    expect(isExpired(Math.floor(Date.now() / 1000) + 60)).toBe(false);
  });
  it("defaultExpiry returns timestamp ~30 days out", () => {
    const now = Math.floor(Date.now() / 1000);
    const exp = defaultExpiry(30);
    expect(exp - now).toBeGreaterThan(29 * 86400);
    expect(exp - now).toBeLessThan(31 * 86400);
  });
});
