import { execute } from "@/lib/ai/executor";
import { buildRegistry, chainFor } from "@/lib/ai/registry";
import type { Outline } from "./outline";

export interface ImageBriefItem {
  placement: string;
  alt_text: string;
  caption?: string;
  filename_suggestion: string;
  width_height_ratio: string;
  format: string;
  ai_prompt: string;
  stock_search_terms: string[];
  on_page_role: string;
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function fallback(outline: Outline, keyword: string): ImageBriefItem[] {
  const out: ImageBriefItem[] = [
    {
      placement: "hero",
      alt_text: `${keyword} concept illustration`,
      caption: "",
      filename_suggestion: slug(`${keyword}-hero`),
      width_height_ratio: "16:9",
      format: "webp",
      ai_prompt: `Professional editorial photograph illustrating ${keyword}. Soft natural lighting, shallow depth of field, modern minimal composition.`,
      stock_search_terms: [keyword, `${keyword} concept`, `${keyword} workflow`],
      on_page_role: "enhance-mood"
    }
  ];
  for (let i = 0; i < outline.h2s.length; i++) {
    const h = outline.h2s[i];
    out.push({
      placement: `section-${i + 1}`,
      alt_text: h.heading.length > 100 ? h.heading.slice(0, 90) + "…" : h.heading,
      filename_suggestion: slug(`${keyword}-${h.heading}`),
      width_height_ratio: "4:3",
      format: "webp",
      ai_prompt: `Clean illustration depicting ${h.heading.toLowerCase()} in the context of ${keyword}. Editorial style, neutral palette, no text overlays.`,
      stock_search_terms: [h.heading.toLowerCase(), keyword, `${h.heading} explainer`],
      on_page_role: "explain-with-image"
    });
  }
  return out;
}

export async function generateImageBrief(
  outline: Outline,
  primary_keyword: string,
  brandHint?: string
): Promise<ImageBriefItem[]> {
  const providers = chainFor(buildRegistry(process.env as Record<string, string | undefined>));
  if (providers.length === 0) return fallback(outline, primary_keyword);
  try {
    const resp = await execute({
      methodologies: ["image-brief-generation"],
      task: "Generate image briefs for hero + each H2 section.",
      input: { outline, primary_keyword, brand_hint: brandHint ?? "" },
      providers,
      jsonMode: true,
      temperature: 0.5
    });
    const text = resp.text.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const sliced = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    const parsed = JSON.parse(sliced) as { images?: ImageBriefItem[] };
    if (!parsed.images || parsed.images.length === 0) return fallback(outline, primary_keyword);
    return parsed.images;
  } catch {
    return fallback(outline, primary_keyword);
  }
}
