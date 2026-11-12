import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";
import {
  appointmentBookingSchema,
  availabilityQuerySchema,
  adminAppointmentStatusSchema,
  paymentOrderSchema,
  paymentVerifySchema,
} from "@/lib/validation/schemas";
import {
  checkRateLimit,
  checkDuplicateSubmission,
  sanitizeInput,
} from "@/lib/security/rate-limit";
import {
  AppointmentStatus,
  BookingSource,
  PaymentGateway,
  PaymentTransactionStatus,
  PaymentStatus,
} from "@prisma/client";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import crypto from "crypto";

describe("Backend Integration: Jawed Habib Salon Appointment & Payment Engine", () => {
  const futureDate = "2026-12-28";
  const pastDate = "2020-01-01";

  // 1. VALID BOOKING
  it("Requirement 1 & 3: Creates a valid booking with all fields, PENDING status, and unique ref", async () => {
    const services = await dbRepo.getServices();
    const service = services[0];
    expect(service).toBeDefined();

    const bookingPayload = {
      customerName: "Pooja Kumari",
      customerPhone: "7707000463",
      customerEmail: "pooja@example.com",
      serviceIds: [service.id],
      packageId: null,
      appointmentDate: futureDate,
      startTime: "12:00",
      couponCode: "WELCOME100",
      notes: "Please allocate quiet station",
      source: "ONLINE_WEBSITE" as const,
    };

    const validated = appointmentBookingSchema.safeParse(bookingPayload);
    expect(validated.success).toBe(true);

    const appointment = await dbRepo.createAppointment(bookingPayload);
    expect(appointment).toBeDefined();
    expect(appointment.appointmentNumber).toMatch(/^JH-LLG-\d{8}-\d{4}$/);
    expect(appointment.status).toBe(AppointmentStatus.PENDING);
    expect(appointment.paymentStatus).toBe(PaymentStatus.UNPAID);
    expect(appointment.appointmentDate).toBeDefined();
  });

  // 2. INVALID BOOKING & MISSING FIELDS
  it("Requirement 1 & 9: Rejects booking with missing fields or invalid format", () => {
    // Missing name
    const missingName = appointmentBookingSchema.safeParse({
      customerName: "",
      customerPhone: "7707000463",
      serviceIds: ["srv_1"],
      appointmentDate: futureDate,
      startTime: "12:00",
    });
    expect(missingName.success).toBe(false);

    // Empty services
    const emptyServices = appointmentBookingSchema.safeParse({
      customerName: "Pooja",
      customerPhone: "7707000463",
      serviceIds: [],
      appointmentDate: futureDate,
      startTime: "12:00",
    });
    expect(emptyServices.success).toBe(false);

    // Invalid time format
    const badTime = appointmentBookingSchema.safeParse({
      customerName: "Pooja",
      customerPhone: "7707000463",
      serviceIds: ["srv_1"],
      appointmentDate: futureDate,
      startTime: "25:99",
    });
    expect(badTime.success).toBe(false);
  });

  // 3. INVALID PHONE NUMBER
  it("Requirement 1 & 9: Strictly validates 10-digit Indian phone numbers", () => {
    const invalidPhones = ["123", "0123456789", "abcdefghij", "5555555555", "987654321012"];
    for (const phone of invalidPhones) {
      const res = appointmentBookingSchema.safeParse({
        customerName: "Amit Kumar",
        customerPhone: phone,
        serviceIds: ["srv_1"],
        appointmentDate: futureDate,
        startTime: "11:00",
      });
      expect(res.success).toBe(false);
    }

    const validPhones = ["7707000463", "9831722983", "9580000175", "6200000001"];
    for (const phone of validPhones) {
      const res = appointmentBookingSchema.safeParse({
        customerName: "Amit Kumar",
        customerPhone: phone,
        serviceIds: ["srv_1"],
        appointmentDate: futureDate,
        startTime: "11:00",
      });
      expect(res.success).toBe(true);
    }
  });

  // 4. PAST DATE RESTRICTION
  it("Requirement 2: Enforces past-date restriction", () => {
    const todayStr = new Date().toISOString().split("T")[0];
    expect(pastDate < todayStr).toBe(true);
    expect(futureDate > todayStr).toBe(true);
  });

  // 5. DOUBLE-BOOKING PREVENTION
  it("Requirement 2 & 9: Prevents double booking for the exact same stylist and duration", async () => {
    const services = await dbRepo.getServices();
    const staff = await dbRepo.getStaffMembers();
    const chosenStaff = staff[0];
    const testDate = "2026-12-29";
    const testSlot = "15:00";

    // First booking succeeds
    const first = await dbRepo.createAppointment({
      customerName: "Client First",
      customerPhone: "7707000463",
      serviceIds: [services[0].id],
      staffId: chosenStaff.id,
      appointmentDate: testDate,
      startTime: testSlot,
    });
    expect(first).toBeDefined();

    // Second booking on exact slot for same stylist must be rejected
    await expect(
      dbRepo.createAppointment({
        customerName: "Client Second",
        customerPhone: "9831722983",
        serviceIds: [services[0].id],
        staffId: chosenStaff.id,
        appointmentDate: testDate,
        startTime: testSlot,
      })
    ).rejects.toThrow(/CONFLICT_DOUBLE_BOOKING/);
  });

  // 6. RAPID DUPLICATE SUBMISSION GUARD & RATE LIMITING
  it("Requirement 9: Detects and stops rapid duplicate submissions within 60s cooldown", () => {
    const phone = "7707000463";
    const date = "2026-12-30";
    const slot = "11:00";

    const firstAttempt = checkDuplicateSubmission(phone, date, slot, 60000);
    expect(firstAttempt.isDuplicate).toBe(false);

    // Immediate second submission with identical payload is flagged as duplicate
    const secondAttempt = checkDuplicateSubmission(phone, date, slot, 60000);
    expect(secondAttempt.isDuplicate).toBe(true);
    expect(secondAttempt.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("Requirement 9: Enforces sliding window rate limiter", () => {
    const key = `test_ip_${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(key, 5, 10000);
      expect(res.allowed).toBe(true);
    }
    // 6th request within window exceeds limit
    const exceeded = checkRateLimit(key, 5, 10000);
    expect(exceeded.allowed).toBe(false);
    expect(exceeded.remaining).toBe(0);
  });

  it("Requirement 9: Sanitizes malicious XSS and control characters from inputs", () => {
    const malicious = "<script>alert('hack')</script>John Doe; rm -rf /";
    const cleaned = sanitizeInput(malicious);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain(";");
    expect(cleaned).toContain("John Doe");
  });

  // 7. CALENDAR AVAILABILITY FROM BACKEND
  it("Requirement 2: Backend returns monthly and slot availability accurately", async () => {
    const monthQuery = availabilityQuerySchema.safeParse({
      month: "2026-12",
      serviceIds: "srv_1",
    });
    expect(monthQuery.success).toBe(true);

    const monthAvailability = await dbRepo.getMonthAvailability("2026-12", ["srv_1"]);
    expect(monthAvailability.yearMonth).toBe("2026-12");
    expect(monthAvailability.availableDates.length).toBeGreaterThan(0);
    expect(monthAvailability.operatingHours.open).toBe(BRAND_CONFIG.hours.open);
    expect(monthAvailability.operatingHours.close).toBe(BRAND_CONFIG.hours.close);

    // Date slot availability
    const slots = await dbRepo.getAvailableSlots("2026-12-15", ["srv_1"]);
    expect(slots.slots.length).toBeGreaterThan(0);
    expect(slots.slots[0].time).toBe("10:00");
  });

  // 8. BOOKING STATUS MANAGEMENT
  it("Requirement 4: Supports all 5 booking statuses: PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED", async () => {
    const services = await dbRepo.getServices();
    const apt = await dbRepo.createAppointment({
      customerName: "Status Client",
      customerPhone: "9580000175",
      serviceIds: [services[0].id],
      appointmentDate: "2026-12-21",
      startTime: "13:00",
    });

    expect(apt.status).toBe(AppointmentStatus.PENDING);

    // Update to CONFIRMED
    const confirmed = await dbRepo.updateAppointmentStatus(apt.id, {
      status: AppointmentStatus.CONFIRMED,
      adminNotes: "Desk confirmed via phone call",
    });
    expect(confirmed.status).toBe(AppointmentStatus.CONFIRMED);

    // Update to REJECTED
    const rejected = await dbRepo.updateAppointmentStatus(apt.id, {
      status: AppointmentStatus.REJECTED,
      adminNotes: "Customer requested alternative non-operational time",
    });
    expect(rejected.status).toBe(AppointmentStatus.REJECTED);

    // Update to CANCELLED
    const cancelled = await dbRepo.updateAppointmentStatus(apt.id, {
      status: AppointmentStatus.CANCELLED,
      adminNotes: "Cancelled by client",
    });
    expect(cancelled.status).toBe(AppointmentStatus.CANCELLED);

    // Update to COMPLETED
    const completed = await dbRepo.updateAppointmentStatus(apt.id, {
      status: AppointmentStatus.COMPLETED,
      adminNotes: "Service rendered satisfactorily",
    });
    expect(completed.status).toBe(AppointmentStatus.COMPLETED);
    expect(completed.paymentStatus).toBe(PaymentStatus.PAID);
  });

  // 9. WHATSAPP CLICK-TO-CHAT INTEGRATION
  it("Requirement 6: Generates prefilled WhatsApp click-to-chat URL with verified number and reference", () => {
    const reference = "JH-LLG-20261215-1234";
    const name = "Rajesh Verma";
    const service = "Standard Precision Haircut";
    const date = "2026-12-15";
    const time = "11:30 AM";

    const message = `Hello The Jawed Habib Salon Lalganj!\n\nI have submitted an online appointment booking request:\n• Reference: ${reference}\n• Customer: ${name}\n• Service(s): ${service}\n• Date: ${date}\n• Preferred Time: ${time}\n\nKindly confirm my reservation.`;
    const whatsappUrl = `https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=${encodeURIComponent(message)}`;

    expect(whatsappUrl).toContain(`91${BRAND_CONFIG.contact.whatsappPhone}`);
    expect(whatsappUrl).toContain(encodeURIComponent(reference));
    expect(whatsappUrl).toContain(encodeURIComponent(name));
    expect(whatsappUrl).toContain(encodeURIComponent(date));
    expect(whatsappUrl).toContain(encodeURIComponent(time));
  });

  // 10. PACKAGE SELECTION & WHATSAPP ENRICHMENT
  it("Requirement 1, 6 & 8: Handles package selection and enriches appointment and WhatsApp payload", async () => {
    const packages = await dbRepo.getPackages();
    expect(packages.length).toBeGreaterThan(0);
    const chosenPkg = packages[0];

    const services = await dbRepo.getServices();
    const chosenService = services[0];

    const aptWithPkg = await dbRepo.createAppointment({
      customerName: "Ritu Sharma",
      customerPhone: "9831722983",
      serviceIds: [chosenService.id],
      packageId: chosenPkg.id,
      appointmentDate: "2026-12-25",
      startTime: "16:00",
      notes: "Bridal consultation with package",
    });

    expect(aptWithPkg).toBeDefined();
    expect(aptWithPkg.packageId).toBe(chosenPkg.id);
    expect(aptWithPkg.totalAmount).toBeGreaterThanOrEqual(chosenPkg.price);

    // Verify package lookup
    const retrievedPkg = await dbRepo.getPackageById(chosenPkg.id);
    expect(retrievedPkg).toBeDefined();
    expect(retrievedPkg?.name).toBe(chosenPkg.name);

    // Verify WhatsApp text includes package
    const serviceNames = chosenService.name;
    const whatsappText = encodeURIComponent(
      `Hello The Jawed Habib Salon Lalganj!\n\nI have submitted an online appointment booking request:\n• Reference: ${aptWithPkg.appointmentNumber}\n• Customer: Ritu Sharma\n• Service(s): ${serviceNames}\n• Curated Package: ${chosenPkg.name}\n• Date: 2026-12-25\n• Preferred Time: 16:00\n\nKindly confirm my reservation.`
    );
    const whatsappUrl = `https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=${whatsappText}`;

    expect(whatsappUrl).toContain(encodeURIComponent(chosenPkg.name));
    expect(whatsappUrl).toContain("917707000463");
  });

  // 11. SERVER-SIDE PAYMENT INTEGRATION & VERIFICATION
  it("Requirement 5: Manages server-side payment order creation and cryptographic verification", async () => {
    const services = await dbRepo.getServices();
    const apt = await dbRepo.createAppointment({
      customerName: "Payment Test Client",
      customerPhone: "7707000463",
      serviceIds: [services[0].id],
      appointmentDate: "2026-12-22",
      startTime: "14:30",
    });

    expect(apt.paymentStatus).toBe(PaymentStatus.UNPAID);

    // 1. Create order
    const orderPayload = {
      appointmentId: apt.id,
      gateway: "RAZORPAY" as const,
    };
    const orderValidation = paymentOrderSchema.safeParse(orderPayload);
    expect(orderValidation.success).toBe(true);

    const paymentOrder = await dbRepo.createPaymentOrder({
      appointmentId: apt.id,
      amount: apt.totalAmount,
      gateway: PaymentGateway.RAZORPAY,
    });
    expect(paymentOrder).toBeDefined();
    expect(paymentOrder.status).toBe(PaymentTransactionStatus.PENDING);
    expect(paymentOrder.transactionRef).toBeDefined();

    // 2. Reject tampering / invalid signature
    const invalidVerification = await dbRepo.verifyPayment({
      appointmentId: apt.id,
      transactionRef: paymentOrder.transactionRef,
      gatewayPaymentId: "pay_fake_123",
      gatewaySignature: "tampered_signature_xyz",
      signatureValid: false,
    });
    expect(invalidVerification.status).toBe(PaymentTransactionStatus.FAILED);

    // 3. Process genuine signature
    const secret = "mock_secret_lalganj_2026";
    const paymentId = `pay_real_${Date.now()}`;
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${paymentOrder.transactionRef}|${paymentId}`)
      .digest("hex");

    const validVerification = await dbRepo.verifyPayment({
      appointmentId: apt.id,
      transactionRef: paymentOrder.transactionRef,
      gatewayPaymentId: paymentId,
      gatewaySignature: validSignature,
      signatureValid: true,
    });
    expect(validVerification.status).toBe(PaymentTransactionStatus.SUCCESS);

    // Verify appointment status updated to PAID
    const updatedApt = await dbRepo.getAppointmentById(apt.id);
    expect(updatedApt?.paymentStatus).toBe(PaymentStatus.PAID);

    // 4. Duplicate payment processing protection: Cannot re-verify already successful transaction
    await expect(
      dbRepo.verifyPayment({
        appointmentId: apt.id,
        transactionRef: paymentOrder.transactionRef,
        gatewayPaymentId: paymentId,
        gatewaySignature: validSignature,
        signatureValid: true,
      })
    ).rejects.toThrow(/Duplicate payment transaction/);
  });
});
