import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculatePricing, determineRiskBand } from "../services/pricingService";
import { quotesRepository } from "../repositories/quotesRepository";
import { prisma } from "@/shared/db";
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
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();
    if (!hasPermission(auth, "quotes:create")) return forbidden();

    const parseResult = schema.safeParse(await req.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const body = parseResult.data;

    // Determine risk band (business logic stays in code)
    const riskBand = determineRiskBand(body.monthlyConsumptionKwh, body.systemSizeKw);

    // Fetch APR and active loan terms from DB
    const riskBandRow = await prisma.riskBands.findUniqueOrThrow({ where: { band: riskBand } });
    const loanTermRows = await prisma.loanTerms.findMany({ where: { active: true }, orderBy: { termYears: "asc" } });
    const termOptions = loanTermRows.map(t => t.termYears);

    const priced = calculatePricing(
      body.systemSizeKw,
      body.monthlyConsumptionKwh,
      body.downPayment ?? 0,
      riskBandRow.apr,
      termOptions,
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
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function listQuotesHandler(req: NextRequest) {
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();

    const canReadAny =
      hasPermission(auth, "quotes:read:any") ||
      hasPermission(auth, "admin:quotes:read");
    const quotes = canReadAny
      ? await quotesRepository.findManyAll()
      : await quotesRepository.findManyByUser(auth.userId);

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error listing quotes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function getQuoteHandler(req: NextRequest, id: string) {
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();

    const quote = await quotesRepository.findById(id);
    
    if (!quote) 
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    if (!canReadQuote(auth, quote.userId)) 
      return forbidden();

    return NextResponse.json(quote);
  } catch (error) {
    console.error("Error getting quote:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
