"use client";
import { useState, use } from "react";
import Link from "next/link";
import { LANGUAGES } from "@/lib/i18n/languages";

interface Variant { lang: string; url: string; }

export default function HreflangPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [variants, setVariants] = useState<Variant[]>([
    { lang: "en", url: "" },
    { lang: "x-default", url: "" }
  ]);
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [format, setFormat] = useState<"tags" | "sitemap">("tags");
  const [busy, setBusy] = useState(false);

  function update(i: number, field: keyof Variant, v: string) {
    setVariants((arr) => arr.map((x, idx) => (idx === i ? { ...x, [field]: v } : x)));
  }

  function add() {
    setVariants((arr) => [...arr, { lang: "es", url: "" }]);
  }

  function removeAt(i: number) {
    setVariants((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function build() {
    setBusy(true);
    const r = await fetch(`/api/hreflang/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variants, format })
    });
    const j = await r.json();
    setTags(j.tags ?? "");
    setErrors(j.errors ?? []);
    setWarnings(j.warnings ?? []);
    setBusy(false);
  }

  return (
    <section className="space-y-6">
      <header>
        <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
          ← Client
        </Link>
        <h1 className="text-2xl font-semibold text-white mt-1">Hreflang manager</h1>
        <p className="text-slate-400 text-sm mt-1">
          Add one variant per language/region. Every variant must list every other variant — we validate it for you.
        </p>
      </header>

      <div className="space-y-2">
        {variants.map((v, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select
              value={v.lang}
              onChange={(e) => update(i, "lang", e.target.value)}
              className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
            >
              <option value="x-default">x-default</option>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.code} · {l.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="https://example.com/page"
              value={v.url}
              onChange={(e) => update(i, "url", e.target.value)}
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
            />
            <button onClick={() => removeAt(i)} className="text-xs text-slate-500 hover:text-red-400 px-2">
              ✕
            </button>
          </div>
        ))}
        <button onClick={add} className="text-xs text-blue-400 hover:underline">
          + Add variant
        </button>
      </div>

      <div className="flex gap-2 items-center">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as "tags" | "sitemap")}
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"
        >
          <option value="tags">HTML &lt;link&gt; tags</option>
          <option value="sitemap">XML sitemap xhtml:link</option>
        </select>
        <button
          onClick={build}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400 disabled:opacity-50"
        >
          {busy ? "Building…" : "Build & validate"}
        </button>
      </div>

      {errors.length > 0 && (
        <ul className="rounded-xl border border-red-800 bg-red-950/30 p-3 text-xs text-red-300 space-y-1">
          {errors.map((e, i) => <li key={i}>✗ {e}</li>)}
        </ul>
      )}
      {warnings.length > 0 && (
        <ul className="rounded-xl border border-yellow-800 bg-yellow-950/30 p-3 text-xs text-yellow-300 space-y-1">
          {warnings.map((w, i) => <li key={i}>! {w}</li>)}
        </ul>
      )}

      {tags && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Output</h2>
          <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap">{tags}</pre>
        </div>
      )}
    </section>
  );
}
