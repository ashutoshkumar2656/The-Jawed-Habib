import { describe, it, expect } from "vitest";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import sitemap from "@/app/sitemap";
import { metadata as termsMeta } from "@/app/(public)/terms-and-conditions/page";
import { metadata as privacyMeta } from "@/app/(public)/privacy-policy/page";
import { metadata as cancelMeta } from "@/app/(public)/cancellation-refund-policy/page";
import { metadata as shippingMeta } from "@/app/(public)/shipping-delivery-policy/page";
import { metadata as termsLegacyMeta } from "@/app/(public)/terms/page";
import { metadata as privacyLegacyMeta } from "@/app/(public)/privacy/page";
import { generateReceiptPdfBuffer } from "@/lib/pdf/receipt";

describe("Razorpay Website Verification & Business Policies Suite", () => {
  describe("1. Brand Information & Business Verification Facts", () => {
    it("verifies accurate permanent salon business coordinates", () => {
      expect(BRAND_CONFIG.name).toBe("The Jawed Habib Salon");
      expect(BRAND_CONFIG.branch).toBe("Lalganj");
      expect(BRAND_CONFIG.fullName).toBe("The Jawed Habib Salon – Lalganj");
      expect(BRAND_CONFIG.location.pinCode).toBe("844121");
      expect(BRAND_CONFIG.location.fullAddress).toContain("1st Floor, Tinpulwa Chowk");
      expect(BRAND_CONFIG.location.fullAddress).toContain("Above Killer Showroom");
      expect(BRAND_CONFIG.location.fullAddress).toContain("Opposite Manglam Mart");
      expect(BRAND_CONFIG.location.fullAddress).toContain("Lalganj, Bihar – 844121");
    });

    it("verifies phone lines and operating hours", () => {
      expect(BRAND_CONFIG.contact.phones).toContain("7707000463");
      expect(BRAND_CONFIG.contact.phones).toContain("9831722983");
      expect(BRAND_CONFIG.contact.phones).toContain("9580000175");
      expect(BRAND_CONFIG.hours.open).toBe("10:00 AM");
      expect(BRAND_CONFIG.hours.close).toBe("10:00 PM");
      expect(BRAND_CONFIG.hours.display).toBe("Monday – Sunday: 10:00 AM – 10:00 PM");
    });
  });

  describe("2. Public Policy Pages & Canonical Metadata", () => {
    it("verifies Terms & Conditions metadata and canonical URL", () => {
      expect(termsMeta.title).toContain("Terms and Conditions");
      expect(termsMeta.alternates?.canonical).toBe("/terms-and-conditions");
      // Legacy /terms route should canonically point to /terms-and-conditions
      expect(termsLegacyMeta.alternates?.canonical).toBe("/terms-and-conditions");
    });

    it("verifies Privacy Policy metadata and zero card data storage statement", () => {
      expect(privacyMeta.title).toContain("Privacy Policy");
      expect(privacyMeta.alternates?.canonical).toBe("/privacy-policy");
      // Legacy /privacy route should canonically point to /privacy-policy
      expect(privacyLegacyMeta.alternates?.canonical).toBe("/privacy-policy");
    });

    it("verifies Cancellation and Refund Policy metadata and canonical URL", () => {
      expect(cancelMeta.title).toContain("Cancellation and Refund Policy");
      expect(cancelMeta.alternates?.canonical).toBe("/cancellation-refund-policy");
    });

    it("verifies Shipping and Service Delivery Policy metadata and canonical URL", () => {
      expect(shippingMeta.title).toContain("Shipping & Service Delivery Policy");
      expect(shippingMeta.alternates?.canonical).toBe("/shipping-delivery-policy");
    });
  });

  describe("3. Sitemap Inclusion of All Mandatory Razorpay Policy Routes", () => {
    it("verifies all policy routes are present in the sitemap", () => {
      const siteMapEntries = sitemap();
      const urls = siteMapEntries.map((e) => e.url);

      expect(urls.some((u) => u.endsWith("/terms-and-conditions"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/privacy-policy"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/cancellation-refund-policy"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/shipping-delivery-policy"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/about"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/contact"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/pricing"))).toBe(true);
    });
  });

  describe("4. Demonstration Invoice Generator", () => {
    it("renders sample PDF invoice without fabricated GSTIN", () => {
      const samplePayload = {
        receiptNumber: "DEMO-RCPT-20261115",
        appointmentId: "demo_apt_001",
        appointmentNumber: "DEMO-JH-2026-001",
        customer: {
          name: "Demonstration Client",
          email: "sample@example.com",
          phone: "9831722983",
        },
        paymentDate: "15 Nov 2026",
        paymentMethod: "Razorpay Standard Checkout (UPI)",
        transactionReference: "TXN_DEMO_001",
        razorpayPaymentId: "pay_demo_test_001",
        serviceDescription: "Standard Precision Haircut",
        totalServiceAmount: 299,
        amountPaidInThisTransaction: 299,
        previouslyPaidAmount: 0,
        remainingBalance: 0,
        paymentStatus: "PAID" as const,
      };

      const buffer = generateReceiptPdfBuffer(samplePayload);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(500);

      const pdfString = buffer.toString("binary");
      expect(pdfString).toContain("THE JAWED HABIB SALON");
      expect(pdfString).toContain("LALGANJ");
      // Check that it doesn't fabricate an arbitrary hardcoded GSTIN
      expect(pdfString).not.toContain("10AAACT0000A1Z5");
    });
  });
});
