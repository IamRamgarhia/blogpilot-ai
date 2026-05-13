"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Social { x_thread: string[]; linkedin: string; instagram: string; pinterest: string; whatsapp: string; }
interface Newsletter { short: string; long: string; }

export default function DistributePage({ params }: { params: Promise<{ id: string; postId: string }> }) {
  const { id, postId } = use(params);
  const [social, setSocial] = useState<Social | null>(null);
  const [news, setNews] = useState<Newsletter | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function gen(kind: "social" | "newsletter") {
    setBusy(kind);
    try {
      const r = await fetch(`/api/${kind}/${postId}`, { method: "POST" });
      const j = await r.json();
      if (kind === "social") setSocial(j.social ?? null);
      else setNews(j.newsletter ?? null);
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    // Try to load any prior generation by reading the export JSON.
    (async () => {
      try {
        const r = await fetch(`/api/export/${postId}?format=json`);
        if (r.ok) {
          // export JSON does not include social/newsletter; trigger fresh generation on demand
        }
      } catch {}
    })();
  }, [postId]);

  async function createShare() {
    setBusy("share");
    try {
      const r = await fetch("/api/share/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clientId: id, scope: "calendar", days: 30 })
      });
      const j = await r.json();
      if (j.ok) setShareUrl(window.location.origin + j.url);
    } finally {
      setBusy(null);
    }
  }

  function dl(platform: string) {
    window.location.href = `/api/export-cms/${postId}?platform=${platform}`;
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link href={`/clients/${id}/posts/${postId}/draft`} className="text-xs text-slate-500 hover:text-slate-300">
            ← Draft
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-1">Distribute</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => dl("wordpress")} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-400">
            Export → WordPress XML
          </button>
          <button onClick={() => dl("ghost")} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-400">
            Ghost JSON
          </button>
          <button onClick={() => dl("webflow")} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-400">
            Webflow CSV
          </button>
          <button onClick={() => dl("hugo")} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-400">
            Hugo
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Social repurposes</h2>
            <button
              onClick={() => gen("social")}
              disabled={busy === "social"}
              className="px-3 py-1.5 text-xs rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400 disabled:opacity-50"
            >
              {busy === "social" ? "…" : social ? "Regenerate" : "Generate"}
            </button>
          </div>
          {social && (
            <div className="space-y-3 text-xs">
              <Block label="X / Twitter thread">
                {social.x_thread.map((t, i) => (
                  <pre key={i} className="border border-slate-800 rounded p-2 text-slate-200 whitespace-pre-wrap font-mono">{t}</pre>
                ))}
              </Block>
              <Block label="LinkedIn">
                <pre className="border border-slate-800 rounded p-2 text-slate-200 whitespace-pre-wrap font-mono">{social.linkedin}</pre>
              </Block>
              <Block label="Instagram">
                <pre className="border border-slate-800 rounded p-2 text-slate-200 whitespace-pre-wrap font-mono">{social.instagram}</pre>
              </Block>
              <Block label="Pinterest">
                <pre className="border border-slate-800 rounded p-2 text-slate-200 whitespace-pre-wrap font-mono">{social.pinterest}</pre>
              </Block>
              <Block label="WhatsApp / Telegram">
                <pre className="border border-slate-800 rounded p-2 text-slate-200 whitespace-pre-wrap font-mono">{social.whatsapp}</pre>
              </Block>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Newsletter</h2>
              <button
                onClick={() => gen("newsletter")}
                disabled={busy === "newsletter"}
                className="px-3 py-1.5 text-xs rounded-lg bg-lime-500 text-slate-900 font-medium hover:bg-lime-400 disabled:opacity-50"
              >
                {busy === "newsletter" ? "…" : news ? "Regenerate" : "Generate"}
              </button>
            </div>
            {news && (
              <div className="space-y-2 text-xs">
                <Block label="Short">
                  <pre className="border border-slate-800 rounded p-2 text-slate-200 whitespace-pre-wrap font-mono">{news.short}</pre>
                </Block>
                <Block label="Long">
                  <pre className="border border-slate-800 rounded p-2 text-slate-200 whitespace-pre-wrap font-mono">{news.long}</pre>
                </Block>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">Client portal share link</h2>
            <p className="text-xs text-slate-400">
              Generate a read-only URL the client can open without an account. 30-day expiry.
            </p>
            <button
              onClick={createShare}
              disabled={busy === "share"}
              className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-400 disabled:opacity-50"
            >
              {busy === "share" ? "…" : "Create share link"}
            </button>
            {shareUrl && (
              <div className="text-xs">
                <input
                  readOnly
                  value={shareUrl}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded text-slate-200 font-mono"
                  onFocus={(e) => e.currentTarget.select()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</div>
      {children}
    </div>
  );
}
