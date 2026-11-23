import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal next assets, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicPath =
    pathname === "/" ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const authToken = request.cookies.get("garuda_auth_token")?.value;
  const isAuthenticated = Boolean(authToken);

  // 2. Unauthenticated user accessing protected or unknown paths (e.g. /dashboard, /docs, /settings)
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated user accessing login, root, or signup page: restore intended or last route
  if (isAuthenticated && (pathname === "/login" || pathname === "/" || pathname === "/signup")) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const lastRoute = request.cookies.get("garuda_last_route")?.value;

    let target = "/dashboard";
    if (callbackUrl && !callbackUrl.startsWith("/login") && !callbackUrl.startsWith("/signup")) {
      target = callbackUrl;
    } else if (
      lastRoute &&
      lastRoute !== "/" &&
      !lastRoute.startsWith("/login") &&
      !lastRoute.startsWith("/signup")
    ) {
      target = decodeURIComponent(lastRoute);
    }

    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
