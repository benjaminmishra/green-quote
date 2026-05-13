import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  it("clears the auth token cookie", async () => {
    const req = new NextRequest("http://localhost/api/auth/logout", {
      method: "POST",
    });
    const res = await POST(req);
    const body = await res.json();
    const setCookie = res.headers.get("set-cookie");

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(setCookie).toContain("token=");
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=strict");
  });
});
