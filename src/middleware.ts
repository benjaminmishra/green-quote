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

  let token = req.cookies.get("token")?.value;
  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="api"' } },
    );

  try {
    const auth = await verifyToken(token);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.delete("x-auth-context");
    requestHeaders.set("x-auth-context", JSON.stringify(auth));
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="api"' } },
    );
  }
}

export const config = {
  matcher: ["/quotes/:path*", "/admin/:path*", "/api/quotes/:path*"],
};
