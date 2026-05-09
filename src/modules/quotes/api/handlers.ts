import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculatePricing } from "../services/pricingService";
import { quotesRepository } from "../repositories/quotesRepository";
import {
  canReadQuote,
  forbidden,
  getAuthContextFromRequest,
  hasPermission,
  unauthorized,
} from "@/shared/rbac";

const schema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(3),
  monthlyConsumptionKwh: z.number().int().positive(),
  systemSizeKw: z.number().positive(),
  downPayment: z.number().nonnegative().optional().default(0),
});

export async function postQuoteHandler(req: NextRequest) {
  const auth = getAuthContextFromRequest(req);
  if (!auth) return unauthorized();
  if (!hasPermission(auth, "quotes:create")) return forbidden();

  const body = schema.parse(await req.json());
  const priced = calculatePricing(
    body.systemSizeKw,
    body.monthlyConsumptionKwh,
    body.downPayment ?? 0,
  );
  const quote = await quotesRepository.create({
    userId: auth.userId,
    address: body.address,
    monthlyConsumptionKwh: body.monthlyConsumptionKwh,
    systemSizeKw: body.systemSizeKw,
    downPayment: body.downPayment ?? 0,
    systemPrice: priced.systemPrice.toString(),
    riskBand: priced.riskBand,
    offers: priced.offers,
  });
  return NextResponse.json({
    id: quote.id,
    inputs: body,
    derived: {
      systemPrice: priced.systemPrice.toFixed(2),
      riskBand: priced.riskBand,
      principal: priced.principal.toFixed(2),
    },
    offers: priced.offers,
  });
}

export async function listQuotesHandler(req: NextRequest) {
  const auth = getAuthContextFromRequest(req);
  if (!auth) return unauthorized();

  const canReadAny =
    hasPermission(auth, "quotes:read:any") ||
    hasPermission(auth, "admin:quotes:read");
  const quotes = canReadAny
    ? await quotesRepository.findManyAll()
    : await quotesRepository.findManyByUser(auth.userId);

  return NextResponse.json(quotes);
}

export async function getQuoteHandler(req: NextRequest, id: string) {
  const auth = getAuthContextFromRequest(req);
  if (!auth) return unauthorized();

  const quote = await quotesRepository.findById(id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canReadQuote(auth, quote.userId)) return forbidden();

  return NextResponse.json(quote);
}
