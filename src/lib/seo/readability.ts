export interface ReadabilityReport {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  avgSentenceLength: number;
  passiveVoicePercent: number;
  longParagraphs: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  warnings: string[];
}

const PASSIVE_RX = /\b(was|were|been|being|is|are|am|be)\s+\w+(?:ed|en)\b/i;
const TRANSITION_RX = /^(however|moreover|furthermore|in contrast|besides|beyond that|in addition|therefore|consequently|on the other hand|meanwhile|conversely|likewise|similarly|nonetheless|nevertheless|in conclusion|finally|notably|specifically|for example|for instance)\b/i;

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>]/g, "");
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, matches ? matches.length : 1);
}

export function readability(markdown: string): ReadabilityReport {
  const text = stripMarkdown(markdown).trim();
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const sentences = text.split(/[.!?]+\s+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const words = text.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const paragraphCount = paragraphs.length;

  const avgSentenceLength = wordCount / sentenceCount;
  const fkGrade = 0.39 * avgSentenceLength + 11.8 * (syllables / Math.max(1, wordCount)) - 15.59;
  const fkEase = 206.835 - 1.015 * avgSentenceLength - 84.6 * (syllables / Math.max(1, wordCount));

  const passiveCount = sentences.filter((s) => PASSIVE_RX.test(s)).length;
  const passivePct = (passiveCount / sentenceCount) * 100;

  const longParagraphs = paragraphs.filter(
    (p) => p.split(/[.!?]+/).filter((s) => s.trim().length > 0).length > 4
  ).length;

  const warnings: string[] = [];
  if (avgSentenceLength > 25) warnings.push(`Average sentence is ${avgSentenceLength.toFixed(1)} words; aim for under 22.`);
  if (passivePct > 10) warnings.push(`Passive voice ${passivePct.toFixed(0)}%; reduce to under 10%.`);
  if (longParagraphs > 0) warnings.push(`${longParagraphs} paragraph(s) longer than 4 sentences.`);
  if (fkGrade > 12) warnings.push(`Flesch-Kincaid grade ${fkGrade.toFixed(1)} is too high; simplify.`);

  return {
    fleschKincaidGrade: Number(fkGrade.toFixed(1)),
    fleschReadingEase: Number(fkEase.toFixed(1)),
    avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
    passiveVoicePercent: Number(passivePct.toFixed(1)),
    longParagraphs,
    wordCount,
    sentenceCount,
    paragraphCount,
    warnings
  };
}
