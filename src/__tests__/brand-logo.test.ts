import { describe, it, expect } from "vitest";
import { BRAND_CONFIG } from "@/lib/constants/brand";

describe("Brand Identity & Official Logo Integrity", () => {
  it("verifies brand configuration contains official brand colors and asset paths", () => {
    expect(BRAND_CONFIG.name).toBe("The Jawed Habib Salon");
    expect(BRAND_CONFIG.branch).toBe("Lalganj");
    expect(BRAND_CONFIG.theme.colors.brandRed).toBe("#C62628");
    expect(BRAND_CONFIG.theme.colors.champagneGold).toBe("#C6A56B");
    expect(BRAND_CONFIG.theme.colors.luxuryBlack).toBe("#111111");

    // Asset paths
    expect(BRAND_CONFIG.assets.logoPrimary).toBe("/brand/jawed-habib/logo-primary.svg");
    expect(BRAND_CONFIG.assets.logoWhite).toBe("/brand/jawed-habib/logo-white.svg");
    expect(BRAND_CONFIG.assets.logoStacked).toBe("/brand/jawed-habib/logo-stacked.png");
    expect(BRAND_CONFIG.assets.logoIcon).toBe("/brand/jawed-habib/logo-icon.svg");
    expect(BRAND_CONFIG.assets.favicon).toBe("/brand/jawed-habib/favicon.png");
    expect(BRAND_CONFIG.assets.brandPreview).toBe("/brand/jawed-habib/brand-preview.webp");
  });

  it("verifies ground truth contact and location parameters are strictly maintained", () => {
    expect(BRAND_CONFIG.contact.primaryPhone).toBe("7707000463");
    expect(BRAND_CONFIG.contact.phones).toContain("7707000463");
    expect(BRAND_CONFIG.contact.phones).toContain("9831722983");
    expect(BRAND_CONFIG.contact.phones).toContain("9580000175");
    expect(BRAND_CONFIG.location.pinCode).toBe("844121");
    expect(BRAND_CONFIG.location.addressLine1).toContain("Tinpulwa Chowk");
    expect(BRAND_CONFIG.location.landmark).toContain("Killer Showroom");
  });
});
