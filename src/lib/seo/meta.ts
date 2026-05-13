import { execute } from "@/lib/ai/executor";
import { buildRegistry, chainFor } from "@/lib/ai/registry";

export interface MetaResult {
  metaTitle: string;
  metaDescription: string;
  warnings: string[];
}

function fallbackMeta(title: string, keyword: string, intent: string): MetaResult {
  const warnings: string[] = [];
  let mt = title.length <= 60 ? title : title.slice(0, 57).trim() + "...";
  if (mt.toLowerCase().indexOf(keyword.toLowerCase()) < 0) {
    mt = `${keyword}: ${mt}`.slice(0, 60);
  }
  if (mt.length > 60) warnings.push(`metaTitle is ${mt.length} chars, over 60 limit`);

  const ctas: Record<string, string> = {
    informational: "Learn how it works",
    commercial: "Compare the top picks",
    transactional: "Get started today",
    navigational: ""
  };
  let md = `${title} — ${ctas[intent] ?? "Learn more"}.`;
  if (md.length > 160) md = md.slice(0, 157).trim() + "...";
  if (md.length < 120) md = `${title} — ${ctas[intent] ?? "Learn more"} about ${keyword} and key takeaways.`;
  if (md.length > 160) md = md.slice(0, 157).trim() + "...";
  if (md.toLowerCase().indexOf(keyword.toLowerCase()) < 0) {
    md = `${keyword}: ${md}`.slice(0, 160);
  }
  if (md.length > 160) warnings.push(`metaDescription is ${md.length} chars, over 160 limit`);

  return { metaTitle: mt, metaDescription: md, warnings };
}

export async function generateMeta(input: {
  title: string;
  primary_keyword: string;
  intent: string;
  intro: string;
  brand?: string;
}): Promise<MetaResult> {
  const providers = chainFor(buildRegistry(process.env as Record<string, string | undefined>));
  if (providers.length === 0) return fallbackMeta(input.title, input.primary_keyword, input.intent);

  try {
    const resp = await execute({
      methodologies: ["meta-title-rules", "meta-description-rules"],
      task: "Generate metaTitle and metaDescription as one combined JSON object.",
      input,
      providers,
      jsonMode: true,
      temperature: 0.4
    });
    const text = resp.text.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const sliced = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    const parsed = JSON.parse(sliced) as { metaTitle?: string; metaDescription?: string; warnings?: string[] };
    if (!parsed.metaTitle || !parsed.metaDescription) {
      return fallbackMeta(input.title, input.primary_keyword, input.intent);
    }
    return {
      metaTitle: parsed.metaTitle,
      metaDescription: parsed.metaDescription,
      warnings: parsed.warnings ?? []
    };
  } catch {
    return fallbackMeta(input.title, input.primary_keyword, input.intent);
  }
}
