"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("Creating client…");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "content-type": "application/json" }
      });
      const j = (await res.json()) as { id?: string; error?: string };
      if (!j.id) {
        setStatus("Error: " + (j.error ?? "unknown"));
        setBusy(false);
        return;
      }
      setStatus("Auto-discovering site (this can take up to 60s)…");
      const dres = await fetch("/api/discover", {
        method: "POST",
        body: JSON.stringify({ clientId: j.id }),
        headers: { "content-type": "application/json" }
      });
      const dj = (await dres.json()) as { ok: boolean; error?: string };
      if (!dj.ok) setStatus("Discovery had issues: " + dj.error);
      router.push(`/clients/${j.id}`);
    } catch (e) {
      setStatus("Error: " + (e as Error).message);
      setBusy(false);
    }
  }

  return (
    <section className="max-w-xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Add a client</h1>
        <p className="text-slate-400 text-sm mt-2">
          Paste any website URL. BlogPilot will crawl the homepage, parse the sitemap, check Core
          Web Vitals, and build a client profile.
        </p>
      </header>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={busy}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !url}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400 disabled:opacity-50"
        >
          {busy ? "Working…" : "Add and auto-discover"}
        </button>
        {status && <p className="text-sm text-slate-400">{status}</p>}
      </form>
    </section>
  );
}
