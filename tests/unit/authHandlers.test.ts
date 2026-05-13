import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { loginHandler, registerHandler } from "@/modules/auth/api/handlers";

vi.mock("@/modules/auth/services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe("Auth Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerHandler", () => {
    it("returns 400 for malformed JSON", async () => {
      const req = new NextRequest("http://localhost/api/auth/register", {
        method: "POST",
        body: "invalid json {",
      });
      const res = await registerHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid JSON payload");
    });

    it("returns 400 for zod validation failure (missing fields)", async () => {
      const req = new NextRequest("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email" }),
      });
      const res = await registerHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("valid name, email, and password");
    });
  });

  describe("loginHandler", () => {
    it("returns 400 for malformed JSON", async () => {
      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: "invalid json {",
      });
      const res = await loginHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid JSON payload");
    });

    it("returns 400 for zod validation failure", async () => {
      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email" }),
      });
      const res = await loginHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("valid email and password");
    });
  });
});
