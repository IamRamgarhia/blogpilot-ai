import { NextResponse } from "next/server";
import { buildPaaTree } from "@/lib/seo/paa-tree";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  let body: { seed?: string; maxDepth?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { seed, maxDepth } = body;
  if (!seed) return NextResponse.json({ error: "seed required" }, { status: 400 });
  const tree = await buildPaaTree(seed, { maxDepth: maxDepth ?? 3 });
  return NextResponse.json({ tree });
}
