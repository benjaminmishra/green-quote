import Decimal from "decimal.js";
import type { RiskBand } from "@prisma/client";
import { ServiceError } from "@/shared/errors";

export class PricingServiceError extends ServiceError {}

/**
 * Determines the risk band based on consumption and system size.
 * This business logic stays in code — not in the database.
 * @param monthlyConsumptionKwh Monthly consumption in kilowatt-hours.
 * @param systemSizeKw System size in kilowatts.
 * @returns The risk band.
 */
export function determineRiskBand(
  monthlyConsumptionKwh: number,
  systemSizeKw: Decimal.Value,
): RiskBand {
  const size = new Decimal(systemSizeKw);
  return monthlyConsumptionKwh >= 400 && size.lte(6)
    ? "A"
    : monthlyConsumptionKwh >= 250
      ? "B"
      : "C";
}

/**
 * Calculates pricing for a solar quote.
 * APR comes from the RiskBands table, term options come from the LoanTerms table.
 * This function is pure — no DB access.
 * @param systemSizeKw System size in kilowatts.
 * @param monthlyConsumptionKwh Monthly consumption in kilowatt-hours.
 * @param downPayment Down payment in dollars.
 * @param apr Annual percentage rate.
 * @param termOptions Array of loan terms in years.
 * @returns Object containing system price, principal, risk band, and offers.
 */
export function calculatePricing(
  systemSizeKw: Decimal.Value,
  monthlyConsumptionKwh: number,
  downPayment: Decimal.Value,
  apr: Decimal.Value,
  termOptions: number[],
) {
  const size = new Decimal(systemSizeKw);
  const down = new Decimal(downPayment);
  const systemPrice = size.mul(1200);
  const principal = Decimal.max(systemPrice.minus(down), 0);
  const riskBand = determineRiskBand(monthlyConsumptionKwh, systemSizeKw);

  const aprDec = new Decimal(apr);

  const offers = termOptions.map((termYears) => {
    const n = new Decimal(termYears * 12);
    const r = aprDec.div(100).div(12);
    const monthly = r.equals(0)
      ? principal.div(n)
      : principal.mul(r).mul(r.plus(1).pow(n)).div(r.plus(1).pow(n).minus(1));
    return {
      termYears,
      apr: aprDec.toFixed(2),
      principalUsed: principal.toFixed(2),
      monthlyPayment: monthly.toDecimalPlaces(2).toFixed(2),
    };
  });

  return {
    systemPrice: systemPrice.toDecimalPlaces(2),
    principal: principal.toDecimalPlaces(2),
    riskBand,
    offers,
  };
}
