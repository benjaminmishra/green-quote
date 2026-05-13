import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/shared/withLogging";

// Mock the logger module
vi.mock("@/shared/logger", () => {
  const mockChild = {
    info: vi.fn(),
    error: vi.fn(),
  };
  return {
    loggerAls: {
      run: vi.fn((_logger: unknown, fn: () => unknown) => fn()),
      getStore: vi.fn(() => mockChild),
    },
    logger: {
      child: vi.fn(() => mockChild),
    },
  };
});

describe("withLogging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the request through to the handler", async () => {
    const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));
    const wrapped = withLogging(handler);

    const req = new NextRequest("http://localhost/test");
    await wrapped(req);

    expect(handler).toHaveBeenCalledWith(req);
  });

  it("returns the handler response on success", async () => {
    const handler = vi.fn().mockResolvedValue(NextResponse.json({ data: 1 }));
    const wrapped = withLogging(handler);

    const req = new NextRequest("http://localhost/test");
    const res = await wrapped(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: 1 });
  });

  it("returns 500 when handler throws an unhandled error", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("kaboom"));
    const wrapped = withLogging(handler);

    const req = new NextRequest("http://localhost/test");
    const res = await wrapped(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal Server Error");
  });

  it("uses existing x-trace-id header when present", async () => {
    const { logger } = await import("@/shared/logger");
    const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));
    const wrapped = withLogging(handler);

    const req = new NextRequest("http://localhost/test", {
      headers: { "x-trace-id": "custom-trace-123" },
    });
    await wrapped(req);

    expect(logger.child).toHaveBeenCalledWith({ trace_id: "custom-trace-123" });
  });

  it("generates a trace id when none provided", async () => {
    const { logger } = await import("@/shared/logger");
    const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));
    const wrapped = withLogging(handler);

    const req = new NextRequest("http://localhost/test");
    await wrapped(req);

    expect(logger.child).toHaveBeenCalledWith(
      expect.objectContaining({ trace_id: expect.any(String) }),
    );
  });
});
