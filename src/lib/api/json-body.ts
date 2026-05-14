import { NextResponse } from "next/server";

export interface ParsedBody<T> {
  ok: true;
  data: T;
}
export interface ParsedBodyError {
  ok: false;
  response: NextResponse;
}

/**
 * Parse a request JSON body without throwing. Returns either a typed body or
 * a ready-to-return NextResponse with a 400 status and helpful message.
 *
 * Usage:
 *   const body = await readJsonBody<{ clientId: string }>(req);
 *   if (!body.ok) return body.response;
 *   const { clientId } = body.data;
 */
export async function readJsonBody<T>(req: Request): Promise<ParsedBody<T> | ParsedBodyError> {
  try {
    const data = (await req.json()) as T;
    if (data === null || typeof data !== "object") {
      return {
        ok: false,
        response: NextResponse.json({ error: "JSON body must be an object" }, { status: 400 })
      };
    }
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
    };
  }
}
