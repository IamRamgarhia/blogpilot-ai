"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Alert {
  url: string;
  signal: string;
  severity: string;
  recommended_action: string;
  detail: string;
}

interface RecommendItem {
  postId: string | null;
  title: string;
  score: number;
  signals: string[];
  rationale: string;
}

export default function MeasurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommend, setRecommend] = useState<RecommendItem[]>([]);
  const [gscCsv, setGscCsv] = useState("");
  const [ga4Csv, setGa4Csv] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [da, rc] = await Promise.all([
      fetch(`/api/decay/${id}`).then((r) => r.json()),
      fetch(`/api/recommend-next/${id}`).then((r) => r.json())
    ]);
    setAlerts(da.alerts ?? []);
    setRecommend(rc.items ?? []);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function importGsc() {
    setBusy("gsc");
    setStatus("Importing GSC CSV…");
    const r = await fetch("/api/gsc-import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientId: id, csv: gscCsv })
    });
    const j = await r.json();
    setStatus(j.ok ? `Imported ${j.imported} rows (${j.rejected} rejected).` : `Error: ${j.error}`);
    setGscCsv("");
    await load();
    setBusy(null);
  }

  async function importGa4() {
    setBusy("ga4");
    setStatus("Importing GA4 CSV…");
    const r = await fetch("/api/ga4-import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientId: id, csv: ga4Csv })
    });
    const j = await r.json();
    setStatus(j.ok ? `Imported ${j.imported} rows (${j.rejected} rejected).` : `Error: ${j.error}`);
    setGa4Csv("");
    setBusy(null);
  }

  return (
    <section className="space-y-8">
      <header>
        <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
          ← Client
        </Link>
        <h1 className="text-2xl font-semibold text-white mt-1">Measurement</h1>
        <p className="text-slate-400 text-sm mt-1">
          Import GSC + GA4 CSVs (no OAuth needed). Rank tracker runs free against Bing + DuckDuckGo.
        </p>
      </header>

      {status && <p className="text-xs text-slate-400">{status}</p>}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">Search Console import</h2>
          <p className="text-xs text-slate-400">
            Paste GSC Pages or Queries CSV. Required columns: Date, Page or URL, Clicks, Impressions, Position.
          </p>
          <textarea
            value={gscCsv}
            onChange={(e) => setGscCsv(e.target.value)}
            placeholder="Paste GSC CSV..."
            className="w-full h-32 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono text-slate-200 focus:border-blue-500 outline-none"
          />
          <button
            onClick={importGsc}
            disabled={busy === "gsc" || !gscCsv}
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-50"
          >
            {busy === "gsc" ? "Importing…" : "Import GSC"}
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">GA4 import</h2>
          <p className="text-xs text-slate-400">
            Paste GA4 CSV. Columns: Date, Page path, Sessions, Users, Bounce rate, Avg session duration.
          </p>
          <textarea
            value={ga4Csv}
            onChange={(e) => setGa4Csv(e.target.value)}
            placeholder="Paste GA4 CSV..."
            className="w-full h-32 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono text-slate-200 focus:border-blue-500 outline-none"
          />
          <button
            onClick={importGa4}
            disabled={busy === "ga4" || !ga4Csv}
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-50"
          >
            {busy === "ga4" ? "Importing…" : "Import GA4"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-white mb-3">
          Decay alerts · {alerts.length}
        </h2>
        {alerts.length === 0 ? (
          <p className="text-xs text-slate-500">
            No decay detected. Import 8+ weeks of GSC data to enable comparison.
          </p>
        ) : (
          <ul className="space-y-2">
            {alerts.slice(0, 20).map((a, i) => (
              <li key={i} className="text-xs border border-slate-800 rounded-lg p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white truncate">{a.url}</span>
                  <span
                    className={
                      "text-[10px] px-1.5 py-0.5 rounded " +
                      (a.severity === "critical"
                        ? "bg-red-500/30 text-red-300"
                        : a.severity === "high"
                          ? "bg-orange-500/30 text-orange-300"
                          : "bg-yellow-500/30 text-yellow-300")
                    }
                  >
                    {a.severity}
                  </span>
                </div>
                <p className="text-slate-400 mt-1">{a.detail}</p>
                <p className="text-slate-500 mt-1">
                  Recommended: <span className="text-slate-300">{a.recommended_action}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-white mb-3">
          What to write next · top {recommend.length}
        </h2>
        {recommend.length === 0 ? (
          <p className="text-xs text-slate-500">No backlog yet.</p>
        ) : (
          <ol className="space-y-2">
            {recommend.map((r, i) => (
              <li key={i} className="text-xs border border-slate-800 rounded-lg p-2 flex items-start gap-3">
                <span className="text-slate-500 font-mono">#{i + 1}</span>
                <span className="text-lime-400 font-mono w-10">{r.score}</span>
                <div className="flex-1">
                  <div className="text-white">{r.title}</div>
                  <div className="text-slate-500 mt-0.5">{r.rationale}</div>
                  <div className="flex gap-1 mt-1">
                    {r.signals.map((s) => (
                      <span key={s} className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-400">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {r.postId && (
                  <Link
                    href={`/clients/${id}/posts/${r.postId}/draft`}
                    className="text-blue-400 hover:underline"
                  >
                    open →
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
