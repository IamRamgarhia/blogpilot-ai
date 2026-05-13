import { execute } from "@/lib/ai/executor";
import { buildRegistry, chainFor } from "@/lib/ai/registry";

export interface SocialPack {
  x_thread: string[];
  linkedin: string;
  instagram: string;
  pinterest: string;
  whatsapp: string;
}

function fallback(title: string, keyword: string, url: string): SocialPack {
  const hook = `Most posts on ${keyword} skip the part that actually moves the needle.`;
  return {
    x_thread: [
      hook,
      `What you'll learn in "${title}":`,
      `1. The first principle most guides miss.`,
      `2. The mistake that quietly kills ranking.`,
      `3. A repeatable workflow you can apply this week.`,
      `Full breakdown: ${url}`
    ],
    linkedin: [
      hook,
      "",
      "",
      `I spent the last few weeks digging into ${keyword}. Three things stood out:`,
      "",
      `- The dominant advice is incomplete.`,
      `- The few who get it right share a specific pattern.`,
      `- The pattern is replicable without a 6-figure tool stack.`,
      "",
      `Full post linked in the first comment. What would you add?`
    ].join("\n"),
    instagram: `${hook}\n\nNew post on ${keyword}. Tap link in bio for the full breakdown.\n\n#${keyword.replace(/\s+/g, "")} #seo #content #blogging #marketing`,
    pinterest: `${title}. Get the full ${keyword} guide with examples and the exact workflow. Save for later. #${keyword.replace(/\s+/g, "")} #seo`,
    whatsapp: `Hey — just published a new piece on ${keyword}. Thought you'd find it useful: ${url}`
  };
}

export async function repurposeSocial(input: {
  title: string;
  primary_keyword: string;
  intro: string;
  tldr_bullets: string[];
  conclusion_cta: string;
  url: string;
  brand_voice?: unknown;
}): Promise<SocialPack> {
  const providers = chainFor(buildRegistry(process.env as Record<string, string | undefined>));
  if (providers.length === 0) {
    return fallback(input.title, input.primary_keyword, input.url);
  }
  try {
    const resp = await execute({
      methodologies: ["social-repurposing"],
      task: "Repurpose this post into native variants for each platform.",
      input,
      providers,
      jsonMode: true,
      temperature: 0.7,
      maxTokens: 3000
    });
    const text = resp.text.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const sliced = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    const parsed = JSON.parse(sliced) as SocialPack;
    if (!parsed.x_thread || !Array.isArray(parsed.x_thread)) {
      return fallback(input.title, input.primary_keyword, input.url);
    }
    return parsed;
  } catch {
    return fallback(input.title, input.primary_keyword, input.url);
  }
}
