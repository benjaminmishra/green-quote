import { NextRequest, NextResponse } from "next/server";
import { loggerAls, logger } from "./logger";
import { randomUUID } from "node:crypto";

type RouteHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse>;

export function withLogging(handler: RouteHandler) {
  return async (req: NextRequest, ...args: unknown[]) => {
    const traceId = req.headers.get("x-trace-id") || randomUUID();
    const childLogger = logger.child({ trace_id: traceId });

    return loggerAls.run(childLogger, async () => {
      const start = Date.now();
      childLogger.info({
        msg: "Incoming request",
        "http.request.method": req.method,
        "url.path": req.nextUrl.pathname,
      });

      try {
        const response = await handler(req, ...args);
        const duration = Date.now() - start;
        childLogger.info({
          msg: "Request completed",
          "http.response.status_code": response?.status || 200,
          duration_ms: duration,
        });
        return response;
      } catch (error) {
        const duration = Date.now() - start;
        childLogger.error({
          msg: "Unhandled request error",
          err: error,
          duration_ms: duration,
        });
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    });
  };
}
