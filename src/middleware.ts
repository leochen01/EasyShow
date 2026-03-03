import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    response.cookies.set("locale", "en");
  } else if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    response.cookies.set("locale", "zh");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
