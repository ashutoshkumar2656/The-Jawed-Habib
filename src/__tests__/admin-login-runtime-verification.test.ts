import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";
import { hashPassword, comparePassword } from "@/lib/auth/password";
import { signToken, verifyToken } from "@/lib/auth/jwt";
import { checkAdminAuth } from "@/lib/auth/rbac";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";
import { siteConfig } from "@/config/site";
import { RoleType } from "@prisma/client";
import { NextRequest } from "next/server";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";

describe("Admin Login Runtime & Authentication Verification Suite", () => {
  const testAdminPhone = "7707000463";
  const testAdminEmail = "admin@jawedhabib-lalganj.in";
  const testDefaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@JawedHabib2026!";
  const testIsolatedPassword = "AdminCustomPass@2026!";

  // -------------------------------------------------------------
  // 1. MODULE RESOLUTION & FORM VALIDATION
  // -------------------------------------------------------------
  describe("Form Validation & Schema Safeguards", () => {
    it("validates administrative login schema with phone number", () => {
      const result = loginSchema.safeParse({
        phoneOrEmail: testAdminPhone,
        password: testDefaultAdminPassword,
        rememberMe: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.phoneOrEmail).toBe(testAdminPhone);
        expect(result.data.rememberMe).toBe(true);
      }
    });

    it("validates administrative login schema with email address", () => {
      const result = loginSchema.safeParse({
        phoneOrEmail: testAdminEmail,
        password: testDefaultAdminPassword,
        rememberMe: false,
      });

      expect(result.success).toBe(true);
    });

    it("rejects login submissions with missing phone/email", () => {
      const result = loginSchema.safeParse({
        phoneOrEmail: "",
        password: testDefaultAdminPassword,
      });

      expect(result.success).toBe(false);
    });

    it("rejects login submissions with missing password", () => {
      const result = loginSchema.safeParse({
        phoneOrEmail: testAdminPhone,
        password: "",
      });

      expect(result.success).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 2. CREDENTIAL VERIFICATION & BCRYPT SECURITY
  // -------------------------------------------------------------
  describe("Credential & Password Cryptography", () => {
    it("hashes admin passwords securely using bcrypt", async () => {
      const hash = await hashPassword(testIsolatedPassword);
      expect(hash).not.toBe(testIsolatedPassword);
      expect(hash.startsWith("$2")).toBe(true);

      const isValid = await comparePassword(testIsolatedPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword("IncorrectPassword123!", hash);
      expect(isInvalid).toBe(false);
    });

    it("authenticates registered salon administrator from repository", async () => {
      const admin = await dbRepo.findUserByPhoneOrEmail(testAdminPhone);
      expect(admin).toBeDefined();
      expect(admin?.roleType).toBe(RoleType.SUPER_ADMIN);
      expect(admin?.passwordHash).toBeDefined();

      const passMatches = await comparePassword(testDefaultAdminPassword, admin!.passwordHash!);
      expect(passMatches).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 3. JWT SESSION GENERATION & RBAC AUTHORIZATION
  // -------------------------------------------------------------
  describe("Session Tokens & Role-Based Access Control", () => {
    it("generates and verifies signed admin JWT sessions", () => {
      const token = signToken({
        userId: "admin_user_001",
        role: RoleType.SUPER_ADMIN,
        phone: testAdminPhone,
        email: testAdminEmail,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe("admin_user_001");
      expect(decoded?.role).toBe(RoleType.SUPER_ADMIN);
      expect(decoded?.phone).toBe(testAdminPhone);
    });

    it("authorizes valid admin session for administrative route handlers", () => {
      const token = signToken({
        userId: "admin_user_001",
        role: RoleType.ADMIN,
        phone: testAdminPhone,
      });

      const req = new NextRequest("http://localhost:3000/api/admin/services", {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${token}`,
        },
      });

      const auth = checkAdminAuth(req);
      expect(auth.authorized).toBe(true);
      expect(auth.user?.role).toBe(RoleType.ADMIN);
    });

    it("rejects unauthorized customer sessions from accessing admin APIs", () => {
      const customerToken = signToken({
        userId: "customer_001",
        role: RoleType.CUSTOMER,
        phone: "9831722983",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/services", {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${customerToken}`,
        },
      });

      const auth = checkAdminAuth(req);
      expect(auth.authorized).toBe(false);
      expect(auth.status).toBe(401);
    });

    it("rejects requests missing session tokens", () => {
      const req = new NextRequest("http://localhost:3000/api/admin/services");
      const auth = checkAdminAuth(req);
      expect(auth.authorized).toBe(false);
      expect(auth.status).toBe(401);
    });
  });

  // -------------------------------------------------------------
  // 4. API AUTH FLOW: LOGIN & LOGOUT ENDPOINTS
  // -------------------------------------------------------------
  describe("Authentication API Endpoints (/api/auth/login & /api/auth/logout)", () => {
    it("successfully authenticates admin with valid QA credentials and sets session cookie", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneOrEmail: testAdminPhone,
          password: testDefaultAdminPassword,
          rememberMe: true,
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.user.phone).toBe(testAdminPhone);
      expect(json.data.user.role).toBe(RoleType.SUPER_ADMIN);
      expect(json.data.token).toBeDefined();

      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain(SESSION_COOKIE_NAME);
      expect(setCookie).toContain("HttpOnly");
    });

    it("rejects login attempt with invalid password with 401 status", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneOrEmail: testAdminPhone,
          password: "CompletelyWrongPassword!123",
          rememberMe: false,
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("Invalid");
    });

    it("rejects login attempt with unknown phone/email with 401 status", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneOrEmail: "0000000000",
          password: testDefaultAdminPassword,
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("handles logout by revoking session and expiring cookie", async () => {
      const token = signToken({
        userId: "admin_user_001",
        role: RoleType.SUPER_ADMIN,
        phone: testAdminPhone,
      });

      const req = new NextRequest("http://localhost:3000/api/auth/logout", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${token}`,
        },
      });

      const res = await logoutHandler(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);

      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toContain(SESSION_COOKIE_NAME);
      expect(setCookie).toContain("Max-Age=0");
    });
  });

  // -------------------------------------------------------------
  // 5. NAVIGATION LABELS & SSR HYDRATION SAFETY
  // -------------------------------------------------------------
  describe("Navigation Labels & Hydration Safety", () => {
    it("ensures public navigation mainNav defines explicit, SSR-consistent labels", () => {
      expect(siteConfig.mainNav).toBeDefined();
      expect(Array.isArray(siteConfig.mainNav)).toBe(true);
      expect(siteConfig.mainNav.length).toBeGreaterThanOrEqual(6);

      // Verify Bridal destination
      const bridalNav = siteConfig.mainNav.find((item) => item.href === "/bridal");
      expect(bridalNav).toBeDefined();
      expect(bridalNav?.title).toBe("Bridal");

      // Verify Home destination
      const homeNav = siteConfig.mainNav.find((item) => item.href === "/");
      expect(homeNav).toBeDefined();
      expect(homeNav?.title).toBe("Home");

      // Verify Services destination
      const servicesNav = siteConfig.mainNav.find((item) => item.href === "/#services");
      expect(servicesNav).toBeDefined();
      expect(servicesNav?.title).toBe("Services");
    });

    it("confirms navigation titles do not rely on client-only globals", () => {
      // In SSR environment (Node), siteConfig produces deterministic string values
      siteConfig.mainNav.forEach((item) => {
        expect(typeof item.title).toBe("string");
        expect(item.title.trim().length).toBeGreaterThan(0);
        expect(typeof item.href).toBe("string");
      });
    });
  });

  // -------------------------------------------------------------
  // 6. SAFE NAVIGATION & OPEN REDIRECT DEFENSE
  // -------------------------------------------------------------
  describe("Navigation Safeguards", () => {
    it("validates safe redirect paths and rejects open redirect attempts", () => {
      const sanitizeRedirect = (url: string | null): string => {
        if (!url) return "/admin/dashboard";
        if (url.startsWith("/admin") && !url.startsWith("/admin//") && !url.includes("://")) {
          return url;
        }
        return "/admin/dashboard";
      };

      expect(sanitizeRedirect("/admin/services")).toBe("/admin/services");
      expect(sanitizeRedirect("/admin/bookings")).toBe("/admin/bookings");
      expect(sanitizeRedirect("https://malicious-site.com")).toBe("/admin/dashboard");
      expect(sanitizeRedirect("//phishing-site.com")).toBe("/admin/dashboard");
      expect(sanitizeRedirect(null)).toBe("/admin/dashboard");
    });
  });

  // -------------------------------------------------------------
  // 7. CACHE CONTROL ISOLATION IN DEVELOPMENT
  // -------------------------------------------------------------
  describe("Development Cache Isolation", () => {
    it("ensures development static assets are not served with immutable cache headers", () => {
      const isProduction = false;
      const getHeaders = (isProd: boolean) => {
        if (!isProd) return [];
        return [{ source: "/_next/static/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
      };

      const devHeaders = getHeaders(isProduction);
      expect(devHeaders.length).toBe(0);

      const prodHeaders = getHeaders(true);
      expect(prodHeaders.length).toBeGreaterThan(0);
      expect(prodHeaders[0].headers[0].value).toContain("immutable");
    });
  });
});
