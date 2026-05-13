import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { writePost } from "@/lib/seo/writer";
import { generateMeta } from "@/lib/seo/meta";
import { articleSchema, faqSchema, breadcrumbSchema, combineSchemas } from "@/lib/seo/schema";
import type { Outline } from "@/lib/seo/outline";
import type { DiscoverySnapshot } from "@/lib/crawler";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  await ensureMigrated();
  const { postId } = (await req.json()) as { postId: string };
  const db = getDb();
  const post = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!post.outlineJson) return NextResponse.json({ error: "outline missing" }, { status: 400 });

  const client = await db.select().from(schema.clients).where(eq(schema.clients.id, post.clientId)).get();
  if (!client) return NextResponse.json({ error: "client missing" }, { status: 404 });

  const outline: Outline = JSON.parse(post.outlineJson);
  const snap: DiscoverySnapshot | null = client.discoverySnapshot
    ? JSON.parse(client.discoverySnapshot)
    : null;

  const markdown = await writePost({
    outline,
    primary_keyword: post.primaryKeyword ?? "",
    style: {
      tone: "conversational",
      voice: "second-person",
      language: client.language ?? "en"
    },
    language: client.language ?? "en"
  });

  const intro = markdown
    .replace(/^#[^\n]*\n+/, "")
    .replace(/^##[^\n]*\n+/, "")
    .split("\n\n")
    .find((p) => p.length > 80) ?? "";

  const meta = await generateMeta({
    title: post.title ?? outline.title,
    primary_keyword: post.primaryKeyword ?? "",
    intent: post.intent ?? "informational",
    intro,
    brand: snap?.identity.title
  });

  const siteUrl = client.url;
  const article = articleSchema({
    title: post.title ?? outline.title,
    description: meta.metaDescription,
    slug: outline.slug,
    siteUrl,
    publisherName: snap?.identity.title ?? client.name,
    publisherLogoUrl: snap?.identity.favicon,
    image: snap?.identity.ogImage
  });
  const faq = outline.faqs && outline.faqs.length > 0
    ? faqSchema(outline.faqs.map((f) => ({ q: f.q, a: `${f.q} — answer in post.` })))
    : null;
  const crumbs = breadcrumbSchema([
    { name: "Home", url: new URL("/", siteUrl).toString() },
    { name: "Blog", url: new URL("/blog/", siteUrl).toString() },
    { name: post.title ?? outline.title, url: new URL(`/blog/${outline.slug}`, siteUrl).toString() }
  ]);
  const schemaJson = combineSchemas(article, faq, crumbs);

  await db
    .update(schema.posts)
    .set({
      draftMarkdown: markdown,
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      schemaJsonLd: schemaJson,
      status: "draft",
      updatedAt: Math.floor(Date.now() / 1000)
    })
    .where(eq(schema.posts.id, postId))
    .run();

  return NextResponse.json({
    ok: true,
    metaTitle: meta.metaTitle,
    metaDescription: meta.metaDescription,
    warnings: meta.warnings,
    draftLength: markdown.length
  });
}
