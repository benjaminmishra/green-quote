import type { z } from "zod";
import type { quoteCreateSchema } from "@/shared/schemas";
import { configRepository } from "../repositories/configRepository";
import { quotesRepository } from "../repositories/quotesRepository";
import { calculatePricing, determineRiskBand } from "./pricingService";

export type CreateQuoteInput = z.infer<typeof quoteCreateSchema>;

export const quoteService = {
  /**
   * Creates a quote: determines the risk band, prices the offers,
   * and persists the resulting quote. Owns all the repository and
   * pricing orchestration so handlers stay thin.
   */
  async createQuote(userId: string, input: CreateQuoteInput) {
    const downPayment = input.downPayment ?? 0;
    const riskBand = determineRiskBand(
      input.monthlyConsumptionKwh,
      input.systemSizeKw,
    );

    const riskBandRow = await configRepository.findRiskBand(riskBand);
    const loanTerms = await configRepository.findActiveLoanTerms();
    const termOptions = loanTerms.map((t) => t.termYears);

    const priced = calculatePricing(
      input.systemSizeKw,
      downPayment,
      riskBandRow.apr,
      termOptions,
      riskBand,
    );

    const quote = await quotesRepository.create({
      userId,
      address: input.address,
      monthlyConsumptionKwh: input.monthlyConsumptionKwh,
      systemSizeKw: input.systemSizeKw,
      downPayment,
      systemPrice: priced.systemPrice.toString(),
      riskBand: priced.riskBand,
      offers: priced.offers,
    });

    return { quote, priced, input: { ...input, downPayment } };
  },
};
