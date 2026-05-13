import { NextResponse } from "next/server";
import { buildRegistry } from "@/lib/ai/registry";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { provider } = (await req.json()) as { provider: string };
  const registry = buildRegistry(process.env as Record<string, string | undefined>);
  const entry = registry.find((e) => e.provider.id === provider);
  if (!entry) {
    return NextResponse.json({ ok: false, error: "Key not set in environment" });
  }
  try {
    const ok = await entry.provider.test();
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}
