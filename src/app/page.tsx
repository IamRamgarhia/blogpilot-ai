import Link from "next/link";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureMigrated();
  const db = getDb();
  const clients = await db.select().from(schema.clients).all();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-8">
        <h1 className="text-3xl font-semibold text-white">
          Your clients, your content, on autopilot.
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Add any website, BlogPilot auto-discovers the niche, voice, competitors, and Core Web
          Vitals, then plans, writes, and schedules SEO-optimized posts for you.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/clients/new"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400"
          >
            + Add client
          </Link>
          <Link
            href="/settings"
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white"
          >
            Connect AI key
          </Link>
        </div>
      </div>

      {clients.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 hover:border-blue-500 transition"
            >
              <div className="text-white font-medium truncate">{c.name}</div>
              <div className="text-xs text-slate-500 truncate mt-1">{c.url}</div>
              <div className="text-xs text-slate-600 mt-2">
                Added {new Date(c.createdAt * 1000).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-xl">
          No clients yet. Click <span className="text-slate-300">+ Add client</span> to get started.
        </div>
      )}
    </section>
  );
}
