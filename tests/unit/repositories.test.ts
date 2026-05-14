import { describe, it, expect, vi } from "vitest";
import { quotesRepository } from "@/modules/quotes/repositories/quotesRepository";
import type { QuoteCreateData } from "@/modules/quotes/models/repository";
import { prisma } from "@/shared/db";

vi.mock("@/shared/db", () => ({
  prisma: {
    quotes: {
      findMany: vi.fn().mockResolvedValue([{ id: "q1" }]),
      create: vi.fn().mockResolvedValue({ id: "q2" }),
    },
  },
}));

function makeQuoteCreateData(
  overrides: Partial<QuoteCreateData> = {},
): QuoteCreateData {
  return {
    userId: "u1",
    address: "123 Solar Way",
    monthlyConsumptionKwh: 500,
    systemSizeKw: 5,
    downPayment: 0,
    systemPrice: "6000.00",
    riskBand: "B",
    offers: [],
    ...overrides,
  };
}

describe("quotesRepository", () => {
  it("findManyByUser calls prisma correctly", async () => {
    const quotes = await quotesRepository.findManyByUser("u1");
    expect(prisma.quotes.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "u1" },
      }),
    );
    expect(quotes.length).toBe(1);
  });

  it("create calls prisma correctly", async () => {
    const quote = await quotesRepository.create(makeQuoteCreateData());
    expect(prisma.quotes.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "u1" }),
      }),
    );
    expect(quote.id).toBe("q2");
  });
});
