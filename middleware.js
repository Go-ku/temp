import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/api/auth",
  "/api/payments/momo/webhook", // payment provider callback
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip public paths and Next internals
  if (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Basic role gating for admin-only areas
  if (
    pathname.startsWith("/dashboard/admin") &&
    !token.roles?.includes("admin")
  ) {
    return pathname.startsWith("/api")
      ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
      : NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/payments/:path*",
    "/invoices/:path*",
    "/leases/:path*",
    "/properties/:path*",
    "/tenants/:path*",
    "/maintenance/:path*",
    "/api/:path*",
  ],
};
