import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";
import { hashPassword } from "@/lib/auth/password";

describe("Customer Dashboard, Reviews & Dynamic Tools", () => {
  it("retrieves and updates customer profile information", async () => {
    const phone = `977${Math.floor(1000000 + Math.random() * 9000000)}`;
    const passHash = await hashPassword("TestPass123!");

    const user = await dbRepo.createUserWithCustomerProfile({
      name: "Deepak Kumar",
      phone,
      email: "deepak@example.com",
      passwordHash: passHash,
      address: "Tinpulwa, Lalganj",
    });

    expect(user.customerProfile?.address).toBe("Tinpulwa, Lalganj");

    // Update profile
    const updated = await dbRepo.updateCustomerProfile(user.id, {
      name: "Deepak K. Verma",
      address: "Opposite Manglam Mart, Lalganj – 844121",
    });

    expect(updated).toBeDefined();
    expect(updated.address).toContain("Manglam Mart");
  });

  it("submits customer review with isApproved: false for admin moderation", async () => {
    const phone = `966${Math.floor(1000000 + Math.random() * 9000000)}`;
    const passHash = await hashPassword("ReviewerPass123!");

    const user = await dbRepo.createUserWithCustomerProfile({
      name: "Ritu Kumari",
      phone,
      passwordHash: passHash,
    });

    const review = await dbRepo.submitReview({
      userId: user.id,
      rating: 5,
      title: "Superb Haircut and Spa experience",
      comment: "The staff was very attentive, hair spa was relaxing, and haircut was precise.",
    });

    expect(review).toBeDefined();
    expect(review.rating).toBe(5);
    // Crucial requirement: customer reviews remain pending until admin approves
    expect(review.isApproved).toBe(false);
  });

  it("validates promotional coupons with minOrderValue constraint", async () => {
    // Under minimum spend
    const underSpend = await dbRepo.validateCoupon("WELCOME100", 300);
    expect(underSpend.isValid).toBe(false);
    expect(underSpend.discount).toBe(0);

    // Meets minimum spend of 499
    const validSpend = await dbRepo.validateCoupon("WELCOME100", 599);
    expect(validSpend.isValid).toBe(true);
    expect(validSpend.discount).toBe(100);

    // Percentage discount with max cap
    const percentCoupon = await dbRepo.validateCoupon("GOLDGLOW20", 1200);
    expect(percentCoupon.isValid).toBe(true);
    expect(percentCoupon.discount).toBe(240); // 20% of 1200
  });

  it("calculates dynamic price estimates with hair length multipliers", async () => {
    const services = await dbRepo.getServices();
    const cut = services.find((s) => s.slug.includes("standard-precision-haircut"));
    const color = services.find((s) => s.slug.includes("global-hair-colour"));

    expect(cut).toBeDefined();
    expect(color).toBeDefined();

    const shortEstimate = await dbRepo.estimatePrice({
      serviceIds: [cut!.id, color!.id],
      hairLength: "SHORT",
    });

    const longEstimate = await dbRepo.estimatePrice({
      serviceIds: [cut!.id, color!.id],
      hairLength: "LONG",
    });

    expect(longEstimate.estimatedTotal).toBeGreaterThan(shortEstimate.estimatedTotal);
    expect(longEstimate.isProvisional).toBe(true);
    expect(longEstimate.disclaimer).toContain("provisional estimates");
  });

  it("provides deterministic guided beauty consultation recommendations", async () => {
    const recommendation = await dbRepo.recommendConsultation({
      gender: "FEMALE",
      hairType: "Wavy",
      primaryConcern: "Frizzy and Dry Hair",
      occasion: "Festival",
      budgetRange: "PREMIUM",
    });

    expect(recommendation).toBeDefined();
    expect(recommendation.recommendedServices.length).toBeGreaterThan(0);
    expect(recommendation.professionalTips.length).toBeGreaterThan(0);
    expect(recommendation.salonBranch).toBe("Lalganj");
  });
});
