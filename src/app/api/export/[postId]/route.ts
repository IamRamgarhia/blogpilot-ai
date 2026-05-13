import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";

export const runtime = "nodejs";

function toFrontMatter(post: { title: string | null; metaTitle: string | null; metaDescription: string | null; primaryKeyword: string | null; intent: string | null; createdAt: number }, slug: string) {
  return `---
title: ${JSON.stringify(post.title ?? "")}
meta_title: ${JSON.stringify(post.metaTitle ?? "")}
description: ${JSON.stringify(post.metaDescription ?? "")}
slug: ${JSON.stringify(slug)}
primary_keyword: ${JSON.stringify(post.primaryKeyword ?? "")}
intent: ${JSON.stringify(post.intent ?? "")}
date: ${new Date(post.createdAt * 1000).toISOString()}
---

`;
}

function markdownToHtml(md: string): string {
  // Minimal MD->HTML for export; users can paste schema JSON-LD into their CMS.
  let html = md
    .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Group consecutive <li> into <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\n<li>)/g, (m) => `<ul>${m}</ul>`);
  // Paragraphs
  html = html
    .split(/\n\s*\n/)
    .map((p) => (p.trim().startsWith("<") ? p : `<p>${p.trim()}</p>`))
    .join("\n\n");
  return html;
}

export async function GET(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  await ensureMigrated();
  const { postId } = await params;
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "md";
  const db = getDb();
  const post = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
  if (!post || !post.draftMarkdown) return NextResponse.json({ error: "no draft" }, { status: 404 });

  const outline = post.outlineJson ? (JSON.parse(post.outlineJson) as { slug?: string }) : {};
  const slug = outline.slug ?? "post";
  const footer = "\n\n---\n_Generated with BlogPilot AI by [Dice Codes](https://dicecodes.com)._\n";

  if (format === "json") {
    const body = {
      title: post.title,
      meta_title: post.metaTitle,
      meta_description: post.metaDescription,
      primary_keyword: post.primaryKeyword,
      intent: post.intent,
      slug,
      markdown: post.draftMarkdown + footer,
      schema_jsonld: post.schemaJsonLd
    };
    return new NextResponse(JSON.stringify(body, null, 2), {
      headers: {
        "content-type": "application/json",
        "content-disposition": `attachment; filename="${slug}.json"`
      }
    });
  }

  if (format === "html") {
    const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>${post.metaTitle ?? post.title ?? ""}</title>
<meta name="description" content="${post.metaDescription ?? ""}">
<script type="application/ld+json">${post.schemaJsonLd ?? "{}"}</script>
</head><body>
${markdownToHtml(post.draftMarkdown + footer)}
</body></html>`;
    return new NextResponse(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-disposition": `attachment; filename="${slug}.html"`
      }
    });
  }

  // default markdown
  const body =
    toFrontMatter(post, slug) +
    post.draftMarkdown +
    footer +
    (post.schemaJsonLd ? `\n\n<!-- Schema JSON-LD -->\n<script type="application/ld+json">\n${post.schemaJsonLd}\n</script>\n` : "");
  return new NextResponse(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.md"`
    }
  });
}
