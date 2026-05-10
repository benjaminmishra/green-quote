import { getQuoteHandler } from "@/modules/quotes/api/handlers";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return getQuoteHandler(req, params.id);
}
