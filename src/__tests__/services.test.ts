import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";
import { GenderTarget } from "@prisma/client";

describe("Services & Category Management", () => {
  it("fetches active categories with service count", async () => {
    const categories = await dbRepo.getCategories();
    expect(categories.length).toBeGreaterThan(0);

    const haircutCat = categories.find((c) => c.slug === "haircuts-styling");
    expect(haircutCat).toBeDefined();
    expect(haircutCat?.name).toContain("Haircuts");
    expect(haircutCat?._count.services).toBeGreaterThan(0);
  });

  it("fetches indicative services and verified pricing", async () => {
    const services = await dbRepo.getServices();
    expect(services.length).toBeGreaterThan(0);

    // Standard Haircut: ₹299
    const standardCut = services.find((s) => s.slug.includes("standard-precision-haircut"));
    expect(standardCut).toBeDefined();
    expect(standardCut?.price).toBe(299);

    // Global Hair Colour: ₹2,499
    const globalColor = services.find((s) => s.slug.includes("global-hair-colour"));
    expect(globalColor).toBeDefined();
    expect(globalColor?.price).toBe(2499);
  });

  it("filters services by category slug and gender target", async () => {
    const hairSpaServices = await dbRepo.getServices({ categorySlug: "hair-spa-treatments" });
    expect(hairSpaServices.length).toBeGreaterThan(0);
    expect(hairSpaServices.every((s) => s.category?.slug === "hair-spa-treatments")).toBe(true);

    const maleServices = await dbRepo.getServices({ gender: GenderTarget.MALE });
    expect(maleServices.length).toBeGreaterThan(0);
    expect(
      maleServices.every(
        (s) => s.gender === GenderTarget.MALE || s.gender === GenderTarget.UNISEX
      )
    ).toBe(true);
  });

  it("fetches active staff members with specialties and ratings", async () => {
    const staff = await dbRepo.getStaffMembers();
    expect(staff.length).toBeGreaterThan(0);

    const masterStylist = staff[0];
    expect(masterStylist.user.name).toBeDefined();
    expect(masterStylist.designation).toBeDefined();
    expect(masterStylist.rating).toBeGreaterThanOrEqual(4.5);
    expect(masterStylist.workingDays.length).toBe(7); // Open all 7 days
  });
});
