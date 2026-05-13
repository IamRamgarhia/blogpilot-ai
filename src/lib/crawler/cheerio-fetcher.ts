import * as cheerio from "cheerio";

export interface FetchResult {
  html: string;
  finalUrl: string;
  status: number;
}

export async function fetchHtml(url: string, signal?: AbortSignal): Promise<FetchResult> {
  const r = await fetch(url, {
    redirect: "follow",
    signal,
    headers: {
      "user-agent": "BlogPilotAI/0.1 (+https://github.com/dicecodes/blogpilot-ai)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });
  const html = await r.text();
  return { html, finalUrl: r.url, status: r.status };
}

export function load(html: string) {
  return cheerio.load(html);
}
