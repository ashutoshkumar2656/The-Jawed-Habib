import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
  maskKeyId,
} from "@/lib/security/encryption";
import {
  testRazorpayConnection,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/payments/razorpay";
import { PaymentStatus, PaymentTransactionStatus } from "@prisma/client";

describe("Razorpay Payment Gateway Admin Management System", () => {
  beforeEach(async () => {
    // Reset test settings to baseline
    await dbRepo.updateRazorpaySettings({
      environment: "TEST",
      isEnabled: true,
      enableOnlinePayments: true,
      enableAdvancePayments: true,
      minAdvanceAmount: 1000,
      maxAdvanceAmount: 2500,
      testKeyId: "rzp_test_mock_12345678",
      testKeySecret: "mock_secret_test_key_lalganj",
      testWebhookSecret: "mock_test_webhook_secret_123",
      liveKeyId: "",
      liveKeySecret: "",
      liveWebhookSecret: "",
    });
  });

  // -------------------------------------------------------------
  // 1. CREDENTIAL ENCRYPTION & AT-REST SECURITY (AES-256-GCM)
  // -------------------------------------------------------------
  it("encrypts secrets using AES-256-GCM authenticated encryption and decrypts accurately", () => {
    const rawSecret = "super_secret_live_api_key_999";
    const encrypted = encryptSecret(rawSecret);

    expect(encrypted).not.toBe(rawSecret);
    expect(encrypted.split(":")).toHaveLength(3); // iv:authTag:cipherText
    const [ivHex, authTagHex, cipherHex] = encrypted.split(":");
    expect(ivHex).toHaveLength(24); // 12-byte IV in hex
    expect(authTagHex).toHaveLength(32); // 16-byte Auth Tag in hex
    expect(cipherHex.length).toBeGreaterThan(0);

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(rawSecret);
  });

  it("safely masks credentials for public UI without exposing plaintext", async () => {
    const publicSettings = await dbRepo.getRazorpaySettings(true);

    expect(publicSettings.testKeySecret).toBe("••••••••••••");
    expect(publicSettings.testWebhookSecret).toBe("••••••••••••");
    expect(publicSettings.liveKeySecret).toBe(""); // empty if unconfigured
    expect(publicSettings.isTestConfigured).toBe(true);

    expect(maskSecret("test_secret_12345")).toBe("test••••••••2345");
    expect(maskKeyId("rzp_test_lalganj_mock_abc")).toBe("rzp_test••••••••_abc");
  });

  // -------------------------------------------------------------
  // 2. SAVING & UPDATING CREDENTIALS SAFELY
  // -------------------------------------------------------------
  it("saves and updates Test credentials without overwriting with masked placeholders", async () => {
    const originalSettings = await dbRepo.getRazorpaySettings(false);
    const originalEncryptedSecret = originalSettings.testKeySecretEncrypted;

    // Simulate frontend submitting masked secret (meaning 'leave unchanged')
    const updated = await dbRepo.updateRazorpaySettings({
      testKeySecret: "••••••••••••",
      minAdvanceAmount: 1200,
    });

    const refetched = await dbRepo.getRazorpaySettings(false);
    expect(refetched.testKeySecretEncrypted).toBe(originalEncryptedSecret);
    expect(refetched.minAdvanceAmount).toBe(1200);
  });

  // -------------------------------------------------------------
  // 3. LIVE MODE ACTIVATION BARRIER & PRE-FLIGHT SAFETY
  // -------------------------------------------------------------
  it("strictly prevents activating Live Mode when Live credentials are missing", async () => {
    await expect(
      dbRepo.updateRazorpaySettings({
        environment: "LIVE",
        liveKeyId: "",
        liveKeySecret: "",
      })
    ).rejects.toThrow(/Cannot switch to Live Mode until Live Key ID and Live Key Secret have been configured/i);
  });

  it("strictly requires explicit admin confirmation before activating Live Mode", async () => {
    await expect(
      dbRepo.updateRazorpaySettings({
        environment: "LIVE",
        liveKeyId: "rzp_live_abc123xyz789",
        liveKeySecret: "live_secret_authentic_key",
        confirmedLiveActivation: false,
      })
    ).rejects.toThrow(/Explicit admin confirmation is required before activating Live Mode/i);
  });

  it("successfully activates Live Mode when valid credentials and confirmation are provided", async () => {
    const updated = await dbRepo.updateRazorpaySettings({
      environment: "LIVE",
      liveKeyId: "rzp_live_realmerchant123",
      liveKeySecret: "real_secret_live_merchant_key",
      liveWebhookSecret: "real_live_webhook_secret",
      confirmedLiveActivation: true,
    });

    expect(updated.environment).toBe("LIVE");
    expect(updated.isLiveConfigured).toBe(true);
    expect(updated.liveKeySecret).toBe("••••••••••••");
  });

  // -------------------------------------------------------------
  // 4. TEST CONNECTION PROBE
  // -------------------------------------------------------------
  it("probes credentials safely against mock and sandbox endpoints", async () => {
    const testResult = await testRazorpayConnection("rzp_test_lalganj_mock", "mock_secret_lalganj_2026");
    expect(testResult.success).toBe(true);
    expect(testResult.message).toContain("Connection verified");
  });

  it("rejects connection test when credentials are blank", async () => {
    const result = await testRazorpayConnection("", "");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Both Key ID and Key Secret must be provided");
  });

  // -------------------------------------------------------------
  // 5. PAYMENT MODE ISOLATION & VERIFICATION
  // -------------------------------------------------------------
  it("strictly rejects verifying a LIVE booking order with a TEST payment ID", async () => {
    // Step 1: Create a live order
    const apt = await dbRepo.createAppointment({
      customerName: "Radha Kumari",
      customerPhone: "7707000463",
      serviceIds: ["srv_1"],
      packageId: "pkg_2",
      appointmentDate: "2026-11-28",
      startTime: "14:00",
      advanceAmount: 1000,
    });

    const liveOrderId = `order_live_${Date.now()}`;
    await dbRepo.recordRazorpayOrder({
      appointmentId: apt.id,
      orderId: liveOrderId,
      amountInPaise: 100000,
      purpose: "ADVANCE_DEPOSIT",
      environment: "LIVE",
    });

    // Step 2: Attempt to verify with a test payment instrument (pay_test_...)
    const result = await dbRepo.verifyRazorpayPayment({
      appointmentId: apt.id,
      razorpayOrderId: liveOrderId,
      razorpayPaymentId: `pay_test_spoofed_${Date.now()}`,
      razorpaySignature: "mock_signature",
      signatureValid: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Security Violation: Cannot verify a LIVE booking order with a TEST payment instrument");
  });

  // -------------------------------------------------------------
  // 6. ADVANCE AMOUNT MANAGEMENT & BOUNDARY VALIDATION
  // -------------------------------------------------------------
  it("updates and validates salon booking advance amount boundaries", async () => {
    await dbRepo.updateRazorpaySettings({
      minAdvanceAmount: 1500,
      maxAdvanceAmount: 3500,
      defaultAdvanceAmount: 1500,
      allowCustomerSelectAdvance: true,
      belowMinPolicy: "CAP_AT_SERVICE_PRICE",
    });

    const settings = await dbRepo.getRazorpaySettings(true);
    expect(settings.minAdvanceAmount).toBe(1500);
    expect(settings.maxAdvanceAmount).toBe(3500);
    expect(settings.defaultAdvanceAmount).toBe(1500);
    expect(settings.allowCustomerSelectAdvance).toBe(true);
  });

  // -------------------------------------------------------------
  // 7. WEBHOOK SIGNATURE & IDEMPOTENCY
  // -------------------------------------------------------------
  it("verifies webhook signature and processes payment events", () => {
    const rawPayload = JSON.stringify({ event: "payment.captured", id: "evt_123" });
    const secret = "whsec_test_12345";

    const validSig = require("crypto")
      .createHmac("sha256", secret)
      .update(rawPayload)
      .digest("hex");

    const isVerified = verifyRazorpayWebhookSignature({
      rawBody: rawPayload,
      signature: validSig,
      webhookSecret: secret,
    });

    expect(isVerified).toBe(true);

    const isTampered = verifyRazorpayWebhookSignature({
      rawBody: rawPayload + "tampered",
      signature: validSig,
      webhookSecret: secret,
    });

    expect(isTampered).toBe(false);
  });
});
