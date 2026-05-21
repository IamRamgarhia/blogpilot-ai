// Recursive, host-scoped, depth-capped, throttled crawler with SSRF guard.
// Feeds CrawledPage objects to the audit rules.

import * as cheerio from "cheerio";
import { assertExternalUrl, UnsafeUrlError } from "@/lib/net/ssrf-guard";
import type { CrawledPage } from "./audits";

const USER_AGENT = "BlogPilotAI/0.1 (+https://github.com/dicecodes/blogpilot-ai)";

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  throttleMs?: number;
  includeExternal?: boolean;
}

const DEFAULTS: Required<CrawlOptions> = {
  maxPages: 50,
  maxDepth: 3,
  throttleMs: 500,
  includeExternal: false
};

function sameHost(a: string, b: string): boolean {
  try {
    return new URL(a).hostname === new URL(b).hostname;
  } catch {
    return false;
  }
}

function normalize(u: string): string {
  try {
    const url = new URL(u);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return u;
  }
}

async function fetchWithRedirects(url: string): Promise<{ statusChain: number[]; finalUrl: string; status: number; html: string; headers: Record<string, string> }> {
  // manual redirect tracking
  const statusChain: number[] = [];
  let current = url;
  for (let i = 0; i < 8; i++) {
    try {
      assertExternalUrl(current);
    } catch (e) {
      if (e instanceof UnsafeUrlError) throw e;
      throw e;
    }
    const r = await fetch(current, {
      redirect: "manual",
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*;q=0.8" }
    });
    statusChain.push(r.status);
    const loc = r.headers.get("location");
    if (r.status >= 300 && r.status < 400 && loc) {
      current = new URL(loc, current).toString();
      continue;
    }
    const html = await r.text();
    const headers: Record<string, string> = {};
    r.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });
    return { statusChain, finalUrl: r.url || current, status: r.status, html, headers };
  }
  return { statusChain, finalUrl: current, status: 0, html: "", headers: {} };
}

function extractLinks($: ReturnType<typeof cheerio.load>, base: string, sameHostOnly: boolean): string[] {
  const out: string[] = [];
  $("a[href]").each((_, el) => {
    let href = ($(el).attr("href") ?? "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;
    try {
      const abs = new URL(href, base).toString();
      if (sameHostOnly && !sameHost(abs, base)) return;
      out.push(normalize(abs));
    } catch { /* ignore */ }
  });
  return out;
}

function bodyText($: ReturnType<typeof cheerio.load>): { text: string; wordCount: number } {
  $("nav, footer, aside, header, script, style, noscript, form").remove();
  const t = ($("article").first().text() || $("main").first().text() || $("body").text())
    .replace(/\s+/g, " ").trim();
  const words = t.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  return { text: t, wordCount: words.length };
}

export async function crawlSite(seedUrl: string, options: CrawlOptions = {}): Promise<CrawledPage[]> {
  const opts = { ...DEFAULTS, ...options };
  try {
    assertExternalUrl(seedUrl);
  } catch (e) {
    if (e instanceof UnsafeUrlError) throw e;
    throw e;
  }
  const start = normalize(seedUrl);
  const visited = new Set<string>();
  const queue: Array<{ url: string; depth: number }> = [{ url: start, depth: 0 }];
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < opts.maxPages) {
    const next = queue.shift()!;
    if (visited.has(next.url)) continue;
    visited.add(next.url);

    let resp;
    try {
      resp = await fetchWithRedirects(next.url);
    } catch {
      continue;
    }
    if (!resp.html || resp.status >= 400) continue;
    const $ = cheerio.load(resp.html);
    const body = bodyText(cheerio.load(resp.html));

    pages.push({
      url: next.url,
      finalUrl: resp.finalUrl,
      statusChain: resp.statusChain,
      status: resp.status,
      html: resp.html,
      $,
      headers: resp.headers,
      bodyText: body.text,
      wordCount: body.wordCount
    });

    if (next.depth < opts.maxDepth) {
      const links = extractLinks($, resp.finalUrl, !opts.includeExternal);
      for (const link of links) {
        if (!visited.has(link)) {
          queue.push({ url: link, depth: next.depth + 1 });
        }
      }
    }
    await new Promise((r) => setTimeout(r, opts.throttleMs));
  }

  return pages;
}
