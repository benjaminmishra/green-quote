import { NextRequest, NextResponse } from "next/server";

export type ParseResult =
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse };

/**
 * Reads and parses a JSON request body. Returns a discriminated
 * union so handlers can short-circuit with the prepared 400 response
 * without duplicating the try/catch.
 */
export async function parseJsonBody(req: NextRequest): Promise<ParseResult> {
  try {
    return { ok: true, body: await req.json() };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      ),
    };
  }
}
