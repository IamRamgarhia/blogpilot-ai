import { eq } from "drizzle-orm";
import Link from "next/link";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";

export const dynamic = "force-dynamic";

const STATUSES = ["idea", "outline_approved", "draft", "ready"] as const;
const STATUS_LABEL: Record<string, string> = {
  idea: "Idea",
  outline_approved: "Outline approved",
  draft: "Draft",
  ready: "Ready"
};

export default async function CalendarPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureMigrated();
  const { id } = await params;
  const db = getDb();
  const posts = await db.select().from(schema.posts).where(eq(schema.posts.clientId, id)).all();
  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, id)).get();

  const byStatus: Record<string, typeof posts> = { idea: [], outline_approved: [], draft: [], ready: [] };
  for (const p of posts) {
    (byStatus[p.status] ?? byStatus.idea).push(p);
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href={`/clients/${id}`} className="text-xs text-slate-500 hover:text-slate-300">
            ← {client?.name ?? "Client"}
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-1">Content calendar</h1>
          <p className="text-slate-400 text-sm mt-1">
            {posts.length} posts ·{" "}
            {byStatus.ready.length} ready, {byStatus.draft.length} draft, {byStatus.outline_approved.length} approved, {byStatus.idea.length} idea
          </p>
        </div>
        <Link
          href={`/clients/${id}/research`}
          className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-400"
        >
          + Research more keywords
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-12 border border-dashed border-slate-800 rounded-xl">
          No posts yet. Run keyword research to generate a calendar.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {STATUSES.map((s) => (
            <div key={s} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                {STATUS_LABEL[s]} · {byStatus[s].length}
              </h2>
              <div className="space-y-2">
                {byStatus[s].map((p) => (
                  <Link
                    key={p.id}
                    href={`/clients/${id}/posts/${p.id}/${p.status === "idea" ? "outline" : "draft"}`}
                    className="block rounded-lg border border-slate-800 bg-slate-900 p-3 hover:border-blue-500 transition"
                  >
                    <div className="text-sm text-white font-medium">{p.title ?? "Untitled"}</div>
                    {p.primaryKeyword && (
                      <div className="text-xs text-slate-500 mt-1">{p.primaryKeyword}</div>
                    )}
                    {p.intent && (
                      <span className="inline-block text-[10px] mt-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {p.intent}
                      </span>
                    )}
                  </Link>
                ))}
                {byStatus[s].length === 0 && (
                  <p className="text-xs text-slate-600">—</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
