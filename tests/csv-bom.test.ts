import { describe, it, expect } from "vitest";
import { parseGSCCsv } from "@/lib/measurement/gsc-import";
import { parseGA4Csv } from "@/lib/measurement/ga4-import";

const BOM = "﻿";

describe("CSV BOM handling", () => {
  it("GSC parser strips UTF-8 BOM from header", () => {
    const csv = `${BOM}Date,Page,Clicks,Impressions,Position\n2026-05-01,https://e.com/a,5,100,7.2`;
    const { rows } = parseGSCCsv(csv);
    expect(rows.length).toBe(1);
    expect(rows[0].url).toBe("https://e.com/a");
  });
  it("GA4 parser strips UTF-8 BOM from header", () => {
    const csv = `${BOM}Date,Page path,Sessions,Users,Bounce rate,Avg session duration\n2026-05-01,/x,10,8,0.4,90`;
    const { rows } = parseGA4Csv(csv);
    expect(rows.length).toBe(1);
    expect(rows[0].url).toBe("/x");
  });
});
