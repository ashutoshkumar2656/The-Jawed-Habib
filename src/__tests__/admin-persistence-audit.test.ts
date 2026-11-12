import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";

describe("Part 5 QA Audit: Admin Dashboard Persistence & Operations", () => {
  it("persists staff onboarding and floor availability toggling", async () => {
    // 1. Add staff
    const staff = await dbRepo.createStaff({
      name: "Deepak Sharma",
      email: "deepak@jawedhabib-lalganj.com",
      phone: "9831722999",
      designation: "Senior Colorist",
      experienceYears: 6,
      bio: "Balayage and ombre specialist",
      specialties: ["Balayage", "Global Color", "Keratin"],
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      startTime: "10:00",
      endTime: "22:00",
      isAvailable: true,
    });
    expect(staff.id).toBeDefined();

    // 2. Toggle floor availability to false (Off Duty)
    const updated = await dbRepo.updateStaff(staff.id, { isAvailable: false });
    expect(updated.isAvailable).toBe(false);

    // 3. Verify in admin staff list and confirm excluded from public booking
    const adminStaff = await dbRepo.getAllStaff();
    const foundAdmin = adminStaff.find((s) => s.id === staff.id);
    expect(foundAdmin?.isAvailable).toBe(false);

    const publicStaff = await dbRepo.getStaffMembers();
    const foundPublic = publicStaff.find((s) => s.id === staff.id);
    expect(foundPublic).toBeUndefined(); // Excluded from public booking slot selection

    // 4. Clean up
    await dbRepo.deleteStaff(staff.id);
  });

  it("persists gallery photo upload and deletion", async () => {
    const newImage = await dbRepo.createGalleryImage({
      title: "Styling Bay Station 4",
      caption: "Hydraulic chairs and luxury mirrors",
      imageUrl: "/images/gallery/interior-4.jpg",
      category: "INTERIOR",
      isFeatured: true,
      sortOrder: 1,
    });
    expect(newImage.id).toBeDefined();

    const images = await dbRepo.getGalleryImages();
    expect(images.some((img) => img.id === newImage.id)).toBe(true);

    const deleted = await dbRepo.deleteGalleryImage(newImage.id);
    expect(deleted).toBe(true);

    const imagesAfter = await dbRepo.getGalleryImages();
    expect(imagesAfter.some((img) => img.id === newImage.id)).toBe(false);
  });

  it("persists before & after makeover transformations", async () => {
    const transformation = await dbRepo.createTransformation({
      title: "Brunette to Honey Caramel Balayage",
      beforeImageUrl: "/images/transformations/before-hair-1.jpg",
      afterImageUrl: "/images/transformations/after-hair-1.jpg",
      description: "Seamless gradient transition with zero brassiness.",
      clientGender: "UNISEX",
      isFeatured: true,
      sortOrder: 1,
    });
    expect(transformation.id).toBeDefined();

    const allTransformations = await dbRepo.getTransformations();
    expect(allTransformations.some((t) => t.id === transformation.id)).toBe(true);

    const deleted = await dbRepo.deleteTransformation(transformation.id);
    expect(deleted).toBe(true);
  });

  it("creates discount coupons and enforces discount deduction calculation", async () => {
    const coupon = await dbRepo.createCoupon({
      code: "FESTIVE25",
      description: "25% off festive promotion",
      discountType: "PERCENTAGE",
      discountValue: 25,
      minOrderValue: 1000,
      maxDiscount: 500,
      validFrom: "2026-11-01",
      validUntil: "2026-12-31",
      usageLimit: 100,
      isActive: true,
    });
    expect(coupon.id).toBeDefined();
    expect(coupon.code).toBe("FESTIVE25");

    const allCoupons = await dbRepo.getAllCoupons();
    expect(allCoupons.some((c) => c.code === "FESTIVE25")).toBe(true);

    // Validate coupon application
    const validated = await dbRepo.validateCoupon("FESTIVE25", 1500);
    expect(validated.isValid).toBe(true);
    // 25% of 1500 is 375, which is <= maxDiscount 500
    expect(validated.discount).toBe(375);

    await dbRepo.deleteCoupon(coupon.id);
  });

  it("persists site operational settings update", async () => {
    const current = await dbRepo.getSiteSettings();
    expect(current).toBeDefined();

    const updated = await dbRepo.updateSiteSettings({
      announcementBarText: "Festive Season Offers Active at Lalganj Salon!",
      advanceBookingDays: "21",
    });
    expect(updated.announcementBarText).toBe("Festive Season Offers Active at Lalganj Salon!");
    expect(updated.advanceBookingDays).toBe("21");
  });

  it("persists video gallery and reels management", async () => {
    const video = await dbRepo.createVideo({
      title: "Bridal Eye Artistry & Lashes Reel",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      category: "Bridal",
      isFeatured: true,
      sortOrder: 5,
    });
    expect(video.title).toBe("Bridal Eye Artistry & Lashes Reel");

    const allVideos = await dbRepo.getVideos();
    expect(allVideos.some((v) => v.id === video.id)).toBe(true);

    const updated = await dbRepo.updateVideo(video.id, { title: "Updated Bridal Eye Artistry" });
    expect(updated.title).toBe("Updated Bridal Eye Artistry");

    const deleted = await dbRepo.deleteVideo(video.id);
    expect(deleted.success).toBe(true);
  });

  it("persists premium cosmetic brands and FAQs", async () => {
    const brand = await dbRepo.createBrand({
      name: "Dyson Supersonic Pro",
      category: "Hair Styling Tools",
      description: "Intelligent heat control styling tools.",
      isFeatured: true,
      sortOrder: 10,
    });
    expect(brand.name).toBe("Dyson Supersonic Pro");

    const brands = await dbRepo.getBrands();
    expect(brands.some((b) => b.id === brand.id)).toBe(true);

    const faq = await dbRepo.createFaq({
      question: "Are your hairstylists certified by Jawed Habib Academy?",
      answer: "Yes, all stylists undergo intensive training under Habib methodologies.",
      category: "Stylists",
      sortOrder: 7,
      isActive: true,
    });
    expect(faq.question).toContain("certified by Jawed Habib");

    const faqs = await dbRepo.getFaqs();
    expect(faqs.some((f) => f.id === faq.id)).toBe(true);
  });
});
