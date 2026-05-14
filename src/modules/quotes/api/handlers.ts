import { NextRequest, NextResponse } from "next/server";
import {
  QuotesInvalidCursorError,
  quotesRepository,
} from "../repositories/quotesRepository";
import { quoteService } from "../services/quoteService";
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
import { parseJsonBody } from "@/shared/parseJsonBody";
import { toQuoteResponse } from "./dto";

export const postQuoteHandler = withLogging(async function (req: NextRequest) {
  try {
    const auth = getAuthContextFromRequest(req);
    if (!auth) return unauthorized();

    if (!hasPermission(auth, "quotes:create")) return forbidden();

    getLogger().info({
      "user.id": auth.userId,
      msg: "Attempting to create quote",
    });

    const parsed = await parseJsonBody(req);
    if (!parsed.ok) return parsed.response;

    const parseResult = quoteCreateSchema.safeParse(parsed.body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }
    const { quote, priced, input } = await quoteService.createQuote(
      auth.userId,
      parseResult.data,
    );

    getLogger().info({
      "user.id": auth.userId,
      quoteId: quote.id,
      msg: "Quote successfully created",
    });
    return NextResponse.json({
      id: quote.id,
      inputs: input,
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
    if (error instanceof QuotesInvalidCursorError) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }
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
