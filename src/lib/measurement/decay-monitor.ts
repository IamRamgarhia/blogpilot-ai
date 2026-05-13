export interface GSCRow {
  date: string;     // ISO date YYYY-MM-DD
  url: string;
  clicks: number;
  impressions: number;
  position: number | null;
}

export type DecaySignal = "impressions_drop" | "clicks_drop" | "position_drop" | "combined";
export type DecaySeverity = "low" | "medium" | "high" | "critical";

export interface DecayAlert {
  url: string;
  signal: DecaySignal;
  severity: DecaySeverity;
  current_value: number;
  previous_value: number;
  percent_change: number;
  recommended_action: "refresh" | "rewrite" | "redirect" | "monitor";
  detail: string;
}

interface PerUrlAgg {
  clicks: { current: number; previous: number };
  impressions: { current: number; previous: number };
  position: { current: number | null; previous: number | null };
  sampleCurrent: number;
  samplePrevious: number;
}

function avgPosition(rows: GSCRow[]): number | null {
  const ps = rows.map((r) => r.position).filter((p): p is number => typeof p === "number");
  if (ps.length === 0) return null;
  return ps.reduce((a, b) => a + b, 0) / ps.length;
}

function pct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function detectDecay(rows: GSCRow[], now = new Date()): DecayAlert[] {
  if (rows.length === 0) return [];

  const dayMs = 86_400_000;
  const cutCurrent = now.getTime() - 28 * dayMs;
  const cutPrevious = now.getTime() - 56 * dayMs;

  const groups = new Map<string, PerUrlAgg>();
  for (const r of rows) {
    const t = new Date(r.date).getTime();
    if (Number.isNaN(t)) continue;
    if (t < cutPrevious) continue;
    const bucket = t >= cutCurrent ? "current" : "previous";
    if (!groups.has(r.url)) {
      groups.set(r.url, {
        clicks: { current: 0, previous: 0 },
        impressions: { current: 0, previous: 0 },
        position: { current: null, previous: null },
        sampleCurrent: 0,
        samplePrevious: 0
      });
    }
    const g = groups.get(r.url)!;
    g.clicks[bucket] += r.clicks;
    g.impressions[bucket] += r.impressions;
    if (bucket === "current") g.sampleCurrent++;
    else g.samplePrevious++;
  }

  // Compute avg positions per url, per bucket
  const positionByUrl = new Map<string, { current: number | null; previous: number | null }>();
  const byUrl = new Map<string, { current: GSCRow[]; previous: GSCRow[] }>();
  for (const r of rows) {
    const t = new Date(r.date).getTime();
    if (Number.isNaN(t) || t < cutPrevious) continue;
    const bucket = t >= cutCurrent ? "current" : "previous";
    if (!byUrl.has(r.url)) byUrl.set(r.url, { current: [], previous: [] });
    byUrl.get(r.url)![bucket].push(r);
  }
  for (const [url, b] of byUrl) {
    positionByUrl.set(url, { current: avgPosition(b.current), previous: avgPosition(b.previous) });
  }

  const alerts: DecayAlert[] = [];

  for (const [url, g] of groups) {
    if (g.sampleCurrent < 3 || g.samplePrevious < 3) continue; // need enough data

    const impPct = pct(g.impressions.current, g.impressions.previous);
    const clkPct = pct(g.clicks.current, g.clicks.previous);
    const pos = positionByUrl.get(url) ?? { current: null, previous: null };
    const posDelta =
      pos.current != null && pos.previous != null ? pos.current - pos.previous : 0;

    // Critical: huge position drop
    if (posDelta > 10) {
      alerts.push({
        url,
        signal: "position_drop",
        severity: "critical",
        current_value: pos.current ?? 0,
        previous_value: pos.previous ?? 0,
        percent_change: posDelta,
        recommended_action: "rewrite",
        detail: `Avg position dropped ${posDelta.toFixed(1)} places. Likely query intent shift.`
      });
      continue;
    }

    // High: combined position + impressions
    if (posDelta > 3 && impPct < -15) {
      alerts.push({
        url,
        signal: "combined",
        severity: "high",
        current_value: g.impressions.current,
        previous_value: g.impressions.previous,
        percent_change: impPct,
        recommended_action: "refresh",
        detail: `Impressions ${impPct.toFixed(1)}% AND position dropped ${posDelta.toFixed(1)} places.`
      });
      continue;
    }

    if (impPct < -30) {
      alerts.push({
        url,
        signal: "impressions_drop",
        severity: "high",
        current_value: g.impressions.current,
        previous_value: g.impressions.previous,
        percent_change: impPct,
        recommended_action: "refresh",
        detail: `Impressions down ${Math.abs(impPct).toFixed(1)}% (4-week vs prior 4-week).`
      });
      continue;
    }

    if (clkPct < -25 && impPct > -10) {
      alerts.push({
        url,
        signal: "clicks_drop",
        severity: "high",
        current_value: g.clicks.current,
        previous_value: g.clicks.previous,
        percent_change: clkPct,
        recommended_action: "rewrite",
        detail: `Clicks down ${Math.abs(clkPct).toFixed(1)}% with stable impressions — likely CTR / title issue.`
      });
      continue;
    }

    if (posDelta > 5) {
      alerts.push({
        url,
        signal: "position_drop",
        severity: "medium",
        current_value: pos.current ?? 0,
        previous_value: pos.previous ?? 0,
        percent_change: posDelta,
        recommended_action: "refresh",
        detail: `Avg position dropped ${posDelta.toFixed(1)} places.`
      });
    }
  }

  return alerts;
}
