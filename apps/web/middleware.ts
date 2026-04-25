import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Must match `authOptions.secret` (NEXTAUTH_SECRET, or BACKEND_SECRET fallback in `lib/auth.ts`). */
const authSecret = process.env.NEXTAUTH_SECRET || process.env.BACKEND_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = isPublicPath(pathname);
  const token = await getToken({ req, secret: authSecret });
  const hasSession = !!token;

  if (!isPublic && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/dashboard/:path*",
    "/apps/:path*",
    "/users/:path*",
    "/licenses/:path*",
    "/api-keys/:path*",
    "/analytics/:path*",
    "/resellers/:path*",
    "/credentials/:path*",
    "/activity-logs/:path*",
    "/settings/:path*"
  ]
};
