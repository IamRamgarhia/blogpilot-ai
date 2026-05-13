import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { buildWordPressWXR } from "@/lib/exports/wordpress-xml";
import { buildGhostJson } from "@/lib/exports/ghost";
import { buildWebflowCsv } from "@/lib/exports/webflow-csv";
import { buildHugoMarkdown } from "@/lib/exports/hugo";
import type { ExportPost } from "@/lib/exports/common";

export const runtime = "nodejs";

function toExportPost(p: {
  id: string;
  title: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  primaryKeyword: string | null;
  draftMarkdown: string | null;
  schemaJsonLd: string | null;
  publishDate: number | null;
  outlineJson: string | null;
}, siteUrl: string, brandName: string): ExportPost {
  let slug = "post";
  let cluster: string | undefined;
  try {
    if (p.outlineJson) {
      const o = JSON.parse(p.outlineJson) as { slug?: string; cluster?: string };
      slug = o.slug ?? slug;
      cluster = o.cluster;
    }
  } catch {}
  return {
    id: p.id,
    title: p.title ?? "Untitled",
    slug,
    metaTitle: p.metaTitle ?? p.title ?? "",
    metaDescription: p.metaDescription ?? "",
    primaryKeyword: p.primaryKeyword ?? "",
    draftMarkdown: p.draftMarkdown ?? "",
    schemaJsonLd: p.schemaJsonLd ?? "{}",
    publishDateISO: p.publishDate ? new Date(p.publishDate * 1000).toISOString() : undefined,
    cluster,
    brandName,
    siteUrl
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  await ensureMigrated();
  const { postId } = await params;
  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") ?? "wordpress";

  const db = getDb();
  const post = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
  if (!post || !post.draftMarkdown) return NextResponse.json({ error: "no draft" }, { status: 404 });
  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, post.clientId)).get();
  if (!client) return NextResponse.json({ error: "client missing" }, { status: 404 });

  const ep = toExportPost(post, client.url, client.name);

  if (platform === "wordpress") {
    const xml = buildWordPressWXR([ep], client.url, client.name);
    return new NextResponse(xml, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "content-disposition": `attachment; filename="${ep.slug}.wp.xml"`
      }
    });
  }
  if (platform === "ghost") {
    const json = buildGhostJson([ep]);
    return new NextResponse(json, {
      headers: {
        "content-type": "application/json",
        "content-disposition": `attachment; filename="${ep.slug}.ghost.json"`
      }
    });
  }
  if (platform === "webflow") {
    const csv = buildWebflowCsv([ep]);
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${ep.slug}.webflow.csv"`
      }
    });
  }
  if (platform === "hugo") {
    const md = buildHugoMarkdown(ep);
    return new NextResponse(md, {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `attachment; filename="${ep.slug}.hugo.md"`
      }
    });
  }
  return NextResponse.json({ error: "unknown platform" }, { status: 400 });
}
