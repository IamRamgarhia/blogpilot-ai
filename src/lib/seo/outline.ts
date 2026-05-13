import { execute } from "@/lib/ai/executor";
import { buildRegistry, chainFor } from "@/lib/ai/registry";
import { classifyIntentByRules } from "./intent";

export interface OutlineH2 {
  heading: string;
  h3s: string[];
  notes?: string;
  snippet_target?: boolean;
}

export interface OutlineFaq { q: string; a_target_words?: number; }

export interface Outline {
  title: string;
  slug: string;
  tldr_bullets: string[];
  intro_hook: string;
  h2s: OutlineH2[];
  faqs: OutlineFaq[];
  conclusion_cta: string;
  internal_link_topics: string[];
  image_suggestions: Array<{ placement: string; alt: string }>;
  word_count_target: number;
}

function fallbackOutline(title: string, keyword: string): Outline {
  const intent = classifyIntentByRules(keyword);
  return {
    title,
    slug: keyword.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    tldr_bullets: [
      `What ${keyword} means and why it matters`,
      `How to apply ${keyword} step by step`,
      `Common mistakes to avoid`,
      `Tools and next steps`
    ],
    intro_hook: `Most guides on ${keyword} skip the part that actually moves the needle.`,
    h2s: [
      { heading: `What is ${keyword}?`, h3s: ["Definition", "Why it matters"], snippet_target: true, notes: "40-55 word direct answer" },
      { heading: `How ${keyword} works`, h3s: ["Step 1", "Step 2", "Step 3"] },
      { heading: `Best practices for ${keyword}`, h3s: ["Do this", "Avoid that"] },
      { heading: `Common mistakes with ${keyword}`, h3s: ["Mistake 1", "Mistake 2"] }
    ],
    faqs: [
      { q: `Is ${keyword} worth it?`, a_target_words: 50 },
      { q: `How long does ${keyword} take?`, a_target_words: 50 },
      { q: `What is the cost of ${keyword}?`, a_target_words: 50 },
      { q: `What is the best tool for ${keyword}?`, a_target_words: 50 }
    ],
    conclusion_cta: `Ready to put ${keyword} into action? Start with our recommended next step.`,
    internal_link_topics: [keyword + " tools", keyword + " examples"],
    image_suggestions: [
      { placement: "intro", alt: `${keyword} diagram` },
      { placement: "section-2", alt: `${keyword} workflow` }
    ],
    word_count_target: 1500 + (intent.intent === "commercial" ? 500 : 0)
  };
}

export async function generateOutline(input: {
  title: string;
  primary_keyword: string;
  intent: string;
  format: string;
  word_count_target?: number;
  client_style_profile?: unknown;
  serp_top10?: unknown;
}): Promise<Outline> {
  const providers = chainFor(buildRegistry(process.env as Record<string, string | undefined>));
  if (providers.length === 0) {
    return fallbackOutline(input.title, input.primary_keyword);
  }
  try {
    const resp = await execute({
      methodologies: ["outline-structure", "skyscraper-technique", "featured-snippet-targeting", "paa-optimization", "faq-paa-targeting"],
      task: "Generate the outline for the given post.",
      input,
      providers,
      jsonMode: true,
      temperature: 0.5
    });
    const text = resp.text.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const sliced = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    const parsed = JSON.parse(sliced) as Outline;
    if (!parsed.h2s || !Array.isArray(parsed.h2s) || parsed.h2s.length === 0) {
      return fallbackOutline(input.title, input.primary_keyword);
    }
    return parsed;
  } catch {
    return fallbackOutline(input.title, input.primary_keyword);
  }
}
