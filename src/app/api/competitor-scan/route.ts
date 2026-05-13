import { NextResponse } from "next/server";
import { scanCompetitor } from "@/lib/seo/competitor-scanner";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  const { url } = (await req.json()) as { url: string };
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  const result = await scanCompetitor(url);
  return NextResponse.json(result);
}
