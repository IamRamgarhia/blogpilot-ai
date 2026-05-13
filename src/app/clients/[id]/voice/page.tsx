"use client";
import { useState, use } from "react";
import Link from "next/link";

export default function VoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [samples, setSamples] = useState<string[]>(["", "", ""]);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  function setSample(i: number, v: string) {
    setSamples((s) => s.map((x, idx) => (idx === i ? v : x)));
  }
  function addSlot() {
    if (samples.length < 5) setSamples((s) => [...s, ""]);
  }

  async function train() {
    const filled = samples.filter((s) => s.trim().length > 100);
    if (filled.length === 0) {
      setStatus("Paste at least one sample (100+ chars).");
      return;
    }
    setBusy(true);
    setStatus("Extracting voice profile…");
    try {
      const r = await fetch("/api/voice-train", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientId: id, samples: filled })
      });
      const j = await r.json();
      if (j.ok) {
        setProfile(j.profile);
        setStatus("Saved. Future post writing will match this voice.");
      } else {
        setStatus("Error: " + (j.error ?? "unknown"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
          ← Client
        </Link>
        <h1 className="text-2xl font-semibold text-white mt-1">Brand voice trainer</h1>
        <p className="text-slate-400 text-sm mt-1">
          Paste 3-5 of the client&apos;s best posts. We extract a richer style profile than the auto-crawl detected, and the writer uses it for every future post.
        </p>
      </header>

      <div className="space-y-3">
        {samples.map((s, i) => (
          <textarea
            key={i}
            value={s}
            onChange={(e) => setSample(i, e.target.value)}
            placeholder={`Sample post ${i + 1} (markdown or plain text)`}
            className="w-full h-40 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none"
          />
        ))}
        {samples.length < 5 && (
          <button onClick={addSlot} className="text-xs text-blue-400 hover:underline">
            + Add another sample
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={train}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400 disabled:opacity-50"
        >
          {busy ? "Extracting…" : "Train voice"}
        </button>
        {status && <span className="text-xs text-slate-400">{status}</span>}
      </div>

      {profile && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">Extracted profile</h2>
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
