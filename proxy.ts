import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJWT } from "./app/lib/jwt";

const publicPaths = ["/auth/login", "/auth/register", "/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path is public
  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Check for static files
  if (
    pathname.includes("._") ||
    pathname.includes("/_next") ||
    pathname.includes("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Verify token
  const payload = verifyJWT(token);
  if (!payload) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access control
  if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    pathname.startsWith("/manager") &&
    payload.role !== "ADMIN" &&
    payload.role !== "PROJECT_MANAGER"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
