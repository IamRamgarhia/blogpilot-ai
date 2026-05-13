"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Outline {
  title: string;
  slug: string;
  tldr_bullets: string[];
  intro_hook: string;
  h2s: Array<{ heading: string; h3s: string[]; notes?: string; snippet_target?: boolean }>;
  faqs: Array<{ q: string; a_target_words?: number }>;
  conclusion_cta: string;
  word_count_target: number;
}

export default function OutlinePage({ params }: { params: Promise<{ id: string; postId: string }> }) {
  const { id, postId } = use(params);
  const router = useRouter();
  const [outline, setOutline] = useState<Outline | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [json, setJson] = useState("");

  useEffect(() => {
    (async () => {
      setStatus("Generating outline…");
      setBusy(true);
      const res = await fetch("/api/outline", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId })
      });
      const j = await res.json();
      if (j.outline) {
        setOutline(j.outline);
        setJson(JSON.stringify(j.outline, null, 2));
        setStatus("");
      } else {
        setStatus("Error: " + (j.error ?? "unknown"));
      }
      setBusy(false);
    })();
  }, [postId]);

  async function approve() {
    setBusy(true);
    setStatus("Saving and drafting full post…");
    try {
      const parsed = JSON.parse(json);
      const r1 = await fetch("/api/outline/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId, outline: parsed })
      });
      const j1 = await r1.json();
      if (!j1.ok) throw new Error(j1.error);

      const r2 = await fetch("/api/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId })
      });
      const j2 = await r2.json();
      if (!j2.ok) throw new Error(j2.error);

      router.push(`/clients/${id}/posts/${postId}/draft`);
    } catch (e) {
      setStatus("Error: " + (e as Error).message);
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <Link href={`/clients/${id}/calendar`} className="text-xs text-slate-500 hover:text-slate-300">
          ← Calendar
        </Link>
        <h1 className="text-2xl font-semibold text-white mt-1">Outline review</h1>
        <p className="text-slate-400 text-sm mt-1">
          Generated using methodologies: outline-structure, skyscraper-technique, featured-snippet-targeting, paa-optimization.
        </p>
      </header>

      {status && <p className="text-sm text-slate-400">{status}</p>}

      {outline && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
            <h2 className="text-white font-semibold">{outline.title}</h2>

            <Section title="TL;DR">
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                {outline.tldr_bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </Section>

            <Section title="Intro hook">
              <p className="text-sm text-slate-300 italic">{outline.intro_hook}</p>
            </Section>

            <Section title={`Body (${outline.h2s.length} sections)`}>
              <ol className="text-sm text-slate-300 space-y-2">
                {outline.h2s.map((h2, i) => (
                  <li key={i}>
                    <span className="text-white font-medium">
                      {h2.heading}
                      {h2.snippet_target && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-300">
                          snippet target
                        </span>
                      )}
                    </span>
                    {h2.h3s.length > 0 && (
                      <ul className="ml-5 mt-1 list-disc text-slate-400 text-xs space-y-0.5">
                        {h2.h3s.map((h3, j) => <li key={j}>{h3}</li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </Section>

            <Section title={`FAQs (${outline.faqs.length})`}>
              <ul className="text-sm text-slate-300 space-y-1">
                {outline.faqs.map((f, i) => <li key={i}>· {f.q}</li>)}
              </ul>
            </Section>

            <Section title="Conclusion CTA">
              <p className="text-sm text-slate-300 italic">{outline.conclusion_cta}</p>
            </Section>

            <div className="pt-2 text-xs text-slate-500">Target: {outline.word_count_target} words</div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">Edit JSON</h2>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              className="w-full h-96 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono text-slate-200 focus:border-blue-500 outline-none"
            />
            <button
              onClick={approve}
              disabled={busy}
              className="px-4 py-2 rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400 disabled:opacity-50"
            >
              {busy ? "Working…" : "Approve & write full post →"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-1.5">{title}</h3>
      {children}
    </div>
  );
}
