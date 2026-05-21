// Pure-TS TF-IDF + n-gram term extractor. Zero external dependencies.
// Used by the Content Score engine to identify must-have terms from top-10 SERP.

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","but","by","for","from","has","have","had",
  "he","her","his","i","in","is","it","its","of","on","or","our","that","the",
  "their","there","these","they","this","to","was","we","were","what","when",
  "where","which","who","why","will","with","you","your","do","does","did","not",
  "no","yes","so","up","out","if","then","than","just","very","more","most",
  "much","some","any","all","each","every","into","over","under","about",
  "would","could","should","may","might","can","also","now","here","also",
  "one","two","three","first","last","new","old","other","another","such",
  "only","own","same","too","while","being","been","through","across","because"
]);

const WORD_RX = /[a-z][a-z0-9'-]{1,}/g;

function stem(word: string): string {
  // Lightweight Porter-style suffix stripping. Not perfect, but good enough for term-matching.
  let w = word.toLowerCase();
  for (const suf of ["ing", "edly", "ly", "ed", "es", "s"]) {
    if (w.length > suf.length + 2 && w.endsWith(suf)) {
      w = w.slice(0, -suf.length);
      break;
    }
  }
  return w;
}

export interface TokenizeOptions {
  keepStopWords?: boolean;
  minLength?: number;
}

export function tokenize(text: string, opts: TokenizeOptions = {}): string[] {
  const lower = text.toLowerCase();
  const matches = lower.match(WORD_RX) ?? [];
  const min = opts.minLength ?? 2;
  return matches.filter((w) => {
    if (w.length < min) return false;
    if (!opts.keepStopWords && STOP_WORDS.has(w)) return false;
    return true;
  });
}

export function tokenizeStemmed(text: string): string[] {
  return tokenize(text).map(stem);
}

export function ngrams(tokens: string[], n: number): string[] {
  if (n < 2 || tokens.length < n) return [];
  const out: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens.slice(i, i + n).join(" ");
    // Drop n-grams entirely composed of stop words / tiny tokens
    out.push(gram);
  }
  return out;
}

export interface DocStats {
  tokens: string[];
  bigrams: string[];
  trigrams: string[];
  length: number;
}

export function docStats(text: string): DocStats {
  const tokens = tokenizeStemmed(text);
  return {
    tokens,
    bigrams: ngrams(tokens, 2),
    trigrams: ngrams(tokens, 3),
    length: tokens.length
  };
}

export interface TermScore {
  term: string;
  /** Number of documents in the corpus that contain this term. */
  documentFrequency: number;
  /** Average term-frequency across documents that contain it. */
  meanTermFrequency: number;
  /** TF-IDF score (averaged TF * IDF). */
  tfidf: number;
  /** "single" | "phrase" — phrases get a 1.5x weight applied. */
  kind: "single" | "phrase";
}

/**
 * Compute weighted TF-IDF scores across a corpus of documents.
 * Returns terms sorted by tfidf descending.
 */
export function tfidfRank(documents: string[], topN = 100): TermScore[] {
  if (documents.length === 0) return [];
  const stats = documents.map(docStats);
  const N = stats.length;

  type Acc = { df: number; tfs: number[]; kind: "single" | "phrase" };
  const acc = new Map<string, Acc>();

  function recordTokens(tokens: string[], kind: "single" | "phrase") {
    for (const s of stats) {
      const docTokens = kind === "single" ? s.tokens : tokens === s.bigrams ? s.bigrams : s.trigrams;
      const counts = new Map<string, number>();
      for (const t of docTokens) counts.set(t, (counts.get(t) ?? 0) + 1);
      for (const [term, count] of counts) {
        let a = acc.get(term);
        if (!a) {
          a = { df: 0, tfs: [], kind };
          acc.set(term, a);
        }
        a.df++;
        a.tfs.push(count / Math.max(1, s.length));
      }
    }
  }

  // Loop docs once for each n-gram kind; record per-doc presence
  for (const kind of ["single", "phrase"] as const) {
    const acc2 = new Map<string, { df: number; tfs: number[] }>();
    for (const s of stats) {
      const docTokens = kind === "single" ? s.tokens : [...s.bigrams, ...s.trigrams];
      const counts = new Map<string, number>();
      for (const t of docTokens) counts.set(t, (counts.get(t) ?? 0) + 1);
      for (const [term, count] of counts) {
        let a = acc2.get(term);
        if (!a) {
          a = { df: 0, tfs: [] };
          acc2.set(term, a);
        }
        a.df++;
        a.tfs.push(count / Math.max(1, s.length));
      }
    }
    for (const [term, a] of acc2) {
      const existing = acc.get(term);
      if (existing) {
        existing.df = Math.max(existing.df, a.df);
        existing.tfs = existing.tfs.concat(a.tfs);
      } else {
        acc.set(term, { ...a, kind });
      }
    }
  }
  void recordTokens; // suppress unused warning

  const results: TermScore[] = [];
  for (const [term, a] of acc) {
    if (a.df < 2) continue;
    if (term.length < 3) continue;
    const idf = Math.log(N / a.df);
    const meanTf = a.tfs.reduce((x, y) => x + y, 0) / a.tfs.length;
    const weight = a.kind === "phrase" ? 1.5 : 1;
    results.push({
      term,
      documentFrequency: a.df,
      meanTermFrequency: meanTf,
      tfidf: meanTf * idf * weight,
      kind: a.kind
    });
  }

  return results.sort((a, b) => b.tfidf - a.tfidf).slice(0, topN);
}

/**
 * Returns the count of how many times each term appears in a document (after stemming).
 */
export function countTerms(text: string, terms: string[]): Map<string, number> {
  const s = docStats(text);
  const haystack = new Set([...s.tokens, ...s.bigrams, ...s.trigrams]);
  const result = new Map<string, number>();
  // Build per-term occurrences via simple sliding match — for phrases we just count substring occurrences in the joined text.
  const joined = s.tokens.join(" ");
  for (const t of terms) {
    if (t.includes(" ")) {
      const rx = new RegExp(`(^| )${escapeRx(t)}( |$)`, "g");
      const matches = joined.match(rx);
      result.set(t, matches?.length ?? 0);
    } else {
      let count = 0;
      for (const tok of s.tokens) if (tok === t) count++;
      result.set(t, count);
    }
  }
  return result;
}

function escapeRx(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { stem };
