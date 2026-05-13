import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { buildLlmsTxt, buildLlmsFullTxt, type LlmsTxtSection } from "@/lib/seo/llms-txt";
import type { DiscoverySnapshot } from "@/lib/crawler";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  await ensureMigrated();
  const { clientId } = await params;
  const url = new URL(req.url);
  const full = url.searchParams.get("full") === "1";
  const db = getDb();
  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, clientId)).get();
  if (!client) return NextResponse.json({ error: "not found" }, { status: 404 });

  const posts = await db.select().from(schema.posts).where(eq(schema.posts.clientId, clientId)).all();
  const snap: DiscoverySnapshot | null = client.discoverySnapshot
    ? JSON.parse(client.discoverySnapshot)
    : null;
  const siteName = snap?.identity.title || client.name;
  const description = snap?.identity.description || `Blog content for ${client.name}.`;

  // Build the canonical site URLs for each post using the outline slug.
  const blogResources = posts
    .filter((p) => p.draftMarkdown)
    .slice(0, 50)
    .map((p) => {
      let slug = "post";
      try {
        if (p.outlineJson) slug = (JSON.parse(p.outlineJson) as { slug?: string }).slug ?? slug;
      } catch {}
      return {
        title: p.title ?? "Untitled",
        url: new URL(`/blog/${slug}`, client.url).toString(),
        summary: p.metaDescription ?? p.primaryKeyword ?? ""
      };
    });

  const sections: LlmsTxtSection[] = [
    {
      heading: "Blog",
      resources: blogResources
    },
    {
      heading: "Site",
      resources: [
        { title: siteName, url: client.url, summary: "Homepage" }
      ]
    }
  ];

  const txt = buildLlmsTxt({ siteName, description, sections });

  if (full) {
    const bodies = new Map<string, string>();
    for (let i = 0; i < posts.length && i < blogResources.length; i++) {
      const p = posts.filter((x) => x.draftMarkdown)[i];
      if (p) bodies.set(blogResources[i].url, p.draftMarkdown!);
    }
    const fullTxt = buildLlmsFullTxt({ siteName, description, sections }, bodies);
    return new NextResponse(fullTxt, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "content-disposition": `attachment; filename="llms-full.txt"`
      }
    });
  }

  return new NextResponse(txt, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="llms.txt"`
    }
  });
}
