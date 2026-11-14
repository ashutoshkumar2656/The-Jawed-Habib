import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus, BookingSource, PaymentStatus } from "@prisma/client";

describe("Phase 4: Appointment Reservation Expiry Engine", () => {
  beforeEach(() => {
    // Reset test appointments in memory
    dbRepo._memoryDb.appointments = [];
    dbRepo._memoryDb.auditLogs = [];
  });

  it("should NOT expire fresh online pending reservations within the 60-minute window", async () => {
    const services = await dbRepo.getServices();
    const serviceId = services[0]?.id || "srv_1";

    const freshApt = await dbRepo.createAppointment({
      customerName: "Fresh Booking User",
      customerPhone: "9811122233",
      serviceIds: [serviceId],
      appointmentDate: "2026-11-25",
      startTime: "11:00",
      source: BookingSource.ONLINE_WEBSITE,
    });

    expect(freshApt.status).toBe(AppointmentStatus.PENDING);
    expect(freshApt.paymentStatus).toBe(PaymentStatus.UNPAID);

    const result = await dbRepo.expireAbandonedOnlineReservations(60);
    expect(result.memCount).toBe(0);

    const checkApt = await dbRepo.getAppointmentById(freshApt.id);
    expect(checkApt?.status).toBe(AppointmentStatus.PENDING);
  });

  it("should safely expire abandoned online reservations older than 60 minutes", async () => {
    const services = await dbRepo.getServices();
    const serviceId = services[0]?.id || "srv_1";

    const staleApt = await dbRepo.createAppointment({
      customerName: "Abandoned Checkout User",
      customerPhone: "9822233344",
      serviceIds: [serviceId],
      appointmentDate: "2026-11-25",
      startTime: "12:00",
      source: BookingSource.ONLINE_WEBSITE,
    });

    // Simulate creation 90 minutes ago
    const memRecord = dbRepo._memoryDb.appointments.find((a) => a.id === staleApt.id);
    if (memRecord) {
      memRecord.createdAt = new Date(Date.now() - 90 * 60 * 1000);
    }

    const result = await dbRepo.expireAbandonedOnlineReservations(60);
    expect(result.memCount).toBe(1);

    const checkApt = await dbRepo.getAppointmentById(staleApt.id);
    expect(checkApt?.status).toBe(AppointmentStatus.CANCELLED);
    expect(checkApt?.adminNotes).toContain("Automated reservation expiry");
  });

  it("should NEVER expire phone call or walk-in pending bookings even if older than 60 minutes", async () => {
    const services = await dbRepo.getServices();
    const serviceId = services[0]?.id || "srv_1";

    const phoneApt = await dbRepo.createAppointment({
      customerName: "Counter Phone Caller",
      customerPhone: "9833344455",
      serviceIds: [serviceId],
      appointmentDate: "2026-11-25",
      startTime: "14:00",
      source: BookingSource.PHONE_CALL,
    });

    // Simulate phone booking made 3 hours ago
    const memRecord = dbRepo._memoryDb.appointments.find((a) => a.id === phoneApt.id);
    if (memRecord) {
      memRecord.createdAt = new Date(Date.now() - 180 * 60 * 1000);
    }

    const result = await dbRepo.expireAbandonedOnlineReservations(60);
    expect(result.memCount).toBe(0);

    const checkApt = await dbRepo.getAppointmentById(phoneApt.id);
    expect(checkApt?.status).toBe(AppointmentStatus.PENDING);
  });

  it("should NEVER expire appointments that are PARTIALLY_PAID or PAID", async () => {
    const services = await dbRepo.getServices();
    const serviceId = services[0]?.id || "srv_1";

    const paidApt = await dbRepo.createAppointment({
      customerName: "Confirmed Bride",
      customerPhone: "9844455566",
      serviceIds: [serviceId],
      appointmentDate: "2026-11-25",
      startTime: "15:00",
      source: BookingSource.ONLINE_WEBSITE,
    });

    const memRecord = dbRepo._memoryDb.appointments.find((a) => a.id === paidApt.id);
    if (memRecord) {
      memRecord.createdAt = new Date(Date.now() - 120 * 60 * 1000);
      memRecord.status = AppointmentStatus.CONFIRMED;
      memRecord.paymentStatus = PaymentStatus.PARTIALLY_PAID;
      memRecord.depositAmount = 1000;
    }

    const result = await dbRepo.expireAbandonedOnlineReservations(60);
    expect(result.memCount).toBe(0);

    const checkApt = await dbRepo.getAppointmentById(paidApt.id);
    expect(checkApt?.status).toBe(AppointmentStatus.CONFIRMED);
    expect(checkApt?.paymentStatus).toBe(PaymentStatus.PARTIALLY_PAID);
  });
});
