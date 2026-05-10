import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  it("clears the auth token cookie", async () => {
    const res = await POST();
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
