// Parses Google Search Console "Pages" or "Queries" CSV exports.
// Both formats supported. Header detection is column-name based.

import type { GSCRow } from "./decay-monitor";

interface ParsedCsv {
  rows: GSCRow[];
  rejected: number;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === "," && !inQuote) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseGSCCsv(csv: string, fallbackUrlForQueriesExport = ""): ParsedCsv {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { rows: [], rejected: 0 };

  const header = splitCsvLine(lines[0]).map((c) => c.trim().toLowerCase());
  const idx = (...keys: string[]) => {
    for (const k of keys) {
      const i = header.indexOf(k.toLowerCase());
      if (i >= 0) return i;
    }
    return -1;
  };

  const iDate = idx("date");
  const iUrl = idx("page", "url", "top pages", "landing page");
  const iQuery = idx("query", "queries");
  const iClicks = idx("clicks");
  const iImpr = idx("impressions");
  const iPos = idx("position", "average position", "avg position");

  const rows: GSCRow[] = [];
  let rejected = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const url = (iUrl >= 0 ? cols[iUrl] : fallbackUrlForQueriesExport).trim();
    const date = iDate >= 0 ? cols[iDate].trim() : new Date().toISOString().slice(0, 10);
    const clicks = iClicks >= 0 ? Number(cols[iClicks]) : 0;
    const impr = iImpr >= 0 ? Number(cols[iImpr]) : 0;
    const pos = iPos >= 0 ? Number(cols[iPos]) : null;

    if (!url || Number.isNaN(clicks) || Number.isNaN(impr)) {
      rejected++;
      continue;
    }
    rows.push({
      date,
      url,
      clicks,
      impressions: impr,
      position: pos != null && !Number.isNaN(pos) ? pos : null
    });
  }
  return { rows, rejected };
}
