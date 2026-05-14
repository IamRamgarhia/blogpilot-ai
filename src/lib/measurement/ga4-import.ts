// Parses a GA4 free-form CSV export with columns: Date, Page path, Sessions, Users, Bounce rate, Avg session duration.

export interface GA4Row {
  date: string;
  url: string;
  organicSessions: number;
  organicUsers: number;
  bounceRate: number;       // 0-1
  avgSessionDurationSec: number;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      out.push(cur); cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export function parseGA4Csv(csv: string): { rows: GA4Row[]; rejected: number } {
  const cleaned = csv.charCodeAt(0) === 0xfeff ? csv.slice(1) : csv;
  const lines = cleaned.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { rows: [], rejected: 0 };

  const header = splitCsvLine(lines[0]).map((c) => c.trim().toLowerCase());
  const idx = (...keys: string[]) => {
    for (const k of keys) {
      const i = header.findIndex((h) => h.includes(k.toLowerCase()));
      if (i >= 0) return i;
    }
    return -1;
  };

  const iDate = idx("date");
  const iUrl = idx("page path", "page", "landing page", "url");
  const iSess = idx("session");
  const iUsers = idx("user");
  const iBr = idx("bounce");
  const iAsd = idx("avg session", "average session", "session duration");

  const rows: GA4Row[] = [];
  let rejected = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const url = (iUrl >= 0 ? cols[iUrl] : "").trim();
    const date = iDate >= 0 ? cols[iDate].trim() : new Date().toISOString().slice(0, 10);
    if (!url) { rejected++; continue; }
    rows.push({
      date,
      url,
      organicSessions: iSess >= 0 ? Number(cols[iSess]) || 0 : 0,
      organicUsers: iUsers >= 0 ? Number(cols[iUsers]) || 0 : 0,
      bounceRate: iBr >= 0 ? Math.min(1, Math.max(0, Number(cols[iBr]) || 0)) : 0,
      avgSessionDurationSec: iAsd >= 0 ? Number(cols[iAsd]) || 0 : 0
    });
  }
  return { rows, rejected };
}
