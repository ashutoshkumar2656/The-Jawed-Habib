import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("habib_session_token")?.value;

  // 1. Customer Protected Routes (/account, /bookings, /profile)
  const isCustomerRoute =
    pathname.startsWith("/account") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/profile");

  if (isCustomerRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Admin Protected Routes (/admin/* except /admin/login)
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (isAdminRoute && !sessionToken) {
    const adminLoginUrl = new URL("/admin/login", request.url);
    adminLoginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(adminLoginUrl);
  }

  // 3. Response with Enhanced Security Headers
  const response = NextResponse.next();

  // Content Security Policy permitting Razorpay Checkout & verified external assets
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.razorpay.com https://maps.app.goo.gl",
    "font-src 'self' https://fonts.gstatic.com data:",
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://www.youtube.com https://maps.google.com https://www.google.com",
    "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com https://res.cloudinary.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://api.razorpay.com",
    "frame-ancestors 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self 'https://maps.app.goo.gl')"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public salon images)
     * - brand/ (brand assets)
     * - videos/ (hero video assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|brand/|videos/).*)",
  ],
};
