import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { readability } from "@/lib/seo/readability";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await ensureMigrated();
  const { postId } = (await req.json()) as { postId: string };
  const db = getDb();
  const post = await db.select().from(schema.posts).where(eq(schema.posts.id, postId)).get();
  if (!post || !post.draftMarkdown) {
    return NextResponse.json({ error: "no draft" }, { status: 400 });
  }
  const r = readability(post.draftMarkdown);

  const kw = (post.primaryKeyword ?? "").toLowerCase();
  const draft = post.draftMarkdown.toLowerCase();
  const firstHundred = draft.split(/\s+/).slice(0, 100).join(" ");
  const checks = [
    { id: "h1", status: /^#\s/m.test(post.draftMarkdown) ? "pass" : "fix", note: "H1 present" },
    { id: "kw_in_h1", status: kw && new RegExp(`^#[^\\n]*${kw}`, "im").test(post.draftMarkdown) ? "pass" : "fix", note: "Primary keyword in H1" },
    { id: "kw_in_intro", status: kw && firstHundred.includes(kw) ? "pass" : "fix", note: "Primary keyword in first 100 words" },
    { id: "meta_title_length", status: post.metaTitle && post.metaTitle.length <= 60 ? "pass" : "fix", note: `Meta title <= 60 chars (got ${post.metaTitle?.length ?? 0})` },
    { id: "meta_desc_length", status: post.metaDescription && post.metaDescription.length <= 160 && post.metaDescription.length >= 120 ? "pass" : "fix", note: `Meta description 120-160 chars (got ${post.metaDescription?.length ?? 0})` },
    { id: "schema", status: post.schemaJsonLd ? "pass" : "fix", note: "Schema JSON-LD present" },
    { id: "faq_section", status: /^##\s+(faq|frequently asked questions)/im.test(post.draftMarkdown) ? "pass" : "fix", note: "FAQ section present" },
    { id: "min_word_count", status: r.wordCount >= 800 ? "pass" : "fix", note: `Word count >= 800 (got ${r.wordCount})` },
    { id: "fk_grade", status: r.fleschKincaidGrade <= 12 ? "pass" : "fix", note: `Flesch-Kincaid grade <= 12 (got ${r.fleschKincaidGrade})` },
    { id: "passive_voice", status: r.passiveVoicePercent <= 10 ? "pass" : "fix", note: `Passive voice <= 10% (got ${r.passiveVoicePercent}%)` }
  ];

  const overall = checks.every((c) => c.status === "pass") ? "pass" : "fix";

  return NextResponse.json({ checks, overall, readability: r });
}
