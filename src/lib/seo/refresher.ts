import { fetchHtmlSmart } from "@/lib/crawler/playwright-fetcher";
import { load } from "@/lib/crawler/cheerio-fetcher";
import { execute } from "@/lib/ai/executor";
import { buildRegistry, chainFor } from "@/lib/ai/registry";

export interface RefreshResult {
  source_url: string;
  original_title: string;
  refreshed_markdown: string;
  meta_title: string;
  meta_description: string;
  change_log: Array<{ type: string; detail: string }>;
}

export interface ExtractedPost {
  title: string;
  markdown: string;
  publishedDate?: string;
}

export function extractPostFromHtml(html: string): ExtractedPost {
  const $ = load(html);
  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() ||
    "";
  // Find the most likely article container
  const article = $("article").first().length
    ? $("article").first()
    : $("main").first().length
      ? $("main").first()
      : $("body");

  // Walk and convert to plain Markdown
  const lines: string[] = [];
  article.find("h1, h2, h3, h4, p, ul, ol, li").each((_, el) => {
    const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? "";
    const text = $(el).text().trim();
    if (!text) return;
    if (tag === "h1") lines.push(`# ${text}`);
    else if (tag === "h2") lines.push(`## ${text}`);
    else if (tag === "h3") lines.push(`### ${text}`);
    else if (tag === "h4") lines.push(`#### ${text}`);
    else if (tag === "p") lines.push(text);
    else if (tag === "li") lines.push(`- ${text}`);
  });

  const published = $('meta[property="article:published_time"]').attr("content") ?? undefined;

  return { title, markdown: lines.join("\n\n"), publishedDate: published };
}

function fallbackRefresh(extracted: ExtractedPost, sourceUrl: string): RefreshResult {
  const year = new Date().getFullYear();
  const rewrote = extracted.markdown
    .replace(/\b20(1\d|2[0-4])\b/g, String(year))
    .replace(/^\n+/, "");
  return {
    source_url: sourceUrl,
    original_title: extracted.title,
    refreshed_markdown: rewrote,
    meta_title: extracted.title.slice(0, 60),
    meta_description: `${extracted.title} — updated for ${year}.`.slice(0, 160),
    change_log: [{ type: "year_update", detail: `Replaced outdated year refs with ${year}` }]
  };
}

export async function refreshPost(sourceUrl: string): Promise<RefreshResult> {
  const fetched = await fetchHtmlSmart(sourceUrl);
  const extracted = extractPostFromHtml(fetched.html);
  if (!extracted.title || extracted.markdown.length < 200) {
    throw new Error("could not extract post content from URL");
  }

  const providers = chainFor(buildRegistry(process.env as Record<string, string | undefined>));
  if (providers.length === 0) return fallbackRefresh(extracted, sourceUrl);

  try {
    const resp = await execute({
      methodologies: ["content-refresh-rules", "eeat-checklist", "readability-targets"],
      task: "Refresh this published post to be current and competitive.",
      input: {
        source_url: sourceUrl,
        original_title: extracted.title,
        original_markdown: extracted.markdown,
        published_date: extracted.publishedDate ?? null,
        current_year: new Date().getFullYear()
      },
      providers,
      jsonMode: true,
      temperature: 0.4,
      maxTokens: 6000
    });
    const text = resp.text.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const sliced = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    const parsed = JSON.parse(sliced) as {
      refreshed_markdown?: string;
      meta_title?: string;
      meta_description?: string;
      change_log?: RefreshResult["change_log"];
    };
    if (!parsed.refreshed_markdown) return fallbackRefresh(extracted, sourceUrl);
    return {
      source_url: sourceUrl,
      original_title: extracted.title,
      refreshed_markdown: parsed.refreshed_markdown,
      meta_title: parsed.meta_title ?? extracted.title.slice(0, 60),
      meta_description:
        parsed.meta_description ?? `${extracted.title} — updated.`.slice(0, 160),
      change_log: parsed.change_log ?? []
    };
  } catch {
    return fallbackRefresh(extracted, sourceUrl);
  }
}
