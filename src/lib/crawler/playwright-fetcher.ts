import { fetchHtml as cheerioFetch } from "./cheerio-fetcher";

export interface SmartFetchResult {
  html: string;
  finalUrl: string;
  status: number;
  rendered: boolean;
}

export async function fetchHtmlSmart(url: string): Promise<SmartFetchResult> {
  try {
    const { chromium } = await import("playwright");
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
    } catch {
      // Browser binary not installed; fall through to Cheerio.
      const r = await cheerioFetch(url);
      return { ...r, rendered: false };
    }
    try {
      const ctx = await browser.newContext({ userAgent: "BlogPilotAI/0.1" });
      const page = await ctx.newPage();
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
      const html = await page.content();
      return {
        html,
        finalUrl: page.url(),
        status: resp?.status() ?? 0,
        rendered: true
      };
    } finally {
      await browser.close();
    }
  } catch {
    const r = await cheerioFetch(url);
    return { ...r, rendered: false };
  }
}
