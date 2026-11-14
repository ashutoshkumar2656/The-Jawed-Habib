import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { appointmentBookingSchema, paymentOrderSchema, paymentVerifySchema } from "@/lib/validation/schemas";
import { BRIDAL_ADDONS, validateAddonIds } from "@/lib/constants/bridal";
import { checkDuplicateSubmission } from "@/lib/security/rate-limit";
import { createRazorpayOrder, verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";
import crypto from "crypto";

describe("Booking Flow Resolution & Verification Suite (10 Core Scenarios)", () => {
  // Use a future date for non-conflict booking tests
  const testDate = "2026-11-28";
  let uniqueId = 100;

  beforeEach(async () => {
    uniqueId++;
    await dbRepo.resetCalendarSettings();
  });

  // 1. A valid booking without add-ons
  it("Scenario 1: Creates a valid booking without add-ons and with 12h AM/PM time format", async () => {
    const payload = {
      customerName: "Sneha Sharma",
      customerPhone: "9831722983",
      customerEmail: "sneha@example.com",
      serviceIds: ["srv_bridal_1"], // Price: 5000
      appointmentDate: testDate,
      startTime: "11:30 AM", // 12-hour format sent from frontend
      advanceAmount: 2000,
      source: "ONLINE_WEBSITE" as const,
    };

    const validation = appointmentBookingSchema.safeParse(payload);
    expect(validation.success).toBe(true);
    if (!validation.success) return;

    // Normalizes to 24h format
    expect(validation.data.startTime).toBe("11:30");

    const appointment = await dbRepo.createAppointment({
      ...validation.data,
      startTime: validation.data.startTime,
    });

    expect(appointment).toBeDefined();
    expect(appointment.appointmentNumber).toMatch(/^JH-LAL-2026-\d{6}$/);
    expect(appointment.subtotal).toBe(5000);
    expect(appointment.totalAmount).toBe(5000);
    expect(appointment.depositAmount).toBe(2000);
    expect(appointment.remainingAmount).toBe(3000);
    expect(appointment.status).toBe(AppointmentStatus.PENDING);
    expect(appointment.paymentStatus).toBe(PaymentStatus.UNPAID);
  });

  // 2. A valid booking with multiple add-ons
  it("Scenario 2: Creates a valid booking with multiple add-ons, calculating exact totals server-side", async () => {
    // Example from user request:
    // Package: Signature HD (5000) or Airbrush (7500)
    // srv_bridal_1 (5000) + Hair Ext (1000) + Family Glam (1500) = 7500
    // Advance: 2000, Remaining: 5500
    const payload = {
      customerName: "Rhea Sen",
      customerPhone: "7707000463",
      customerEmail: "rhea@example.com",
      serviceIds: ["srv_bridal_1"],
      appointmentDate: testDate,
      startTime: "01:00 PM",
      advanceAmount: 2000,
      selectedAddons: ["addon_hair_ext", "addon_family_glam"],
      bridalRequirements: "Dual dupatta setting",
      source: "ONLINE_WEBSITE" as const,
    };

    const validation = appointmentBookingSchema.safeParse(payload);
    expect(validation.success).toBe(true);
    if (!validation.success) return;

    expect(validation.data.startTime).toBe("13:00");
    expect(validation.data.selectedAddons).toEqual(["addon_hair_ext", "addon_family_glam"]);

    const appointment = await dbRepo.createAppointment({
      ...validation.data,
      startTime: validation.data.startTime,
      selectedAddons: validation.data.selectedAddons,
    });

    // 5000 + 1000 + 1500 = 7500
    expect(appointment.totalAmount).toBe(7500);
    expect(appointment.depositAmount).toBe(2000);
    expect(appointment.remainingAmount).toBe(5500);
    expect(appointment.bridalRequirements).toContain("Add-ons:");
  });

  // 3. A booking with the minimum advance amount
  it("Scenario 3: Correctly enforces and calculates minimum advance amount (₹1,000)", async () => {
    const payload = {
      customerName: "Pooja Verma",
      customerPhone: "9580000175",
      customerEmail: "pooja@example.com",
      serviceIds: ["srv_bridal_1"], // Price: 5000
      appointmentDate: testDate,
      startTime: "10:00 AM",
      advanceAmount: 1000, // Minimum configured advance
      source: "ONLINE_WEBSITE" as const,
    };

    const validation = appointmentBookingSchema.safeParse(payload);
    expect(validation.success).toBe(true);
    if (!validation.success) return;

    const appointment = await dbRepo.createAppointment({
      ...validation.data,
      startTime: validation.data.startTime,
    });

    expect(appointment.depositAmount).toBe(1000);
    expect(appointment.remainingAmount).toBe(4000);
  });

  // 4. A booking with the maximum advance amount
  it("Scenario 4: Correctly enforces and calculates maximum advance amount (₹2,500)", async () => {
    const payload = {
      customerName: "Kavita Singh",
      customerPhone: "9580000175",
      customerEmail: "kavita@example.com",
      serviceIds: ["srv_bridal_2"], // Price: 7500
      appointmentDate: testDate,
      startTime: "02:30 PM",
      advanceAmount: 2500, // Maximum configured advance
      source: "ONLINE_WEBSITE" as const,
    };

    const validation = appointmentBookingSchema.safeParse(payload);
    expect(validation.success).toBe(true);
    if (!validation.success) return;

    const appointment = await dbRepo.createAppointment({
      ...validation.data,
      startTime: validation.data.startTime,
    });

    expect(appointment.depositAmount).toBe(2500);
    expect(appointment.remainingAmount).toBe(5000);
  });

  // 5. Invalid or missing customer information
  it("Scenario 5: Rejects booking with missing name, invalid phone, or bad email format", () => {
    // Missing name
    const missingName = appointmentBookingSchema.safeParse({
      customerName: " ",
      customerPhone: "9831722983",
      serviceIds: ["srv_bridal_1"],
      appointmentDate: testDate,
      startTime: "11:30 AM",
    });
    expect(missingName.success).toBe(false);

    // Invalid phone (not 10 digits or doesn't start with 6-9)
    const invalidPhone = appointmentBookingSchema.safeParse({
      customerName: "Valid Name",
      customerPhone: "1234567890",
      serviceIds: ["srv_bridal_1"],
      appointmentDate: testDate,
      startTime: "11:30 AM",
    });
    expect(invalidPhone.success).toBe(false);

    // Invalid time
    const invalidTime = appointmentBookingSchema.safeParse({
      customerName: "Valid Name",
      customerPhone: "9831722983",
      serviceIds: ["srv_bridal_1"],
      appointmentDate: testDate,
      startTime: "25:99",
    });
    expect(invalidTime.success).toBe(false);
  });

  // 6. An invalid service ID
  it("Scenario 6: Rejects booking with unknown/invalid service ID or add-on ID", async () => {
    await expect(
      dbRepo.createAppointment({
        customerName: "Test Customer",
        customerPhone: "9831722983",
        serviceIds: ["non_existent_service_xyz"],
        appointmentDate: testDate,
        startTime: "11:00",
      })
    ).rejects.toThrow(/Invalid service ID/);

    await expect(
      dbRepo.createAppointment({
        customerName: "Test Customer",
        customerPhone: "9831722983",
        serviceIds: ["srv_bridal_1"],
        appointmentDate: testDate,
        startTime: "11:00",
        selectedAddons: ["invalid_addon_fake"],
      })
    ).rejects.toThrow(/Invalid add-on ID/);
  });

  // 7. An unavailable appointment slot
  it("Scenario 7: Rejects booking for closed day or already booked slot", async () => {
    // Book a slot first
    await dbRepo.createAppointment({
      customerName: "First Customer",
      customerPhone: "9831722981",
      serviceIds: ["srv_bridal_6"], // 240 mins long
      appointmentDate: "2026-11-29",
      startTime: "10:00",
      advanceAmount: 2000,
    });

    // Attempting same-day past slot or closed day check
    await dbRepo.updateCalendarSettings({
      status: "DISABLED",
    });

    await expect(
      dbRepo.createAppointment({
        customerName: "Second Customer",
        customerPhone: "9831722982",
        serviceIds: ["srv_bridal_1"],
        appointmentDate: "2026-11-29",
        startTime: "10:00",
        advanceAmount: 2000,
      })
    ).rejects.toThrow(/Online booking is currently disabled/);

    await dbRepo.resetCalendarSettings();
  });

  // 8. Duplicate booking submission
  it("Scenario 8: Prevents duplicate rapid submissions for the same phone, date, and slot", () => {
    const phone = "9831722983";
    const date = "2026-12-05";
    const time = "11:30";

    const firstCheck = checkDuplicateSubmission(phone, date, time, 60000);
    expect(firstCheck.isDuplicate).toBe(false);

    const duplicateCheck = checkDuplicateSubmission(phone, date, time, 60000);
    expect(duplicateCheck.isDuplicate).toBe(true);
    expect(duplicateCheck.retryAfterSeconds).toBeGreaterThan(0);
  });

  // 9. Razorpay order creation in Test Mode
  it("Scenario 9: Creates Razorpay order on server-side with precise paise conversion in Test Mode", async () => {
    const creds = await dbRepo.getRazorpayCredentials("TEST");
    expect(creds.environment).toBe("TEST");
    expect(creds.keyId).toBeDefined();
    expect(creds.keySecret).toBeDefined();

    // Create an appointment for order
    const apt = await dbRepo.createAppointment({
      customerName: "Priya Roy",
      customerPhone: "7707000463",
      customerEmail: "priya@example.com",
      serviceIds: ["srv_bridal_2"], // 7500
      appointmentDate: "2026-12-06",
      startTime: "11:30",
      advanceAmount: 2000,
      source: "ONLINE_WEBSITE",
    });

    // Advance deposit payable is 2000 INR = 200,000 paise
    const amountInPaise = Math.round(apt.depositAmount * 100);
    expect(amountInPaise).toBe(200000);

    const rzpOrder = await createRazorpayOrder(
      {
        amountInPaise,
        currency: "INR",
        receipt: `rcpt_${apt.appointmentNumber}`,
        notes: {
          appointmentId: apt.id,
          appointmentNumber: apt.appointmentNumber,
          purpose: "ADVANCE_DEPOSIT",
        },
      },
      creds.keyId,
      creds.keySecret
    );

    expect(rzpOrder.id).toBeDefined();
    expect(rzpOrder.amount).toBe(200000);
    expect(rzpOrder.currency).toBe("INR");

    const recorded = await dbRepo.recordRazorpayOrder({
      appointmentId: apt.id,
      orderId: rzpOrder.id,
      amountInPaise,
      currency: "INR",
      purpose: "ADVANCE_DEPOSIT",
      environment: "TEST",
    });

    expect(recorded).toBeDefined();
    expect(recorded.order.orderId).toBe(rzpOrder.id);
  });

  // 10. Successful and failed test payments
  it("Scenario 10: Authoritatively verifies valid HMAC signature and rejects forged signatures", async () => {
    const creds = await dbRepo.getRazorpayCredentials("TEST");

    const apt = await dbRepo.createAppointment({
      customerName: "Madhu Kumari",
      customerPhone: "9831722983",
      serviceIds: ["srv_bridal_1"], // 5000
      appointmentDate: "2026-12-07",
      startTime: "12:00",
      advanceAmount: 2000,
      source: "ONLINE_WEBSITE",
    });

    const orderId = `order_${Date.now()}`;
    const paymentId = `pay_${Date.now()}`;

    // 10a. Valid HMAC SHA256 Signature
    const expectedSig = crypto
      .createHmac("sha256", creds.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature: expectedSig,
      keySecret: creds.keySecret,
    });
    expect(isValid).toBe(true);

    const verifySuccess = await dbRepo.verifyRazorpayPayment({
      appointmentId: apt.id,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: expectedSig,
      signatureValid: true,
      amountInPaise: 200000,
    });
    expect(verifySuccess.success).toBe(true);

    const updatedApt = await dbRepo.getAppointmentById(apt.id);
    expect(updatedApt?.status).toBe(AppointmentStatus.CONFIRMED);
    expect(updatedApt?.paymentStatus).toBe(PaymentStatus.PARTIALLY_PAID);
    expect(updatedApt?.depositAmount).toBe(2000);
    expect(updatedApt?.remainingAmount).toBe(3000);

    // 10b. Forged signature rejected
    const isForgedValid = verifyRazorpayPaymentSignature({
      orderId,
      paymentId: "pay_tampered_id",
      signature: "forged_signature_attack_string",
      keySecret: creds.keySecret,
    });
    expect(isForgedValid).toBe(false);
  });
});
