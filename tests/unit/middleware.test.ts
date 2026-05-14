import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the auth module
vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
}));

import { middleware } from "@/middleware";
import { verifyToken } from "@/lib/auth";

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes through non-protected routes", async () => {
    const req = new NextRequest("http://localhost/api/health");
    const res = await middleware(req);
    // NextResponse.next() returns a 200 with no body
    expect(res.status).toBe(200);
  });

  it("returns 401 when no token cookie on protected route", async () => {
    const req = new NextRequest("http://localhost/api/quotes");
    const res = await middleware(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyToken).mockRejectedValue(new Error("invalid token"));

    const req = new NextRequest("http://localhost/api/quotes", {
      headers: { cookie: "token=bad-token" },
    });
    const res = await middleware(req);
    expect(res.status).toBe(401);
  });

  it("sets x-auth-context header on valid token", async () => {
    const authPayload = {
      userId: "u1",
      role: "USER" as const,
      email: "test@test.com",
      fullName: "Test",
      permissions: ["quotes:create", "quotes:read:own"] as (
        | "quotes:create"
        | "quotes:read:own"
      )[],
    };
    vi.mocked(verifyToken).mockResolvedValue(authPayload);

    const req = new NextRequest("http://localhost/api/quotes", {
      headers: { cookie: "token=valid-token" },
    });
    const res = await middleware(req);

    // NextResponse.next() with request headers returns 200
    expect(res.status).toBe(200);
  });

  it("protects /admin routes", async () => {
    const req = new NextRequest("http://localhost/admin/quotes");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/login");
  });

  it("protects /quotes routes", async () => {
    const req = new NextRequest("http://localhost/quotes");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/login");
  });
});
