export interface PageSpeedResult {
  lcpMs?: number;
  clsScore?: number;
  inpMs?: number;
  performance?: number;
}

export async function pageSpeed(url: string): Promise<PageSpeedResult> {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=mobile`;
  try {
    const r = await fetch(api);
    if (!r.ok) return {};
    const j = (await r.json()) as {
      lighthouseResult?: {
        audits?: Record<string, { numericValue?: number }>;
        categories?: { performance?: { score?: number } };
      };
      loadingExperience?: {
        metrics?: Record<string, { percentile?: number }>;
      };
    };
    const audits = j.lighthouseResult?.audits ?? {};
    const cwv = j.loadingExperience?.metrics ?? {};
    return {
      lcpMs:
        audits["largest-contentful-paint"]?.numericValue ??
        cwv.LARGEST_CONTENTFUL_PAINT_MS?.percentile,
      clsScore:
        audits["cumulative-layout-shift"]?.numericValue ??
        cwv.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile,
      inpMs: cwv.INTERACTION_TO_NEXT_PAINT?.percentile,
      performance: (j.lighthouseResult?.categories?.performance?.score ?? 0) * 100
    };
  } catch {
    return {};
  }
}
