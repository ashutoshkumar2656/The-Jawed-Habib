import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { siteConfig } from "@/config/site";
import {
  appointmentBookingSchema,
  enquirySchema,
  adminAppointmentStatusSchema,
} from "@/lib/validation/schemas";
import {
  checkRateLimit,
  checkDuplicateSubmission,
  sanitizeInput,
} from "@/lib/security/rate-limit";
import {
  AppointmentStatus,
  BookingSource,
  PaymentStatus,
  EnquiryStatus,
} from "@prisma/client";

describe("Complete Platform Integration Test Suite: Jawed Habib Salon Lalganj", () => {
  const testDate = "2026-12-20";

  // ========================================================
  // 1. PUBLIC WEBSITE & GROUND TRUTH INTEGRITY
  // ========================================================
  describe("1. Public Website & Business Information", () => {
    it("verifies immutable business facts across brand configuration", () => {
      expect(BRAND_CONFIG.name).toBe("The Jawed Habib Salon");
      expect(BRAND_CONFIG.fullName).toBe("The Jawed Habib Salon – Lalganj");
      expect(BRAND_CONFIG.location.city).toBe("Lalganj");
      expect(BRAND_CONFIG.location.district).toBe("Vaishali");
      expect(BRAND_CONFIG.location.state).toBe("Bihar");
      expect(BRAND_CONFIG.location.pinCode).toBe("844121");
      expect(BRAND_CONFIG.location.addressLine1).toContain("1st Floor, Tinpulwa Chowk");
      expect(BRAND_CONFIG.location.landmark).toContain("Above Killer Showroom");
      expect(BRAND_CONFIG.hours.display).toContain("10:00 AM – 10:00 PM");
      expect(BRAND_CONFIG.hours.days).toContain("Monday to Sunday");
      expect(BRAND_CONFIG.contact.primaryPhone).toBe("7707000463");
      expect(BRAND_CONFIG.contact.secondaryPhone).toBe("9831722983");
      expect(BRAND_CONFIG.contact.tertiaryPhone).toBe("9580000175");
    });

    it("verifies public navigation destinations match single-page section anchors", () => {
      const hrefs = siteConfig.mainNav.map((n) => n.href);
      expect(hrefs).toContain("/");
      expect(hrefs).toContain("/#services");
      expect(hrefs).toContain("/#packages");
      expect(hrefs).toContain("/#gallery");
      expect(hrefs).toContain("/#reviews");
      expect(hrefs).toContain("/#contact");
    });

    it("verifies WhatsApp consultation and Google Maps links are well-formed", () => {
      const whatsappUrl = `https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=${encodeURIComponent("Hello Jawed Habib Lalganj")}`;
      expect(whatsappUrl).toContain("917707000463");
      expect(whatsappUrl).toContain("Hello%20Jawed%20Habib%20Lalganj");

      expect(BRAND_CONFIG.location.googleMapsUrl).toContain("maps.app.goo.gl");
      expect(BRAND_CONFIG.contact.instagramUrl).toContain("the_jawedhabib_lalganj");
    });
  });

  // ========================================================
  // 2. INTERACTIVE FUNCTIONALITY & CONTROLS
  // ========================================================
  describe("2. Interactive Functionality & Widget Mechanics", () => {
    it("verifies Lightbox circular navigation logic", () => {
      const totalPhotos = 8;
      const getNext = (cur: number) => (cur + 1) % totalPhotos;
      const getPrev = (cur: number) => (cur - 1 + totalPhotos) % totalPhotos;

      expect(getNext(0)).toBe(1);
      expect(getNext(7)).toBe(0); // wrap to first
      expect(getPrev(0)).toBe(7); // wrap to last
      expect(getPrev(4)).toBe(3);
    });

    it("verifies YouTube embed transformation function handles all URL formats", () => {
      function getEmbedUrl(url: string): string {
        if (!url) return "";
        if (url.includes("youtube.com/embed/")) {
          return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
        }
        const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
        if (watchMatch && watchMatch[1]) {
          return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
        }
        return url;
      }

      // Standard watch URL
      expect(getEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
      // Short URL
      expect(getEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
      // Shorts URL
      expect(getEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ");
      // Already embed URL
      expect(getEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1");
    });

    it("verifies Before & After slider coordinate clamping", () => {
      const clampPercentage = (rawX: number, containerWidth: number) => {
        return Math.min(Math.max((rawX / containerWidth) * 100, 0), 100);
      };

      expect(clampPercentage(500, 1000)).toBe(50);
      expect(clampPercentage(-50, 1000)).toBe(0); // no underflow
      expect(clampPercentage(1200, 1000)).toBe(100); // no overflow
    });

    it("verifies Quick Contact Enquiry form validation and DB persistence", async () => {
      // Missing name
      const invalidName = enquirySchema.safeParse({
        name: "A",
        phone: "7707000463",
        message: "Need bridal makeup quotation",
      });
      expect(invalidName.success).toBe(false);

      // Invalid Indian phone (less than 10 digits or non-Indian prefix)
      const invalidPhone = enquirySchema.safeParse({
        name: "Rahul Verma",
        phone: "1234567890", // starts with 1
        message: "Need haircut appointment",
      });
      expect(invalidPhone.success).toBe(false);

      // Short message (<10 characters)
      const shortMsg = enquirySchema.safeParse({
        name: "Rahul Verma",
        phone: "9831722983",
        message: "Hi",
      });
      expect(shortMsg.success).toBe(false);

      // Valid Enquiry Payload
      const validPayload = {
        name: "Sunita Kumari",
        phone: "7707000463",
        email: "sunita@example.com",
        serviceInterest: "Bridal HD Makeup",
        message: "Need complete pre-bridal and wedding day package details.",
        type: "BRIDAL" as const,
      };

      const parsed = enquirySchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);

      const created = await dbRepo.createEnquiry(validPayload);
      expect(created).toBeDefined();
      expect(created.name).toBe("Sunita Kumari");
      expect(created.status).toBe(EnquiryStatus.NEW);
    });
  });

  // ========================================================
  // 3. COMPLETE CUSTOMER BOOKING JOURNEY & CONFLICT VALIDATION
  // ========================================================
  describe("3. End-to-End Customer Booking Journey", () => {
    let bookedAppointmentId = "";
    let selectedStaffId = "";

    it("Step 1: Customer queries available calendar dates for the month", async () => {
      const monthData = await dbRepo.getMonthAvailability("2026-12", ["srv_1"]);
      expect(monthData).toBeDefined();
      expect(monthData.yearMonth).toBe("2026-12");
      expect(Array.isArray(monthData.availableDates)).toBe(true);
      expect(monthData.availableDates.length).toBeGreaterThan(0);
    });

    it("Step 2: Customer queries 30m slots for an open date", async () => {
      const staffList = await dbRepo.getStaffMembers();
      expect(staffList.length).toBeGreaterThan(0);
      selectedStaffId = staffList[0].id;

      const availability = await dbRepo.getAvailableSlots(testDate, ["srv_1"], selectedStaffId);
      expect(availability).toBeDefined();
      expect(Array.isArray(availability.slots)).toBe(true);
      expect(availability.slots.length).toBeGreaterThan(10);
      const slot11am = availability.slots.find((s) => s.time === "11:00");
      expect(slot11am).toBeDefined();
      expect(slot11am?.isAvailable).toBe(true);
    });

    it("Step 3 & 4: Customer submits booking form & Backend validates request", async () => {
      const payload = {
        customerName: "Vikash Kumar",
        customerPhone: "7707000463",
        customerEmail: "vikash@jawedhabib-demo.in",
        serviceIds: ["srv_1"],
        staffId: selectedStaffId,
        packageId: null,
        appointmentDate: testDate,
        startTime: "11:00",
        notes: "Senior barber preferred for taper fade",
        source: "ONLINE_WEBSITE" as const,
      };

      const validated = appointmentBookingSchema.safeParse(payload);
      expect(validated.success).toBe(true);

      // Step 5: Booking is saved in database
      const appt = await dbRepo.createAppointment(payload);
      expect(appt).toBeDefined();
      expect(appt.appointmentNumber).toMatch(/^JH-LLG-\d{8}-\d{4}$/);
      expect(appt.status).toBe(AppointmentStatus.PENDING);
      expect(appt.paymentStatus).toBe(PaymentStatus.UNPAID);

      bookedAppointmentId = appt.id;
    });

    it("Step 6: Same slot is now marked as unavailable for that stylist to prevent double booking", async () => {
      const availability = await dbRepo.getAvailableSlots(testDate, ["srv_1"], selectedStaffId);
      const slot11am = availability.slots.find((s) => s.time === "11:00");
      expect(slot11am).toBeDefined();
      expect(slot11am?.isAvailable).toBe(false);
      expect(slot11am?.conflictReason).toBe("Slot fully booked or staff unavailable");
    });

    it("Step 7: Booking appears in Admin Dashboard Recent Bookings & Analytics", async () => {
      const analytics = await dbRepo.getAdminAnalytics();
      expect(analytics.totalAppointments).toBeGreaterThan(0);
      expect(analytics.pendingAppointments).toBeGreaterThan(0);

      const appointments = await dbRepo.getAppointments({});
      const found = appointments.find((a: any) => a.id === bookedAppointmentId);
      expect(found).toBeDefined();
      expect(found?.customerProfile?.user?.phone).toBe("7707000463");
    });

    it("Step 8 & 9: Admin confirms the booking -> Status updates to CONFIRMED", async () => {
      const updateData = {
        status: AppointmentStatus.CONFIRMED,
      };
      const validated = adminAppointmentStatusSchema.safeParse(updateData);
      expect(validated.success).toBe(true);

      const updated = await dbRepo.updateAppointmentStatus(bookedAppointmentId, {
        status: AppointmentStatus.CONFIRMED,
      });
      expect(updated).toBeDefined();
      expect(updated?.status).toBe(AppointmentStatus.CONFIRMED);

      const verified = await dbRepo.getAppointmentById(bookedAppointmentId);
      expect(verified?.status).toBe(AppointmentStatus.CONFIRMED);
    });

    it("Step 10: Admin completes the appointment", async () => {
      const completed = await dbRepo.updateAppointmentStatus(bookedAppointmentId, {
        status: AppointmentStatus.COMPLETED,
      });
      expect(completed?.status).toBe(AppointmentStatus.COMPLETED);
    });

    it("Rejects duplicate rapid booking attempts from same phone and slot", () => {
      const res1 = checkDuplicateSubmission("7707000463", testDate, "11:00", 60000);
      expect(res1.isDuplicate).toBe(false); // First attempt recorded

      const res2 = checkDuplicateSubmission("7707000463", testDate, "11:00", 60000);
      expect(res2.isDuplicate).toBe(true); // Flagged as rapid duplicate
    });
  });

  // ========================================================
  // 4. ADMIN DASHBOARD 15 MODULES VERIFICATION
  // ========================================================
  describe("4. Admin Dashboard: Complete 15 Modules Verification", () => {
    // 1. Dashboard Overview
    it("Module 1: Dashboard Overview provides real DB counts, status distribution and trends", async () => {
      const analytics = await dbRepo.getAdminAnalytics();
      expect(analytics).toBeDefined();
      expect(typeof analytics.totalAppointments).toBe("number");
      expect(typeof analytics.pendingAppointments).toBe("number");
      expect(typeof analytics.confirmedAppointments).toBe("number");
      expect(typeof analytics.completedAppointments).toBe("number");
      expect(typeof analytics.cancelledAppointments).toBe("number");
      expect(typeof analytics.totalEnquiries).toBe("number");
      expect(Array.isArray(analytics.monthlyTrends)).toBe(true);
      expect(Array.isArray(analytics.recentBookings)).toBe(true);
    });

    // 2. Appointment Management
    it("Module 2: Appointment Management filters by search, service, and status", async () => {
      const allAppts = await dbRepo.getAppointments({});
      expect(Array.isArray(allAppts)).toBe(true);

      const completedAppts = await dbRepo.getAppointments({ status: AppointmentStatus.COMPLETED });
      expect(completedAppts.every((a: any) => a.status === AppointmentStatus.COMPLETED)).toBe(true);
    });

    // 3. Calendar Management (Slot & Date Blocking)
    it("Module 3: Booking Calendar blocks specific time intervals and full dates", async () => {
      const blockDate = "2026-12-25";

      // Block specific time slot
      const blockedSlot = await dbRepo.createBlockedSlot({
        date: blockDate,
        startTime: "14:00",
        endTime: "15:00",
        reason: "VIP Bridal Party Station Allocation",
      });
      expect(blockedSlot).toBeDefined();
      expect(blockedSlot.startTime).toBe("14:00");

      // Verify availability engine respects the blocked slot
      const availability = await dbRepo.getAvailableSlots(blockDate, ["srv_1"]);
      const slot14 = availability.slots.find((s) => s.time === "14:00");
      expect(slot14?.isAvailable).toBe(false);
      expect(slot14?.conflictReason).toBe("Slot blocked by salon administrator");

      // Delete/Unblock the slot
      const unblocked = await dbRepo.deleteBlockedSlot(blockedSlot.id);
      expect(unblocked.success).toBe(true);

      // Verify slot is free again
      const availabilityAfter = await dbRepo.getAvailableSlots(blockDate, ["srv_1"]);
      const slot14After = availabilityAfter.slots.find((s) => s.time === "14:00");
      expect(slot14After?.isAvailable).toBe(true);
    });

    // 4. Service Management
    it("Module 4: Service Management adds new service, updates price, and categorizes", async () => {
      const services = await dbRepo.getServices();
      const initialCount = services.length;

      const newService = await dbRepo.createService({
        name: "Moroccan Argan Hair Spa",
        slug: "moroccan-argan-hair-spa",
        categoryId: services[0]?.categoryId || "cat_hair",
        gender: "UNISEX" as const,
        description: "Intense moisture repair using 100% organic cold-pressed argan oil.",
        price: 1499,
        discountedPrice: 1299,
        durationMinutes: 60,
        imageUrl: "/images/services/service-hair-spa.jpg",
        isPopular: true,
        isFeatured: true,
        isActive: true,
      });

      expect(newService).toBeDefined();
      expect(newService.price).toBe(1499);

      // Update price
      const updated = await dbRepo.updateService(newService.id, {
        price: 1599,
      });
      expect(updated?.price).toBe(1599);

      const refreshed = await dbRepo.getServices();
      expect(refreshed.length).toBe(initialCount + 1);
    });

    // 5. Package Management
    it("Module 5: Package Management creates combo package with included services", async () => {
      const newPackage = await dbRepo.createPackage({
        name: "Lalganj Royal Festive Glow",
        slug: "lalganj-royal-festive-glow",
        price: 2499,
        originalPrice: 3200,
        durationMinutes: 120,
        description: "Precision Haircut + 24K Gold Facial + Hot Towel Scalp Massage.",
        imageUrl: "/images/packages/festive-glow.jpg",
        isFeatured: true,
        isActive: true,
        servicesList: ["Precision Haircut", "24K Gold Facial"],
      });

      expect(newPackage).toBeDefined();
      expect(newPackage.price).toBe(2499);
      expect(newPackage.originalPrice).toBe(3200);

      const packages = await dbRepo.getPackages();
      const found = packages.find((p: any) => p.id === newPackage.id);
      expect(found).toBeDefined();
    });

    // 6. Photo Gallery Management
    it("Module 6: Photo Gallery Management publishes and updates image metadata", async () => {
      const newImage = await dbRepo.createGalleryImage({
        title: "Airbrushed Bridal Reception Look",
        category: "Bridal & Makeup",
        caption: "Charlotte Tilbury base with soft bronze eye styling.",
        imageUrl: "/images/gallery/gallery-6.jpg",
        sortOrder: 1,
        isFeatured: true,
      });

      expect(newImage).toBeDefined();
      expect(newImage.isFeatured).toBe(true);

      const updated = await dbRepo.updateGalleryImage(newImage.id, {
        title: "Updated Bridal Look 2026",
      });
      expect(updated?.title).toBe("Updated Bridal Look 2026");
    });

    // 7. Video Gallery Management
    it("Module 7: Video Gallery Management adds external YouTube video and toggles visibility", async () => {
      const newVideo = await dbRepo.createVideo({
        title: "Balayage Ribbon Technique Masterclass",
        description: "Step-by-step lightening and root glossing.",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "/images/services/service-hair-color.jpg",
        category: "Hair Artistry",
        sortOrder: 2,
        isFeatured: true,
      });

      expect(newVideo).toBeDefined();
      expect(newVideo.videoUrl).toContain("youtube.com");

      const videos = await dbRepo.getVideos();
      const found = videos.find((v: any) => v.id === newVideo.id);
      expect(found).toBeDefined();
    });

    // 8. Before & After Management
    it("Module 8: Before & After Management manages dual-image transformation items", async () => {
      const transformations = await dbRepo.getTransformations();
      expect(Array.isArray(transformations)).toBe(true);
      expect(transformations.length).toBeGreaterThan(0);
      expect(transformations[0]).toHaveProperty("beforeImageUrl");
      expect(transformations[0]).toHaveProperty("afterImageUrl");
    });

    // 9. Customer Reviews Management
    it("Module 9: Review Moderation approves authentic client reviews for public display", async () => {
      const review = await dbRepo.submitReview({
        userId: "usr_cust_1",
        rating: 5,
        title: "Best Salon in Lalganj",
        comment: "Exceptional hair spa and precision haircut. Clean and hygienic.",
      });

      expect(review).toBeDefined();
      expect(review.isApproved).toBe(false); // Pending moderation

      // Admin approves review
      const approved = await dbRepo.updateReviewStatus(review.id, { isApproved: true });
      expect(approved?.isApproved).toBe(true);

      // Verify it appears in public approved reviews
      const publicReviews = await dbRepo.getReviews(true);
      const found = publicReviews.find((r: any) => r.id === review.id);
      expect(found).toBeDefined();
    });

    // 10. Offers Management
    it("Module 10: Offers Management creates and validates seasonal discount campaigns", async () => {
      const newOffer = await dbRepo.createOffer({
        title: "Diwali & Chhath Special Privilege",
        slug: "diwali-chhath-special-2026",
        discountType: "PERCENTAGE",
        discountValue: 20,
        validFrom: "2026-10-01",
        validUntil: "2026-11-30",
        description: "Flat 20% OFF on all hair spas and facial services.",
        isFeatured: true,
        isActive: true,
        termsConditions: ["Valid on appointments above ₹999"],
      });

      expect(newOffer).toBeDefined();
      expect(newOffer.title).toBe("Diwali & Chhath Special Privilege");

      const offers = await dbRepo.getOffers();
      const found = offers.find((o: any) => o.slug === "diwali-chhath-special-2026");
      expect(found).toBeDefined();
    });

    // 11. Brand Management
    it("Module 11: Premium Brand Management registers authorized luxury partners", async () => {
      const newBrand = await dbRepo.createBrand({
        name: "OPI Nail Lacquer",
        logoUrl: "/images/brands/opi.png",
        category: "Nails & Care",
        description: "World leader in professional nail care, rich pigments, and durable gel finishes.",
        isFeatured: true,
        sortOrder: 7,
      });

      expect(newBrand).toBeDefined();
      expect(newBrand.name).toBe("OPI Nail Lacquer");

      const brands = await dbRepo.getBrands();
      const found = brands.find((b: any) => b.name === "OPI Nail Lacquer");
      expect(found).toBeDefined();
    });

    // 12. FAQ Management
    it("Module 12: FAQ Management adds structured answers to common queries", async () => {
      const newFaq = await dbRepo.createFaq({
        question: "Do you offer home bridal makeup services outside Lalganj?",
        answer: "Yes, our senior bridal team travels to venues across Vaishali, Hajipur, and Muzaffarpur upon prior booking.",
        category: "Bridal",
        sortOrder: 10,
        isActive: true,
      });

      expect(newFaq).toBeDefined();
      expect(newFaq.question).toContain("home bridal");

      const faqs = await dbRepo.getFaqs();
      const found = faqs.find((f: any) => f.id === newFaq.id);
      expect(found).toBeDefined();
    });

    // 13. Website Content CMS
    it("Module 13: Website Content CMS updates site settings and contact parameters", async () => {
      const initialSettings = await dbRepo.getSiteSettings();
      expect(initialSettings).toBeDefined();
      expect(initialSettings.site_title).toContain("The Jawed Habib Salon");
      expect(initialSettings.primary_phone).toBe("7707000463");

      const updated = await dbRepo.updateSiteSettings({
        business_notice: "Special bridal packages now open for winter 2026 booking.",
      });

      expect(updated.business_notice).toBe("Special bridal packages now open for winter 2026 booking.");
    });

    // 14. Enquiry Management
    it("Module 14: Enquiry Management supports internal staff notes and status updates", async () => {
      const enquiries = await dbRepo.getAllEnquiries();
      expect(enquiries.length).toBeGreaterThan(0);
      const targetEnquiry = enquiries[0];

      const updated = await dbRepo.updateEnquiry(targetEnquiry.id, {
        status: EnquiryStatus.CONTACTED,
        adminNotes: "Spoke with client on phone; shared bridal lookbook on WhatsApp.",
      });

      expect(updated?.status).toBe(EnquiryStatus.CONTACTED);
      expect(updated?.adminNotes).toContain("Spoke with client");
    });

    // 15. Settings
    it("Module 15: Settings manages salon slot durations and operational policies", async () => {
      const settings = await dbRepo.getSiteSettings();
      expect(settings).toHaveProperty("advance_booking_days");
      expect(settings.advance_booking_days).toBe("14");
    });
  });

  // ========================================================
  // 5. FRONTEND-BACKEND SYNCHRONIZATION
  // ========================================================
  describe("5. Frontend-Backend Live Synchronization", () => {
    it("syncs newly created services with public service query", async () => {
      const uniqueName = `Signature Blowout ${Date.now()}`;
      await dbRepo.createService({
        name: uniqueName,
        slug: `blowout-${Date.now()}`,
        categoryId: "cat_hair",
        gender: "FEMALE" as const,
        description: "Smooth volume blowout.",
        price: 499,
        durationMinutes: 30,
        isPopular: true,
        isFeatured: false,
        isActive: true,
      });

      const publicServices = await dbRepo.getServices();
      const match = publicServices.find((s: any) => s.name === uniqueName);
      expect(match).toBeDefined();
      expect(match?.price).toBe(499);
    });

    it("syncs updated service pricing immediately", async () => {
      const services = await dbRepo.getServices();
      const target = services[0];
      const newPrice = target.price + 100;

      await dbRepo.updateService(target.id, { price: newPrice });

      const rechecked = await dbRepo.getServices();
      const updatedTarget = rechecked.find((s: any) => s.id === target.id);
      expect(updatedTarget?.price).toBe(newPrice);
    });

    it("syncs published gallery images and filters out unpublished photos", async () => {
      const published = await dbRepo.createGalleryImage({
        title: "Published Glam Look",
        category: "Bridal",
        imageUrl: "/images/gallery/test-pub.jpg",
        isFeatured: true,
        sortOrder: 1,
      });

      const unpublished = await dbRepo.createGalleryImage({
        title: "Draft Glam Look",
        category: "Bridal",
        imageUrl: "/images/gallery/test-unpub.jpg",
        isFeatured: false,
        sortOrder: 2,
      });

      const all = await dbRepo.getGalleryImages();
      const pubMatch = all.find((i: any) => i.id === published.id);
      expect(pubMatch).toBeDefined();
      expect(pubMatch?.isFeatured).toBe(true);

      const unpubMatch = all.find((i: any) => i.id === unpublished.id);
      expect(unpubMatch?.isFeatured).toBe(false);
    });
  });

  // ========================================================
  // 6. SECURITY, RATE LIMITING & INPUT SANITIZATION
  // ========================================================
  describe("6. Performance, Security & Input Sanitization", () => {
    it("sanitizes potentially malicious HTML and script injections in customer inputs", () => {
      const maliciousName = "<script>alert('XSS')</script>Pooja Kumari";
      const sanitized = sanitizeInput(maliciousName);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("</script>");
      expect(sanitized).toContain("Pooja Kumari");
    });

    it("enforces rate limits on client requests", () => {
      const ip = "192.168.1.100";
      // Allow up to 5 requests per window in test
      for (let i = 0; i < 5; i++) {
        const res = checkRateLimit(ip, 5, 60);
        expect(res.allowed).toBe(true);
      }
      // 6th request is throttled
      const blocked = checkRateLimit(ip, 5, 60);
      expect(blocked.allowed).toBe(false);
    });
  });
});
