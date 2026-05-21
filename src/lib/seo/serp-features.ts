// Detect SERP features by scraping a Bing search results page.
// Bing exposes most major feature types in HTML form.

import * as cheerio from "cheerio";

export type SerpFeature =
  | "featured_snippet"
  | "paa"
  | "shopping"
  | "map_pack"
  | "video_carousel"
  | "image_pack"
  | "knowledge_panel"
  | "top_stories"
  | "twitter_box";

export interface SerpFeaturesResult {
  keyword: string;
  features: SerpFeature[];
  total_results_indicator: string | null;
  notes: string[];
}

export async function detectSerpFeatures(keyword: string): Promise<SerpFeaturesResult> {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`;
  const notes: string[] = [];
  try {
    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9"
      }
    });
    if (!r.ok) return { keyword, features: [], total_results_indicator: null, notes: [`HTTP ${r.status}`] };
    const html = await r.text();
    const $ = cheerio.load(html);

    const features: SerpFeature[] = [];

    // Featured snippet — Bing uses ".b_ans" or ".b_focusLabel"
    if ($(".b_ans .b_snippet, .b_focusLabel, .rwrl_padref").length > 0) features.push("featured_snippet");

    // People Also Ask
    if ($(".df_qntext, .df_qntxt, .b_secondaryFocus, .b_rich .b_subModule li:has(.df_qntext)").length > 0) {
      features.push("paa");
    }

    // Shopping carousel
    if ($(".pa_carousel, .shop_carousel, [data-priority='shopping']").length > 0) features.push("shopping");

    // Map pack / local
    if ($(".b_localPOIvg, .lo_hl, [data-priority='maps']").length > 0) features.push("map_pack");

    // Video carousel
    if ($(".vidthumb, .b_vlist2col, .b_videoSearchCarousel").length > 0) features.push("video_carousel");

    // Image pack
    if ($(".imgpt, .b_imagePair, .b_imagepair").length > 0) features.push("image_pack");

    // Knowledge panel / entity card
    if ($(".b_entityTP, .lite_entityCard, .b_factrow").length > 0) features.push("knowledge_panel");

    // Top stories / news
    if ($(".na_n, .news-card, .b_topnews").length > 0) features.push("top_stories");

    // Twitter / X
    if ($(".b_twtrCard, .twitter").length > 0) features.push("twitter_box");

    const totalIndicator = $(".sb_count").first().text().trim() || null;

    return { keyword, features, total_results_indicator: totalIndicator, notes };
  } catch (e) {
    return { keyword, features: [], total_results_indicator: null, notes: [(e as Error).message] };
  }
}
