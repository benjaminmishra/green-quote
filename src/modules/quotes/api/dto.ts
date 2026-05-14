import { Prisma } from "@prisma/client";

export const safeUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
} as const;

const quoteWithSafeUser = Prisma.validator<Prisma.QuotesDefaultArgs>()({
  include: {
    user: {
      select: safeUserSelect,
    },
  },
});

export type QuoteWithSafeUser = Prisma.QuotesGetPayload<typeof quoteWithSafeUser>;

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
