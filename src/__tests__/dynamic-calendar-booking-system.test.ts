import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus, BookingSource } from "@prisma/client";

describe("Dynamic Calendar & Appointment Booking Engine Integration Suite", () => {
  beforeEach(async () => {
    // Reset calendar settings to standard salon defaults before each test
    await dbRepo.resetCalendarSettings();
  });

  describe("1. Dynamic Service Catalog, Pricing Display & Deposit Rules", () => {
    it("creates a service with custom pricing display type and advance deposit rules", async () => {
      const created = await dbRepo.createService({
        name: "Lalganj Royal Keratin Luxe",
        slug: "royal-keratin-luxe",
        description: "Intense smoothing and silk protein infusion.",
        detailedDescription: "Multi-stage therapy using certified professional solutions.",
        price: 3999,
        discountedPrice: 3499,
        priceDisplayType: "STARTING_FROM",
        isStartingPrice: true,
        durationMinutes: 120,
        bufferTimeMinutes: 15,
        gender: "UNISEX",
        categoryId: "cat_hair",
        imageUrl: "/images/salon/services/jh-lalganj-keratin-station.webp",
        allowOnlineBooking: true,
        allowAdvancePayment: true,
        depositType: "PERCENTAGE",
        depositValue: 25, // 25% advance
        isPopular: true,
        isFeatured: true,
        isActive: true,
      });

      expect(created.id).toBeDefined();
      expect(created.name).toBe("Lalganj Royal Keratin Luxe");
      expect(created.priceDisplayType).toBe("STARTING_FROM");
      expect(created.depositType).toBe("PERCENTAGE");
      expect(created.depositValue).toBe(25);
      expect(created.bufferTimeMinutes).toBe(15);
    });

    it("unpublishes a service from public online booking and prevents appointment creation", async () => {
      const offlineService = await dbRepo.createService({
        name: "Exclusive Bridal VIP Suite",
        slug: "exclusive-bridal-vip",
        description: "Phone reservation only bridal room.",
        price: 9999,
        durationMinutes: 180,
        gender: "FEMALE",
        categoryId: "cat_makeup",
        allowOnlineBooking: false, // In-salon / phone only
        isPopular: false,
        isFeatured: false,
        isActive: true,
      });

      // Public appointment creation must reject it
      await expect(
        dbRepo.createAppointment({
          customerName: "Pooja Verma",
          customerPhone: "9831722983",
          serviceIds: [offlineService.id],
          appointmentDate: "2026-11-20",
          startTime: "12:00",
        })
      ).rejects.toThrow(/cannot be booked online/i);
    });
  });

  describe("2. Dynamic Calendar Settings & Operating Hours Engine", () => {
    it("reads default 7-day operating hours and generates slots between 10:00 and 22:00", async () => {
      const settings = await dbRepo.getCalendarSettings();
      expect(settings.weeklyHours.length).toBe(7);
      expect(settings.weeklyHours.every((d) => d.isOpen)).toBe(true);

      const availability = await dbRepo.getAvailableSlots("2026-11-22", ["srv_1"]);
      expect(availability.isClosed).toBe(false);
      expect(availability.slots.length).toBeGreaterThan(0);
      expect(availability.slots[0].time).toBe("10:00");
    });

    it("respects day closures when salon marks a day of the week as closed", async () => {
      // Mark Sunday as closed
      const current = await dbRepo.getCalendarSettings();
      const updatedHours = current.weeklyHours.map((d) =>
        d.day === "Sunday" ? { ...d, isOpen: false } : d
      );

      await dbRepo.updateCalendarSettings({ weeklyHours: updatedHours });

      // 2026-11-22 is Sunday
      const availability = await dbRepo.getAvailableSlots("2026-11-22", ["srv_1"]);
      expect(availability.isClosed).toBe(true);
      expect(availability.closeReason).toContain("closed on Sundays");
      expect(availability.slots.length).toBe(0);
    });

    it("enforces recurring break periods and blocks overlapping slots", async () => {
      // Add lunch break from 14:00 to 15:00
      await dbRepo.updateCalendarSettings({
        breaks: [
          {
            id: "brk_test_lunch",
            name: "Stylist Lunch Break",
            startTime: "14:00",
            endTime: "15:00",
            applicableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            isActive: true,
          },
        ],
      });

      // 2026-11-23 is Monday
      const availability = await dbRepo.getAvailableSlots("2026-11-23", ["srv_1"]);
      const slot14 = availability.slots.find((s) => s.time === "14:00");
      const slot1430 = availability.slots.find((s) => s.time === "14:30");

      expect(slot14?.isAvailable).toBe(false);
      expect(slot14?.conflictReason).toContain("Break time");
      expect(slot1430?.isAvailable).toBe(false);
    });

    it("enforces full-day holiday overrides and disables all bookings", async () => {
      const holidayDate = "2026-11-26";
      await dbRepo.updateCalendarSettings({
        blockedDates: [
          {
            id: "blk_chhath",
            date: holidayDate,
            reason: "Chhath Puja Mahaparv",
            blockEntireDay: true,
            isFullDay: true,
            isActive: true,
          },
        ],
      });

      const availability = await dbRepo.getAvailableSlots(holidayDate, ["srv_1"]);
      expect(availability.isClosed).toBe(true);
      expect(availability.closeReason).toContain("Chhath Puja");
    });
  });

  describe("3. Double-Booking Prevention & Capacity Limits", () => {
    it("enforces maximum bookings per slot capacity", async () => {
      // Set slot capacity to 2 bookings per slot
      await dbRepo.updateCalendarSettings({ maxBookingsPerSlot: 2 });

      const testDate = "2026-11-24";
      const slotTime = "15:00";

      // Booking 1
      await dbRepo.createAppointment({
        customerName: "Anjali Gupta",
        customerPhone: "7707000463",
        serviceIds: ["srv_1"],
        appointmentDate: testDate,
        startTime: slotTime,
      });

      // Booking 2
      await dbRepo.createAppointment({
        customerName: "Vikram Kumar",
        customerPhone: "9831722983",
        serviceIds: ["srv_1"],
        appointmentDate: testDate,
        startTime: slotTime,
      });

      // Booking 3 should be rejected due to capacity limit of 2
      await expect(
        dbRepo.createAppointment({
          customerName: "Deepak Pandey",
          customerPhone: "9580000175",
          serviceIds: ["srv_1"],
          appointmentDate: testDate,
          startTime: slotTime,
        })
      ).rejects.toThrow(/CONFLICT_DOUBLE_BOOKING/);
    });

    it("accurately calculates advance deposit required and remaining balance", async () => {
      // Create service requiring 20% advance deposit
      const serviceWithDeposit = await dbRepo.createService({
        name: "Bridal Radiance Facial",
        slug: "bridal-radiance-deposit",
        description: "Pre-wedding brightening facial.",
        price: 2000,
        discountedPrice: 2000,
        durationMinutes: 60,
        gender: "FEMALE",
        categoryId: "cat_skin",
        depositType: "PERCENTAGE",
        depositValue: 20, // 20% of 2000 = 400
        isPopular: false,
        isFeatured: false,
        isActive: true,
      });

      const apt = await dbRepo.createAppointment({
        customerName: "Sneha Sinha",
        customerPhone: "7707000463",
        serviceIds: [serviceWithDeposit.id],
        appointmentDate: "2026-11-27",
        startTime: "16:00",
      });

      expect(apt.totalAmount).toBe(2000);
      expect((apt as any).depositAmount).toBe(400);
      expect((apt as any).remainingAmount).toBe(1600);
      expect((apt as any).depositType).toBe("PARTIAL");
    });
  });

  describe("4. Appointment Lifecycle & Operations Management", () => {
    it("supports confirming, rescheduling, and completing an appointment with internal notes", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Manish Kumar",
        customerPhone: "7707000463",
        serviceIds: ["srv_1"],
        appointmentDate: "2026-11-28",
        startTime: "11:00",
      });

      expect(apt.status).toBe(AppointmentStatus.PENDING);

      // Confirm appointment
      const confirmed = await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.CONFIRMED,
        adminNotes: "Confirmed via phone call with client",
        internalNotes: "VIP client - seat at Station 1",
      });
      expect(confirmed.status).toBe(AppointmentStatus.CONFIRMED);
      expect((confirmed as any).internalNotes).toBe("VIP client - seat at Station 1");

      // Reschedule to 12:00
      const rescheduled = await dbRepo.rescheduleAppointment(
        apt.id,
        "2026-11-28",
        "12:00",
        undefined,
        "Client requested 1 hour later"
      );
      expect(rescheduled.startTime).toBe("12:00");

      // Mark completed
      const completed = await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.COMPLETED,
      });
      expect(completed.status).toBe(AppointmentStatus.COMPLETED);
    });
  });
});
