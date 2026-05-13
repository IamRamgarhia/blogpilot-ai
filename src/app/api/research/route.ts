import { NextResponse } from "next/server";
import { research } from "@/lib/seo/research";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { seed, lang } = (await req.json()) as { seed: string; lang?: string };
  if (!seed || seed.length < 2) {
    return NextResponse.json({ error: "seed required" }, { status: 400 });
  }
  const result = await research(seed, lang ?? "en");
  return NextResponse.json(result);
}
