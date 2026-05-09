import Decimal from "decimal.js";

export type RiskBand = "A" | "B" | "C";

const aprMap: Record<RiskBand, Decimal> = {
  A: new Decimal(6.9),
  B: new Decimal(8.9),
  C: new Decimal(11.9),
};

export function calculatePricing(
  systemSizeKw: Decimal.Value,
  monthlyConsumptionKwh: number,
  downPayment: Decimal.Value = 0,
) {
  const size = new Decimal(systemSizeKw);
  const down = new Decimal(downPayment);
  const systemPrice = size.mul(1200);
  const principal = Decimal.max(systemPrice.minus(down), 0);
  const riskBand: RiskBand =
    monthlyConsumptionKwh >= 400 && size.lte(6)
      ? "A"
      : monthlyConsumptionKwh >= 250
        ? "B"
        : "C";
  const apr = aprMap[riskBand];
  const offers = [5, 10, 15].map((termYears) => {
    const n = new Decimal(termYears * 12);
    const r = apr.div(100).div(12);
    const monthly = r.equals(0)
      ? principal.div(n)
      : principal.mul(r).mul(r.plus(1).pow(n)).div(r.plus(1).pow(n).minus(1));
    return {
      termYears,
      apr: apr.toFixed(2),
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
