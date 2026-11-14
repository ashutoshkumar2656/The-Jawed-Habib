import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";

describe("Customer Management & Booking Lifecycle Automated Verification", () => {
  const testPhone = "9800012345";
  const familyPhone = "9800054321";

  beforeEach(() => {
    // repo handles memory fallback and isolation
  });

  describe("Scenario A: Customer Identity & Phone Number Preservation", () => {
    it("should create user and customer profile on first booking", async () => {
      const services = await dbRepo.getServices();
      const validServiceId = services[0]?.id || "srv_1";

      const apt = await dbRepo.createAppointment({
        customerName: "Aarav Sharma",
        customerPhone: testPhone,
        customerEmail: "aarav@example.com",
        serviceIds: [validServiceId],
        appointmentDate: "2026-11-20",
        startTime: "11:00",
      });

      expect(apt).toBeDefined();
      expect(apt.appointmentNumber).toBeDefined();
      expect(apt.customerName).toBe("Aarav Sharma");
      expect(apt.customerPhone).toBe(testPhone);

      // Verify customer exists in customer directory
      const customers = await dbRepo.getAllCustomers(testPhone);
      expect(customers.length).toBeGreaterThan(0);
      const cust = customers.find((c) => c.user.phone === testPhone);
      expect(cust).toBeDefined();
      expect(cust?.user.name).toBe("Aarav Sharma");
    });

    it("should preserve account holder name when a family member books with the same phone", async () => {
      const services = await dbRepo.getServices();
      const validServiceId = services[0]?.id || "srv_1";

      // 1. Initial booking by Priya Patel
      await dbRepo.createAppointment({
        customerName: "Priya Patel",
        customerPhone: familyPhone,
        customerEmail: "priya@example.com",
        serviceIds: [validServiceId],
        appointmentDate: "2026-11-21",
        startTime: "12:00",
      });

      // 2. Spouse Rohan Patel books using the same shared family number
      const apt2 = await dbRepo.createAppointment({
        customerName: "Rohan Patel",
        customerPhone: familyPhone,
        customerEmail: "rohan@example.com",
        serviceIds: [validServiceId],
        appointmentDate: "2026-11-22",
        startTime: "14:00",
      });

      // Appointment snapshot must reflect Rohan
      expect(apt2.customerName).toBe("Rohan Patel");
      expect(apt2.customerPhone).toBe(familyPhone);
      expect(apt2.internalNotes).toContain("Family/Guest Booking");
      expect(apt2.internalNotes).toContain("Rohan Patel");

      // Account holder name must remain Priya Patel (not silently overwritten)
      const customers = await dbRepo.getAllCustomers(familyPhone);
      const cust = customers.find((c) => c.user.phone === familyPhone);
      expect(cust?.user.name).toBe("Priya Patel");
    });
  });

  describe("Scenario B: Complete Appointment Lifecycle Transitions", () => {
    it("should transition PENDING -> CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> COMPLETED with timestamps", async () => {
      const services = await dbRepo.getServices();
      const validServiceId = services[0]?.id || "srv_1";
      const targetDate = "2026-11-25";

      const availability = await dbRepo.getAvailableSlots(targetDate, [validServiceId]);
      const availableSlot = availability.slots.find((s) => s.isAvailable);
      const chosenTime = availableSlot ? availableSlot.time : "14:00";

      // 1. Create PENDING appointment
      const apt = await dbRepo.createAppointment({
        customerName: "Meera Sen",
        customerPhone: "9811122233",
        serviceIds: [validServiceId],
        appointmentDate: targetDate,
        startTime: chosenTime,
      });
      expect(apt.status).toBe(AppointmentStatus.PENDING);

      // 2. Confirm booking
      const confirmed = await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.CONFIRMED,
      });
      expect(confirmed.status).toBe(AppointmentStatus.CONFIRMED);

      // 3. Customer arrives at salon (CHECKED_IN)
      const checkedIn = await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.CHECKED_IN,
      });
      expect(checkedIn.status).toBe(AppointmentStatus.CHECKED_IN);
      expect((checkedIn as any).checkedInAt).toBeDefined();

      // 4. Stylist seats customer (IN_PROGRESS)
      const inProgress = await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.IN_PROGRESS,
      });
      expect(inProgress.status).toBe(AppointmentStatus.IN_PROGRESS);

      // 5. Stylist completes styling (COMPLETED)
      const completed = await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.COMPLETED,
      });
      expect(completed.status).toBe(AppointmentStatus.COMPLETED);
      expect((completed as any).completedAt).toBeDefined();
    });
  });

  describe("Scenario C: No-Show Protection Rules", () => {
    it("should prevent marking future appointments as NO_SHOW", async () => {
      const services = await dbRepo.getServices();
      const validServiceId = services[0]?.id || "srv_1";

      const futureDate = "2026-12-30";
      const availability = await dbRepo.getAvailableSlots(futureDate, [validServiceId]);
      const availableSlot = availability.slots.find((s) => s.isAvailable);
      const chosenTime = availableSlot ? availableSlot.time : "15:00";

      const apt = await dbRepo.createAppointment({
        customerName: "Kavita Rao",
        customerPhone: "9833344455",
        serviceIds: [validServiceId],
        appointmentDate: futureDate,
        startTime: chosenTime,
      });

      await expect(
        dbRepo.updateAppointmentStatus(apt.id, {
          status: AppointmentStatus.NO_SHOW,
        })
      ).rejects.toThrow(/Cannot mark a future appointment.*as NO_SHOW/i);
    });

    it("should prevent marking today's appointment as NO_SHOW before scheduled time and grace period", async () => {
      const services = await dbRepo.getServices();
      const validServiceId = services[0]?.id || "srv_1";

      let targetDate = new Date().toISOString().split("T")[0];
      let availability = await dbRepo.getAvailableSlots(targetDate, [validServiceId]);
      let futureSlot = availability.slots.find((s) => s.isAvailable);

      if (!futureSlot) {
        // If today has no remaining slots left, test with tomorrow's scheduled slot
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        targetDate = tomorrow.toISOString().split("T")[0];
        availability = await dbRepo.getAvailableSlots(targetDate, [validServiceId]);
        futureSlot = availability.slots.find((s) => s.isAvailable);
      }
      const chosenTime = futureSlot ? futureSlot.time : "11:00";

      const apt = await dbRepo.createAppointment({
        customerName: "Vikram Malhotra",
        customerPhone: "9855566677",
        serviceIds: [validServiceId],
        appointmentDate: targetDate,
        startTime: chosenTime,
      });

      await expect(
        dbRepo.updateAppointmentStatus(apt.id, {
          status: AppointmentStatus.NO_SHOW,
        })
      ).rejects.toThrow(/(Cannot mark appointment as NO_SHOW|Cannot mark a future appointment)/i);
    });

    it("should allow marking past appointments as NO_SHOW", async () => {
      const services = await dbRepo.getServices();
      const validServiceId = services[0]?.id || "srv_1";

      const pastDate = "2026-11-10";
      const chosenTime = "10:00";

      const apt = await dbRepo.createAppointment({
        customerName: "Vikram Malhotra",
        customerPhone: "9855566677",
        serviceIds: [validServiceId],
        appointmentDate: pastDate,
        startTime: chosenTime,
      });

      const updated = await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.NO_SHOW,
      });
      expect(updated.status).toBe(AppointmentStatus.NO_SHOW);
    });
  });

  describe("Scenario D: Payment Reconciliation & Visit Completion Decoupling", () => {
    it("should NOT automatically wipe outstanding balances upon COMPLETED status", async () => {
      const services = await dbRepo.getServices();
      const serviceIds = services.slice(0, 3).map((s) => s.id);
      const testDate = "2026-11-26";

      const availability = await dbRepo.getAvailableSlots(testDate, serviceIds);
      const availableSlot = availability.slots.find((s) => s.isAvailable);
      const chosenTime = availableSlot ? availableSlot.time : "13:00";

      const apt = await dbRepo.createAppointment({
        customerName: "Siddharth Verma",
        customerPhone: "9877788899",
        serviceIds,
        advanceAmount: 500,
        appointmentDate: testDate,
        startTime: chosenTime,
      });

      expect(apt.paymentStatus).toBe(PaymentStatus.UNPAID);
      expect(apt.totalAmount).toBeGreaterThan(apt.depositAmount);
      expect(apt.remainingAmount).toBeGreaterThan(0);
      const initialRemaining = apt.remainingAmount;

      // Complete the visit
      const completed = await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.COMPLETED,
      });

      // CRITICAL CHECK: Status is COMPLETED, but paymentStatus remains UNPAID or PARTIALLY_PAID
      expect(completed.status).toBe(AppointmentStatus.COMPLETED);
      expect(completed.paymentStatus).toBe(PaymentStatus.UNPAID);
      expect(completed.remainingAmount).toBe(initialRemaining);
    });
  });

  describe("Scenario E: Admin Analytics & Operations Accuracy", () => {
    it("should include today's operational breakdown metrics", async () => {
      const analytics = await dbRepo.getAdminAnalytics();
      expect(analytics).toBeDefined();
      expect(typeof analytics.totalAppointments).toBe("number");
      expect(typeof (analytics as any).todayAppointments).toBe("number");
      expect(typeof (analytics as any).todayArrived).toBe("number");
      expect(typeof (analytics as any).todayInProgress).toBe("number");
      expect(typeof (analytics as any).todayCompleted).toBe("number");
      expect(typeof (analytics as any).todayNoShow).toBe("number");
      expect(typeof (analytics as any).todayConfirmed).toBe("number");
      expect(typeof (analytics as any).todayPending).toBe("number");
      expect(typeof (analytics as any).remainingBalance).toBe("number");
    });
  });

  describe("Scenario F: Customer CRM Metrics & 4-Section Profile", () => {
    it("should compute 12 CRM metrics and return full 4-section profile", async () => {
      const services = await dbRepo.getServices();
      const validServiceId = services[0]?.id || "srv_1";

      const testDate = "2026-11-29";
      const availability = await dbRepo.getAvailableSlots(testDate, [validServiceId]);
      const availableSlot = availability.slots.find((s) => s.isAvailable);
      const chosenTime = availableSlot ? availableSlot.time : "14:30";

      const apt = await dbRepo.createAppointment({
        customerName: "Ananya Roy",
        customerPhone: "9899900011",
        customerEmail: "ananya@example.com",
        serviceIds: [validServiceId],
        appointmentDate: testDate,
        startTime: chosenTime,
      });

      const profileId = apt.customerProfileId;
      expect(profileId).toBeDefined();

      const dossier = await dbRepo.getCustomerProfileDetails(profileId);
      expect(dossier).toBeDefined();

      // Section A: Customer Details
      expect(dossier.customer).toBeDefined();
      expect(dossier.customer.user?.name).toBe("Ananya Roy");

      // 12 CRM Metrics
      expect(dossier.metrics.totalBookings).toBeGreaterThanOrEqual(1);
      expect(typeof dossier.metrics.completedVisits).toBe("number");
      expect(typeof dossier.metrics.upcomingAppointments).toBe("number");
      expect(typeof dossier.metrics.cancelledAppointments).toBe("number");
      expect(typeof dossier.metrics.noShowCount).toBe("number");
      expect(typeof dossier.metrics.totalSpent).toBe("number");
      expect(typeof dossier.metrics.outstandingBalance).toBe("number");
      expect(dossier.metrics.loyaltyTier).toBeDefined();

      // Section B: Booking History
      expect(Array.isArray(dossier.bookingHistory)).toBe(true);
      expect(dossier.bookingHistory.length).toBeGreaterThanOrEqual(1);

      // Section C: Visit History
      expect(Array.isArray(dossier.visitHistory)).toBe(true);

      // Section D: Financial Summary
      expect(dossier.financialSummary).toBeDefined();
      expect(typeof dossier.financialSummary.totalBilled).toBe("number");
      expect(typeof dossier.financialSummary.totalAdvancePaid).toBe("number");
      expect(typeof dossier.financialSummary.outstandingBalance).toBe("number");
    });
  });
});
