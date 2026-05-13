export interface AutocompleteResult {
  query: string;
  suggestions: string[];
}

export async function googleAutocomplete(query: string, lang = "en"): Promise<AutocompleteResult> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${lang}&q=${encodeURIComponent(query)}`;
  try {
    const r = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 BlogPilotAI/0.1" }
    });
    if (!r.ok) return { query, suggestions: [] };
    const j = (await r.json()) as [string, string[]];
    return { query, suggestions: Array.isArray(j) && Array.isArray(j[1]) ? j[1] : [] };
  } catch {
    return { query, suggestions: [] };
  }
}
