import { NextRequest, NextResponse } from "next/server";
import {
  calculatePricing,
  determineRiskBand,
} from "../services/pricingService";
import { quotesRepository } from "../repositories/quotesRepository";
import { configRepository } from "../repositories/configRepository";
import {
  canReadQuote,
  forbidden,
  getAuthContextFromRequest,
  hasPermission,
  unauthorized,
} from "@/shared/rbac";
import { getLogger } from "@/shared/logger";
import { withLogging } from "@/shared/withLogging";
import { quoteCreateSchema } from "@/shared/schemas";
import { ServiceError } from "@/shared/errors";

function toQuoteResponse(quote: any) {
  return {
    id: quote.id,
    userId: quote.userId,
    address: quote.address,
    monthlyConsumptionKwh: quote.monthlyConsumptionKwh,
    systemSizeKw: quote.systemSizeKw.toString(),
    downPayment: quote.downPayment.toString(),
    systemPrice: quote.systemPrice.toString(),
    riskBand: quote.riskBand,
    offers: quote.offers,
    createdAt: quote.createdAt,
    user: quote.user
      ? {
          id: quote.user.id,
          email: quote.user.email,
          fullName: quote.user.fullName,
          role: quote.user.role,
        }
      : undefined,
  };
}

export const postQuoteHandler = withLogging(async function (req: NextRequest) {
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();

    if (!hasPermission(auth, "quotes:create")) return forbidden();

    getLogger().info({
      "user.id": auth.userId,
      msg: "Attempting to create quote",
    });

    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }
    const parseResult = quoteCreateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }
    const body = parseResult.data;

    const riskBand = determineRiskBand(
      body.monthlyConsumptionKwh,
      body.systemSizeKw,
    );

    const riskBandRow = await configRepository.findRiskBand(riskBand);
    const loanTermRows = await configRepository.findActiveLoanTerms();
    const termOptions = loanTermRows.map((t) => t.termYears);

    const priced = calculatePricing(
      body.systemSizeKw,
      body.downPayment ?? 0,
      riskBandRow.apr,
      termOptions,
      riskBand,
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
    getLogger().info({
      "user.id": auth.userId,
      quoteId: quote.id,
      msg: "Quote successfully created",
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
    if (error instanceof ServiceError) {
      getLogger().warn({ err: error, msg: "Service error creating quote" });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    getLogger().error({ err: error, msg: "Error creating quote" });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});

export const listQuotesHandler = withLogging(async function (req: NextRequest) {
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();
    getLogger().info({ "user.id": auth.userId, msg: "Listing quotes" });

    const searchParams = req.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    let limit = 20;

    if (limitParam !== null) {
      const rawLimit = Number(limitParam);
      if (!Number.isInteger(rawLimit) || rawLimit <= 0) {
        return NextResponse.json(
          { error: "Invalid limit parameter" },
          { status: 400 },
        );
      }
      limit = Math.min(rawLimit, 100);
    }

    const cursor = searchParams.get("cursor") || undefined;

    const canReadAny =
      hasPermission(auth, "quotes:read:any") ||
      hasPermission(auth, "admin:quotes:read");
    const quotes = canReadAny
      ? await quotesRepository.findManyAll({ limit, cursor })
      : await quotesRepository.findManyByUser(auth.userId, { limit, cursor });

    const nextCursor =
      quotes.length === limit ? quotes[quotes.length - 1].id : null;

    return NextResponse.json({
      items: quotes.map(toQuoteResponse),
      nextCursor,
    });
  } catch (error) {
    getLogger().error({ err: error, msg: "Error listing quotes" });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});

export const getQuoteHandler = withLogging(async function (
  req: NextRequest,
  ...args: unknown[]
) {
  const id = args[0];
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Missing quote id" }, { status: 400 });
  }
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();
    getLogger().info({
      "user.id": auth.userId,
      quoteId: id,
      msg: "Getting quote",
    });

    const quote = await quotesRepository.findById(id);

    if (!quote)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!canReadQuote(auth, quote.userId)) return forbidden();

    return NextResponse.json(toQuoteResponse(quote));
  } catch (error) {
    getLogger().error({ err: error, msg: "Error getting quote" });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});
