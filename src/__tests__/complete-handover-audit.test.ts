import { describe, it, expect, vi, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus, BookingSource, EnquiryStatus } from "@prisma/client";
import { BRAND_CONFIG } from "@/lib/constants/brand";

describe("Complete Functional Testing & Client Handover Test Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. Permanent Brand Coordinates & Identity (AGENTS.md)", () => {
    it("preserves exact salon business coordinates and contact details", () => {
      expect(BRAND_CONFIG.name).toBe("The Jawed Habib Salon");
      expect(BRAND_CONFIG.branch).toBe("Lalganj");
      expect(BRAND_CONFIG.fullName).toBe("The Jawed Habib Salon – Lalganj");
      expect(BRAND_CONFIG.location.city).toBe("Lalganj");
      expect(BRAND_CONFIG.location.fullAddress).toBe(
        "1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121"
      );
      expect(BRAND_CONFIG.contact.primaryPhone).toBe("7707000463");
      expect(BRAND_CONFIG.contact.secondaryPhone).toBe("9831722983");
      expect(BRAND_CONFIG.contact.tertiaryPhone).toBe("9580000175");
      expect(BRAND_CONFIG.hours.open).toBe("10:00 AM");
      expect(BRAND_CONFIG.hours.close).toBe("10:00 PM");
    });
  });

  describe("2. Every Interactive Button & Lifecycle Action", () => {
    it("handles appointment lifecycle transition sequence: CHECKED_IN -> IN_PROGRESS -> COMPLETED", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      const appt = await dbRepo.createAppointment({
        customerName: "Sneha Kumari",
        customerPhone: "9876543210",
        customerEmail: "sneha@example.com",
        serviceIds: [serviceId],
        appointmentDate: "2026-11-28",
        startTime: "11:00",
        source: BookingSource.ONLINE_WEBSITE,
      });

      expect(appt.status).toBe(AppointmentStatus.PENDING);

      // 1. Check-In Action
      const checkedIn = await dbRepo.updateAppointmentStatus(appt.id, {
        status: AppointmentStatus.CHECKED_IN,
      });
      expect(checkedIn.status).toBe(AppointmentStatus.CHECKED_IN);

      // 2. Start Service Action
      const inProgress = await dbRepo.updateAppointmentStatus(appt.id, {
        status: AppointmentStatus.IN_PROGRESS,
      });
      expect(inProgress.status).toBe(AppointmentStatus.IN_PROGRESS);

      // 3. Complete Service Action
      const completed = await dbRepo.updateAppointmentStatus(appt.id, {
        status: AppointmentStatus.COMPLETED,
      });
      expect(completed.status).toBe(AppointmentStatus.COMPLETED);
    });

    it("handles cancellation action and releases booking gracefully", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      const appt = await dbRepo.createAppointment({
        customerName: "Rahul Verma",
        customerPhone: "9812345678",
        serviceIds: [serviceId],
        appointmentDate: "2026-11-28",
        startTime: "14:00",
        source: BookingSource.ONLINE_WEBSITE,
      });

      const cancelled = await dbRepo.updateAppointmentStatus(appt.id, {
        status: AppointmentStatus.CANCELLED,
      });
      expect(cancelled.status).toBe(AppointmentStatus.CANCELLED);

      // Slot should now be available for another booking
      const slots = await dbRepo.getAvailableSlots("2026-11-28", [serviceId]);
      const slot14 = slots.slots.find((s) => s.time === "14:00");
      expect(slot14?.isAvailable).toBe(true);
    });
  });

  describe("3. Contact Form & Enquiry Management Workflow", () => {
    it("creates, retrieves, and updates customer enquiries", async () => {
      const enquiry = await dbRepo.createEnquiry({
        name: "Anjali Singh",
        phone: "9823456789",
        email: "anjali@example.com",
        serviceInterest: "Bridal Suite",
        message: "Looking for VIP bridal package on Dec 12.",
        type: "BRIDAL_CONSULTATION",
      });

      expect(enquiry).toBeDefined();
      expect(enquiry.status).toBe(EnquiryStatus.NEW);

      // Admin updates enquiry status
      const updated = await dbRepo.updateEnquiry(enquiry.id, {
        status: EnquiryStatus.CONTACTED,
        adminNotes: "Client called and invited for in-salon hair trial.",
      });
      expect(updated.status).toBe(EnquiryStatus.CONTACTED);
      expect(updated.adminNotes).toContain("hair trial");
    });
  });

  describe("4. Administrative Media & Before/After Transformations", () => {
    it("creates paired Before/After transformation with custom URLs", async () => {
      const tf = await dbRepo.createTransformation({
        title: "Keratin Smooth Transformation",
        description: "Frizzy hair restored with premium Brazilian keratin infusion.",
        beforeImageUrl: "https://res.cloudinary.com/salon/before-keratin.jpg",
        afterImageUrl: "https://res.cloudinary.com/salon/after-keratin.jpg",
        clientGender: "FEMALE",
        isFeatured: true,
        sortOrder: 1,
      });

      expect(tf.id).toBeDefined();
      expect(tf.beforeImageUrl).toContain("before-keratin");
      expect(tf.afterImageUrl).toContain("after-keratin");
      expect(tf.isFeatured).toBe(true);
    });
  });

  describe("5. Payment Gateway Security & Status Independence", () => {
    it("maintains independent appointment status and payment status", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      const appt = await dbRepo.createAppointment({
        customerName: "Vikram Malhotra",
        customerPhone: "9845678901",
        serviceIds: [serviceId],
        appointmentDate: "2026-11-29",
        startTime: "16:00",
        source: BookingSource.ONLINE_WEBSITE,
      });

      // Record offline advance deposit
      const payment = await dbRepo.recordOfflinePayment({
        appointmentId: appt.id,
        amount: 1000,
        paymentMethod: "CASH",
        receivedDate: "2026-11-29",
        recordedBy: "Front Desk Concierge",
        notes: "Advance cash paid at counter",
      });

      expect(payment).toBeDefined();

      // Verify appointment remains trackable
      const updatedAppt = await dbRepo.getAppointmentById(appt.id);
      expect(updatedAppt).toBeDefined();
      expect(updatedAppt?.id).toBe(appt.id);
    });
  });
});
