import { describe, it, expect } from "vitest";
import { parseGSCCsv } from "@/lib/measurement/gsc-import";

describe("parseGSCCsv", () => {
  it("parses standard GSC Pages export", () => {
    const csv = `Date,Page,Clicks,Impressions,Position
2026-05-01,https://e.com/a,5,100,7.2
2026-05-02,https://e.com/a,8,120,6.5
2026-05-01,https://e.com/b,2,40,15.3
`;
    const { rows, rejected } = parseGSCCsv(csv);
    expect(rows.length).toBe(3);
    expect(rejected).toBe(0);
    expect(rows[0].url).toBe("https://e.com/a");
    expect(rows[0].clicks).toBe(5);
    expect(rows[0].position).toBe(7.2);
  });

  it("handles quoted fields", () => {
    const csv = `Date,Page,Clicks,Impressions,Position
2026-05-01,"https://e.com/path, with comma",10,200,5.0`;
    const { rows } = parseGSCCsv(csv);
    expect(rows.length).toBe(1);
    expect(rows[0].url).toBe("https://e.com/path, with comma");
  });

  it("rejects rows missing url", () => {
    const csv = `Date,Page,Clicks,Impressions,Position
2026-05-01,,10,200,5.0
2026-05-02,https://e.com/b,3,50,8.0`;
    const { rows, rejected } = parseGSCCsv(csv);
    expect(rows.length).toBe(1);
    expect(rejected).toBe(1);
  });

  it("handles empty input", () => {
    expect(parseGSCCsv("")).toEqual({ rows: [], rejected: 0 });
  });
});
