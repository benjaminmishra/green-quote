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
import { getLogger } from "@/shared/logger";
import { withLogging } from "@/shared/withLogging";

const schema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(3),
  monthlyConsumptionKwh: z.number().int().positive(),
  systemSizeKw: z.number().positive(),
  downPayment: z.number().nonnegative().optional().default(0),
});

export const postQuoteHandler = withLogging(async function (req: NextRequest) {
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();
    if (!hasPermission(auth, "quotes:create")) return forbidden();
    getLogger().info({ "user.id": auth.userId, msg: "Attempting to create quote" });

    const parseResult = schema.safeParse(await req.json());
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const body = parseResult.data;

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
    getLogger().info({ "user.id": auth.userId, quoteId: quote.id, msg: "Quote successfully created" });
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
    getLogger().error({ err: error, msg: "Error creating quote" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const listQuotesHandler = withLogging(async function (req: NextRequest) {
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();
    getLogger().info({ "user.id": auth.userId, msg: "Listing quotes" });

    const canReadAny =
      hasPermission(auth, "quotes:read:any") ||
      hasPermission(auth, "admin:quotes:read");
    const quotes = canReadAny
      ? await quotesRepository.findManyAll()
      : await quotesRepository.findManyByUser(auth.userId);

    return NextResponse.json(quotes);
  } catch (error) {
    getLogger().error({ err: error, msg: "Error listing quotes" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const getQuoteHandler = withLogging(async function (req: NextRequest, id: string) {
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();
    getLogger().info({ "user.id": auth.userId, quoteId: id, msg: "Getting quote" });

    const quote = await quotesRepository.findById(id);

    if (!quote)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!canReadQuote(auth, quote.userId))
      return forbidden();

    return NextResponse.json(quote);
  } catch (error) {
    getLogger().error({ err: error, msg: "Error getting quote" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
