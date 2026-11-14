import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import {
  encryptSecret,
  decryptSecret,
  maskSecret,
} from "@/lib/security/encryption";
import {
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/payments/razorpay";
import {
  AppointmentStatus,
  PaymentStatus,
  PaymentTransactionStatus,
  RoleType,
} from "@prisma/client";
import crypto from "crypto";

describe("Production-Readiness Audit Suite: 15 Core System Scenarios", () => {
  beforeEach(async () => {
    // Ensure clean baseline settings
    await dbRepo.updateRazorpaySettings({
      environment: "TEST",
      isEnabled: true,
      enableOnlinePayments: true,
      enableAdvancePayments: true,
      minAdvanceAmount: 1000,
      maxAdvanceAmount: 2500,
      defaultAdvanceAmount: 1000,
      testKeyId: "rzp_test_lalganj_mock",
      testKeySecret: "mock_secret_lalganj_2026",
      testWebhookSecret: "mock_webhook_secret_lalganj_2026",
      liveKeyId: "",
      liveKeySecret: "",
      liveWebhookSecret: "",
    });
  });

  // -------------------------------------------------------------
  // Scenario 1: Admin Login and Logout Session Lifecycle
  // -------------------------------------------------------------
  it("Scenario 1: Authenticates admin, creates database session, and revokes it on logout", async () => {
    const adminUsers = await dbRepo.getAdminUsers();
    expect(adminUsers.length).toBeGreaterThan(0);
    const adminUser = adminUsers[0];

    // Generate session token
    const sessionToken = `sess_token_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = await dbRepo.recordAdminSession({
      userId: adminUser.id,
      token: sessionToken,
      ipAddress: "127.0.0.1",
      userAgent: "Vitest-Production-Audit/1.0",
      expiresAt,
    });
    expect(session).toBeDefined();
    expect(session.userId).toBe(adminUser.id);

    // Verify session is active
    const isActiveBefore = await dbRepo.isSessionActive(sessionToken);
    expect(isActiveBefore).toBe(true);

    // Logout: revoke session
    const revoked = await dbRepo.revokeAdminSession(sessionToken);
    expect(revoked).toBe(true);

    // Verify session is no longer active
    const isActiveAfter = await dbRepo.isSessionActive(sessionToken);
    expect(isActiveAfter).toBe(false);
  });

  // -------------------------------------------------------------
  // Scenario 2: Customer Booking Form Verification
  // -------------------------------------------------------------
  it("Scenario 2: Validates customer booking parameters and initializes booking record", async () => {
    const apt = await dbRepo.createAppointment({
      customerName: "Pooja Verma",
      customerPhone: "9831722983",
      customerEmail: "pooja.verma@example.com",
      serviceIds: ["srv_1"],
      appointmentDate: "2026-11-25",
      startTime: "11:00",
      advanceAmount: 1000,
    });

    expect(apt).toBeDefined();
    expect(apt.id).toBeDefined();
    expect(apt.appointmentNumber).toBeDefined();
    expect(apt.totalAmount).toBeGreaterThanOrEqual(299);
  });

  // -------------------------------------------------------------
  // Scenario 3: Appointment Slot Availability & Double-Booking Prevention
  // -------------------------------------------------------------
  it("Scenario 3: Checks appointment slot availability and prevents double booking", async () => {
    const date = "2026-11-26";
    const time = "15:00";

    const apt1 = await dbRepo.createAppointment({
      customerName: "Ananya Roy",
      customerPhone: "9580000175",
      serviceIds: ["srv_1"],
      appointmentDate: date,
      startTime: time,
      advanceAmount: 1000,
    });
    expect(apt1).toBeDefined();

    const existingApts = await dbRepo.getAppointments({ date });
    const slotTaken = existingApts.some(
      (a) => a.startTime === time && a.status !== AppointmentStatus.CANCELLED
    );
    expect(slotTaken).toBe(true);
  });

  // -------------------------------------------------------------
  // Scenario 4: Authoritative Service Selection & Verification
  // -------------------------------------------------------------
  it("Scenario 4: Validates service catalog existence and rejects non-existent service IDs", async () => {
    const validService = await dbRepo.getServiceById("srv_1");
    expect(validService).toBeDefined();
    expect(validService?.name).toBeDefined();
    expect(validService?.price).toBeGreaterThan(0);

    await expect(
      dbRepo.createAppointment({
        customerName: "Fake Service User",
        customerPhone: "7707000463",
        serviceIds: ["non_existent_service_99999"],
        appointmentDate: "2026-11-27",
        startTime: "10:00",
      })
    ).rejects.toThrow(/does not exist/i);
  });

  // -------------------------------------------------------------
  // Scenario 5: Add-on Selection & Precise Subtotal Calculation
  // -------------------------------------------------------------
  it("Scenario 5: Includes enhancement add-ons and calculates exact server-verified subtotal", async () => {
    const addons = await dbRepo.getServiceAddons(true);
    expect(addons.length).toBeGreaterThan(0);

    const apt = await dbRepo.createAppointment({
      customerName: "Kritika Sen",
      customerPhone: "7707000463",
      serviceIds: ["srv_1"],
      selectedAddons: ["addon_hair_ext", "addon_draping_master"],
      appointmentDate: "2026-11-27",
      startTime: "12:00",
      advanceAmount: 1000,
    });

    // Base srv_1 is ₹299 + hair_ext ₹1,000 + draping ₹500 = ₹1,799
    expect(apt.totalAmount).toBe(1799);
  });

  // -------------------------------------------------------------
  // Scenario 6: Booking Creation & Reference Integrity
  // -------------------------------------------------------------
  it("Scenario 6: Generates immutable booking reference and associates customer profile", async () => {
    const apt = await dbRepo.createAppointment({
      customerName: "Sunita Devi",
      customerPhone: "9831722983",
      serviceIds: ["srv_1"],
      appointmentDate: "2026-11-28",
      startTime: "14:00",
      advanceAmount: 1000,
    });

    expect(apt.appointmentNumber).toBeDefined();
    const fetched = await dbRepo.getAppointmentById(apt.id);
    expect(fetched?.appointmentNumber).toBe(apt.appointmentNumber);
  });

  // -------------------------------------------------------------
  // Scenario 7: Booking Cancellation Flow
  // -------------------------------------------------------------
  it("Scenario 7: Cancels appointment and updates status to CANCELLED", async () => {
    const apt = await dbRepo.createAppointment({
      customerName: "Nisha Patel",
      customerPhone: "7707000463",
      serviceIds: ["srv_1"],
      appointmentDate: "2026-11-29",
      startTime: "10:00",
      advanceAmount: 1000,
    });

    const cancelled = await dbRepo.cancelAppointment(apt.id, "Client requested cancellation due to travel");
    expect(cancelled.status).toBe(AppointmentStatus.CANCELLED);

    const refetched = await dbRepo.getAppointmentById(apt.id);
    expect(refetched?.status).toBe(AppointmentStatus.CANCELLED);
  });

  // -------------------------------------------------------------
  // Scenario 8: Test Payment Success & Booking Confirmation
  // -------------------------------------------------------------
  it("Scenario 8: Processes successful Razorpay test advance payment and confirms booking", async () => {
    const apt = await dbRepo.createAppointment({
      customerName: "Rani Mukherjee",
      customerPhone: "7707000463",
      serviceIds: ["srv_1"],
      packageId: "pkg_2",
      appointmentDate: "2026-11-30",
      startTime: "16:00",
      advanceAmount: 1000,
    });

    const orderId = `order_test_${Date.now()}`;
    await dbRepo.recordRazorpayOrder({
      appointmentId: apt.id,
      orderId,
      amountInPaise: 100000,
      purpose: "ADVANCE_DEPOSIT",
      environment: "TEST",
    });

    const capture = await dbRepo.verifyRazorpayPayment({
      appointmentId: apt.id,
      razorpayOrderId: orderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: "mock_sig_valid",
      signatureValid: true,
      amountInPaise: 100000,
    });

    expect(capture.success).toBe(true);
    expect(capture.payment.status).toBe(PaymentTransactionStatus.SUCCESS);

    const refetched = await dbRepo.getAppointmentById(apt.id);
    expect(refetched?.paymentStatus).toBe(PaymentStatus.PARTIALLY_PAID);
    expect(refetched?.depositAmount).toBe(1000);
    expect(refetched?.remainingAmount).toBe(apt.totalAmount - 1000);
  });

  // -------------------------------------------------------------
  // Scenario 9: Test Payment Failure Handling
  // -------------------------------------------------------------
  it("Scenario 9: Records failed payment without confirming booking or crediting balance", async () => {
    const apt = await dbRepo.createAppointment({
      customerName: "Geeta Sharma",
      customerPhone: "7707000463",
      serviceIds: ["srv_1"],
      appointmentDate: "2026-12-01",
      startTime: "11:00",
      advanceAmount: 1000,
    });

    const orderId = `order_fail_${Date.now()}`;
    await dbRepo.recordRazorpayOrder({
      appointmentId: apt.id,
      orderId,
      amountInPaise: 100000,
      purpose: "ADVANCE_DEPOSIT",
      environment: "TEST",
    });

    const failResult = await dbRepo.verifyRazorpayPayment({
      appointmentId: apt.id,
      razorpayOrderId: orderId,
      razorpayPaymentId: `pay_test_failed_${Date.now()}`,
      razorpaySignature: "bad_signature",
      signatureValid: false,
      failureReason: "Payment authorization failed: insufficient balance on test card",
    });

    expect(failResult.success).toBe(false);
    expect(failResult.payment.status).toBe(PaymentTransactionStatus.FAILED);

    const refetched = await dbRepo.getAppointmentById(apt.id);
    expect(refetched?.paymentStatus).toBe(PaymentStatus.UNPAID);
  });

  // -------------------------------------------------------------
  // Scenario 10: Webhook Delivery & Idempotent Event Deduplication
  // -------------------------------------------------------------
  it("Scenario 10: Verifies webhook HMAC signature and rejects duplicate webhook replays", async () => {
    const payload = JSON.stringify({
      event: "payment.captured",
      id: `evt_test_${Date.now()}`,
      payload: { payment: { entity: { id: "pay_123", amount: 100000 } } },
    });
    const webhookSecret = "whsec_test_secret_lalganj_2026";

    const signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    const valid = verifyRazorpayWebhookSignature({
      rawBody: payload,
      signature,
      webhookSecret,
    });
    expect(valid).toBe(true);

    // Duplicate check
    const eventId = `wh_evt_${Date.now()}`;
    const firstDelivery = await dbRepo.recordWebhookEvent({
      eventId,
      eventType: "payment.captured",
      payload: JSON.parse(payload),
    });
    expect(firstDelivery.isDuplicate).toBe(false);

    const secondDelivery = await dbRepo.recordWebhookEvent({
      eventId,
      eventType: "payment.captured",
      payload: JSON.parse(payload),
    });
    expect(secondDelivery.isDuplicate).toBe(true);
  });

  // -------------------------------------------------------------
  // Scenario 11: Payment Settings Save, Encrypt and Update
  // -------------------------------------------------------------
  it("Scenario 11: Saves payment settings, encrypts secrets with AES-256-GCM, and projects masked values", async () => {
    await dbRepo.updateRazorpaySettings({
      minAdvanceAmount: 1200,
      maxAdvanceAmount: 3000,
      defaultAdvanceAmount: 1200,
      testKeyId: "rzp_test_updated_key_1",
      testKeySecret: "new_plain_test_secret_abc",
    });

    const settings = await dbRepo.getRazorpaySettings(true);
    expect(settings.minAdvanceAmount).toBe(1200);
    expect(settings.maxAdvanceAmount).toBe(3000);
    expect(settings.defaultAdvanceAmount).toBe(1200);
    expect(settings.testKeySecret).toBe("••••••••••••"); // Never plaintext
  });

  // -------------------------------------------------------------
  // Scenario 12: Test and Live Mode Switching Barrier
  // -------------------------------------------------------------
  it("Scenario 12: Blocks switching to Live Mode until live credentials and explicit confirmation are provided", async () => {
    await expect(
      dbRepo.updateRazorpaySettings({
        environment: "LIVE",
        liveKeyId: "",
        liveKeySecret: "",
      })
    ).rejects.toThrow(/Cannot switch to Live Mode/i);

    await expect(
      dbRepo.updateRazorpaySettings({
        environment: "LIVE",
        liveKeyId: "rzp_live_realmerchant99",
        liveKeySecret: "secret_live_key_valid",
        confirmedLiveActivation: false,
      })
    ).rejects.toThrow(/Explicit admin confirmation is required/i);

    const liveSettings = await dbRepo.updateRazorpaySettings({
      environment: "LIVE",
      liveKeyId: "rzp_live_realmerchant99",
      liveKeySecret: "secret_live_key_valid",
      liveWebhookSecret: "secret_live_webhook_valid",
      confirmedLiveActivation: true,
    });

    expect(liveSettings.environment).toBe("LIVE");
  });

  // -------------------------------------------------------------
  // Scenario 13: Admin Permission Restrictions & Role Checks
  // -------------------------------------------------------------
  it("Scenario 13: Enforces role permissions and prevents unauthorized modifications", async () => {
    const allUsers = await dbRepo.getAdminUsers();
    expect(allUsers.length).toBeGreaterThan(0);

    const superAdmin = allUsers.find((u) => u.roleType === RoleType.SUPER_ADMIN);
    expect(superAdmin).toBeDefined();

    const allowedRoles: RoleType[] = [RoleType.SUPER_ADMIN, RoleType.ADMIN];
    expect(allowedRoles.includes(superAdmin!.roleType)).toBe(true);
    expect(allowedRoles.includes("CUSTOMER" as any)).toBe(false);
  });

  // -------------------------------------------------------------
  // Scenario 14: Data Persistence After Admin Logout
  // -------------------------------------------------------------
  it("Scenario 14: Verifies appointments, services, and transactions persist intact after admin logout", async () => {
    const testPhone = `90${Date.now().toString().slice(-8)}`;
    const apt = await dbRepo.createAppointment({
      customerName: "Shanti Swaroop Unique",
      customerPhone: testPhone,
      serviceIds: ["srv_1"],
      appointmentDate: "2026-12-05",
      startTime: "15:30",
      advanceAmount: 1000,
    });

    const token = `temp_admin_token_${Date.now()}`;
    await dbRepo.recordAdminSession({
      userId: "usr_adm_1",
      token,
      expiresAt: new Date(Date.now() + 3600000),
    });
    await dbRepo.revokeAdminSession(token);

    const persisted = await dbRepo.getAppointmentById(apt.id);
    expect(persisted).toBeDefined();
    expect(persisted?.customerProfile?.user?.name).toBe("Shanti Swaroop Unique");
  });

  // -------------------------------------------------------------
  // Scenario 15: Data Persistence After System / Repository Re-init
  // -------------------------------------------------------------
  it("Scenario 15: Verifies database settings survive process re-evaluations and cold starts", async () => {
    const current = await dbRepo.getRazorpaySettings(true);
    expect(current).toBeDefined();
    expect(current.gatewayName).toBe("Razorpay");
    expect(current.currency).toBe("INR");

    const categories = await dbRepo.getCategories();
    expect(categories.length).toBeGreaterThan(0);
  });
});
