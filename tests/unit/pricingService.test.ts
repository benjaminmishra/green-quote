import { describe, it, expect } from "vitest";
import { calculatePricing } from "@/modules/quotes/services/pricingService";

describe("pricing", () => {
  it("band A", () => {
    const r = calculatePricing(6, 400, 0);
    expect(r.riskBand).toBe("A");
    expect(r.systemPrice.toNumber()).toBe(7200);
  });
  it("band B", () => {
    expect(calculatePricing(7, 300, 0).riskBand).toBe("B");
  });
  it("band C", () => {
    expect(calculatePricing(5, 100, 0).riskBand).toBe("C");
  });
});
