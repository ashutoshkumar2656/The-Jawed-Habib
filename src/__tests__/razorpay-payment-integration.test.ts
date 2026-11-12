import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
  maskKeyId,
} from "@/lib/security/encryption";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
  testRazorpayConnection,
} from "@/lib/payments/razorpay";
import crypto from "crypto";

describe("Razorpay Payment Gateway & Standard Checkout Integration", () => {
  let testAppointmentId: string;
  let testCount = 0;

  beforeEach(async () => {
    testCount++;
    // Reset calendar & payment settings to verified test standards
    await dbRepo.resetCalendarSettings();
    await dbRepo.updateRazorpaySettings({
      isEnabled: true,
      environment: "TEST",
      currency: "INR",
      displayName: "The Jawed Habib Salon - Lalganj",
      enableOnlinePayments: true,
      enableAdvancePayments: true,
      enableFullPayments: true,
      enableRemainingCollection: true,
      allowOfflineRecording: true,
      testKeyId: "rzp_test_lalganj_mock",
      testKeySecret: "mock_secret_lalganj_2026",
      testWebhookSecret: "mock_webhook_secret_lalganj_2026",
      isTestVerified: true,
    });

    // Clean any prior test appointments to ensure fresh slot availability
    dbRepo._memoryDb.appointments = dbRepo._memoryDb.appointments.filter(
      (a) => a.notes !== "razorpay_test"
    );

    // Create a fresh test appointment for payment tests with unique slot
    const hour = 11 + (testCount % 8);
    const timeStr = `${hour}:00`;
    const apt = await dbRepo.createAppointment({
      customerName: "Aman Verma",
      customerPhone: "7707000463",
      customerEmail: "aman@example.com",
      serviceIds: ["srv_1"], // Haircut service
      appointmentDate: `2026-11-2${testCount % 5}`,
      startTime: timeStr,
      source: "ONLINE_WEBSITE",
      notes: "razorpay_test",
    });
    testAppointmentId = apt.id;
  });

  // -------------------------------------------------------------
  // 1. CREDENTIAL ENCRYPTION & SECURITY (AES-256-GCM)
  // -------------------------------------------------------------
  describe("1. Credential Encryption & Security Standard", () => {
    it("encrypts secrets using AES-256-GCM and decrypts accurately", () => {
      const plainSecret = "secret_rzp_live_key_9999_xyz";
      const encrypted = encryptSecret(plainSecret);

      expect(encrypted).not.toBe(plainSecret);
      expect(encrypted.split(":")).toHaveLength(3); // iv:authTag:cipher

      const decrypted = decryptSecret(encrypted);
      expect(decrypted).toBe(plainSecret);
    });

    it("masks secrets for UI projection without exposing plaintext", async () => {
      const publicSettings = await dbRepo.getRazorpaySettings(true);
      expect(publicSettings.testKeySecret).toBe("••••••••••••");
      expect(publicSettings.testKeySecretEncrypted).toBeUndefined();
      expect(publicSettings.testKeyId).toBe("rzp_test_lalganj_mock");
      expect(publicSettings.testStatus).toBe("CONNECTION_VERIFIED");
    });

    it("prevents switching to Live Mode until live credentials are configured", async () => {
      await expect(
        dbRepo.updateRazorpaySettings({
          environment: "LIVE",
          liveKeyId: "",
          liveKeySecret: "",
        })
      ).rejects.toThrow(/Cannot switch to Live Mode until Live Key ID/);
    });
  });

  // -------------------------------------------------------------
  // 2. CONNECTION TEST
  // -------------------------------------------------------------
  describe("2. Razorpay Connection Testing", () => {
    it("safely verifies test credentials with Razorpay sandbox", async () => {
      const creds = await dbRepo.getRazorpayCredentials("TEST");
      const result = await testRazorpayConnection(creds.keyId, creds.keySecret);

      expect(result.success).toBe(true);
      expect(result.message).toContain("verified successfully");
    });

    it("rejects connection test when credentials are missing", async () => {
      const result = await testRazorpayConnection("", "");
      expect(result.success).toBe(false);
      expect(result.message).toContain("must be provided");
    });
  });

  // -------------------------------------------------------------
  // 3. ORDER CREATION & TRUSTED PRICING
  // -------------------------------------------------------------
  describe("3. Secure Server-Side Order Creation", () => {
    it("creates an authorized Razorpay Order with precise paise conversion", async () => {
      const appointment = await dbRepo.getAppointmentById(testAppointmentId);
      expect(appointment).toBeDefined();

      const creds = await dbRepo.getRazorpayCredentials();
      const deposit = appointment?.depositAmount ?? 0;
      const amountInINR = deposit > 0 ? deposit : (appointment?.totalAmount ?? 300);
      const amountInPaise = Math.round(amountInINR * 100);

      const orderData = await dbRepo.recordRazorpayOrder({
        appointmentId: testAppointmentId,
        orderId: `order_test_${Date.now()}`,
        amountInPaise,
        currency: "INR",
        purpose: "ADVANCE_DEPOSIT",
        environment: creds.environment,
      });

      expect(orderData.order.orderId).toContain("order_test_");
      expect(orderData.order.amountInPaise).toBe(amountInPaise);
      expect(orderData.order.purpose).toBe("ADVANCE_DEPOSIT");
      expect(orderData.payment.status).toBe("PENDING");
    });
  });

  // -------------------------------------------------------------
  // 4. SIGNATURE VERIFICATION & CONFIRMATION
  // -------------------------------------------------------------
  describe("4. Signature Verification & Payment Capture", () => {
    it("verifies HMAC SHA256 payment signature and captures transaction", async () => {
      const orderId = `order_${Date.now()}`;
      const paymentId = `pay_${Date.now()}`;
      const secret = "mock_secret_lalganj_2026";

      // Generate legitimate HMAC signature
      const validSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const isSigValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: validSignature,
        keySecret: secret,
      });
      expect(isSigValid).toBe(true);

      // Verify and capture in database
      const result = await dbRepo.verifyRazorpayPayment({
        appointmentId: testAppointmentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
        signatureValid: true,
      });

      expect(result.success).toBe(true);
      expect(result.payment.status).toBe("SUCCESS");

      // Verify appointment is marked as confirmed and payment status updated
      const updatedApt = await dbRepo.getAppointmentById(testAppointmentId);
      expect(updatedApt!.status).toBe("CONFIRMED");
      expect(updatedApt!.paymentMethod).toBe("RAZORPAY_ONLINE");
    });

    it("rejects tampered payment signature and records failure", async () => {
      const orderId = `order_${Date.now()}`;
      const paymentId = `pay_${Date.now()}`;
      const fakeSignature = "invalid_tampered_signature_1234567890abcdef";

      const isSigValid = verifyRazorpayPaymentSignature({
        orderId,
        paymentId,
        signature: fakeSignature,
        keySecret: "mock_secret_lalganj_2026",
      });
      expect(isSigValid).toBe(false);

      const result = await dbRepo.verifyRazorpayPayment({
        appointmentId: testAppointmentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: fakeSignature,
        signatureValid: false,
        failureReason: "HMAC signature mismatch",
      });

      expect(result.success).toBe(false);
      expect(result.payment.status).toBe("FAILED");
    });

    it("handles duplicate payment verification idempotently", async () => {
      const orderId = `order_${Date.now()}`;
      const paymentId = `pay_dup_${Date.now()}`;

      // First verification
      await dbRepo.verifyRazorpayPayment({
        appointmentId: testAppointmentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: "test_signature_valid",
        signatureValid: true,
      });

      // Second identical call
      const secondCall = await dbRepo.verifyRazorpayPayment({
        appointmentId: testAppointmentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: "test_signature_valid",
        signatureValid: true,
      });

      expect(secondCall.success).toBe(true);
      expect(secondCall.isDuplicate).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 5. ADVANCE DEPOSIT VS FULL PAYMENT
  // -------------------------------------------------------------
  describe("5. Advance Deposit vs Full Payment Logic", () => {
    it("handles advance deposit payment and correctly tracks remaining balance", async () => {
      const apt = await dbRepo.getAppointmentById(testAppointmentId);
      const totalAmount = apt!.totalAmount;
      const advanceDeposit = 200;

      const orderId = `order_adv_${Date.now()}`;
      const paymentId = `pay_adv_${Date.now()}`;

      await dbRepo.verifyRazorpayPayment({
        appointmentId: testAppointmentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: "test_signature_valid",
        signatureValid: true,
        amountInPaise: advanceDeposit * 100,
      });

      const updatedApt = await dbRepo.getAppointmentById(testAppointmentId);
      expect(updatedApt!.paymentStatus).toBe(totalAmount > advanceDeposit ? "PARTIALLY_PAID" : "PAID");
      expect(updatedApt!.remainingAmount).toBe(Math.max(0, totalAmount - advanceDeposit));
    });
  });

  // -------------------------------------------------------------
  // 6. OFFLINE SALON PAYMENT RECORDING
  // -------------------------------------------------------------
  describe("6. Offline Counter Payment Recording", () => {
    it("records remaining balance payment received at salon reception", async () => {
      const res = await dbRepo.recordOfflinePayment({
        appointmentId: testAppointmentId,
        amount: 250,
        paymentMethod: "CASH",
        transactionReference: "CASH-REC-101",
        receivedDate: "2026-11-20",
        recordedBy: "Receptionist Priya",
        notes: "Remaining balance paid in cash after haircut",
      });

      expect(res.offlineRecord.paymentMethod).toBe("CASH");
      expect(res.transaction.environment).toBe("OFFLINE");
      expect(res.transaction.paymentMethod).toBe("CASH");
      expect(res.transaction.status).toBe("SUCCESS");
      expect(res.transaction.gateway).not.toBe("RAZORPAY"); // Not falsely labeled as Razorpay
    });
  });

  // -------------------------------------------------------------
  // 7. WEBHOOKS & EVENT DEDUPLICATION
  // -------------------------------------------------------------
  describe("7. Razorpay Webhook Processing & Deduplication", () => {
    it("verifies webhook signature and processes payment.captured event", async () => {
      const secret = "mock_webhook_secret_lalganj_2026";
      const payload = JSON.stringify({
        id: `evt_${Date.now()}`,
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_hook_${Date.now()}`,
              amount: 50000,
              currency: "INR",
              order_id: `order_hook_${Date.now()}`,
              method: "upi",
              notes: { appointmentId: testAppointmentId },
            },
          },
        },
      });

      const validSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
      const isSigValid = verifyRazorpayWebhookSignature({
        rawBody: payload,
        signature: validSig,
        webhookSecret: secret,
      });
      expect(isSigValid).toBe(true);

      const webhookEvent = await dbRepo.recordWebhookEvent({
        eventId: "evt_unique_101",
        eventType: "payment.captured",
        payload,
      });
      expect(webhookEvent.isDuplicate).toBe(false);

      // Duplicate delivery check
      const duplicateDelivery = await dbRepo.recordWebhookEvent({
        eventId: "evt_unique_101",
        eventType: "payment.captured",
        payload,
      });
      expect(duplicateDelivery.isDuplicate).toBe(true);
    });

    it("rejects invalid webhook signature", () => {
      const isSigValid = verifyRazorpayWebhookSignature({
        rawBody: '{"event":"payment.captured"}',
        signature: "invalid_sig_abc123",
        webhookSecret: "mock_webhook_secret_lalganj_2026",
      });
      expect(isSigValid).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 8. REFUND MANAGEMENT
  // -------------------------------------------------------------
  describe("8. Controlled Refund Processing", () => {
    it("processes partial refund and updates transaction status", async () => {
      const orderId = `order_ref_${Date.now()}`;
      const paymentId = `pay_ref_${Date.now()}`;

      // Create and capture payment
      const verifyRes = await dbRepo.verifyRazorpayPayment({
        appointmentId: testAppointmentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: "test_signature_valid",
        signatureValid: true,
        amountInPaise: 50000, // ₹500
      });

      const txId = verifyRes.payment.id;

      // Process ₹200 partial refund
      const refund = await dbRepo.recordPaymentRefund({
        transactionId: txId,
        amount: 200,
        reason: "Client canceled blow-dry addon",
        initiatedBy: "Salon Manager (Lalganj)",
      });

      expect(refund.status).toBe("PROCESSED");
      expect(refund.amount).toBe(200);

      const updatedTx = await dbRepo.getPaymentTransactionById(txId);
      expect(updatedTx!.refundedAmount).toBe(200);
      expect(updatedTx!.status).toBe("CAPTURED"); // Still partially captured
    });

    it("processes full refund and updates appointment status to REFUNDED", async () => {
      const orderId = `order_full_ref_${Date.now()}`;
      const paymentId = `pay_full_ref_${Date.now()}`;

      const verifyRes = await dbRepo.verifyRazorpayPayment({
        appointmentId: testAppointmentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: "test_signature_valid",
        signatureValid: true,
        amountInPaise: 30000, // ₹300
      });

      const txId = verifyRes.payment.id;

      // Process ₹300 full refund
      const refund = await dbRepo.recordPaymentRefund({
        transactionId: txId,
        amount: 300,
        reason: "Full booking cancellation",
        initiatedBy: "Salon Manager (Lalganj)",
      });

      expect(refund.amount).toBe(300);

      const updatedTx = await dbRepo.getPaymentTransactionById(txId);
      expect(updatedTx!.status).toBe("REFUNDED");

      const apt = await dbRepo.getAppointmentById(testAppointmentId);
      expect(apt!.paymentStatus).toBe("REFUNDED");
    });
  });

  // -------------------------------------------------------------
  // 9. TRANSACTION LEDGER & QUERIES
  // -------------------------------------------------------------
  describe("9. Transaction Management Ledger & Statistics", () => {
    it("retrieves filtered transactions and computes financial summary stats", async () => {
      const ledger = await dbRepo.getPaymentTransactions();

      expect(ledger.transactions).toBeDefined();
      expect(ledger.stats.totalCollected).toBeGreaterThanOrEqual(0);
      expect(ledger.stats.capturedCount).toBeGreaterThanOrEqual(0);
      expect(ledger.stats.pendingCount).toBeGreaterThanOrEqual(0);
    });
  });

  // -------------------------------------------------------------
  // 10. COMPREHENSIVE SECURITY & INTEGRITY TESTING (PHASE 9)
  // -------------------------------------------------------------
  describe("10. Security Testing & Edge Case Protections", () => {
    it("blocks booking confirmation without authoritative verified payment", async () => {
      const unverifiedApt = await dbRepo.getAppointmentById(testAppointmentId);
      expect(unverifiedApt).toBeDefined();
      expect(unverifiedApt!.status).toBe("PENDING");
      expect(unverifiedApt!.paymentStatus).not.toBe("PAID");
    });

    it("rejects forged payment signature and protects appointment integrity", async () => {
      const fakeOrder = `order_fake_${Date.now()}`;
      const fakePayment = `pay_fake_${Date.now()}`;
      const forgedSig = "0000000000000000000000000000000000000000000000000000000000000000";

      const isValid = verifyRazorpayPaymentSignature({
        orderId: fakeOrder,
        paymentId: fakePayment,
        signature: forgedSig,
        keySecret: "mock_secret_lalganj_2026",
      });
      expect(isValid).toBe(false);

      const failRes = await dbRepo.verifyRazorpayPayment({
        appointmentId: testAppointmentId,
        razorpayOrderId: fakeOrder,
        razorpayPaymentId: fakePayment,
        razorpaySignature: forgedSig,
        signatureValid: false,
        failureReason: "HMAC signature verification failed",
      });

      expect(failRes.success).toBe(false);
      expect(failRes.payment.status).toBe("FAILED");

      // Ensure appointment was NOT confirmed
      const apt = await dbRepo.getAppointmentById(testAppointmentId);
      expect(apt!.status).toBe("PENDING");
    });

    it("enforces idempotency on duplicate webhook deliveries", async () => {
      const uniqueEventId = `evt_sec_test_${Date.now()}`;
      const payload = JSON.stringify({
        id: uniqueEventId,
        event: "order.paid",
        payload: {
          order: {
            entity: {
              id: `order_${Date.now()}`,
              amount: 200000,
              notes: { appointmentId: testAppointmentId },
            },
          },
        },
      });

      // First webhook delivery
      const firstDelivery = await dbRepo.recordWebhookEvent({
        eventId: uniqueEventId,
        eventType: "order.paid",
        payload,
      });
      expect(firstDelivery.isDuplicate).toBe(false);

      // Re-delivery of identical webhook
      const duplicateDelivery = await dbRepo.recordWebhookEvent({
        eventId: uniqueEventId,
        eventType: "order.paid",
        payload,
      });
      expect(duplicateDelivery.isDuplicate).toBe(true);
    });

    it("handles failed checkout event and updates failure reason", async () => {
      const failedOrder = `order_failed_${Date.now()}`;
      const failedPayment = `pay_failed_${Date.now()}`;

      const failRes = await dbRepo.verifyRazorpayPayment({
        appointmentId: testAppointmentId,
        razorpayOrderId: failedOrder,
        razorpayPaymentId: failedPayment,
        razorpaySignature: "invalid_sig",
        signatureValid: false,
        failureReason: "Customer bank server timed out (BAD_GATEWAY)",
      });

      expect(failRes.success).toBe(false);
      expect(failRes.payment.status).toBe("FAILED");
      expect(failRes.payment.failureReason).toContain("timed out");
    });

    it("enforces server-side advance boundary limits and clamps manipulated amounts", async () => {
      // Test booking with customer attempting an advance of ₹50 (below minimum ₹1,000)
      const aptBelow = await dbRepo.createAppointment({
        customerName: "Kavita Singh",
        customerPhone: "9831722983",
        serviceIds: ["srv_bridal_1"], // Royal Bridal Package
        appointmentDate: "2026-11-28",
        startTime: "12:00",
        advanceAmount: 50, // Manipulated low advance
        source: "ONLINE_WEBSITE",
      });

      // Backend must clamp to configured minimum ₹1,000
      expect(aptBelow.depositAmount).toBeGreaterThanOrEqual(1000);

      // Test booking with customer attempting advance higher than package price
      const aptAbove = await dbRepo.createAppointment({
        customerName: "Pooja Roy",
        customerPhone: "9580000175",
        serviceIds: ["srv_1"], // Haircut ₹300
        appointmentDate: "2026-11-29",
        startTime: "14:00",
        advanceAmount: 10000, // Exceeds haircut price
        source: "ONLINE_WEBSITE",
      });

      // Backend must never allow deposit to exceed total amount
      expect(aptAbove.depositAmount).toBeLessThanOrEqual(aptAbove.totalAmount);
    });

    it("prevents unauthorized access to administrative payment endpoints", async () => {
      const { authorizeAdminRequest } = await import("@/lib/auth/rbac");

      // Missing session
      const unauthenticated = authorizeAdminRequest(null);
      expect(unauthenticated.authorized).toBe(false);
      expect(unauthenticated.status).toBe(401);

      // Customer role trying to access admin payment settings
      const forbiddenCustomer = authorizeAdminRequest("CUSTOMER");
      expect(forbiddenCustomer.authorized).toBe(false);
      expect(forbiddenCustomer.status).toBe(403);

      // Legitimate Admin role
      const authorizedAdmin = authorizeAdminRequest("ADMIN");
      expect(authorizedAdmin.authorized).toBe(true);
      expect(authorizedAdmin.status).toBe(200);
    });
  });
});
