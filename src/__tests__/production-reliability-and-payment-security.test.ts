import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus, PaymentStatus, BookingSource, PaymentTransactionStatus } from "@prisma/client";
import { verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";
import { POST as createOrderPost } from "@/app/api/payments/create-order/route";
import { POST as verifyPaymentPost } from "@/app/api/payments/verify/route";
import { NextRequest } from "next/server";

describe("Production Reliability, Booking Integrity & Payment Security Suite", () => {
  beforeEach(async () => {
    // Reset test memory state
  });

  describe("1. Booking Concurrency & Double-Booking Prevention Across All Lifecycle States", () => {
    it("strictly marks slots as unavailable when an existing appointment is CHECKED_IN or IN_PROGRESS", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      // Create an appointment for 14:00
      const appointmentDate = "2026-12-15";
      const startTime = "14:00";

      const apt1 = await dbRepo.createAppointment({
        customerName: "Active Service Client",
        customerPhone: "9876543210",
        serviceIds: [serviceId],
        appointmentDate,
        startTime,
        source: BookingSource.ONLINE_WEBSITE,
      });

      // Transition to CHECKED_IN
      await dbRepo.updateAppointmentStatus(apt1.id, {
        status: AppointmentStatus.CHECKED_IN,
      });

      // Check slot availability for the same slot
      const slotsCheckedIn = await dbRepo.getAvailableSlots(appointmentDate, [serviceId], apt1.staffId);
      const slot14 = slotsCheckedIn.slots.find((s) => s.time === "14:00");
      expect(slot14?.isAvailable).toBe(false);

      // Transition to IN_PROGRESS
      await dbRepo.updateAppointmentStatus(apt1.id, {
        status: AppointmentStatus.IN_PROGRESS,
      });

      const slotsInProgress = await dbRepo.getAvailableSlots(appointmentDate, [serviceId], apt1.staffId);
      const slot14InProgress = slotsInProgress.slots.find((s) => s.time === "14:00");
      expect(slot14InProgress?.isAvailable).toBe(false);

      // Attempting to book the occupied slot must be rejected with CONFLICT_DOUBLE_BOOKING
      await expect(
        dbRepo.createAppointment({
          customerName: "Conflicting Client",
          customerPhone: "9123456789",
          serviceIds: [serviceId],
          staffId: apt1.staffId,
          appointmentDate,
          startTime,
          source: BookingSource.ONLINE_WEBSITE,
        })
      ).rejects.toThrow(/CONFLICT_DOUBLE_BOOKING/);
    });
  });

  describe("2. Payment Order Creation Protection", () => {
    it("strictly rejects creating a Razorpay order for an appointment that has been CANCELLED or EXPIRED", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      const apt = await dbRepo.createAppointment({
        customerName: "Expired Client",
        customerPhone: "9876500001",
        serviceIds: [serviceId],
        appointmentDate: "2026-12-16",
        startTime: "11:00",
      });

      // Mark appointment as CANCELLED (e.g. 60-min abandoned checkout expiry)
      await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.CANCELLED,
        adminNotes: "Automated reservation expiry: checkout window timed out.",
      });

      const req = new NextRequest("http://localhost:3000/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: apt.id,
          paymentPurpose: "ADVANCE_DEPOSIT",
        }),
      });

      const res = await createOrderPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/(cancelled|expired)/i);
    });
  });

  describe("3. Late Payment Handling & Slot Conflict Reconciliation", () => {
    it("handles late payment on a CANCELLED appointment where the slot is now occupied: captures payment, preserves CANCELLED status, and flags manual reconciliation", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";
      const appointmentDate = "2026-12-17";
      const startTime = "15:00";

      // 1. Initial appointment that expires and gets cancelled
      const aptOriginal = await dbRepo.createAppointment({
        customerName: "Slow Paying Client",
        customerPhone: "9876500002",
        serviceIds: [serviceId],
        appointmentDate,
        startTime,
      });

      await dbRepo.updateAppointmentStatus(aptOriginal.id, {
        status: AppointmentStatus.CANCELLED,
        adminNotes: "Automated reservation expiry: Online payment timed out.",
      });

      // 2. A new customer books the now-free slot
      const aptNew = await dbRepo.createAppointment({
        customerName: "New Active Client",
        customerPhone: "9876500003",
        serviceIds: [serviceId],
        appointmentDate,
        startTime,
      });
      expect(aptNew.status).toBe(AppointmentStatus.PENDING);

      // 3. Late payment arrives from the original customer via Razorpay
      const paymentResult = await dbRepo.verifyRazorpayPayment({
        appointmentId: aptOriginal.id,
        razorpayOrderId: "order_late_test_123",
        razorpayPaymentId: "pay_test_late_999",
        razorpaySignature: "test_signature_valid",
        signatureValid: true,
        amountInPaise: 50000,
      });

      // The payment must be captured (never lose money!)
      expect(paymentResult.success).toBe(true);
      expect(paymentResult.payment).toBeDefined();
      expect(paymentResult.payment.status).toBe(PaymentTransactionStatus.SUCCESS);

      // BUT the appointment must NOT overwrite the new customer's booking!
      expect(paymentResult.slotConflict).toBe(true);
      expect(paymentResult.requiresReconciliation).toBe(true);
      expect(paymentResult.appointment?.status).toBe(AppointmentStatus.CANCELLED);
      expect(paymentResult.appointment?.adminNotes).toContain("LATE_PAYMENT_RECONCILIATION");
    });

    it("restores and confirms a CANCELLED appointment when a late payment arrives and the slot remains available", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";
      const appointmentDate = "2026-12-18";
      const startTime = "16:00";

      const apt = await dbRepo.createAppointment({
        customerName: "Late But Free Client",
        customerPhone: "9876500004",
        serviceIds: [serviceId],
        appointmentDate,
        startTime,
      });

      await dbRepo.updateAppointmentStatus(apt.id, {
        status: AppointmentStatus.CANCELLED,
        adminNotes: "Automated reservation expiry: Online payment timed out.",
      });

      // No other customer booked the slot; slot remains free
      const paymentResult = await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayOrderId: "order_late_free_123",
        razorpayPaymentId: "pay_test_free_999",
        razorpaySignature: "test_signature_valid",
        signatureValid: true,
        amountInPaise: 50000,
      });

      expect(paymentResult.success).toBe(true);
      expect(paymentResult.slotConflict).toBe(false);
      expect(paymentResult.appointment?.status).toBe(AppointmentStatus.CONFIRMED);
      expect(paymentResult.appointment?.adminNotes).toContain("LATE_PAYMENT_RESTORED");
    });
  });

  describe("4. Payment Signature & Webhook Security Verification", () => {
    it("authoritatively rejects forged or mismatched HMAC SHA256 payment signatures", () => {
      const isValid = verifyRazorpayPaymentSignature({
        orderId: "order_real_12345",
        paymentId: "pay_real_67890",
        signature: "forged_malicious_signature_hex_12345",
        keySecret: "actual_server_key_secret_32_chars_ok",
      });
      expect(isValid).toBe(false);
    });

    it("verifies and rejects tampered raw body payloads on Razorpay webhook verification", () => {
      const rawBody = JSON.stringify({ event: "payment.captured", id: "evt_123" });
      const tamperedBody = JSON.stringify({ event: "payment.captured", id: "evt_123", amount: 9999999 });

      const isValid = verifyRazorpayWebhookSignature({
        rawBody: tamperedBody,
        signature: "invalid_tampered_signature",
        webhookSecret: "secure_webhook_secret_123",
      });
      expect(isValid).toBe(false);
    });

    it("deduplicates identical webhook events to prevent double-crediting", async () => {
      const eventId = `evt_test_dedup_${Date.now()}`;
      const firstDelivery = await dbRepo.recordWebhookEvent({
        eventId,
        eventType: "order.paid",
        payload: { id: eventId },
        isProcessed: true,
      });
      expect(firstDelivery.isDuplicate).toBe(false);

      const secondDelivery = await dbRepo.recordWebhookEvent({
        eventId,
        eventType: "order.paid",
        payload: { id: eventId },
        isProcessed: true,
      });
      expect(secondDelivery.isDuplicate).toBe(true);
    });
  });

  describe("5. Payment Verification Rate Limiting", () => {
    it("enforces rate limits on the payment verification endpoint to prevent brute-force attacks", async () => {
      const ip = "192.168.1.100";
      let rateLimited = false;

      for (let i = 0; i < 35; i++) {
        const req = new NextRequest("http://localhost:3000/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": ip,
          },
          body: JSON.stringify({
            appointmentId: "apt_nonexistent",
            razorpay_order_id: "order_fake",
            razorpay_payment_id: "pay_fake",
            razorpay_signature: "sig_fake",
          }),
        });

        const res = await verifyPaymentPost(req);
        if (res.status === 429) {
          rateLimited = true;
          break;
        }
      }

      expect(rateLimited).toBe(true);
    });
  });

  describe("6. Financial Reporting & Test Mode Isolation", () => {
    it("distinguishes Test Mode and Live Mode transactions in admin financial aggregates", async () => {
      const data = await dbRepo.getPaymentTransactions();
      const stats = data.stats as any;
      expect(stats).toHaveProperty("totalTestOnline");
      expect(stats).toHaveProperty("totalLiveOnline");
      expect(stats).toHaveProperty("realRevenue");
      expect(typeof stats.totalTestOnline).toBe("number");
      expect(typeof stats.realRevenue).toBe("number");
    });
  });
});
