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
