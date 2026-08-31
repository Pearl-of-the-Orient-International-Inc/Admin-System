import { type NextRequest, NextResponse } from "next/server";

const EXPIRED_ROUTE = "/vps-expired";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === EXPIRED_ROUTE) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = EXPIRED_ROUTE;
  url.search = "";

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml|mock-expired.png|.*\\..*).*)"],
};
