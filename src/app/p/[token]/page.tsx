import { eq } from "drizzle-orm";
import Link from "next/link";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { isExpired } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  await ensureMigrated();
  const { token } = await params;
  const db = getDb();
  const link = await db.select().from(schema.shareLinks).where(eq(schema.shareLinks.token, token)).get();
  if (!link || link.revoked || isExpired(link.expiresAt)) {
    return (
      <section className="text-center py-16">
        <h1 className="text-xl text-slate-200">This link is no longer active.</h1>
        <p className="text-slate-500 mt-2">Contact the agency that shared it for a fresh link.</p>
      </section>
    );
  }
  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, link.clientId)).get();
  const posts = await db.select().from(schema.posts).where(eq(schema.posts.clientId, link.clientId)).all();

  return (
    <section className="space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <p className="text-xs text-slate-500">Read-only client view</p>
        <h1 className="text-2xl font-semibold text-white mt-1">{client?.name ?? "Client"}</h1>
        <p className="text-slate-400 text-sm mt-1">{posts.length} posts in queue</p>
      </header>

      <div className="grid md:grid-cols-2 gap-3">
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex justify-between gap-3">
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{p.status}</span>
              {p.publishDate && (
                <span className="text-xs text-slate-500">
                  Publishes {new Date(p.publishDate * 1000).toLocaleDateString()}
                </span>
              )}
            </div>
            <h2 className="text-white font-medium mt-2">{p.title ?? "Untitled"}</h2>
            {p.primaryKeyword && <p className="text-xs text-slate-500 mt-1">{p.primaryKeyword}</p>}
            {p.metaDescription && <p className="text-sm text-slate-300 mt-3">{p.metaDescription}</p>}
          </div>
        ))}
      </div>

      <footer className="text-center text-xs text-slate-500 pt-8 border-t border-slate-800">
        Prepared with <Link href="https://dicecodes.com" className="text-slate-300 hover:text-white">BlogPilot AI by Dice Codes</Link>
      </footer>
    </section>
  );
}
