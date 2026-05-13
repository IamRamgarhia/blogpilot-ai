import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";
import { buildRegistry, chainFor } from "@/lib/ai/registry";
import { execute } from "@/lib/ai/executor";
import type { IntentResult } from "@/lib/seo/intent";

export const runtime = "nodejs";
export const maxDuration = 60;

interface KeywordInput {
  keyword: string;
  intent: IntentResult;
}

interface CalendarItem {
  title: string;
  slug: string;
  primary_keyword: string;
  intent: string;
  format: string;
  cluster: string;
  is_pillar: boolean;
  word_count_target: number;
  priority: number;
  rationale: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function fallbackCalendar(keywords: KeywordInput[]): CalendarItem[] {
  return keywords.map((k, i) => ({
    title: k.keyword
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    slug: slugify(k.keyword),
    primary_keyword: k.keyword,
    intent: k.intent.intent,
    format: k.intent.recommended_format,
    cluster: keywords[0]?.keyword ?? "main",
    is_pillar: i === 0,
    word_count_target: 1500,
    priority: i + 1,
    rationale: "rule-based fallback (no AI provider configured)"
  }));
}

export async function POST(req: Request) {
  await ensureMigrated();
  const { clientId, keywords } = (await req.json()) as {
    clientId: string;
    keywords: KeywordInput[];
  };

  if (!keywords || keywords.length === 0) {
    return NextResponse.json({ error: "no keywords" }, { status: 400 });
  }

  const db = getDb();
  const client = await db
    .select()
    .from(schema.clients)
    .where(eq(schema.clients.id, clientId))
    .get();
  if (!client) return NextResponse.json({ error: "client not found" }, { status: 404 });

  const providers = chainFor(buildRegistry(process.env as Record<string, string | undefined>));

  let items: CalendarItem[];
  if (providers.length === 0) {
    items = fallbackCalendar(keywords);
  } else {
    try {
      const resp = await execute({
        methodologies: ["content-calendar-design", "topic-cluster-model", "skyscraper-technique"].filter((m) => {
          // skyscraper-technique might not be loaded yet on some installs; safe to leave in — loader throws clearly if missing
          return true;
        }),
        task: "Generate a content calendar from the provided keywords.",
        input: {
          niche: client.niche ?? "unknown",
          language: client.language ?? "en",
          keywords: keywords.map((k) => ({ keyword: k.keyword, intent: k.intent }))
        },
        providers,
        jsonMode: true,
        temperature: 0.4
      });
      // Sanitize: provider may wrap in extra text.
      const text = resp.text.trim();
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      const sliced = start >= 0 && end > start ? text.slice(start, end + 1) : text;
      const parsed = JSON.parse(sliced) as CalendarItem[] | { items: CalendarItem[] };
      items = Array.isArray(parsed) ? parsed : parsed.items ?? [];
      if (!items.length) items = fallbackCalendar(keywords);
    } catch {
      items = fallbackCalendar(keywords);
    }
  }

  const created: string[] = [];
  for (const it of items) {
    const postId = randomUUID();
    await db
      .insert(schema.posts)
      .values({
        id: postId,
        clientId,
        status: "idea",
        title: it.title,
        primaryKeyword: it.primary_keyword,
        intent: it.intent,
        outlineJson: JSON.stringify({
          slug: it.slug,
          format: it.format,
          cluster: it.cluster,
          is_pillar: it.is_pillar,
          word_count_target: it.word_count_target,
          priority: it.priority,
          rationale: it.rationale
        })
      })
      .run();
    created.push(postId);
  }

  return NextResponse.json({ ok: true, created: created.length });
}
