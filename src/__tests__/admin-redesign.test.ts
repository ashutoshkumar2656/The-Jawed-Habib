import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus } from "@prisma/client";

describe("Admin Dashboard & Operations Redesign Integration Suite", () => {
  const testDate = "2026-11-20";

  beforeEach(async () => {
    // Reset or clean test state if needed
  });

  // 1. DASHBOARD OVERVIEW METRICS
  it("provides real DB metrics for all appointment statuses and enquiries", async () => {
    const analytics = await dbRepo.getAdminAnalytics();

    expect(typeof analytics.totalAppointments).toBe("number");
    expect(typeof analytics.todayAppointments).toBe("number");
    expect(typeof analytics.pendingAppointments).toBe("number");
    expect(typeof analytics.confirmedAppointments).toBe("number");
    expect(typeof analytics.completedAppointments).toBe("number");
    expect(typeof analytics.cancelledAppointments).toBe("number");
    expect(typeof analytics.totalEnquiries).toBe("number");
    expect(Array.isArray(analytics.recentBookings)).toBe(true);
    expect(Array.isArray(analytics.upcomingAppointments)).toBe(true);
    expect(Array.isArray(analytics.monthlyTrends)).toBe(true);

    // Sum verification
    const activeAndClosed =
      analytics.pendingAppointments +
      analytics.confirmedAppointments +
      analytics.completedAppointments +
      analytics.cancelledAppointments;
    expect(activeAndClosed).toBeLessThanOrEqual(analytics.totalAppointments + 5);
  });

  // 2. APPOINTMENT MANAGEMENT FILTERS
  it("allows searching and filtering appointments by status and service", async () => {
    const allApts = await dbRepo.getAllAppointments();
    expect(allApts.length).toBeGreaterThan(0);

    const pendingApts = await dbRepo.getAllAppointments({ status: "PENDING" });
    pendingApts.forEach((a) => {
      expect(a.status).toBe(AppointmentStatus.PENDING);
    });

    const confirmedApts = await dbRepo.getAllAppointments({ status: "CONFIRMED" });
    confirmedApts.forEach((a) => {
      expect(a.status).toBe(AppointmentStatus.CONFIRMED);
    });
  });

  // 3. BOOKING CALENDAR & AVAILABILITY ENGINE
  it("allows blocking specific time slots and reflects in availability engine", async () => {
    // Create blocked slot for 14:00 - 15:00 on testDate
    const blocked = await dbRepo.createBlockedSlot({
      date: testDate,
      startTime: "14:00",
      endTime: "15:00",
      reason: "VIP Salon Reservation",
    });

    expect(blocked.id).toBeDefined();
    expect(blocked.startTime).toBe("14:00");
    expect(blocked.endTime).toBe("15:00");

    // Fetch availability
    const slotsResult = await dbRepo.getAvailableSlots(testDate, ["srv_1"]);
    const slot14 = slotsResult.slots.find((s) => s.time === "14:00");
    const slot1430 = slotsResult.slots.find((s) => s.time === "14:30");

    expect(slot14?.isAvailable).toBe(false);
    expect(slot14?.conflictReason).toContain("Slot blocked");
    expect(slot1430?.isAvailable).toBe(false);

    // Clean up
    await dbRepo.deleteBlockedSlot(blocked.id);
  });

  it("allows blocking full dates and flags them in monthly availability", async () => {
    const fullBlockDate = "2026-11-25";
    const blocked = await dbRepo.createBlockedSlot({
      date: fullBlockDate,
      startTime: "10:00",
      endTime: "22:00",
      reason: "Salon Deep Sanitation",
    });

    const monthResult = await dbRepo.getMonthAvailability("2026-11", ["srv_1"]);
    expect(monthResult.blockedDates).toContain(fullBlockDate);
    expect(monthResult.unavailableDates).toContain(fullBlockDate);

    // Clean up
    await dbRepo.deleteBlockedSlot(blocked.id);
  });

  // 4. SERVICE CATEGORIES MANAGEMENT
  it("supports category creation, update, and deletion", async () => {
    const newCat = await dbRepo.createCategory({
      name: "Bridal Special",
      slug: "bridal-special",
      description: "Exclusive bridal grooming",
    });

    expect(newCat.id).toBeDefined();
    expect(newCat.name).toBe("Bridal Special");

    const updated = await dbRepo.updateCategory(newCat.id, {
      description: "Updated description",
    });
    expect(updated.description).toBe("Updated description");

    const deleted = await dbRepo.deleteCategory(newCat.id);
    expect(deleted.success).toBe(true);
  });

  // 5. PACKAGE MANAGEMENT
  it("supports updating packages and toggling active status", async () => {
    const pkgs = await dbRepo.getPackages();
    expect(pkgs.length).toBeGreaterThan(0);
    const target = pkgs[0];
    const initialPrice = target.price;

    const updated = await dbRepo.updatePackage(target.id, {
      price: initialPrice + 50,
      isActive: false,
    });
    expect(updated.price).toBe(initialPrice + 50);
    expect(updated.isActive).toBe(false);

    // Revert
    await dbRepo.updatePackage(target.id, {
      price: initialPrice,
      isActive: true,
    });
  });

  // 6. PHOTO GALLERY
  it("supports updating gallery photo information", async () => {
    const images = await dbRepo.getGalleryImages();
    expect(images.length).toBeGreaterThan(0);
    const target = images[0];

    const updated = await dbRepo.updateGalleryImage(target.id, {
      caption: "Updated ambience caption for Lalganj salon",
    });
    expect(updated.caption).toBe("Updated ambience caption for Lalganj salon");
  });

  // 7. VIDEO GALLERY
  it("supports creating, updating, and deleting video links", async () => {
    const newVid = await dbRepo.createVideo({
      title: "Hair Botox Treatment Live Demo",
      videoUrl: "https://www.youtube.com/watch?v=botox-demo",
      category: "Transformations",
      isFeatured: true,
      sortOrder: 5,
    });
    expect(newVid.id).toBeDefined();

    const updated = await dbRepo.updateVideo(newVid.id, {
      title: "Updated Botox Treatment Demo",
    });
    expect(updated.title).toBe("Updated Botox Treatment Demo");

    const del = await dbRepo.deleteVideo(newVid.id);
    expect(del.success).toBe(true);
  });

  // 8. PARTNER BRANDS & FAQS
  it("supports updating brands and FAQs", async () => {
    const brands = await dbRepo.getBrands();
    expect(brands.length).toBeGreaterThan(0);
    const b = brands[0];
    const updatedBrand = await dbRepo.updateBrand(b.id, {
      description: "Official L'Oreal Professional Partner Salon",
    });
    expect(updatedBrand.description).toBe("Official L'Oreal Professional Partner Salon");

    const faqs = await dbRepo.getFaqs();
    expect(faqs.length).toBeGreaterThan(0);
    const f = faqs[0];
    const updatedFaq = await dbRepo.updateFaq(f.id, {
      question: "Are prior appointments required at Lalganj branch?",
    });
    expect(updatedFaq.question).toBe("Are prior appointments required at Lalganj branch?");
  });
});
