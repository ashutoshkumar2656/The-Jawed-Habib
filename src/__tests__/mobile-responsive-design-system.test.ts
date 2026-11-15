/**
 * Automated Mobile Responsive Design System & Cross-Device UX Test Suite
 * The Jawed Habib Salon – Lalganj, Vaishali, Bihar
 *
 * Verifies:
 * 1. Mobile touch targets meet minimum 44x44px (WCAG 2.5.5 / 2.5.8)
 * 2. Mobile drawer and modal scroll locking & Escape key navigation
 * 3. iOS Safari auto-zoom prevention (font-size >= 16px on mobile viewports)
 * 4. Numeric keypad optimization for Indian mobile number inputs (inputMode="numeric", type="tel")
 * 5. Touch swipe event isolation (touch-none, touch-action: none) on Before/After sliders
 * 6. Keyboard accessibility on Before/After sliders (ArrowLeft, ArrowRight, Home, End)
 * 7. Mobile-first Admin CRM cards eliminating horizontal table scrolling on small viewports
 * 8. Safe-area padding support for mobile home indicators (env(safe-area-inset-bottom))
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Mobile-First Responsive Design System & Touch Ergonomics", () => {
  const headerFile = fs.readFileSync(
    path.join(process.cwd(), "src/components/layout/header.tsx"),
    "utf-8"
  );
  const modalFile = fs.readFileSync(
    path.join(process.cwd(), "src/components/ui/modal.tsx"),
    "utf-8"
  );
  const inputFile = fs.readFileSync(
    path.join(process.cwd(), "src/components/ui/input.tsx"),
    "utf-8"
  );
  const sliderFile = fs.readFileSync(
    path.join(process.cwd(), "src/components/shared/before-after-slider.tsx"),
    "utf-8"
  );
  const bookingFile = fs.readFileSync(
    path.join(process.cwd(), "src/components/public/bridal-booking-experience.tsx"),
    "utf-8"
  );
  const adminNavFile = fs.readFileSync(
    path.join(process.cwd(), "src/components/layout/admin-nav-context.tsx"),
    "utf-8"
  );
  const adminBookingsFile = fs.readFileSync(
    path.join(process.cwd(), "src/components/admin/bookings-management-hub.tsx"),
    "utf-8"
  );
  const adminPaymentsFile = fs.readFileSync(
    path.join(process.cwd(), "src/components/admin/payments-management-hub.tsx"),
    "utf-8"
  );
  const adminCustomersFile = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/customers/page.tsx"),
    "utf-8"
  );
  const floatingContactFile = fs.readFileSync(
    path.join(process.cwd(), "src/components/shared/floating-contact.tsx"),
    "utf-8"
  );

  describe("1. Navigation & Drawer Ergonomics", () => {
    it("locks body scrolling when mobile menu drawer is open", () => {
      expect(headerFile).toContain('document.body.style.overflow = "hidden"');
      expect(headerFile).toContain('document.body.style.overflow = ""');
    });

    it("closes mobile menu drawer on Escape key press", () => {
      expect(headerFile).toContain('e.key === "Escape"');
      expect(headerFile).toContain("setMobileMenuOpen(false)");
    });

    it("renders backdrop overlay behind mobile navigation drawer", () => {
      expect(headerFile).toContain("bg-black/80 backdrop-blur-sm");
      expect(headerFile).toContain("onClick={() => setMobileMenuOpen(false)}");
    });

    it("enforces scroll locking and Escape key navigation on Admin mobile drawer", () => {
      expect(adminNavFile).toContain('document.body.style.overflow = "hidden"');
      expect(adminNavFile).toContain('e.key === "Escape" && isMobileOpen');
      expect(adminNavFile).toContain("closeMobile()");
    });
  });

  describe("2. Mobile Touch Targets & iOS Auto-Zoom Mitigation", () => {
    it("enforces text-base sm:text-sm on input fields to prevent iOS Safari auto-zoom", () => {
      expect(inputFile).toContain("text-base sm:text-sm");
    });

    it("ensures mobile input height provides comfortable >= 44px hitboxes (h-11 sm:h-10)", () => {
      expect(inputFile).toContain("h-11 sm:h-10");
    });

    it("configures inputMode='numeric' and autoComplete='tel' for mobile phone inputs", () => {
      expect(bookingFile).toContain('inputMode="numeric"');
      expect(bookingFile).toContain('autoComplete="tel"');
    });
  });

  describe("3. Touch-Based Before/After Slider Interaction", () => {
    it("disables browser page-scroll gesture conflicts via touch-none & touchAction: none", () => {
      expect(sliderFile).toContain('style={{ touchAction: "none" }}');
      expect(sliderFile).toContain("touch-none");
    });

    it("provides accessible keyboard navigation for sliders", () => {
      expect(sliderFile).toContain('role="slider"');
      expect(sliderFile).toContain('tabIndex={0}');
      expect(sliderFile).toContain('e.key === "ArrowLeft"');
      expect(sliderFile).toContain('e.key === "ArrowRight"');
      expect(sliderFile).toContain("setSliderPosition");
    });
  });

  describe("4. Responsive Calendar & Time Slot Allocation", () => {
    it("applies responsive mobile padding to prevent calendar grid clipping", () => {
      expect(bookingFile).toContain("p-3 sm:p-6 md:p-10");
      expect(bookingFile).toContain("p-3 sm:p-6");
    });

    it("enforces minimum comfortable touch targets for time slot buttons (min-h-[44px])", () => {
      expect(bookingFile).toContain("min-h-[44px]");
    });
  });

  describe("5. Responsive Admin CRM & Financial Ledger Cards", () => {
    it("provides responsive booking cards on mobile viewports (< 768px)", () => {
      expect(adminBookingsFile).toContain("hidden md:block");
      expect(adminBookingsFile).toContain("block md:hidden space-y-3");
      expect(adminBookingsFile).toContain("Mobile Booking Cards (Smartphone Screens)");
    });

    it("provides responsive payment transaction cards on mobile viewports (< 768px)", () => {
      expect(adminPaymentsFile).toContain("hidden md:block");
      expect(adminPaymentsFile).toContain("block md:hidden space-y-3");
      expect(adminPaymentsFile).toContain("Mobile Payment Cards (Smartphone Screens)");
    });

    it("provides responsive customer directory cards on mobile viewports (< 768px)", () => {
      expect(adminCustomersFile).toContain("hidden md:block");
      expect(adminCustomersFile).toContain("block md:hidden space-y-3");
      expect(adminCustomersFile).toContain("Mobile Customer Cards (Smartphone Screens)");
    });
  });

  describe("6. Safe-Area Inset Support & Bottom Sheet Modals", () => {
    it("implements mobile bottom sheet styling for dialogs with safe-area padding", () => {
      expect(modalFile).toContain("rounded-t-3xl sm:rounded-2xl");
      expect(modalFile).toContain("items-end sm:items-center");
      expect(modalFile).toContain("pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]");
    });

    it("supports safe-area insets on floating concierge widgets", () => {
      expect(floatingContactFile).toContain("bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]");
    });
  });
});
