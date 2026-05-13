import { describe, it, expect } from "vitest";
import { validateHreflangSet, buildHreflangTags, ensureReturnTags } from "@/lib/seo/hreflang";
import { isValidLanguageCode } from "@/lib/i18n/languages";

describe("validateHreflangSet", () => {
  it("rejects single variant", () => {
    const r = validateHreflangSet([{ lang: "en", url: "https://e.com/" }]);
    expect(r.ok).toBe(false);
  });
  it("accepts valid set with x-default", () => {
    const r = validateHreflangSet([
      { lang: "en", url: "https://e.com/" },
      { lang: "fr", url: "https://e.com/fr/" },
      { lang: "x-default", url: "https://e.com/" }
    ]);
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
  });
  it("flags invalid BCP 47", () => {
    const r = validateHreflangSet([
      { lang: "EN_US", url: "https://e.com/" },
      { lang: "fr", url: "https://e.com/fr/" }
    ]);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes("BCP 47"))).toBe(true);
  });
  it("flags non-absolute URL", () => {
    const r = validateHreflangSet([
      { lang: "en", url: "/page" },
      { lang: "fr", url: "https://e.com/fr" }
    ]);
    expect(r.ok).toBe(false);
  });
  it("flags duplicate lang code", () => {
    const r = validateHreflangSet([
      { lang: "en", url: "https://e.com/" },
      { lang: "en", url: "https://e.com/v2" }
    ]);
    expect(r.ok).toBe(false);
  });
  it("warns when no x-default", () => {
    const r = validateHreflangSet([
      { lang: "en", url: "https://e.com/" },
      { lang: "fr", url: "https://e.com/fr/" }
    ]);
    expect(r.ok).toBe(true);
    expect(r.warnings.some((w) => w.includes("x-default"))).toBe(true);
  });
});

describe("buildHreflangTags", () => {
  it("emits correct HTML link tags", () => {
    const tags = buildHreflangTags([
      { lang: "en", url: "https://e.com/" },
      { lang: "fr", url: "https://e.com/fr/" }
    ]);
    expect(tags).toContain('hreflang="en"');
    expect(tags).toContain('hreflang="fr"');
    expect(tags).toContain('href="https://e.com/fr/"');
  });
});

describe("isValidLanguageCode", () => {
  it("accepts plain language codes", () => {
    expect(isValidLanguageCode("en")).toBe(true);
    expect(isValidLanguageCode("fr")).toBe(true);
  });
  it("accepts region variants", () => {
    expect(isValidLanguageCode("en-US")).toBe(true);
    expect(isValidLanguageCode("zh-Hans")).toBe(true);
  });
  it("rejects malformed codes", () => {
    expect(isValidLanguageCode("EN")).toBe(false);
    expect(isValidLanguageCode("en_US")).toBe(false);
    expect(isValidLanguageCode("english")).toBe(false);
  });
});

describe("ensureReturnTags", () => {
  it("flags missing return tag", () => {
    const sets = new Map<string, Array<{ lang: string; url: string }>>();
    sets.set("https://e.com/", [
      { lang: "en", url: "https://e.com/" },
      { lang: "fr", url: "https://e.com/fr/" }
    ]);
    // Missing entry for https://e.com/fr/
    const r = ensureReturnTags(sets);
    expect(r.ok).toBe(false);
    expect(r.missing.length).toBeGreaterThan(0);
  });
});
