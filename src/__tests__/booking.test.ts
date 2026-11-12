import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus } from "@prisma/client";

describe("Appointment Booking System & Double-Booking Prevention", () => {
  const targetDate = "2026-12-15";

  it("calculates slots strictly between 10:00 AM and 10:00 PM (10:00 to 22:00)", async () => {
    const services = await dbRepo.getServices();
    const service1 = services[0];
    expect(service1).toBeDefined();

    const availability = await dbRepo.getAvailableSlots(targetDate, [service1.id]);

    expect(availability.slots.length).toBeGreaterThan(0);
    // Earliest slot should be 10:00
    expect(availability.slots[0].time).toBe("10:00");

    // All slots must begin at or after 10:00 and end by 22:00
    for (const slot of availability.slots) {
      const [sh, sm] = slot.time.split(":").map(Number);
      const [eh, em] = slot.endTime.split(":").map(Number);
      expect(sh * 60 + sm).toBeGreaterThanOrEqual(10 * 60);
      expect(eh * 60 + em).toBeLessThanOrEqual(22 * 60);
    }
  });

  it("aggregates duration across multiple selected services", async () => {
    const services = await dbRepo.getServices();
    const cut = services.find((s) => s.slug.includes("standard-precision-haircut")); // 30m
    const spa = services.find((s) => s.slug.includes("hair-spa")); // 60m

    expect(cut).toBeDefined();
    expect(spa).toBeDefined();

    const availability = await dbRepo.getAvailableSlots(targetDate, [cut!.id, spa!.id]);
    expect(availability.totalDurationMinutes).toBe((cut?.durationMinutes || 30) + (spa?.durationMinutes || 60));

    // For a 90m service starting at 10:00, endTime must be 11:30
    const slot10 = availability.slots.find((s) => s.time === "10:00");
    expect(slot10?.endTime).toBe("11:30");
  });

  it("creates a new appointment with status PENDING and unique reference", async () => {
    const services = await dbRepo.getServices();
    const staff = await dbRepo.getStaffMembers();

    const appointment = await dbRepo.createAppointment({
      customerName: "Sanjay Kumar",
      customerPhone: "7707000463",
      serviceIds: [services[0].id],
      staffId: staff[0].id,
      appointmentDate: targetDate,
      startTime: "14:00",
      couponCode: "WELCOME100",
      notes: "First time haircut request",
    });

    expect(appointment).toBeDefined();
    expect(appointment.appointmentNumber.startsWith("JH-LLG-")).toBe(true);
    expect(appointment.status).toBe(AppointmentStatus.PENDING);
    expect(appointment.startTime).toBe("14:00");
    expect(appointment.subtotal).toBeGreaterThan(0);
  });

  it("prevents double-booking: rejects overlapping appointment for the same stylist", async () => {
    const services = await dbRepo.getServices();
    const staff = await dbRepo.getStaffMembers();
    const chosenStaff = staff[0];

    const slotTime = "16:00";
    const testDate = "2026-12-20";

    // First booking: 16:00 to 16:30 for chosenStaff
    const firstApt = await dbRepo.createAppointment({
      customerName: "Client A",
      customerPhone: "9831722983",
      serviceIds: [services[0].id],
      staffId: chosenStaff.id,
      appointmentDate: testDate,
      startTime: slotTime,
    });
    expect(firstApt).toBeDefined();

    // Second booking: Attempting identical slot for identical stylist must be rejected
    await expect(
      dbRepo.createAppointment({
        customerName: "Client B",
        customerPhone: "9580000175",
        serviceIds: [services[0].id],
        staffId: chosenStaff.id,
        appointmentDate: testDate,
        startTime: slotTime,
      })
    ).rejects.toThrow(/CONFLICT_DOUBLE_BOOKING/);
  });

  it("allows rescheduling an appointment to an available slot", async () => {
    const services = await dbRepo.getServices();
    const apt = await dbRepo.createAppointment({
      customerName: "Reschedule Client",
      customerPhone: "9123456789",
      serviceIds: [services[0].id],
      appointmentDate: "2026-12-22",
      startTime: "12:00",
    });

    const rescheduled = await dbRepo.rescheduleAppointment(
      apt.id,
      "2026-12-23",
      "15:00",
      null,
      "Doctor appointment clash"
    );

    expect(rescheduled).toBeDefined();
    expect(rescheduled.startTime).toBe("15:00");
  });

  it("cancels an appointment and updates status to CANCELLED", async () => {
    const services = await dbRepo.getServices();
    // Booking set far in the future to satisfy 2-hour window rule
    const apt = await dbRepo.createAppointment({
      customerName: "Cancel Client",
      customerPhone: "9988776655",
      serviceIds: [services[0].id],
      appointmentDate: "2027-01-10",
      startTime: "11:00",
    });

    const cancelled = await dbRepo.cancelAppointment(
      apt.id,
      "Client requested cancellation in advance"
    );

    expect(cancelled.status).toBe(AppointmentStatus.CANCELLED);
  });

  it("enforces 2-hour cancellation window rule", async () => {
    const services = await dbRepo.getServices();
    // Create an appointment first
    const apt = await dbRepo.createAppointment({
      customerName: "Late Cancellation Client",
      customerPhone: "9977553311",
      serviceIds: [services[0].id],
      appointmentDate: "2027-02-15",
      startTime: "14:00",
    });

    // Adjust appointment date & time to 30 minutes from now to simulate last-minute cancellation
    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
    const dateStr = in30Minutes.toISOString().split("T")[0];
    const timeStr = `${in30Minutes.getHours().toString().padStart(2, "0")}:${in30Minutes.getMinutes().toString().padStart(2, "0")}`;

    const memApt = (dbRepo as any)._memoryDb.appointments.find((a: any) => a.id === apt.id);
    if (memApt) {
      memApt.appointmentDate = dateStr;
      memApt.startTime = timeStr;
    }

    // Cancelling with less than 2 hours remaining must reject with CANCELLATION_WINDOW_EXPIRED
    await expect(
      dbRepo.cancelAppointment(apt.id, "Last minute emergency")
    ).rejects.toThrow(/CANCELLATION_WINDOW_EXPIRED/);
  });
});
