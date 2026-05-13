"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Suggestion {
  keyword: string;
  source: string;
  intent: {
    intent: string;
    sub_intent: string;
    recommended_format: string;
    confidence: number;
  };
}

export default function ResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [seed, setSeed] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [serp, setSerp] = useState<Array<{ position: number; title: string; url: string }>>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [calBusy, setCalBusy] = useState(false);

  async function runResearch(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResults([]);
    setPicked(new Set());
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seed })
      });
      const j = await res.json();
      setResults(j.suggested ?? []);
      setSerp(j.serpTop10 ?? []);
    } finally {
      setBusy(false);
    }
  }

  function toggle(kw: string) {
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(kw)) n.delete(kw);
      else n.add(kw);
      return n;
    });
  }

  async function addToCalendar() {
    if (picked.size === 0) return;
    setCalBusy(true);
    try {
      const keywords = results.filter((r) => picked.has(r.keyword));
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientId: id, keywords })
      });
      const j = await res.json();
      if (j.ok) router.push(`/clients/${id}/calendar`);
      else alert("Calendar error: " + (j.error ?? "unknown"));
    } finally {
      setCalBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
          ← Client
        </Link>
        <h1 className="text-2xl font-semibold text-white mt-1">Keyword research</h1>
        <p className="text-slate-400 text-sm mt-1">
          Free APIs: Google Autocomplete + People-Also-Ask + Bing SERP top-10.
        </p>
      </header>

      <form onSubmit={runResearch} className="flex gap-2">
        <input
          required
          placeholder="seed keyword (e.g. 'wordpress seo')"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          disabled={busy}
          className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-4 py-2 text-white placeholder:text-slate-500 focus:border-blue-500 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !seed}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-50"
        >
          {busy ? "Researching…" : "Research"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              {results.length} keyword candidates · {picked.size} selected
            </h2>
            <button
              onClick={addToCalendar}
              disabled={picked.size === 0 || calBusy}
              className="px-3 py-1.5 text-xs rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400 disabled:opacity-50"
            >
              {calBusy ? "Generating calendar…" : "Generate calendar from selected →"}
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-400 text-xs">
                <tr>
                  <th className="px-3 py-2 w-8"></th>
                  <th className="px-3 py-2 text-left">Keyword</th>
                  <th className="px-3 py-2 text-left">Intent</th>
                  <th className="px-3 py-2 text-left">Format</th>
                  <th className="px-3 py-2 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.keyword} className="border-t border-slate-800 hover:bg-slate-900/40">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={picked.has(r.keyword)}
                        onChange={() => toggle(r.keyword)}
                      />
                    </td>
                    <td className="px-3 py-2 text-white">{r.keyword}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {r.intent.intent}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-300 text-xs">{r.intent.recommended_format}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {serp.length > 0 && (
            <details className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <summary className="text-sm font-semibold text-slate-200 cursor-pointer">
                Top {serp.length} SERP results (Bing)
              </summary>
              <ul className="mt-3 space-y-2 text-xs">
                {serp.map((s) => (
                  <li key={s.position}>
                    <span className="text-slate-500 mr-2">#{s.position}</span>
                    <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-blue-400 hover:underline">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
