import { NextResponse } from "next/server";
import { detectSerpFeatures } from "@/lib/seo/serp-features";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { keyword?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!body.keyword) return NextResponse.json({ error: "keyword required" }, { status: 400 });
  const result = await detectSerpFeatures(body.keyword);
  return NextResponse.json(result);
}
