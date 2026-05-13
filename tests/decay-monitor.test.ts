import { describe, it, expect } from "vitest";
import { detectDecay, type GSCRow } from "@/lib/measurement/decay-monitor";

function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

describe("detectDecay", () => {
  it("returns empty for empty input", () => {
    expect(detectDecay([])).toEqual([]);
  });

  it("flags large impressions drop", () => {
    const rows: GSCRow[] = [];
    // previous 4 weeks: 1000 impressions/day per url
    for (let i = 35; i < 56; i++) {
      rows.push({ date: dayOffset(i), url: "https://e.com/p", clicks: 50, impressions: 1000, position: 5 });
    }
    // current 4 weeks: 500 impressions/day (50% drop)
    for (let i = 5; i < 26; i++) {
      rows.push({ date: dayOffset(i), url: "https://e.com/p", clicks: 25, impressions: 500, position: 5 });
    }
    const alerts = detectDecay(rows);
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    const a = alerts.find((x) => x.url === "https://e.com/p");
    expect(a).toBeDefined();
    expect(a!.severity).toBe("high");
  });

  it("flags critical position drop > 10", () => {
    const rows: GSCRow[] = [];
    for (let i = 35; i < 56; i++) {
      rows.push({ date: dayOffset(i), url: "https://e.com/q", clicks: 10, impressions: 200, position: 3 });
    }
    for (let i = 5; i < 26; i++) {
      rows.push({ date: dayOffset(i), url: "https://e.com/q", clicks: 5, impressions: 200, position: 20 });
    }
    const alerts = detectDecay(rows);
    const a = alerts.find((x) => x.url === "https://e.com/q");
    expect(a).toBeDefined();
    expect(a!.severity).toBe("critical");
    expect(a!.recommended_action).toBe("rewrite");
  });

  it("does not flag stable urls", () => {
    const rows: GSCRow[] = [];
    for (let i = 5; i < 56; i++) {
      rows.push({ date: dayOffset(i), url: "https://e.com/stable", clicks: 100, impressions: 1000, position: 4 });
    }
    expect(detectDecay(rows)).toEqual([]);
  });

  it("requires minimum sample size", () => {
    const rows: GSCRow[] = [
      { date: dayOffset(40), url: "https://e.com/short", clicks: 1, impressions: 100, position: 5 },
      { date: dayOffset(10), url: "https://e.com/short", clicks: 0, impressions: 1, position: 50 }
    ];
    expect(detectDecay(rows)).toEqual([]);
  });
});
