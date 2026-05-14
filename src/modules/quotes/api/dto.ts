import type { QuoteWithSafeUser } from "../models/userProjection";

export function toQuoteResponse(quote: QuoteWithSafeUser) {
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
