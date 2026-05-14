import { NextResponse } from "next/server";
import { scanCompetitor } from "@/lib/seo/competitor-scanner";
import { assertExternalUrl, UnsafeUrlError } from "@/lib/net/ssrf-guard";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { url } = body;
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    assertExternalUrl(normalized);
  } catch (e) {
    if (e instanceof UnsafeUrlError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    throw e;
  }
  try {
    const result = await scanCompetitor(normalized);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
