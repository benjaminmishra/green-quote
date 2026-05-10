import { describe, it, expect } from "vitest";
import { calculatePricing } from "@/modules/quotes/services/pricingService";

describe("post /api/quotes payload math", () => {
  it("returns offers length", () => {
    expect(calculatePricing(5, 300, 0, 8.9, [5, 10, 15]).offers).toHaveLength(3);
  });
});
