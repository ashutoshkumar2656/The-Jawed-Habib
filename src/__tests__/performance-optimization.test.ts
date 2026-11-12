import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";
import fs from "fs";
import path from "path";

describe("Phase 1-17: Website Performance & Stability Optimization Suite", () => {
  // ---------------------------------------------------------------------------
  // 1. NEXT.JS CONFIGURATION & ASSET COMPRESSION
  // ---------------------------------------------------------------------------
  describe("Next.js Performance & Compression Configuration", () => {
    it("verifies next.config.mjs exists and enables compression and package optimization", () => {
      const configPath = path.join(process.cwd(), "next.config.mjs");
      expect(fs.existsSync(configPath)).toBe(true);

      const configContent = fs.readFileSync(configPath, "utf-8");
      expect(configContent).toContain("compress: true");
      expect(configContent).toContain("optimizePackageImports");
      expect(configContent).toContain("lucide-react");
      expect(configContent).toContain("date-fns");
      expect(configContent).toContain("image/avif");
      expect(configContent).toContain("image/webp");
    });

    it("verifies static asset caching headers in next.config.mjs", () => {
      const configPath = path.join(process.cwd(), "next.config.mjs");
      const configContent = fs.readFileSync(configPath, "utf-8");

      expect(configContent).toContain("/_next/static/:path*");
      expect(configContent).toContain("max-age=31536000, immutable");
      expect(configContent).toContain("/images/:path*");
      expect(configContent).toContain("/brand/:path*");
      expect(configContent).toContain("/videos/:path*");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. FONT OPTIMIZATION & ZERO RENDER-BLOCKING WATERFALLS
  // ---------------------------------------------------------------------------
  describe("Font & CSS Optimization (Eliminating Render-Blocking @import)", () => {
    it("verifies globals.css does NOT contain blocking @import url for Google Fonts", () => {
      const cssPath = path.join(process.cwd(), "src/app/globals.css");
      const cssContent = fs.readFileSync(cssPath, "utf-8");
      expect(cssContent).not.toContain("@import url('https://fonts.googleapis.com");
    });

    it("verifies RootLayout utilizes non-blocking font loading with display swap and system fallbacks", () => {
      const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
      const layoutContent = fs.readFileSync(layoutPath, "utf-8");
      expect(layoutContent).toContain("display=swap");
      expect(layoutContent).toContain("fonts.gstatic.com");
      expect(layoutContent).toContain("rel=\"preconnect\"");
    });

    it("verifies globals.css defines high-performance system font fallbacks", () => {
      const cssPath = path.join(process.cwd(), "src/app/globals.css");
      const cssContent = fs.readFileSync(cssPath, "utf-8");
      expect(cssContent).toContain("--font-playfair");
      expect(cssContent).toContain("--font-sans");
    });
  });

  // ---------------------------------------------------------------------------
  // 3. HERO VIDEO & LCP POSTER OPTIMIZATION
  // ---------------------------------------------------------------------------
  describe("Hero Video Performance & LCP Prioritization", () => {
    it("verifies hero video uses preload metadata and persistent LCP poster image", () => {
      const heroPath = path.join(process.cwd(), "src/components/public/hero-video-section.tsx");
      const heroContent = fs.readFileSync(heroPath, "utf-8");
      expect(heroContent).toContain("preload=\"metadata\"");
      expect(heroContent).toContain("priority");
      expect(heroContent).toContain("sizes=\"100vw\"");
      expect(heroContent).toContain("/images/salon-hero-poster.webp");
    });
  });

  // ---------------------------------------------------------------------------
  // 4. BACKEND CONCURRENCY & AVAILABILITY PERFORMANCE
  // ---------------------------------------------------------------------------
  describe("Backend Query Optimization & Concurrency", () => {
    it("resolves monthly availability rapidly using parallel slot calculations", async () => {
      const start = performance.now();
      const monthResult = await dbRepo.getMonthAvailability("2026-11", ["srv_bridal_1"]);
      const durationMs = performance.now() - start;

      expect(monthResult).toBeDefined();
      expect(monthResult.yearMonth).toBe("2026-11");
      expect(Array.isArray(monthResult.availableDates)).toBe(true);
      // Fast execution guarantee
      expect(durationMs).toBeLessThan(1000);
    });

    it("fetches admin analytics in parallel with low latency", async () => {
      const start = performance.now();
      const analytics = await dbRepo.getAdminAnalytics();
      const durationMs = performance.now() - start;

      expect(analytics).toBeDefined();
      expect(analytics.totalAppointments).toBeGreaterThanOrEqual(0);
      expect(durationMs).toBeLessThan(500);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. PUBLIC CACHING & FRESH TRANSACTIONAL GUARANTEES
  // ---------------------------------------------------------------------------
  describe("Cache Policy: Public Cacheable vs Transactional Freshness", () => {
    it("verifies public API routes include revalidation and cache headers", () => {
      const servicesApi = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/services/route.ts"),
        "utf-8"
      );
      expect(servicesApi).toContain("Cache-Control");
      expect(servicesApi).toContain("stale-while-revalidate");

      const categoriesApi = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/categories/route.ts"),
        "utf-8"
      );
      expect(categoriesApi).toContain("Cache-Control");

      const packagesApi = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/packages/route.ts"),
        "utf-8"
      );
      expect(packagesApi).toContain("Cache-Control");
    });

    it("verifies transactional booking & payment routes are NEVER cached (always fresh)", () => {
      const appointmentsApi = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/appointments/route.ts"),
        "utf-8"
      );
      expect(appointmentsApi).toContain("export const dynamic = \"force-dynamic\"");

      const orderApi = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/payments/create-order/route.ts"),
        "utf-8"
      );
      expect(orderApi).toContain("export const dynamic = \"force-dynamic\"");

      const verifyApi = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/payments/verify/route.ts"),
        "utf-8"
      );
      expect(verifyApi).toContain("export const dynamic = \"force-dynamic\"");
    });
  });
});
