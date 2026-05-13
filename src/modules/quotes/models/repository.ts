import type { RiskBand } from "@prisma/client";
import type { Offer } from "./ui";

export type QuoteCreateData = {
  userId: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment: number;
  systemPrice: string;
  riskBand: RiskBand;
  offers: Offer[];
};
