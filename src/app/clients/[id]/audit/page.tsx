"use client";
import { useState, use } from "react";
import Link from "next/link";

type Severity = "critical" | "high" | "medium" | "low";

interface Finding {
  id: string;
  url: string;
  severity: Severity;
  category: string;
  message: string;
  fix: string;
  evidence?: string;
}

interface CannibalGroup {
  primary_keyword: string;
  post_titles: string[];
  signal: string;
  severity: string;
}

interface Summary {
  pages_crawled: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const SEVERITY_STYLES: Record<Severity, { dot: string; chip: string; ring: string }> = {
  critical: { dot: "bg-red-500", chip: "bg-red-500/15 text-red-300 border-red-500/30", ring: "ring-red-500/40" },
  high:     { dot: "bg-orange-500", chip: "bg-orange-500/15 text-orange-300 border-orange-500/30", ring: "ring-orange-500/40" },
  medium:   { dot: "bg-yellow-500", chip: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30", ring: "ring-yellow-500/40" },
  low:      { dot: "bg-slate-500", chip: "bg-slate-500/15 text-slate-300 border-slate-500/30", ring: "ring-slate-500/40" }
};

export default function AuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [maxPages, setMaxPages] = useState(50);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [cannibal, setCannibal] = useState<CannibalGroup[]>([]);
  const [filter, setFilter] = useState<Severity | "all">("all");

  async function run() {
    setBusy(true);
    setStatus(`Crawling up to ${maxPages} pages…`);
    setFindings([]);
    setSummary(null);
    setCannibal([]);
    try {
      const r = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientId: id, maxPages, maxDepth: 3 })
      });
      const j = await r.json();
      if (j.ok) {
        setFindings(j.findings ?? []);
        setSummary(j.summary ?? null);
        setCannibal(j.cannibalization ?? []);
        setStatus(`${j.summary.pages_crawled} pages crawled, ${j.findings.length} findings.`);
      } else {
        setStatus("Error: " + (j.error ?? "unknown"));
      }
    } finally {
      setBusy(false);
    }
  }

  const filtered = filter === "all" ? findings : findings.filter((f) => f.severity === filter);

  function exportCsv() {
    const header = ["severity", "category", "id", "url", "message", "fix", "evidence"];
    const rows = findings.map((f) => header.map((k) => csvCell(String((f as unknown as Record<string, string>)[k] ?? ""))));
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-audit-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
            ← Client
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-1">Technical SEO audit</h1>
          <p className="text-sm text-slate-400 mt-1">
            Screaming Frog-style recursive crawl with 25+ deterministic audits. Free, local, no extra APIs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={200}
            value={maxPages}
            onChange={(e) => setMaxPages(Number(e.target.value) || 50)}
            className="w-20 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white text-center"
          />
          <button
            onClick={run}
            disabled={busy}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition"
          >
            {busy ? "Crawling…" : summary ? "Re-run audit" : "Start audit"}
          </button>
          {findings.length > 0 && (
            <button
              onClick={exportCsv}
              className="px-3 py-2.5 text-xs rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
            >
              .csv
            </button>
          )}
        </div>
      </header>

      {status && <p className="text-xs text-slate-400">{status}</p>}

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <SummaryStat n={summary.pages_crawled} label="Pages" tone="slate" onClick={() => setFilter("all")} active={filter === "all"} />
          <SummaryStat n={summary.critical} label="Critical" tone="critical" onClick={() => setFilter("critical")} active={filter === "critical"} />
          <SummaryStat n={summary.high} label="High" tone="high" onClick={() => setFilter("high")} active={filter === "high"} />
          <SummaryStat n={summary.medium} label="Medium" tone="medium" onClick={() => setFilter("medium")} active={filter === "medium"} />
          <SummaryStat n={summary.low} label="Low" tone="low" onClick={() => setFilter("low")} active={filter === "low"} />
        </div>
      )}

      {cannibal.length > 0 && (
        <div className="rounded-2xl border border-orange-800/50 bg-orange-950/20 p-4">
          <h2 className="text-sm font-semibold text-orange-300 mb-2">
            Cannibalization · {cannibal.length} group{cannibal.length === 1 ? "" : "s"}
          </h2>
          <ul className="space-y-2">
            {cannibal.map((g, i) => (
              <li key={i} className="text-xs text-slate-300">
                <span className="text-orange-300 font-mono">{g.primary_keyword}</span>
                <span className="text-slate-500"> · {g.signal} · {g.post_titles.length} posts</span>
                <ul className="ml-4 mt-1 text-slate-400">
                  {g.post_titles.map((t, j) => <li key={j}>· {t}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.slice(0, 200).map((f, i) => {
            const s = SEVERITY_STYLES[f.severity];
            return (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full ${s.dot} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${s.chip}`}>
                        {f.severity}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">{f.category}</span>
                      <span className="text-[10px] font-mono text-slate-600">{f.id}</span>
                    </div>
                    <div className="text-white text-sm mt-1.5">{f.message}</div>
                    <div className="text-xs text-slate-400 mt-1">{f.fix}</div>
                    <a href={f.url} target="_blank" rel="noreferrer noopener" className="text-xs text-blue-400 hover:underline mt-1.5 inline-block truncate max-w-full">
                      {f.url}
                    </a>
                    {f.evidence && (
                      <pre className="text-[10px] text-slate-500 mt-2 bg-slate-900 border border-slate-800 rounded px-2 py-1 overflow-x-auto">
                        {f.evidence.slice(0, 200)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length > 200 && (
            <p className="text-xs text-slate-500 text-center py-2">Showing first 200 of {filtered.length} — export to CSV for all.</p>
          )}
        </div>
      )}
    </section>
  );
}

function csvCell(s: string): string {
  const needs = /[",\n\r]/.test(s);
  const safe = /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
  return needs ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function SummaryStat({
  n,
  label,
  tone,
  onClick,
  active
}: {
  n: number;
  label: string;
  tone: "slate" | "critical" | "high" | "medium" | "low";
  onClick: () => void;
  active: boolean;
}) {
  const styles = tone === "slate"
    ? "border-slate-700 text-slate-300"
    : tone === "critical"
      ? "border-red-500/30 text-red-300"
      : tone === "high"
        ? "border-orange-500/30 text-orange-300"
        : tone === "medium"
          ? "border-yellow-500/30 text-yellow-300"
          : "border-slate-500/30 text-slate-400";
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-slate-900/40 px-4 py-3 text-left transition hover:bg-slate-900/60 ${styles} ${active ? "ring-2 ring-blue-500/60" : ""}`}
    >
      <div className="text-3xl font-semibold leading-none">{n}</div>
      <div className="text-xs uppercase tracking-wider mt-1 opacity-80">{label}</div>
    </button>
  );
}
