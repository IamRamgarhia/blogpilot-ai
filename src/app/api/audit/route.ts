import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { crawlSite } from "@/lib/technical/crawler";
import { runAllPageAudits, auditDuplicates, type Finding } from "@/lib/technical/audits";
import { detectCannibalization } from "@/lib/technical/cannibalization";
import { assertExternalUrl, UnsafeUrlError } from "@/lib/net/ssrf-guard";

export const runtime = "nodejs";
export const maxDuration = 300; // long-running

export async function POST(req: Request) {
  await ensureMigrated();
  let body: { clientId?: string; maxPages?: number; maxDepth?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { clientId, maxPages, maxDepth } = body;
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
  const db = getDb();
  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, clientId)).get();
  if (!client) return NextResponse.json({ error: "client not found" }, { status: 404 });

  const url = /^https?:\/\//i.test(client.url) ? client.url : `https://${client.url}`;
  try {
    assertExternalUrl(url);
  } catch (e) {
    if (e instanceof UnsafeUrlError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }

  try {
    const pages = await crawlSite(url, {
      maxPages: Math.min(maxPages ?? 50, 200),
      maxDepth: Math.min(maxDepth ?? 3, 5)
    });

    const findings: Finding[] = [];
    for (const p of pages) findings.push(...runAllPageAudits(p));
    auditDuplicates(pages, findings);

    // Cannibalization across client posts in DB
    const dbPosts = await db.select().from(schema.posts).where(eq(schema.posts.clientId, clientId)).all();
    const cannibal = detectCannibalization(
      dbPosts.map((p) => ({ id: p.id, title: p.title ?? "", primaryKeyword: p.primaryKeyword ?? "" }))
    );

    const summary = {
      pages_crawled: pages.length,
      critical: findings.filter((f) => f.severity === "critical").length,
      high: findings.filter((f) => f.severity === "high").length,
      medium: findings.filter((f) => f.severity === "medium").length,
      low: findings.filter((f) => f.severity === "low").length
    };

    return NextResponse.json({ ok: true, summary, findings, cannibalization: cannibal });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
