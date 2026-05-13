"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string | null;
  primaryKeyword: string | null;
  status: string;
  publishDate: number | null;
}

export default function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [posts, setPosts] = useState<Post[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function load() {
    try {
      const r = await fetch(`/api/clients/${id}/posts`);
      if (r.ok) {
        const j = (await r.json()) as { posts: Post[] };
        setPosts(j.posts ?? []);
      } else {
        setStatus(`Error loading posts: HTTP ${r.status}`);
      }
    } catch (e) {
      setStatus(`Error loading posts: ${(e as Error).message}`);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function autoSchedule() {
    setBusy(true);
    setStatus("Building schedule…");
    const r = await fetch("/api/schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clientId: id })
    });
    const j = await r.json();
    if (j.ok) {
      setStatus(`Scheduled ${j.scheduled} posts.`);
      await load();
    } else {
      setStatus("Error: " + (j.error ?? "unknown"));
    }
    setBusy(false);
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
            ← Client
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-1">Publishing schedule</h1>
          <p className="text-slate-400 text-sm mt-1">
            Best-day-of-week recommendations by niche, deterministic and timezone-aware.
          </p>
        </div>
        <button
          onClick={autoSchedule}
          disabled={busy}
          className="px-3 py-1.5 text-xs rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400 disabled:opacity-50"
        >
          {busy ? "Working…" : "Auto-schedule unscheduled"}
        </button>
      </header>
      {status && <p className="text-xs text-slate-400">{status}</p>}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400 text-xs">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Keyword</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Publish</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="px-3 py-2">
                  <Link href={`/clients/${id}/posts/${p.id}/draft`} className="text-white hover:text-blue-400">
                    {p.title ?? "Untitled"}
                  </Link>
                </td>
                <td className="px-3 py-2 text-slate-400 text-xs">{p.primaryKeyword}</td>
                <td className="px-3 py-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{p.status}</span>
                </td>
                <td className="px-3 py-2 text-slate-300 text-xs">
                  {p.publishDate ? new Date(p.publishDate * 1000).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-xs text-slate-500">
                  No posts loaded. Generate a calendar from the Research page first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
