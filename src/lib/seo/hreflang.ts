import { isValidLanguageCode } from "@/lib/i18n/languages";

export interface HreflangVariant {
  lang: string;     // BCP 47 code OR "x-default"
  url: string;      // absolute URL
}

export interface HreflangValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function validateHreflangSet(variants: HreflangVariant[]): HreflangValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (variants.length < 2) {
    errors.push("Hreflang set must contain at least 2 variants (a translation set of one is not a set).");
  }

  const seenLangs = new Set<string>();
  let xDefaultCount = 0;
  for (const v of variants) {
    if (!isValidLanguageCode(v.lang)) {
      errors.push(`Invalid BCP 47 code: ${v.lang}`);
    }
    if (v.lang === "x-default") xDefaultCount++;
    if (seenLangs.has(v.lang)) {
      errors.push(`Duplicate language code in set: ${v.lang}`);
    }
    seenLangs.add(v.lang);
    if (!/^https?:\/\//i.test(v.url)) {
      errors.push(`URL must be absolute: ${v.url}`);
    }
  }
  if (xDefaultCount > 1) errors.push("Only one x-default allowed per set.");
  if (xDefaultCount === 0) warnings.push("Consider adding an x-default fallback variant.");

  return { ok: errors.length === 0, errors, warnings };
}

export function buildHreflangTags(variants: HreflangVariant[]): string {
  return variants
    .map((v) => `<link rel="alternate" hreflang="${v.lang}" href="${v.url}">`)
    .join("\n");
}

export function buildHreflangSitemapBlock(variants: HreflangVariant[]): string {
  // Returns inner <xhtml:link> elements for a sitemap <url> entry.
  return variants
    .map(
      (v) => `<xhtml:link rel="alternate" hreflang="${v.lang}" href="${v.url}"/>`
    )
    .join("\n");
}

export function ensureReturnTags(setsByUrl: Map<string, HreflangVariant[]>): { ok: boolean; missing: Array<{ from: string; to: string }> } {
  const missing: Array<{ from: string; to: string }> = [];
  for (const [pageUrl, variants] of setsByUrl) {
    const langs = new Set(variants.map((v) => v.lang));
    for (const v of variants) {
      if (v.url === pageUrl) continue;
      const reverse = setsByUrl.get(v.url);
      if (!reverse) {
        missing.push({ from: pageUrl, to: v.url });
        continue;
      }
      const reverseLangs = new Set(reverse.map((x) => x.lang));
      for (const l of langs) {
        if (!reverseLangs.has(l)) {
          missing.push({ from: v.url, to: pageUrl });
          break;
        }
      }
    }
  }
  return { ok: missing.length === 0, missing };
}
