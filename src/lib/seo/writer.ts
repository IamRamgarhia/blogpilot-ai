import { execute } from "@/lib/ai/executor";
import { buildRegistry, chainFor } from "@/lib/ai/registry";
import type { Outline } from "./outline";

export interface StyleProfile {
  tone?: string;
  voice?: string;
  avgSentenceLength?: number;
  headingCase?: "title" | "sentence";
  ctaStyle?: string;
  language?: string;
}

function fallbackPost(outline: Outline, kw: string): string {
  const lines: string[] = [];
  lines.push(`# ${outline.title}`, "");
  lines.push("## TL;DR", "");
  for (const b of outline.tldr_bullets) lines.push(`- ${b}`);
  lines.push("", outline.intro_hook ?? `${kw} matters more than most guides admit.`, "");
  for (const h2 of outline.h2s) {
    lines.push(`## ${h2.heading}`, "");
    if (h2.snippet_target) {
      lines.push(`${kw} is a key approach that lets you achieve a specific outcome. The short answer: it works when you follow the playbook below.`, "");
    } else {
      lines.push(`This section covers ${h2.heading.toLowerCase()} in practical terms. ${h2.notes ?? ""}`.trim(), "");
    }
    for (const h3 of h2.h3s) {
      lines.push(`### ${h3}`, "");
      lines.push(`Detail for ${h3.toLowerCase()}. [CITE: source needed]`, "");
    }
  }
  lines.push("## Frequently asked questions", "");
  for (const f of outline.faqs) {
    lines.push(`### ${f.q}`, "", `Direct answer in 40-55 words covering ${kw}. [CITE: source needed]`, "");
  }
  lines.push("## Conclusion", "", outline.conclusion_cta);
  return lines.join("\n");
}

export async function writePost(input: {
  outline: Outline;
  primary_keyword: string;
  style: StyleProfile;
  language: string;
}): Promise<string> {
  const providers = chainFor(buildRegistry(process.env as Record<string, string | undefined>));
  if (providers.length === 0) return fallbackPost(input.outline, input.primary_keyword);

  try {
    const resp = await execute({
      methodologies: [
        "post-writer-style-matching",
        "eeat-checklist",
        "readability-targets",
        "featured-snippet-targeting",
        "paa-optimization",
        "skyscraper-technique"
      ],
      task: "Write the full post in Markdown following the outline exactly.",
      input,
      providers,
      jsonMode: false,
      temperature: 0.7,
      maxTokens: 6000
    });
    return resp.text.trim();
  } catch {
    return fallbackPost(input.outline, input.primary_keyword);
  }
}
