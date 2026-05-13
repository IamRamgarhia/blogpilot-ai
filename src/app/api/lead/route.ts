import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    message?: string;
    source?: string;
  };
  if (env.DICE_LEAD_WEBHOOK) {
    try {
      await fetch(env.DICE_LEAD_WEBHOOK, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch {
      // best-effort; do not surface to user
    }
  }
  return NextResponse.json({
    ok: true,
    contact: { email: "Contact@dicecodes.com", whatsapp: "+919888404991" }
  });
}
