// proxy.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Redirect unauthenticated users
  if (!accessToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (accessToken && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Exclude:
      - api routes
      - next static files
      - next image optimization files
      - favicon
      - all public files (png, jpg, svg, gif, etc)
    */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
