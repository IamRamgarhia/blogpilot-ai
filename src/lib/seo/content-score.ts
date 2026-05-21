// The Surfer/Clearscope-killer scoring engine.

import { tfidfRank, docStats, countTerms, type TermScore } from "./tfidf";
import { bingSerp, type SerpResult } from "./bing-serp";
import { peopleAlsoAsk } from "./paa";
import { fetchSerpPages, type SerpPageContent } from "./serp-content";

export interface TermCoverageItem {
  term: string;
  in_competitors: number;
  in_draft: number;
  median_count_in_competitors: number;
  status: "ok" | "missing" | "over_optimized";
}

export interface ContentScoreBreakdown {
  required_terms: { points: number; max: number; covered: number; total: number };
  recommended_terms: { points: number; max: number; covered: number; total: number };
  word_count: { points: number; max: number; actual: number; median: number };
  headings: { points: number; max: number; covered: number; total: number };
  questions: { points: number; max: number; covered: number; total: number };
}

export interface ContentScoreReport {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: ContentScoreBreakdown;
  required: TermCoverageItem[];
  recommended: TermCoverageItem[];
  over_optimized: Array<{ term: string; draft_count: number; median_count: number }>;
  paa_questions_covered: Array<{ q: string; covered: boolean }>;
  competitor_count: number;
  serp_median_words: number;
  serp_headings_top3: string[];
}

function grade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 55) return "D";
  return "F";
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function jaccardWords(a: string, b: string): number {
  const wa = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const wb = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (wa.size === 0 && wb.size === 0) return 0;
  let inter = 0;
  for (const x of wa) if (wb.has(x)) inter++;
  return inter / (wa.size + wb.size - inter);
}

export async function gatherCorpus(keyword: string): Promise<{
  serp: SerpResult[];
  pages: SerpPageContent[];
  paaQuestions: string[];
}> {
  const serp = await bingSerp(keyword);
  const top = serp.slice(0, 10);
  const [pages, paaQuestions] = await Promise.all([
    fetchSerpPages(top.map((r) => r.url)),
    peopleAlsoAsk(keyword)
  ]);
  return { serp: top, pages, paaQuestions };
}

export interface CorpusContext {
  pages: SerpPageContent[];
  paaQuestions: string[];
}

function competitorDocFrequency(term: string, pages: SerpPageContent[]): number {
  // Use the same stemmed counting as countTerms to keep parity with the draft.
  let df = 0;
  for (const p of pages) {
    if (!p.fetched || !p.body) continue;
    const counts = countTerms(p.body, [term]);
    if ((counts.get(term) ?? 0) > 0) df++;
  }
  return df;
}

function competitorMedianCount(term: string, pages: SerpPageContent[]): number {
  const counts: number[] = [];
  for (const p of pages) {
    if (!p.fetched || !p.body) continue;
    counts.push(countTerms(p.body, [term]).get(term) ?? 0);
  }
  return median(counts);
}

