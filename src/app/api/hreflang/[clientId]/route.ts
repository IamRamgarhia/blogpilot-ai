import { NextResponse } from "next/server";
import { validateHreflangSet, buildHreflangTags, buildHreflangSitemapBlock, type HreflangVariant } from "@/lib/seo/hreflang";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { variants, format } = (await req.json()) as {
    variants: HreflangVariant[];
    format?: "tags" | "sitemap";
  };
  const v = validateHreflangSet(variants ?? []);
  const tags = (format ?? "tags") === "sitemap"
    ? buildHreflangSitemapBlock(variants ?? [])
    : buildHreflangTags(variants ?? []);
  return NextResponse.json({ ...v, tags });
}
