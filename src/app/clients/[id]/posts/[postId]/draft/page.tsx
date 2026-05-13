"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";

interface Check { id: string; status: string; note: string; }
interface CheckResp {
  checks: Check[];
  overall: string;
  readability: {
    fleschKincaidGrade: number;
    fleschReadingEase: number;
    avgSentenceLength: number;
    passiveVoicePercent: number;
    wordCount: number;
    warnings: string[];
  };
}

export default function DraftPage({ params }: { params: Promise<{ id: string; postId: string }> }) {
  const { id, postId } = use(params);
  const [post, setPost] = useState<{
    title: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    draftMarkdown: string | null;
    schemaJsonLd: string | null;
  } | null>(null);
  const [check, setCheck] = useState<CheckResp | null>(null);
  const [links, setLinks] = useState<Array<{ postId: string; title: string; score: number; anchor_options: string[]; rationale: string }>>([]);
  const [images, setImages] = useState<Array<{ placement: string; alt_text: string; filename_suggestion: string; ai_prompt: string }>>([]);
  const [imgBusy, setImgBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function load() {
    setStatus("Loading…");
    setPost(null);
    const r = await fetch(`/api/posts/${postId}`);
    if (r.ok) {
      const { post: row } = (await r.json()) as {
        post: {
          title: string | null;
          metaTitle: string | null;
          metaDescription: string | null;
          draftMarkdown: string | null;
          schemaJsonLd: string | null;
        };
      };
      setPost({
        title: row.title,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        draftMarkdown: row.draftMarkdown,
        schemaJsonLd: row.schemaJsonLd
      });
    }
    const cr = await fetch("/api/seo-check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId })
    });
    if (cr.ok) setCheck(await cr.json());

    const lr = await fetch(`/api/internal-links/${postId}`);
    if (lr.ok) {
      const lj = await lr.json();
      setLinks(lj.suggestions ?? []);
    }
    setStatus("");
  }

  async function generateImages() {
    setImgBusy(true);
    try {
      const r = await fetch(`/api/image-brief/${postId}`, { method: "POST" });
      const j = await r.json();
      setImages(j.images ?? []);
    } finally {
      setImgBusy(false);
    }
  }

  useEffect(() => { load(); }, [id, postId]);

  function dl(format: string) {
    window.location.href = `/api/export/${postId}?format=${format}`;
  }

  if (!post) return <p className="text-slate-400">{status || "Loading…"}</p>;

  const passCount = check?.checks.filter((c) => c.status === "pass").length ?? 0;
  const totalCount = check?.checks.length ?? 0;

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link href={`/clients/${id}/calendar`} className="text-xs text-slate-500 hover:text-slate-300">
            ← Calendar
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-1">{post.title}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => dl("md")} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-400">
            Download .md
          </button>
          <button onClick={() => dl("html")} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-400">
            Download .html
          </button>
          <button onClick={() => dl("json")} className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700">
            .json
          </button>
          <Link href={`/clients/${id}/posts/${postId}/distribute`} className="px-3 py-1.5 text-xs rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400">
            Distribute →
          </Link>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Draft (Markdown)</h2>
          <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono max-h-[600px] overflow-auto">
            {post.draftMarkdown}
          </pre>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Meta</h2>
            <div className="text-sm">
              <div className="text-slate-400">Title <span className="text-xs text-slate-500">({(post.metaTitle ?? "").length}/60)</span></div>
              <div className="text-white">{post.metaTitle}</div>
              <div className="text-slate-400 mt-2">Description <span className="text-xs text-slate-500">({(post.metaDescription ?? "").length}/160)</span></div>
              <div className="text-white">{post.metaDescription}</div>
            </div>
          </div>

          {check && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                SEO checks · {passCount}/{totalCount} pass
              </h2>
              <ul className="text-xs space-y-1.5">
                {check.checks.map((c) => (
                  <li key={c.id} className="flex justify-between gap-2">
                    <span className={c.status === "pass" ? "text-lime-400" : "text-orange-400"}>
                      {c.status === "pass" ? "✓" : "✗"}
                    </span>
                    <span className="flex-1 text-slate-300">{c.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {links.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                Internal link suggestions
              </h2>
              <ul className="text-xs space-y-2">
                {links.slice(0, 5).map((l) => (
                  <li key={l.postId} className="border border-slate-800 rounded-lg p-2">
                    <div className="text-slate-200 font-medium">{l.title}</div>
                    <div className="text-slate-500 mt-0.5">score {l.score} · {l.rationale}</div>
                    <div className="text-slate-400 mt-1">
                      anchors: {l.anchor_options.slice(0, 2).join(" · ")}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs uppercase tracking-wider text-slate-500">Image briefs</h2>
              <button
                onClick={generateImages}
                disabled={imgBusy}
                className="px-2 py-1 text-xs rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50"
              >
                {imgBusy ? "…" : images.length > 0 ? "Regenerate" : "Generate"}
              </button>
            </div>
            {images.length > 0 ? (
              <ul className="text-xs space-y-2">
                {images.slice(0, 5).map((im, i) => (
                  <li key={i} className="border border-slate-800 rounded-lg p-2">
                    <div className="text-slate-200 font-medium">{im.placement}</div>
                    <div className="text-slate-400 mt-0.5">alt: {im.alt_text}</div>
                    <div className="text-slate-500 mt-0.5 italic">{im.ai_prompt.slice(0, 120)}…</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">No image brief generated yet.</p>
            )}
          </div>

          {check && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Readability</h2>
              <div className="text-sm space-y-1.5">
                <Row k="Words" v={String(check.readability.wordCount)} />
                <Row k="Flesch-Kincaid grade" v={String(check.readability.fleschKincaidGrade)} />
                <Row k="Flesch reading ease" v={String(check.readability.fleschReadingEase)} />
                <Row k="Avg sentence length" v={`${check.readability.avgSentenceLength} words`} />
                <Row k="Passive voice" v={`${check.readability.passiveVoicePercent}%`} />
              </div>
              {check.readability.warnings.length > 0 && (
                <ul className="mt-2 text-xs text-orange-300 list-disc list-inside">
                  {check.readability.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{k}</span>
      <span className="text-slate-200">{v}</span>
    </div>
  );
}
