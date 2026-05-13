"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RefreshPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("Fetching and refreshing…");
    try {
      const r = await fetch("/api/refresh", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientId: id, url })
      });
      const j = await r.json();
      if (j.ok) {
        router.push(`/clients/${id}/posts/${j.postId}/draft`);
      } else {
        setStatus("Error: " + (j.error ?? "unknown"));
      }
    } catch (e) {
      setStatus("Error: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6 max-w-xl">
      <header>
        <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
          ← Client
        </Link>
        <h1 className="text-2xl font-semibold text-white mt-1">Refresh existing post</h1>
        <p className="text-slate-400 text-sm mt-1">
          Paste a URL of a published post. We fetch it, update year references, restructure if intent shifted, regenerate meta + schema, and save as a new draft for review.
        </p>
      </header>
      <form onSubmit={submit} className="space-y-4">
        <input
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yoursite.com/old-post"
          disabled={busy}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 outline-none disabled:opacity-50"
        />
        <button
          disabled={busy || !url}
          className="px-4 py-2 rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400 disabled:opacity-50"
        >
          {busy ? "Refreshing…" : "Refresh post"}
        </button>
        {status && <p className="text-sm text-slate-400">{status}</p>}
      </form>
    </section>
  );
}
