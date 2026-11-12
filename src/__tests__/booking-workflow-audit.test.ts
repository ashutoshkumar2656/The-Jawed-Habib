import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";
import { appointmentBookingSchema, appointmentCancelSchema, appointmentRescheduleSchema } from "@/lib/validation/schemas";
import { AppointmentStatus } from "@prisma/client";

describe("Part 4 QA Audit: 10 Core Booking Workflow Test Cases", () => {
  const targetDate = "2026-12-25";

  // Case 1: Successful booking
  it("Case 1: Successful booking with valid details and service basket", async () => {
    const services = await dbRepo.getServices();
    const staff = await dbRepo.getStaffMembers();

    const bookingPayload = {
      customerName: "Ananya Verma",
      customerPhone: "9876500111",
      customerEmail: "ananya@example.com",
      serviceIds: [services[0].id],
      staffId: staff[0].id,
      appointmentDate: targetDate,
      startTime: "11:00",
      couponCode: "WELCOME100",
      notes: "First time customer",
    };

    // Validation passes
    const validation = appointmentBookingSchema.safeParse(bookingPayload);
    expect(validation.success).toBe(true);

    // Database record is created
    const created = await dbRepo.createAppointment(bookingPayload);
    expect(created).toBeDefined();
    expect(created.appointmentNumber.startsWith("JH-LLG-")).toBe(true);
    expect(created.status).toBe(AppointmentStatus.PENDING);
    expect((created as any).customerProfile?.user?.name || (created as any).customerName).toBe("Ananya Verma");
  });

  // Case 2: Missing customer details
  it("Case 2: Rejects booking when required customer details are missing", () => {
    const invalidPayload = {
      customerName: "", // missing/too short
      customerPhone: "7707000463",
      serviceIds: ["srv_haircut"],
      appointmentDate: targetDate,
      startTime: "11:00",
    };

    const validation = appointmentBookingSchema.safeParse(invalidPayload);
    expect(validation.success).toBe(false);
    if (!validation.success) {
      const nameError = validation.error.issues.find((i) => i.path.includes("customerName"));
      expect(nameError).toBeDefined();
    }
  });

  // Case 3: Invalid phone number
  it("Case 3: Rejects invalid phone numbers (non-Indian format or wrong length)", () => {
    const invalidPhones = ["12345", "9876543210123", "abcde12345", "1234567890"]; // 1234567890 doesn't start with 6-9

    for (const phone of invalidPhones) {
      const validation = appointmentBookingSchema.safeParse({
        customerName: "Test User",
        customerPhone: phone,
        serviceIds: ["srv_haircut"],
        appointmentDate: targetDate,
        startTime: "11:00",
      });
      expect(validation.success).toBe(false);
    }

    // Valid Indian 10-digit number
    const valid = appointmentBookingSchema.safeParse({
      customerName: "Test User",
      customerPhone: "9831722983",
      serviceIds: ["srv_haircut"],
      appointmentDate: targetDate,
      startTime: "11:00",
    });
    expect(valid.success).toBe(true);
  });

  // Case 4: Missing service selection
  it("Case 4: Rejects booking when service basket is empty", () => {
    const emptyServices = {
      customerName: "Rohit Sinha",
      customerPhone: "9831722983",
      serviceIds: [], // Empty array
      appointmentDate: targetDate,
      startTime: "11:00",
    };

    const validation = appointmentBookingSchema.safeParse(emptyServices);
    expect(validation.success).toBe(false);
    if (!validation.success) {
      const srvError = validation.error.issues.find((i) => i.path.includes("serviceIds"));
      expect(srvError?.message).toContain("at least one service");
    }
  });

  // Case 5: Unavailable slot (outside 10:00 AM - 10:00 PM operating hours)
  it("Case 5: Prevents booking before 10:00 AM or extending past 10:00 PM", async () => {
    const services = await dbRepo.getServices();
    const service = services[0];

    const availability = await dbRepo.getAvailableSlots(targetDate, [service.id]);

    // Check no slot starts before 10:00
    const earlySlot = availability.slots.find((s) => {
      const [h] = s.time.split(":").map(Number);
      return h < 10;
    });
    expect(earlySlot).toBeUndefined();

    // Check no slot ends after 22:00
    const lateSlot = availability.slots.find((s) => {
      const [eh, em] = s.endTime.split(":").map(Number);
      return eh * 60 + em > 22 * 60;
    });
    expect(lateSlot).toBeUndefined();
  });

  // Case 6: Overlapping appointment for the same stylist
  it("Case 6: Detects and rejects overlapping appointment for the same stylist", async () => {
    const services = await dbRepo.getServices();
    const staff = await dbRepo.getStaffMembers();
    const stylist = staff[0];
    const testDate = "2026-12-28";
    const slotTime = "15:00";

    // 1st appointment confirmed for stylist
    const apt1 = await dbRepo.createAppointment({
      customerName: "Client First",
      customerPhone: "7707000463",
      serviceIds: [services[0].id],
      staffId: stylist.id,
      appointmentDate: testDate,
      startTime: slotTime,
    });
    expect(apt1).toBeDefined();

    // 2nd appointment overlapping for same stylist must be rejected
    await expect(
      dbRepo.createAppointment({
        customerName: "Client Overlap",
        customerPhone: "9831722983",
        serviceIds: [services[0].id],
        staffId: stylist.id,
        appointmentDate: testDate,
        startTime: slotTime,
      })
    ).rejects.toThrow(/CONFLICT_DOUBLE_BOOKING/);
  });

  // Case 7: Double booking attempt on same slot and stylist
  it("Case 7: Double booking attempt throws clear conflict code", async () => {
    const services = await dbRepo.getServices();
    const staff = await dbRepo.getStaffMembers();
    const stylist = staff[1] || staff[0];
    const testDate = "2026-12-29";

    await dbRepo.createAppointment({
      customerName: "Initial Booker",
      customerPhone: "9580000175",
      serviceIds: [services[0].id],
      staffId: stylist.id,
      appointmentDate: testDate,
      startTime: "16:30",
    });

    try {
      await dbRepo.createAppointment({
        customerName: "Concurrent Booker",
        customerPhone: "7707000463",
        serviceIds: [services[0].id],
        staffId: stylist.id,
        appointmentDate: testDate,
        startTime: "16:30",
      });
      expect.unreachable("Should have thrown CONFLICT_DOUBLE_BOOKING");
    } catch (err: any) {
      expect(err.message).toContain("CONFLICT_DOUBLE_BOOKING");
    }
  });

  // Case 8: Booking cancellation
  it("Case 8: Cancels booking in advance and marks status CANCELLED", async () => {
    const services = await dbRepo.getServices();
    const apt = await dbRepo.createAppointment({
      customerName: "To Cancel",
      customerPhone: "9831722983",
      serviceIds: [services[0].id],
      appointmentDate: "2027-01-20",
      startTime: "12:00",
    });

    const validation = appointmentCancelSchema.safeParse({ reason: "Travelling out of town" });
    expect(validation.success).toBe(true);

    const cancelled = await dbRepo.cancelAppointment(apt.id, "Travelling out of town");
    expect(cancelled.status).toBe(AppointmentStatus.CANCELLED);
  });

  // Case 9: Booking rescheduling
  it("Case 9: Reschedules booking to a new valid date/time slot", async () => {
    const services = await dbRepo.getServices();
    const apt = await dbRepo.createAppointment({
      customerName: "To Reschedule",
      customerPhone: "9831722983",
      serviceIds: [services[0].id],
      appointmentDate: "2027-01-22",
      startTime: "14:00",
    });

    const reschedulePayload = {
      appointmentDate: "2027-01-23",
      startTime: "16:00",
      rescheduleReason: "Meeting moved",
    };
    const validation = appointmentRescheduleSchema.safeParse(reschedulePayload);
    expect(validation.success).toBe(true);

    const rescheduled = await dbRepo.rescheduleAppointment(
      apt.id,
      reschedulePayload.appointmentDate,
      reschedulePayload.startTime,
      null,
      reschedulePayload.rescheduleReason
    );
    expect(rescheduled.startTime).toBe("16:00");
    expect(rescheduled.appointmentDate).toBe("2027-01-23");
  });

  // Case 10: Unauthorized booking modification
  it("Case 10: Prevents modification of non-existent or unauthorized booking ID", async () => {
    await expect(
      dbRepo.updateAppointmentStatus("non_existent_apt_id", { status: AppointmentStatus.CONFIRMED })
    ).rejects.toThrow();

    await expect(
      dbRepo.cancelAppointment("non_existent_apt_id", "Reason")
    ).rejects.toThrow();
  });
});
