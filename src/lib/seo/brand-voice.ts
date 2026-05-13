import { execute } from "@/lib/ai/executor";
import { buildRegistry, chainFor } from "@/lib/ai/registry";
import type { StyleProfile } from "./writer";

interface DeepProfile extends StyleProfile {
  vocabularyLevel?: string;
  hedgeWords?: string;
  contractions?: boolean;
  emDashes?: string;
  listsVsProse?: string;
  authorPersona?: string;
  phrasesToKeep?: string[];
  phrasesToAvoid?: string[];
}

function avgSentenceLengthOf(text: string): number {
  const sentences = text.split(/[.!?]+\s+/).filter((s) => s.trim().length > 0);
  const totalWords = text.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w)).length;
  return sentences.length === 0 ? 0 : Math.round(totalWords / sentences.length / 5) * 5;
}

function detectHeadingCase(text: string): "title" | "sentence" {
  const headings = [...text.matchAll(/^#{1,3}\s+(.+)$/gm)].map((m) => m[1]);
  if (headings.length === 0) return "sentence";
  const titleCaseCount = headings.filter((h) => {
    const words = h.split(/\s+/);
    if (words.length < 2) return false;
    return words.slice(0, Math.min(3, words.length)).every((w) => /^[A-Z]/.test(w));
  }).length;
  return titleCaseCount / headings.length > 0.5 ? "title" : "sentence";
}

function detectContractions(text: string): boolean {
  return /\b(don't|can't|won't|we're|you're|it's|that's|i've|we've|they're)\b/i.test(text);
}

function detectVoice(text: string): "first-person" | "second-person" | "third-person" {
  const i = (text.match(/\b(i|me|my|mine|we|us|our)\b/gi) || []).length;
  const you = (text.match(/\b(you|your|yours)\b/gi) || []).length;
  const max = Math.max(i, you);
  if (max < 3) return "third-person";
  return i >= you ? "first-person" : "second-person";
}

export function ruleBasedVoiceProfile(samples: string[]): DeepProfile {
  const joined = samples.join("\n\n");
  return {
    tone: "conversational",
    voice: detectVoice(joined),
    avgSentenceLength: avgSentenceLengthOf(joined),
    headingCase: detectHeadingCase(joined),
    ctaStyle: "inline-link",
    vocabularyLevel: "mixed",
    hedgeWords: "low",
    contractions: detectContractions(joined),
    emDashes: joined.includes("—") ? "moderate" : "rare",
    listsVsProse: (joined.match(/^- /gm) || []).length > 5 ? "balanced" : "prose-heavy",
    authorPersona: "friendly expert"
  };
}

export async function trainBrandVoice(samples: string[]): Promise<DeepProfile> {
  if (samples.length === 0) throw new Error("at least 1 sample required");
  const providers = chainFor(buildRegistry(process.env as Record<string, string | undefined>));
  if (providers.length === 0) return ruleBasedVoiceProfile(samples);
  try {
    const resp = await execute({
      methodologies: ["brand-voice-extraction"],
      task: "Extract the brand voice profile from these sample posts.",
      input: { samples },
      providers,
      jsonMode: true,
      temperature: 0.3
    });
    const text = resp.text.trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const sliced = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    return JSON.parse(sliced) as DeepProfile;
  } catch {
    return ruleBasedVoiceProfile(samples);
  }
}
