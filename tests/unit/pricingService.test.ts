import { describe, it, expect } from "vitest";
import {
  calculatePricing,
  determineRiskBand,
} from "@/modules/quotes/services/pricingService";

describe("determineRiskBand", () => {
  it("returns A for high consumption and small system", () => {
    expect(determineRiskBand(400, 6)).toBe("A");
  });
  it("returns B for moderate consumption", () => {
    expect(determineRiskBand(300, 7)).toBe("B");
  });
  it("returns C for low consumption", () => {
    expect(determineRiskBand(100, 5)).toBe("C");
  });
});

describe("calculatePricing", () => {
  it("band A with correct system price", () => {
    const r = calculatePricing(6, 400, 0, 6.9, [5, 10, 15]);
    expect(r.riskBand).toBe("A");
    expect(r.systemPrice.toNumber()).toBe(7200);
    expect(r.offers.length).toBe(3);
  });
  it("band B with provided apr", () => {
    const r = calculatePricing(7, 300, 0, 8.9, [10]);
    expect(r.riskBand).toBe("B");
    expect(r.offers.length).toBe(1);
    expect(r.offers[0].termYears).toBe(10);
  });
  it("band C with custom term options", () => {
    const r = calculatePricing(5, 100, 0, 11.9, [5, 20]);
    expect(r.riskBand).toBe("C");
    expect(r.offers.length).toBe(2);
    expect(r.offers[1].termYears).toBe(20);
  });
  it("respects down payment", () => {
    const r = calculatePricing(6, 400, 1000, 6.9, [10]);
    expect(r.principal.toNumber()).toBe(6200);
  });
  it("handles zero APR without division error", () => {
    const r = calculatePricing(5, 300, 0, 0, [10]);
    expect(r.offers.length).toBe(1);
    expect(Number(r.offers[0].monthlyPayment)).toBeGreaterThan(0);
  });
  it("clamps principal to zero when down payment exceeds system price", () => {
    const r = calculatePricing(5, 400, 99999, 6.9, [10]);
    expect(r.principal.toNumber()).toBe(0);
  });
});
