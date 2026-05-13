import { googleAutocomplete } from "./autocomplete";
import { peopleAlsoAsk } from "./paa";
import { bingSerp, type SerpResult } from "./bing-serp";
import { classifyIntentByRules, type IntentResult } from "./intent";

export interface KeywordSuggestion {
  keyword: string;
  source: "autocomplete" | "paa" | "seed";
  intent: IntentResult;
}

export interface ResearchResult {
  seed: string;
  autocomplete: string[];
  paa: string[];
  serpTop10: SerpResult[];
  suggested: KeywordSuggestion[];
}

export async function research(seed: string, lang = "en"): Promise<ResearchResult> {
  const [ac, paa, serp] = await Promise.all([
    googleAutocomplete(seed, lang),
    peopleAlsoAsk(seed),
    bingSerp(seed)
  ]);

  const candidates = new Set<string>([seed]);
  for (const s of ac.suggestions) candidates.add(s.toLowerCase().trim());
  for (const q of paa) {
    // strip trailing "?" so it reads as a keyword
    candidates.add(q.toLowerCase().replace(/\?$/, "").trim());
  }

  const suggested: KeywordSuggestion[] = [...candidates].slice(0, 25).map((k) => ({
    keyword: k,
    source: k === seed ? "seed" : ac.suggestions.map((s) => s.toLowerCase()).includes(k) ? "autocomplete" : "paa",
    intent: classifyIntentByRules(k)
  }));

  return { seed, autocomplete: ac.suggestions, paa, serpTop10: serp, suggested };
}