export function scoreDraft(
  draftMarkdown: string,
  draftHeadings: string[],
  ctx: CorpusContext
): ContentScoreReport {
  const fetched = ctx.pages.filter((p) => p.fetched && p.body.length > 200);
  const competitorCount = fetched.length;

  // 1. Extract candidate terms via TF-IDF across competitor bodies
  const bodies = fetched.map((p) => p.body);
  const tfidf = bodies.length >= 2 ? tfidfRank(bodies, 200) : [];

  // 2. Split into required (df >= 5) and recommended (df 3-4)
  const required: TermScore[] = tfidf.filter((t) => t.documentFrequency >= 5);
  const recommended: TermScore[] = tfidf.filter((t) => t.documentFrequency >= 3 && t.documentFrequency < 5);

  // 3. Count each candidate term in the draft
  const allTerms = [...required, ...recommended].map((t) => t.term);
  const draftCounts = countTerms(draftMarkdown, allTerms);

  function buildItem(t: TermScore): TermCoverageItem {
    const draftCount = draftCounts.get(t.term) ?? 0;
    const compMedian = competitorMedianCount(t.term, fetched);
    let status: TermCoverageItem["status"] = draftCount > 0 ? "ok" : "missing";
    if (compMedian > 0 && draftCount > compMedian * 2.5) status = "over_optimized";
    return {
      term: t.term,
      in_competitors: t.documentFrequency,
      in_draft: draftCount,
      median_count_in_competitors: compMedian,
      status
    };
  }

  const requiredItems = required.map(buildItem);
  const recommendedItems = recommended.map(buildItem);

  // 4. Coverage points
  const requiredCovered = requiredItems.filter((r) => r.in_draft > 0).length;
  const recommendedCovered = recommendedItems.filter((r) => r.in_draft > 0).length;
  const overOptimized = requiredItems
    .concat(recommendedItems)
    .filter((r) => r.status === "over_optimized");

  const requiredPts =
    requiredItems.length > 0
      ? Math.max(0, (requiredCovered / requiredItems.length) * 50 - overOptimized.length * 5)
      : 50;
  const recommendedPts =
    recommendedItems.length > 0
      ? (recommendedCovered / recommendedItems.length) * 20
      : 20;

  // 5. Word count
  const draftWordCount = draftMarkdown.split(/\s+/).filter(Boolean).length;
  const medianWords = median(fetched.map((p) => p.wordCount));
  let wordPts = 0;
  if (medianWords > 0) {
    const lo = medianWords * 0.7;
    const hi = medianWords * 1.5;
    if (draftWordCount >= lo && draftWordCount <= hi) {
      wordPts = 15;
    } else {
      const dist = draftWordCount < lo ? (lo - draftWordCount) / medianWords : (draftWordCount - hi) / medianWords;
      wordPts = Math.max(0, 15 * (1 - dist));
    }
  } else {
    wordPts = 15;
  }

  // 6. Heading parity (against top-3)
  const top3Headings = fetched.slice(0, 3).flatMap((p) => p.headings);
  const top3Clusters: string[][] = [];
  for (const h of top3Headings) {
    const cluster = top3Clusters.find((c) => c.some((x) => jaccardWords(x, h) > 0.4));
    if (cluster) cluster.push(h);
    else top3Clusters.push([h]);
  }
  const mainClusters = top3Clusters.filter((c) => c.length >= 2).slice(0, 3);
  let headingsCovered = 0;
  for (const cluster of mainClusters) {
    const draftHasIt = draftHeadings.some((dh) =>
      cluster.some((ch) => jaccardWords(dh, ch) > 0.3)
    );
    if (draftHasIt) headingsCovered++;
  }
  const headingPts = mainClusters.length === 0 ? 10 : (headingsCovered / mainClusters.length) * 10;

  // 7. PAA / question coverage
  const draftLower = draftMarkdown.toLowerCase();
  const paaCovered = ctx.paaQuestions.map((q) => ({
    q,
    covered: draftLower.includes(q.toLowerCase().replace(/\?$/, "").trim().slice(0, 40))
  }));
  const questionPts = ctx.paaQuestions.length === 0 ? 5 : (paaCovered.filter((p) => p.covered).length / ctx.paaQuestions.length) * 5;

  const score = Math.round(requiredPts + recommendedPts + wordPts + headingPts + questionPts);

  return {
    score,
    grade: grade(score),
    breakdown: {
      required_terms: { points: Math.round(requiredPts), max: 50, covered: requiredCovered, total: requiredItems.length },
      recommended_terms: { points: Math.round(recommendedPts), max: 20, covered: recommendedCovered, total: recommendedItems.length },
      word_count: { points: Math.round(wordPts), max: 15, actual: draftWordCount, median: Math.round(medianWords) },
      headings: { points: Math.round(headingPts), max: 10, covered: headingsCovered, total: mainClusters.length },
      questions: { points: Math.round(questionPts), max: 5, covered: paaCovered.filter((p) => p.covered).length, total: ctx.paaQuestions.length }
    },
    required: requiredItems.slice(0, 30),
    recommended: recommendedItems.slice(0, 30),
    over_optimized: overOptimized.map((r) => ({
      term: r.term,
      draft_count: r.in_draft,
      median_count: r.median_count_in_competitors
    })),
    paa_questions_covered: paaCovered,
    competitor_count: competitorCount,
    serp_median_words: Math.round(medianWords),
    serp_headings_top3: top3Headings.slice(0, 20)
  };
}
