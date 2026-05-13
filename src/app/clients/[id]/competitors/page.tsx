"use client";
import { useState, use } from "react";
import Link from "next/link";

interface Gap {
  topic: string;
  competitor_count: number;
  status: string;
  priority: number;
  suggested_post_title: string;
  rationale: string;
}

interface ScanResult {
  competitorUrl: string;
  posts: Array<{ url: string; title: string }>;
  inferredClusters: Array<{ name: string; posts: string[] }>;
}

export default function CompetitorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [keyword, setKeyword] = useState("");
  const [compUrl, setCompUrl] = useState("");
  const [gaps, setGaps] = useState<Gap[] | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [busyG, setBusyG] = useState(false);
  const [busyS, setBusyS] = useState(false);

  async function runGap(e: React.FormEvent) {
    e.preventDefault();
    setBusyG(true);
    setGaps(null);
    try {
      const r = await fetch("/api/gap-analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientId: id, keyword })
      });
      const j = await r.json();
      setGaps(j.gaps ?? []);
    } finally {
      setBusyG(false);
    }
  }

  async function runScan(e: React.FormEvent) {
    e.preventDefault();
    setBusyS(true);
    setScan(null);
    try {
      const r = await fetch("/api/competitor-scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: compUrl })
      });
      const j = await r.json();
      setScan(j);
    } finally {
      setBusyS(false);
    }
  }

  return (
    <section className="space-y-8">
      <header>
        <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
          ← Client
        </Link>
        <h1 className="text-2xl font-semibold text-white mt-1">Competitor intelligence</h1>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Content gap analyzer</h2>
          <p className="text-xs text-slate-500">
            Scrapes top SERP results, parses their headings, returns topics your client is missing.
          </p>
          <form onSubmit={runGap} className="flex gap-2">
            <input
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="target keyword"
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
            />
            <button
              disabled={busyG || !keyword}
              className="px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 disabled:opacity-50"
            >
              {busyG ? "Analyzing…" : "Analyze"}
            </button>
          </form>
          {gaps && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              {gaps.length === 0 ? (
                <p className="p-4 text-xs text-slate-500">No gaps detected.</p>
              ) : (
                <ul className="divide-y divide-slate-800">
                  {gaps.map((g, i) => (
                    <li key={i} className="p-3">
                      <div className="flex justify-between gap-2">
                        <span className="text-sm text-white">{g.suggested_post_title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          P{g.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{g.rationale}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Competitor blog scanner</h2>
          <p className="text-xs text-slate-500">
            Crawls competitor sitemap or /blog, returns their post inventory and inferred clusters.
          </p>
          <form onSubmit={runScan} className="flex gap-2">
            <input
              required
              value={compUrl}
              onChange={(e) => setCompUrl(e.target.value)}
              placeholder="https://competitor.com"
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
            />
            <button
              disabled={busyS || !compUrl}
              className="px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 disabled:opacity-50"
            >
              {busyS ? "Scanning…" : "Scan"}
            </button>
          </form>
          {scan && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <p className="text-xs text-slate-400 mb-2">
                {scan.posts.length} posts · {scan.inferredClusters.length} clusters detected
              </p>
              <details>
                <summary className="text-xs text-slate-300 cursor-pointer">
                  Clusters
                </summary>
                <ul className="mt-2 space-y-2">
                  {scan.inferredClusters.map((c) => (
                    <li key={c.name} className="text-xs">
                      <span className="text-white">{c.name}</span>
                      <span className="text-slate-500"> · {c.posts.length} posts</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
