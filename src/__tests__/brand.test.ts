import { describe, it, expect } from "vitest";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { formatPrice, formatPhoneNumber } from "@/lib/utils/cn";
import { phoneRegex } from "@/lib/validation/schemas";

describe("Brand & Salon Constants", () => {
  it("has correct business details for Lalganj", () => {
    expect(BRAND_CONFIG.name).toBe("The Jawed Habib Salon");
    expect(BRAND_CONFIG.branch).toBe("Lalganj");
    expect(BRAND_CONFIG.contact.phones).toContain("7707000463");
    expect(BRAND_CONFIG.contact.phones).toContain("9831722983");
    expect(BRAND_CONFIG.contact.phones).toContain("9580000175");
    expect(BRAND_CONFIG.hours.open).toBe("10:00 AM");
    expect(BRAND_CONFIG.hours.close).toBe("10:00 PM");
  });

  it("validates Indian phone numbers correctly", () => {
    expect(phoneRegex.test("7707000463")).toBe(true);
    expect(phoneRegex.test("9831722983")).toBe(true);
    expect(phoneRegex.test("9580000175")).toBe(true);
    expect(phoneRegex.test("1234567890")).toBe(false);
  });

  it("formats prices into INR currency", () => {
    const formatted = formatPrice(299);
    expect(formatted).toContain("299");
  });
});
