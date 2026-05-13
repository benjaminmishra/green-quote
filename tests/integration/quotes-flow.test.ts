import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import {
  postQuoteHandler,
  listQuotesHandler,
  getQuoteHandler,
} from "@/modules/quotes/api/handlers";
import { prisma } from "@/shared/db";

describe("Quotes Flow Integration", () => {
  let userId: string;

  beforeAll(async () => {
    // Clear data
    await prisma.quotes.deleteMany({});
    await prisma.users.deleteMany({});

    // Create test user
    const user = await prisma.users.create({
      data: {
        email: "quote-test@test.com",
        fullName: "Quote Test",
        passwordHash: "hash",
        role: "USER",
      },
    });
    userId = user.id;
  });

  it("can create, list, and get a quote", async () => {
    // 1. Post Quote
    const postReq = new NextRequest("http://localhost/api/quotes", {
      method: "POST",
      headers: {
        "x-auth-context": JSON.stringify({
          userId,
          role: "USER",
          permissions: ["quotes:create", "quotes:read:own"],
        }),
      },
      body: JSON.stringify({
        fullName: "Test User",
        email: "test@test.com",
        address: "123 Solar Way",
        monthlyConsumptionKwh: 1200,
        systemSizeKw: 8,
        downPayment: 2000,
      }),
    });

    const postRes = await postQuoteHandler(postReq);
    expect(postRes.status).toBe(200);
    const postData = await postRes.json();
    const quoteId = postData.id;
    expect(quoteId).toBeDefined();

    // 2. List Quotes
    const listReq = new NextRequest("http://localhost/api/quotes", {
      method: "GET",
      headers: {
        "x-auth-context": JSON.stringify({
          userId,
          role: "USER",
          permissions: ["quotes:create", "quotes:read:own"],
        }),
      },
    });

    const listRes = await listQuotesHandler(listReq);
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.length).toBe(1);
    expect(listData[0].id).toBe(quoteId);

    // 3. Get Specific Quote
    const getReq = new NextRequest(`http://localhost/api/quotes/${quoteId}`, {
      method: "GET",
      headers: {
        "x-auth-context": JSON.stringify({
          userId,
          role: "USER",
          permissions: ["quotes:create", "quotes:read:own"],
        }),
      },
    });

    const getRes = await getQuoteHandler(getReq, quoteId);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.id).toBe(quoteId);
  });

  it("returns 403 when user tries to read another user quote", async () => {
    // Create a second user
    const userB = await prisma.users.create({
      data: {
        email: "other-user@test.com",
        fullName: "Other User",
        passwordHash: "hash",
        role: "USER",
      },
    });

    // First, list quotes as user A to get an existing quote ID
    const listReq = new NextRequest("http://localhost/api/quotes", {
      method: "GET",
      headers: {
        "x-auth-context": JSON.stringify({
          userId,
          role: "USER",
          permissions: ["quotes:create", "quotes:read:own"],
        }),
      },
    });
    const listRes = await listQuotesHandler(listReq);
    const listData = await listRes.json();
    const quoteId = listData[0].id;

    // User B tries to read user A's quote
    const getReq = new NextRequest(`http://localhost/api/quotes/${quoteId}`, {
      method: "GET",
      headers: {
        "x-auth-context": JSON.stringify({
          userId: userB.id,
          role: "USER",
          permissions: ["quotes:create", "quotes:read:own"],
        }),
      },
    });

    const getRes = await getQuoteHandler(getReq, quoteId);
    expect(getRes.status).toBe(403);
  });
});
