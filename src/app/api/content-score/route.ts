import { NextResponse } from "next/server";
import { gatherCorpus, scoreDraft } from "@/lib/seo/content-score";

export const runtime = "nodejs";
export const maxDuration = 120;

// Two modes:
//  1. corpus=1 -> fetch and return SERP corpus only (slow ~30s, cache client-side)
//  2. default -> client passes prefetched corpus; runs scoring locally for fast keystroke updates

export async function POST(req: Request) {
  let body: {
    mode?: "corpus" | "score";
    keyword?: string;
    draft?: string;
    headings?: string[];
    corpus?: { pages: { url: string; title: string; headings: string[]; body: string; wordCount: number; fetched: boolean }[]; paaQuestions: string[] };
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const mode = body.mode ?? "score";

  if (mode === "corpus") {
    if (!body.keyword) return NextResponse.json({ error: "keyword required" }, { status: 400 });
    try {
      const { serp, pages, paaQuestions } = await gatherCorpus(body.keyword);
      return NextResponse.json({ ok: true, serp, pages, paaQuestions });
    } catch (e) {
      return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
    }
  }

  if (!body.draft || !body.corpus) {
    return NextResponse.json({ error: "draft + corpus required" }, { status: 400 });
  }
  try {
    const report = scoreDraft(body.draft, body.headings ?? [], {
      pages: body.corpus.pages,
      paaQuestions: body.corpus.paaQuestions
    });
    return NextResponse.json({ ok: true, report });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
