import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { loginHandler, registerHandler } from "@/modules/auth/api/handlers";
import { AuthServiceError } from "@/modules/auth/services/authService";
import { authService } from "@/modules/auth/services/authService";

vi.mock("@/modules/auth/services/authService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/auth/services/authService")>();
  return {
    ...actual,
    authService: {
      login: vi.fn(),
      register: vi.fn(),
    },
  };
});

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

    it("returns 409 for AuthServiceError 'Email already used'", async () => {
      vi.mocked(authService.register).mockRejectedValue(
        new AuthServiceError("Email already used")
      );
      const req = new NextRequest("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: "Test User",
          email: "test@test.com",
          password: "password123",
        }),
      });
      const res = await registerHandler(req);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toBe("Email already used");
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

    it("returns 401 for AuthServiceError 'Invalid credentials'", async () => {
      vi.mocked(authService.login).mockRejectedValue(
        new AuthServiceError("Invalid credentials")
      );
      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@test.com",
          password: "password123",
        }),
      });
      const res = await loginHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Invalid credentials");
    });
  });
});
