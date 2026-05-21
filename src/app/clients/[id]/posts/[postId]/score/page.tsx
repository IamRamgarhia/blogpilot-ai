"use client";
import { useEffect, useState, use, useRef, useCallback } from "react";
import Link from "next/link";

interface CorpusPage {
  url: string;
  title: string;
  headings: string[];
  body: string;
  wordCount: number;
  fetched: boolean;
}

interface Corpus {
  pages: CorpusPage[];
  paaQuestions: string[];
}

interface TermCoverage {
  term: string;
  in_competitors: number;
  in_draft: number;
  status: string;
}

interface Report {
  score: number;
  grade: string;
  breakdown: {
    required_terms: { points: number; max: number; covered: number; total: number };
    recommended_terms: { points: number; max: number; covered: number; total: number };
    word_count: { points: number; max: number; actual: number; median: number };
    headings: { points: number; max: number; covered: number; total: number };
    questions: { points: number; max: number; covered: number; total: number };
  };
  required: TermCoverage[];
  recommended: TermCoverage[];
  over_optimized: Array<{ term: string; draft_count: number; median_count: number }>;
  competitor_count: number;
  serp_median_words: number;
}

export default function ScorePage({ params }: { params: Promise<{ id: string; postId: string }> }) {
  const { id, postId } = use(params);
  const [keyword, setKeyword] = useState("");
  const [draft, setDraft] = useState("");
  const [corpus, setCorpus] = useState<Corpus | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loadingCorpus, setLoadingCorpus] = useState(false);
  const [status, setStatus] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/posts/${postId}`);
      if (r.ok) {
        const { post } = (await r.json()) as { post: { primaryKeyword: string | null; draftMarkdown: string | null } };
        setKeyword(post.primaryKeyword ?? "");
        setDraft(post.draftMarkdown ?? "");
      }
    })();
  }, [postId]);

  const score = useCallback(async () => {
    if (!corpus || !draft) return;
    const headings = (draft.match(/^##\s+(.+)$/gm) ?? []).map((h) => h.replace(/^##\s+/, ""));
    const r = await fetch("/api/content-score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "score", draft, headings, corpus })
    });
    const j = await r.json();
    if (j.ok) setReport(j.report);
  }, [corpus, draft]);

  useEffect(() => {
    if (!corpus) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void score(); }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [draft, corpus, score]);

  async function loadCorpus() {
    if (!keyword) return;
    setLoadingCorpus(true);
    setStatus("Scraping top-10 SERP pages (15-30s)…");
    try {
      const r = await fetch("/api/content-score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "corpus", keyword })
      });
      const j = await r.json();
      if (j.ok) {
        setCorpus({ pages: j.pages, paaQuestions: j.paaQuestions });
        setStatus(`Corpus ready: ${j.pages.filter((p: CorpusPage) => p.fetched).length} pages fetched.`);
      } else {
        setStatus("Error: " + (j.error ?? "unknown"));
      }
    } finally {
      setLoadingCorpus(false);
    }
  }

  const gradeColor = report ? gradeToColor(report.grade) : "text-slate-400";
  const gradeBg = report ? gradeToBg(report.grade) : "bg-slate-800";

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href={`/clients/${id}/posts/${postId}/draft`} className="text-xs text-slate-500 hover:text-slate-300">
            ← Draft
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-1">Content Score</h1>
          <p className="text-slate-400 text-sm mt-1">
            Live grading against the top-10 SERP. Pure local TF-IDF — no AI cost.
          </p>
        </div>
        {report && (
          <div className={`${gradeBg} rounded-2xl px-6 py-4 text-center`}>
            <div className={`text-5xl font-bold ${gradeColor} leading-none`}>{report.grade}</div>
            <div className="text-xs text-slate-300 mt-1">{report.score} / 100</div>
          </div>
        )}
      </header>

      <div className="flex gap-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Target keyword"
          className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 outline-none transition"
        />
        <button
          onClick={loadCorpus}
          disabled={loadingCorpus || !keyword}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 transition shadow-lg shadow-blue-500/20"
        >
          {loadingCorpus ? "Scraping…" : corpus ? "Refresh SERP" : "Load SERP corpus"}
        </button>
      </div>
      {status && <p className="text-xs text-slate-400">{status}</p>}

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste or type your draft here. Score updates as you type."
            className="w-full h-[600px] rounded-2xl bg-slate-900/60 border border-slate-800 px-5 py-4 text-sm text-slate-100 font-mono focus:border-blue-500 outline-none transition leading-relaxed"
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!corpus && (
            <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-sm text-slate-500 text-center">
              Click <span className="text-slate-300">Load SERP corpus</span> to start scoring.
            </div>
          )}

          {report && (
            <>
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4 space-y-3">
                <h2 className="text-xs uppercase tracking-wider text-slate-500">Breakdown</h2>
                <ScoreBar label="Required terms" {...report.breakdown.required_terms} />
                <ScoreBar label="Recommended terms" {...report.breakdown.recommended_terms} />
                <ScoreBar label="Word count" points={report.breakdown.word_count.points} max={report.breakdown.word_count.max} sub={`${report.breakdown.word_count.actual} / median ${report.breakdown.word_count.median}`} />
                <ScoreBar label="Heading parity" {...report.breakdown.headings} />
                <ScoreBar label="PAA coverage" {...report.breakdown.questions} />
              </div>

              {report.over_optimized.length > 0 && (
                <div className="rounded-2xl border border-orange-800/60 bg-orange-950/20 p-4">
                  <h2 className="text-xs uppercase tracking-wider text-orange-300 mb-2">Over-optimized</h2>
                  <ul className="text-xs text-orange-200 space-y-1">
                    {report.over_optimized.slice(0, 5).map((o) => (
                      <li key={o.term}>
                        <span className="font-mono">{o.term}</span>
                        <span className="text-slate-400"> · {o.draft_count}x vs median {o.median_count}x</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <TermSection title="Required" items={report.required} accent="lime" />
              <TermSection title="Recommended" items={report.recommended} accent="blue" />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ScoreBar({ label, points, max, covered, total, sub }: { label: string; points: number; max: number; covered?: number; total?: number; sub?: string }) {
  const pct = Math.min(100, Math.round((points / max) * 100));
  const color = pct >= 80 ? "from-lime-400 to-green-500" : pct >= 50 ? "from-yellow-400 to-orange-500" : "from-red-400 to-red-600";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500 font-mono">
          {sub ?? (covered != null && total != null ? `${covered}/${total}` : "")}
          <span className="text-slate-300 ml-2">{points}/{max}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function TermSection({ title, items, accent }: { title: string; items: TermCoverage[]; accent: "lime" | "blue" }) {
  if (items.length === 0) return null;
  const tone = accent === "lime"
    ? { ok: "bg-lime-500/20 text-lime-300 border-lime-500/30", missing: "bg-slate-800 text-slate-500 border-slate-700" }
    : { ok: "bg-blue-500/20 text-blue-300 border-blue-500/30", missing: "bg-slate-800 text-slate-500 border-slate-700" };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">{title} terms</h2>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 30).map((t) => (
          <span
            key={t.term}
            className={
              "text-xs px-2 py-0.5 rounded-full border " +
              (t.in_draft > 0 ? tone.ok : tone.missing)
            }
            title={`${t.in_draft} in draft · ${t.in_competitors} in competitors`}
          >
            {t.term}
            <span className="opacity-50 ml-1 text-[10px]">{t.in_draft}/{t.in_competitors}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function gradeToColor(g: string): string {
  if (g === "A") return "text-lime-400";
  if (g === "B") return "text-green-400";
  if (g === "C") return "text-yellow-400";
  if (g === "D") return "text-orange-400";
  return "text-red-400";
}
function gradeToBg(g: string): string {
  if (g === "A") return "bg-lime-500/10 border border-lime-500/30";
  if (g === "B") return "bg-green-500/10 border border-green-500/30";
  if (g === "C") return "bg-yellow-500/10 border border-yellow-500/30";
  if (g === "D") return "bg-orange-500/10 border border-orange-500/30";
  return "bg-red-500/10 border border-red-500/30";
}
