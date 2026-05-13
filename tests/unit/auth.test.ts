import { describe, it, expect, beforeEach } from "vitest";
import { verifyToken } from "@/lib/auth";
import { SignJWT } from "jose";

describe("verifyToken", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  it("successfully parses a valid token", async () => {
    const secret = new TextEncoder().encode("test-secret");
    const token = await new SignJWT({
      userId: "user1",
      role: "USER",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    const auth = await verifyToken(token);
    expect(auth.userId).toBe("user1");
    expect(auth.role).toBe("USER");
  });

  it("throws when token is expired", async () => {
    const secret = new TextEncoder().encode("test-secret");
    const token = await new SignJWT({
      userId: "user1",
      role: "USER",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("-1h") // Expired 1 hour ago
      .sign(secret);

    await expect(verifyToken(token)).rejects.toThrow("exp");
  });

  it("throws when token signature is invalid", async () => {
    const wrongSecret = new TextEncoder().encode("wrong-secret");

    const token = await new SignJWT({
      userId: "user1",
      role: "USER",
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(wrongSecret);

    await expect(verifyToken(token)).rejects.toThrow();
  });

  it("throws when token payload is missing required userId", async () => {
    const secret = new TextEncoder().encode("test-secret");
    const token = await new SignJWT({
      // missing userId
      role: "USER",
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    await expect(verifyToken(token)).rejects.toThrow();
  });
});
