import { describe, it, expect, beforeEach, vi } from "vitest";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus, BookingSource, PaymentTransactionStatus } from "@prisma/client";
import { verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature, captureRazorpayPayment } from "@/lib/payments/razorpay";
import { POST as createOrderPost } from "@/app/api/payments/create-order/route";
import { POST as verifyPaymentPost } from "@/app/api/payments/verify/route";
import { POST as webhookPost } from "@/app/api/webhooks/razorpay/route";
import { NextRequest } from "next/server";

describe("Razorpay Test to Live Mode Migration & Production Security Suite", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    delete process.env.RAZORPAY_ENVIRONMENT;
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    delete process.env.RAZORPAY_LIVE_KEY_ID;
    delete process.env.RAZORPAY_LIVE_KEY_SECRET;
    delete process.env.RAZORPAY_LIVE_WEBHOOK_SECRET;
    delete process.env.RAZORPAY_TEST_KEY_ID;
    delete process.env.RAZORPAY_TEST_KEY_SECRET;
    delete process.env.RAZORPAY_TEST_WEBHOOK_SECRET;

    // Reset settings to Test baseline
    await dbRepo.updateRazorpaySettings({
      environment: "TEST",
      isEnabled: true,
      enableOnlinePayments: true,
      enableAdvancePayments: true,
      minAdvanceAmount: 1000,
      testKeyId: "rzp_test_lalganj_mock",
      testKeySecret: "mock_secret_lalganj_2026",
      testWebhookSecret: "mock_webhook_secret_lalganj_2026",
      liveKeyId: "",
      liveKeySecret: "",
      liveWebhookSecret: "",
    });
  });

  describe("1. Credential Prefix Isolation & Environment Integrity", () => {
    it("fails safely if Live mode is requested with missing Live credentials", async () => {
      await expect(dbRepo.getRazorpayCredentials("LIVE")).rejects.toThrow(
        /Razorpay Live Mode is active but Live credentials are missing/i
      );
    });

    it("strictly rejects Live mode if Key ID has test prefix (rzp_test_)", async () => {
      process.env.RAZORPAY_LIVE_KEY_ID = "rzp_test_invalid_in_live";
      process.env.RAZORPAY_LIVE_KEY_SECRET = "some_secret_123456";

      await expect(dbRepo.getRazorpayCredentials("LIVE")).rejects.toThrow(
        /expected prefix 'rzp_live_'/i
      );
    });

    it("strictly rejects Test mode if Key ID has live prefix (rzp_live_)", async () => {
      process.env.RAZORPAY_TEST_KEY_ID = "rzp_live_invalid_in_test";

      await expect(dbRepo.getRazorpayCredentials("TEST")).rejects.toThrow(
        /Live Key ID detected while running in Test Mode/i
      );
    });

    it("rejects incomplete live credential pairs where key ID is set but secret is missing", async () => {
      process.env.RAZORPAY_LIVE_KEY_ID = "rzp_live_lalganj_valid123";
      delete process.env.RAZORPAY_LIVE_KEY_SECRET;

      await expect(dbRepo.getRazorpayCredentials("LIVE")).rejects.toThrow(
        /RAZORPAY_LIVE_KEY_ID and RAZORPAY_LIVE_KEY_SECRET must both be provided as a matching pair/i
      );
    });

    it("successfully resolves valid Live credentials when properly configured", async () => {
      process.env.RAZORPAY_LIVE_KEY_ID = "rzp_live_validmerchant99";
      process.env.RAZORPAY_LIVE_KEY_SECRET = "live_secret_authenticated_2026";
      process.env.RAZORPAY_LIVE_WEBHOOK_SECRET = "live_webhook_secret_authenticated_2026";

      const creds = await dbRepo.getRazorpayCredentials("LIVE");
      expect(creds.environment).toBe("LIVE");
      expect(creds.keyId).toBe("rzp_live_validmerchant99");
      expect(creds.keySecret).toBe("live_secret_authenticated_2026");
      expect(creds.webhookSecret).toBe("live_webhook_secret_authenticated_2026");
    });
  });

  describe("2. Server-Side Price Calculation & Tamper Proofing", () => {
    it("strictly uses server database price and rejects client-manipulated amounts", async () => {
      const services = await dbRepo.getServices();
      const service = services[0] || { id: "svc_haircut_men", price: 850 };

      const appt = await dbRepo.createAppointment({
        customerName: "Pooja Roy",
        customerPhone: "9876543210",
        serviceIds: [service.id],
        appointmentDate: "2026-12-20",
        startTime: "12:00",
        source: BookingSource.ONLINE_WEBSITE,
      });

      // Client submits manipulated amount: attempts to pay ₹1 instead of required deposit
      const req = new NextRequest("http://localhost:3000/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appt.id,
          paymentPurpose: "ADVANCE_DEPOSIT",
          manipulatedAmount: 1, // Malicious payload field
        }),
      });

      const res = await createOrderPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      // Server-side calculated amount should equal deposit/service amount, NOT ₹1
      expect(json.data.amount).toBe(appt.depositAmount || appt.totalAmount);
      expect(json.data.amountInPaise).toBe(Math.round((appt.depositAmount || appt.totalAmount) * 100));
    });

    it("rejects order creation for cancelled or rejected appointments with HTTP 400", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      const appt = await dbRepo.createAppointment({
        customerName: "Rohan Jha",
        customerPhone: "9823456781",
        serviceIds: [serviceId],
        appointmentDate: "2026-12-21",
        startTime: "15:00",
        source: BookingSource.ONLINE_WEBSITE,
      });

      await dbRepo.updateAppointmentStatus(appt.id, {
        status: AppointmentStatus.CANCELLED,
      });

      const req = new NextRequest("http://localhost:3000/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appt.id,
          paymentPurpose: "ADVANCE_DEPOSIT",
        }),
      });

      const res = await createOrderPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/(cancelled|expired)/i);
    });
  });

  describe("3. Payment Verification Security & Timing-Safe Signatures", () => {
    it("rejects signature verification when signature has been forged or altered", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      const appt = await dbRepo.createAppointment({
        customerName: "Amit Kumar",
        customerPhone: "9834567890",
        serviceIds: [serviceId],
        appointmentDate: "2026-12-22",
        startTime: "16:00",
        source: BookingSource.ONLINE_WEBSITE,
      });

      const fakeSignature = "forged_razorpay_signature_abcdef1234567890";

      const req = new NextRequest("http://localhost:3000/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appt.id,
          razorpay_order_id: "order_mock_test_123",
          razorpay_payment_id: "pay_test_tampered_001",
          razorpay_signature: fakeSignature,
        }),
      });

      const res = await verifyPaymentPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/invalid signature/i);
    });

    it("verifies idempotency and prevents duplicate payment processing", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      const appt = await dbRepo.createAppointment({
        customerName: "Sonia Mehra",
        customerPhone: "9845612345",
        serviceIds: [serviceId],
        appointmentDate: "2026-12-23",
        startTime: "11:30",
        source: BookingSource.ONLINE_WEBSITE,
      });

      const orderId = "order_idempotent_test_01";
      const paymentId = "pay_test_idempotent_01";
      const validSig = `mock_sig_${orderId}`;

      const req1 = new NextRequest("http://localhost:3000/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appt.id,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSig,
        }),
      });

      const res1 = await verifyPaymentPost(req1);
      const json1 = await res1.json();
      expect(res1.status).toBe(200);
      expect(json1.success).toBe(true);

      // Re-send identical verification request (Simulating network retry)
      const req2 = new NextRequest("http://localhost:3000/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appt.id,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSig,
        }),
      });

      const res2 = await verifyPaymentPost(req2);
      const json2 = await res2.json();
      expect(res2.status).toBe(200);
      expect(json2.success).toBe(true);
      expect(json2.duplicate).toBe(true);
    });

    it("verifies explicit manual payment capture via captureRazorpayPayment", async () => {
      const captureResult = await captureRazorpayPayment({
        paymentId: "pay_test_manual_capture_01",
        amountInPaise: 50000,
        currency: "INR",
        keyId: "rzp_test_lalganj_mock",
        keySecret: "mock_secret_lalganj_2026",
      });

      expect(captureResult.success).toBe(true);
      expect(captureResult.data?.status).toBe("captured");
      expect(captureResult.data?.amount).toBe(50000);
    });
  });

  describe("4. Webhook Integrity & Deduplication", () => {
    it("rejects incoming webhooks missing the X-Razorpay-Signature header", async () => {
      const req = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "payment.captured" }),
      });

      const res = await webhookPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Missing X-Razorpay-Signature/i);
    });

    it("verifies webhook deduplication prevents double crediting on duplicate events", async () => {
      const eventId = "evt_live_dedup_test_99";
      const rawPayload = JSON.stringify({
        id: eventId,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_test_hook_01",
              order_id: "order_test_hook_01",
              amount: 100000,
              method: "upi",
              notes: {},
            },
          },
        },
      });

      const req1 = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "test_webhook_signature_valid",
        },
        body: rawPayload,
      });

      const res1 = await webhookPost(req1);
      const json1 = await res1.json();
      expect(res1.status).toBe(200);
      expect(json1.success).toBe(true);

      // Deliver same webhook event a second time
      const req2 = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": "test_webhook_signature_valid",
        },
        body: rawPayload,
      });

      const res2 = await webhookPost(req2);
      const json2 = await res2.json();
      expect(res2.status).toBe(200);
      expect(json2.duplicate).toBe(true);
    });

    it("prevents out-of-order failure events from regressing an already captured payment", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      const apt = await dbRepo.createAppointment({
        customerName: "Success Before Failure Client",
        customerPhone: "9876543210",
        serviceIds: [serviceId],
        appointmentDate: "2026-12-28",
        startTime: "11:00",
        source: BookingSource.ONLINE_WEBSITE,
      });

      // 1. Success event arrives first (order.paid / verified payment)
      const successResult = await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayOrderId: "order_success_first_123",
        razorpayPaymentId: "pay_test_success_123",
        razorpaySignature: "mock_sig_order_success_first_123",
        signatureValid: true,
        amountInPaise: 29900,
      });
      expect(successResult.success).toBe(true);
      expect(successResult.payment?.status).toBe(PaymentTransactionStatus.SUCCESS);

      // 2. An out-of-order failed attempt arrives second (signatureValid: false)
      const outOfOrderResult = await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayOrderId: "order_success_first_123",
        razorpayPaymentId: "pay_test_failed_retry_999",
        razorpaySignature: "mock_sig_invalid",
        signatureValid: false,
        failureReason: "Card declined by user bank",
      });

      // The successful payment must NOT be overwritten or regressed!
      expect(outOfOrderResult.success).toBe(true);
      expect(outOfOrderResult.payment?.status).toBe(PaymentTransactionStatus.SUCCESS);
      const reFetchedApt = await dbRepo.getAppointmentById(apt.id);
      expect(reFetchedApt?.paymentStatus).toBe("PAID");
    });
  });

  describe("5. Late Payment Handling & Expiry Containment", () => {
    it("handles late payment on expired booking by capturing funds and alerting concierge when slot is occupied", async () => {
      const services = await dbRepo.getServices();
      const serviceId = services[0]?.id || "svc_haircut_men";

      const apt1 = await dbRepo.createAppointment({
        customerName: "Late Payer Client",
        customerPhone: "9811122233",
        serviceIds: [serviceId],
        appointmentDate: "2026-12-25",
        startTime: "14:00",
        source: BookingSource.ONLINE_WEBSITE,
      });

      // Mark apt1 as CANCELLED (simulating 60-min abandoned timeout)
      await dbRepo.updateAppointmentStatus(apt1.id, {
        status: AppointmentStatus.CANCELLED,
      });

      // Another client takes the 14:00 slot in the interim
      const apt2 = await dbRepo.createAppointment({
        customerName: "New Client",
        customerPhone: "9844455566",
        serviceIds: [serviceId],
        appointmentDate: "2026-12-25",
        startTime: "14:00",
        source: BookingSource.ONLINE_WEBSITE,
      });
      await dbRepo.updateAppointmentStatus(apt2.id, {
        status: AppointmentStatus.CONFIRMED,
      });

      // Late payment arrives for apt1
      const result = await dbRepo.verifyRazorpayPayment({
        appointmentId: apt1.id,
        razorpayOrderId: "order_late_slot_conflict",
        razorpayPaymentId: "pay_test_late_conflict",
        razorpaySignature: "mock_sig_order_late_slot_conflict",
        signatureValid: true,
      });

      expect(result.success).toBe(true);
      expect(result.payment?.status).toBe(PaymentTransactionStatus.SUCCESS); // Money is NEVER discarded!
      expect(result.appointment?.status).toBe(AppointmentStatus.CANCELLED); // Appointment is NOT reopened to cause double-booking!
      expect((result as any).slotConflict).toBe(true);
      expect((result as any).requiresReconciliation).toBe(true);
    });
  });
});
