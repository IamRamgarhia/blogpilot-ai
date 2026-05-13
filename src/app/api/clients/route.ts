import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDb, schema } from "@/lib/db";
import { ensureMigrated } from "@/lib/db/migrate";

export const runtime = "nodejs";

export async function GET() {
  await ensureMigrated();
  const db = getDb();
  const rows = await db.select().from(schema.clients).all();
  return NextResponse.json({ clients: rows });
}

export async function POST(req: Request) {
  await ensureMigrated();
  const body = (await req.json()) as { url: string; name?: string };
  if (!body.url || (!/^https?:\/\//i.test(body.url) && !body.url.includes("."))) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }
  const db = getDb();
  const id = randomUUID();
  const url = /^https?:\/\//i.test(body.url) ? body.url : `https://${body.url}`;
  await db.insert(schema.clients).values({ id, url, name: body.name ?? url }).run();
  return NextResponse.json({ id });
}
