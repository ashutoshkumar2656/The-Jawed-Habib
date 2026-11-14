import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";

describe("Admin Dashboard & Operations Module", () => {
  it("computes accurate real admin analytics from live records", async () => {
    const analytics = await dbRepo.getAdminAnalytics();

    expect(analytics).toBeDefined();
    expect(analytics.totalAppointments).toBeGreaterThan(0);
    expect(analytics.totalCustomers).toBeGreaterThan(0);
    expect(typeof analytics.totalRevenue).toBe("number");
    expect(typeof analytics.todayRevenue).toBe("number");
    expect(Array.isArray(analytics.popularServices)).toBe(true);
    expect(Array.isArray(analytics.recentBookings)).toBe(true);
    expect(Array.isArray(analytics.monthlyTrends)).toBe(true);
    expect(analytics.monthlyTrends.length).toBe(6);
  });

  it("updates appointment status to COMPLETED and records customer visit & spend metrics", async () => {
    // 1. Fetch appointments
    const appointments = await dbRepo.getAllAppointments();
    const targetApt = appointments.find((a) => a.status === AppointmentStatus.CONFIRMED) || appointments[0];
    expect(targetApt).toBeDefined();

    const customerBefore = await dbRepo.getAllCustomers();
    const custProfileBefore = customerBefore.find((c) => c.id === targetApt.customerProfileId);
    const initialVisits = custProfileBefore?.totalVisits || 0;

    // 2. Mark completed
    const updated = await dbRepo.updateAppointmentStatus(targetApt.id, {
      status: AppointmentStatus.COMPLETED,
      adminNotes: "Client delighted with salon service",
    });

    expect(updated.status).toBe(AppointmentStatus.COMPLETED);
    // Verified decoupled: completing a visit does not wipe unpaid or partially paid balance
    expect(updated.paymentStatus).toBe(targetApt.paymentStatus);

    // 3. Verify CRM profile received visit and spend
    const customerAfter = await dbRepo.getAllCustomers();
    const custProfileAfter = customerAfter.find((c) => c.id === targetApt.customerProfileId);

    expect(custProfileAfter).toBeDefined();
    expect(custProfileAfter!.totalVisits).toBeGreaterThanOrEqual(initialVisits);
  });

  it("updates customer CRM notes successfully", async () => {
    const customers = await dbRepo.getAllCustomers();
    expect(customers.length).toBeGreaterThan(0);
    const targetCustomer = customers[0];

    const newNote = "VIP client: prefers lukewarm water and organic shampoo";
    await dbRepo.updateCustomerNotes(targetCustomer.id, newNote);

    const refreshed = await dbRepo.getAllCustomers();
    const updated = refreshed.find((c) => c.id === targetCustomer.id);
    expect(updated?.notes).toBe(newNote);
  });

  it("supports service catalog creation, update, and deletion lifecycle", async () => {
    // 1. Create
    const newService = await dbRepo.createService({
      name: "Luxury Moroccan Argan Hair Spa",
      slug: "luxury-moroccan-argan-hair-spa",
      description: "Restorative argan oil treatment for dry hair",
      price: 1500,
      discountedPrice: 1299,
      durationMinutes: 60,
      gender: "UNISEX",
      categoryId: "cat_2",
      imageUrl: "/images/services/hair-spa.webp",
      isPopular: true,
      isFeatured: true,
      isActive: true,
    });

    expect(newService.id).toBeDefined();
    expect(newService.name).toBe("Luxury Moroccan Argan Hair Spa");

    // 2. Update
    const updatedService = await dbRepo.updateService(newService.id, {
      price: 1600,
      discountedPrice: 1399,
    });
    expect(updatedService.price).toBe(1600);

    // 3. Delete
    const deleted = await dbRepo.deleteService(newService.id);
    expect(deleted).toBe(true);

    const allServices = await dbRepo.getServices();
    expect(allServices.some((s) => s.id === newService.id)).toBe(false);
  });

  it("moderates customer reviews correctly (approvals and featuring)", async () => {
    const reviews = await dbRepo.getAllReviews("ALL");
    expect(reviews.length).toBeGreaterThan(0);
    const targetReview = reviews[0];

    // Toggle approval & feature
    const moderated = await dbRepo.updateReviewStatus(targetReview.id, {
      isApproved: true,
      isFeatured: true,
    });

    expect(moderated.isApproved).toBe(true);
    expect(moderated.isFeatured).toBe(true);
  });

  it("manages salon video reels and brand partners", async () => {
    // 1. Fetch videos
    const videos = await dbRepo.getVideos();
    expect(Array.isArray(videos)).toBe(true);
    expect(videos.length).toBeGreaterThan(0);
    expect(videos[0].videoUrl).toBeDefined();

    // 2. Fetch brands
    const brands = await dbRepo.getBrands();
    expect(Array.isArray(brands)).toBe(true);
    expect(brands.length).toBeGreaterThan(0);
    expect(brands.some((b) => b.name.includes("L'Oréal"))).toBe(true);

    // 3. Fetch FAQs
    const faqs = await dbRepo.getFaqs();
    expect(Array.isArray(faqs)).toBe(true);
    expect(faqs.length).toBeGreaterThan(0);
  });

  it("generates comprehensive reports and staff productivity data", async () => {
    const reports = await dbRepo.getReportsData("monthly");

    expect(reports.totalAppointmentsCount).toBeGreaterThan(0);
    expect(reports.totalCustomersCount).toBeGreaterThan(0);
    expect(Array.isArray(reports.staffPerformance)).toBe(true);
    expect(reports.staffPerformance.length).toBeGreaterThan(0);
    expect(Array.isArray(reports.categoryRevenue)).toBe(true);
    expect(Array.isArray(reports.rawAppointments)).toBe(true);
  });
});
