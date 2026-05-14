import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (
    !path.startsWith("/quotes") &&
    !path.startsWith("/admin") &&
    !path.startsWith("/api/quotes")
  )
    return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  let token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : undefined;
  if (!token) token = req.cookies.get("token")?.value;

  const respondUnauthorized = () => {
    if (path.startsWith("/api")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="api"' } },
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  };

  if (!token) return respondUnauthorized();

  try {
    const auth = await verifyToken(token);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("x-auth-context");
    requestHeaders.set("x-auth-context", JSON.stringify(auth));
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return respondUnauthorized();
  }
}

export const config = {
  matcher: ["/quotes/:path*", "/admin/:path*", "/api/quotes/:path*"],
};
