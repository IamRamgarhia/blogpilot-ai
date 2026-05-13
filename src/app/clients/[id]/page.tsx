import { eq } from "drizzle-orm";
import Link from "next/link";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import type { DiscoverySnapshot } from "@/lib/crawler";

export const dynamic = "force-dynamic";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureMigrated();
  const { id } = await params;
  const db = getDb();
  const row = await db.select().from(schema.clients).where(eq(schema.clients.id, id)).get();
  if (!row) {
    return (
      <section className="space-y-4">
        <p className="text-slate-400">Client not found.</p>
        <Link href="/" className="text-blue-400 hover:underline">
          ← Back
        </Link>
      </section>
    );
  }
  const snap: DiscoverySnapshot | null = row.discoverySnapshot
    ? (JSON.parse(row.discoverySnapshot) as DiscoverySnapshot)
    : null;

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
            ← All clients
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-1">{row.name}</h1>
          <a
            href={row.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-400 text-sm hover:underline"
          >
            {row.url}
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/clients/${id}/research`} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400">
            Research
          </Link>
          <Link href={`/clients/${id}/calendar`} className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">
            Calendar
          </Link>
          <Link href={`/clients/${id}/competitors`} className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">
            Competitors
          </Link>
          <Link href={`/clients/${id}/voice`} className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">
            Train voice
          </Link>
          <Link href={`/clients/${id}/refresh`} className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">
            Refresh post
          </Link>
          <Link href={`/clients/${id}/schedule`} className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">
            Schedule
          </Link>
          <Link href={`/clients/${id}/measure`} className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">
            Measure
          </Link>
          <Link href={`/clients/${id}/hreflang`} className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">
            Hreflang
          </Link>
          <a href={`/api/llms-txt/${id}`} target="_blank" rel="noreferrer noopener" className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800">
            llms.txt
          </a>
        </div>
      </header>

      {!snap && (
        <div className="border border-dashed border-slate-800 rounded-xl p-6 text-sm text-slate-400 text-center">
          No discovery snapshot yet. Run auto-discover from the Add Client flow.
        </div>
      )}

      {snap && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Identity">
            <Row k="Title" v={snap.identity.title || "—"} />
            <Row k="Description" v={snap.identity.description || "—"} />
            <Row k="Language" v={snap.identity.language} />
            <Row k="Generator" v={snap.identity.generator ?? "—"} />
            <Row k="Final URL" v={snap.finalUrl} />
            <Row
              k="Rendered with"
              v={snap.renderedWithPlaywright ? "Playwright" : "Cheerio (static)"}
            />
          </Card>

          <Card title="Sitemap">
            <Row k="URLs discovered" v={String(snap.sitemap.count)} />
            {snap.sitemap.sample.length > 0 && (
              <ul className="text-xs text-slate-400 mt-2 max-h-48 overflow-auto space-y-1">
                {snap.sitemap.sample.map((u: string) => (
                  <li key={u} className="truncate">
                    {u}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Core Web Vitals (mobile)">
            <Row
              k="Performance"
              v={
                snap.webVitals.performance != null
                  ? `${Math.round(snap.webVitals.performance)} / 100`
                  : "—"
              }
            />
            <Row
              k="LCP"
              v={snap.webVitals.lcpMs != null ? `${Math.round(snap.webVitals.lcpMs)} ms` : "—"}
            />
            <Row
              k="INP (field)"
              v={snap.webVitals.inpMs != null ? `${Math.round(snap.webVitals.inpMs)} ms` : "—"}
            />
            <Row
              k="CLS"
              v={snap.webVitals.clsScore != null ? snap.webVitals.clsScore.toFixed(3) : "—"}
            />
          </Card>

          <Card title="Social profiles">
            {Object.entries(snap.identity.social).map(([k, v]) => (
              <Row key={k} k={k} v={v} />
            ))}
            {Object.keys(snap.identity.social).length === 0 && (
              <p className="text-slate-500 text-sm">None detected.</p>
            )}
          </Card>
        </div>
      )}
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h2 className="text-sm font-semibold text-slate-200 mb-3">{title}</h2>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500 whitespace-nowrap">{k}</span>
      <span className="text-slate-200 text-right truncate max-w-[60%]">{v}</span>
    </div>
  );
}
