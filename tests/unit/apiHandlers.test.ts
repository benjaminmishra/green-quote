import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  postQuoteHandler,
  getQuoteHandler,
  listQuotesHandler,
} from "@/modules/quotes/api/handlers";
import { NextRequest } from "next/server";
import {
  getAuthContextFromRequest,
  hasPermission,
  canReadQuote,
} from "@/shared/rbac";
import { quotesRepository } from "@/modules/quotes/repositories/quotesRepository";
import { configRepository } from "@/modules/quotes/repositories/configRepository";
import { ServiceError } from "@/shared/errors";

// Mock the RBAC module
vi.mock("@/shared/rbac", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/rbac")>();
  return {
    ...actual,
    getAuthContextFromRequest: vi.fn(),
    hasPermission: vi.fn(),
    canReadQuote: vi.fn(),
  };
});

// Mock the repositories
vi.mock("@/modules/quotes/repositories/quotesRepository", () => ({
  quotesRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findManyAll: vi.fn(),
    findManyByUser: vi.fn(),
  },
}));

vi.mock("@/modules/quotes/repositories/configRepository", () => ({
  configRepository: {
    findRiskBand: vi.fn(),
    findActiveLoanTerms: vi.fn(),
  },
}));

const mockAuthContext = {
  userId: "u1",
  role: "USER" as const,
  email: "test@test.com",
  fullName: "Test User",
  permissions: ["quotes:create", "quotes:read:own"] as any[],
};

describe("Quote Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks for a successful path
    vi.mocked(getAuthContextFromRequest).mockReturnValue(mockAuthContext);
    vi.mocked(hasPermission).mockReturnValue(true);
    vi.mocked(canReadQuote).mockReturnValue(true);

    vi.mocked(configRepository.findRiskBand).mockResolvedValue({
      band: "B",
      apr: 8.9,
    } as any);
    vi.mocked(configRepository.findActiveLoanTerms).mockResolvedValue([
      { termYears: 5, active: true },
    ] as any);
  });

  describe("postQuoteHandler", () => {
    it("returns 401 if missing auth context", async () => {
      vi.mocked(getAuthContextFromRequest).mockReturnValue(null);
      const req = new NextRequest("http://localhost/api/quotes", {
        method: "POST",
      });
      const res = await postQuoteHandler(req);
      expect(res.status).toBe(401);
    });

    it("returns 403 if missing quotes:create permission", async () => {
      vi.mocked(hasPermission).mockReturnValue(false);
      const req = new NextRequest("http://localhost/api/quotes", {
        method: "POST",
      });
      const res = await postQuoteHandler(req);
      expect(res.status).toBe(403);
    });

    it("returns 400 for malformed JSON payload", async () => {
      const req = new NextRequest("http://localhost/api/quotes", {
        method: "POST",
        body: "invalid json {",
      });
      const res = await postQuoteHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid JSON payload");
    });

    it("returns 400 for invalid data", async () => {
      const req = new NextRequest("http://localhost/api/quotes", {
        method: "POST",
        body: JSON.stringify({ systemSizeKw: -5 }), // invalid size
      });
      const res = await postQuoteHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Validation failed");
    });

    it("returns 500 if DB config throws", async () => {
      vi.mocked(configRepository.findRiskBand).mockRejectedValue(
        new Error("DB Down"),
      );
      const req = new NextRequest("http://localhost/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          fullName: "Test User",
          email: "test@test.com",
          address: "123",
          monthlyConsumptionKwh: 1000,
          systemSizeKw: 5,
          downPayment: 1000,
        }),
      });
      const res = await postQuoteHandler(req);
      expect(res.status).toBe(500);
    });

    it("returns 400 if a ServiceError is thrown", async () => {
      vi.mocked(configRepository.findRiskBand).mockRejectedValue(
        new ServiceError("Business logic failed"),
      );
      const req = new NextRequest("http://localhost/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          fullName: "Test User",
          email: "test@test.com",
          address: "123",
          monthlyConsumptionKwh: 1000,
          systemSizeKw: 5,
          downPayment: 1000,
        }),
      });
      const res = await postQuoteHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Business logic failed");
    });

    it("returns 200 for valid data", async () => {
      vi.mocked(quotesRepository.create).mockResolvedValue({
        id: "quote1",
      } as any);
      const req = new NextRequest("http://localhost/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          fullName: "Test User",
          email: "test@test.com",
          address: "123",
          monthlyConsumptionKwh: 1000,
          systemSizeKw: 5,
          downPayment: 1000,
        }),
      });
      const res = await postQuoteHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.id).toBe("quote1");
    });
  });

  describe("getQuoteHandler", () => {
    it("returns 401 if not logged in", async () => {
      vi.mocked(getAuthContextFromRequest).mockReturnValue(null);
      const req = new NextRequest("http://localhost/api/quotes/q1");
      const res = await getQuoteHandler(req, "q1");
      expect(res.status).toBe(401);
    });

    it("returns 404 if quote not found", async () => {
      vi.mocked(quotesRepository.findById).mockResolvedValue(null);
      const req = new NextRequest("http://localhost/api/quotes/q1");
      const res = await getQuoteHandler(req, "q1");
      expect(res.status).toBe(404);
    });

    it("returns 403 if user cannot read the quote", async () => {
      vi.mocked(quotesRepository.findById).mockResolvedValue({
        id: "q1",
        userId: "u2",
      } as any);
      vi.mocked(canReadQuote).mockReturnValue(false); // e.g. cross-user access
      const req = new NextRequest("http://localhost/api/quotes/q1");
      const res = await getQuoteHandler(req, "q1");
      expect(res.status).toBe(403);
    });

    it("returns 200 and the quote on success", async () => {
      vi.mocked(quotesRepository.findById).mockResolvedValue({
        id: "q1",
        userId: "u1",
      } as any);
      vi.mocked(canReadQuote).mockReturnValue(true);
      const req = new NextRequest("http://localhost/api/quotes/q1");
      const res = await getQuoteHandler(req, "q1");
      expect(res.status).toBe(200);
    });
  });

  describe("listQuotesHandler", () => {
    it("returns 401 if missing auth context", async () => {
      vi.mocked(getAuthContextFromRequest).mockReturnValue(null);
      const req = new NextRequest("http://localhost/api/quotes");
      const res = await listQuotesHandler(req);
      expect(res.status).toBe(401);
    });

    it("calls findManyByUser for standard users", async () => {
      vi.mocked(hasPermission).mockReturnValue(false); // no 'quotes:read:any'
      vi.mocked(quotesRepository.findManyByUser).mockResolvedValue([
        { id: "q1" },
      ] as any);
      const req = new NextRequest("http://localhost/api/quotes");
      const res = await listQuotesHandler(req);
      expect(res.status).toBe(200);
      expect(quotesRepository.findManyByUser).toHaveBeenCalledWith("u1");
      expect(quotesRepository.findManyAll).not.toHaveBeenCalled();
    });

    it("calls findManyAll for admin users", async () => {
      vi.mocked(hasPermission).mockReturnValue(true); // user has 'quotes:read:any'
      vi.mocked(quotesRepository.findManyAll).mockResolvedValue([
        { id: "q1" },
        { id: "q2" },
      ] as any);
      const req = new NextRequest("http://localhost/api/quotes");
      const res = await listQuotesHandler(req);
      expect(res.status).toBe(200);
      expect(quotesRepository.findManyAll).toHaveBeenCalled();
      expect(quotesRepository.findManyByUser).not.toHaveBeenCalled();
    });
  });
});
