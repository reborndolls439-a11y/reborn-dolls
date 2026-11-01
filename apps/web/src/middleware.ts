import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-change-in-production"
);

const PROTECTED_ACCOUNT_PATHS = ["/account"];
const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("reborn_session")?.value;

  const isAccountPath = PROTECTED_ACCOUNT_PATHS.some((p) =>
    pathname.startsWith(p)
  );
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Verify token validity
  let isValidToken = false;
  let userRole: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      isValidToken = true;
      userRole = (payload as { role: string }).role;
    } catch {
      isValidToken = false;
    }
  }

  // Redirect unauthenticated users away from account pages
  if (isAccountPath && !isValidToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && isValidToken) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  // Add user role to headers for server components
  const response = NextResponse.next();
  if (isValidToken && userRole) {
    response.headers.set("x-user-role", userRole);
  }

  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
