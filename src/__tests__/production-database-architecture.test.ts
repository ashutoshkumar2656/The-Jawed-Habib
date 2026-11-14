import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { signToken } from "@/lib/auth/jwt";
import { ROLES } from "@/lib/auth/rbac";
import { PaymentStatus, AppointmentStatus, PaymentTransactionStatus } from "@prisma/client";

describe("Production Database Architecture, Relationships & Data Integrity Suite", () => {
  // -------------------------------------------------------------
  // 1. Model Relationships & Referential Integrity
  // -------------------------------------------------------------
  describe("1. Database Model Relationships & Referential Integrity", () => {
    it("associates appointment with customer, services, add-ons, and payment records", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Radha Kumari",
        customerPhone: "7707000463",
        serviceIds: ["srv_1"],
        selectedAddons: ["addon_hair_ext", "addon_family_glam"],
        appointmentDate: "2026-11-20",
        startTime: "11:30",
        advanceAmount: 2000,
        notes: "Bridal makeover consultation",
      });

      expect(apt).toBeDefined();
      expect(apt.appointmentNumber).toMatch(/^JH-(LAL|LLG)-\d+/);
      expect(apt.customerProfileId).toBeDefined();

      // Verify AppointmentService relationship
      expect(apt.appointmentServices).toBeDefined();
      expect(apt.appointmentServices.length).toBeGreaterThan(0);
      expect(apt.appointmentServices[0].serviceId).toBe("srv_1");

      // Verify server-side financial calculations
      expect(apt.totalAmount).toBeGreaterThan(0);
      expect(apt.remainingAmount).toBe(apt.totalAmount - (apt.depositAmount || 0));
    });

    it("maintains referential integrity on offline counter payments and balance tracking", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Pooja Verma",
        customerPhone: "9831722983",
        serviceIds: ["srv_1"],
        packageId: "pkg_2", // ₹2,499 package
        appointmentDate: "2026-11-21",
        startTime: "14:00",
        advanceAmount: 1000,
      });

      const initialRemaining = apt.remainingAmount ?? (apt.totalAmount - (apt.depositAmount || 0));
      expect(initialRemaining).toBeGreaterThan(0);

      // Settle full remaining balance at the salon counter
      const offlinePay = await dbRepo.recordOfflinePayment({
        appointmentId: apt.id,
        amount: initialRemaining,
        paymentMethod: "CASH",
        receivedDate: "2026-11-21",
        recordedBy: "Receptionist Priya",
        notes: "Remaining balance paid in cash at counter",
      });

      expect(offlinePay).toBeDefined();
      expect(offlinePay.offlineRecord.amount).toBe(initialRemaining);

      const updatedApt = await dbRepo.getAppointmentById(apt.id);
      expect(updatedApt?.remainingAmount).toBe(0);
      expect(updatedApt?.paymentStatus).toBe(PaymentStatus.PAID);
    });
  });

  // -------------------------------------------------------------
  // 2. Database Transactions & Atomicity
  // -------------------------------------------------------------
  describe("2. Database Transactions & Financial Atomicity", () => {
    it("executes atomic refund transactions updating refund log, transaction, and booking status", async () => {
      // Step 1: Create appointment
      const apt = await dbRepo.createAppointment({
        customerName: "Anjali Singh",
        customerPhone: "9580000175",
        serviceIds: ["srv_1"],
        packageId: "pkg_2",
        appointmentDate: "2026-11-22",
        startTime: "16:00",
        advanceAmount: 1000,
      });

      // Step 2: Record and capture advance payment
      const order = await dbRepo.recordRazorpayOrder({
        appointmentId: apt.id,
        orderId: `order_test_${Date.now()}`,
        amountInPaise: 100000,
        purpose: "ADVANCE_DEPOSIT",
      });

      const captureResult = await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayPaymentId: `pay_test_${Date.now()}`,
        razorpayOrderId: order.order.orderId,
        razorpaySignature: "mock_sig_valid",
        signatureValid: true,
        amountInPaise: 100000,
      });

      expect(captureResult.success).toBe(true);
      expect(captureResult.payment.status).toBe(PaymentTransactionStatus.SUCCESS);

      // Step 3: Execute controlled refund transaction
      const refund = await dbRepo.recordPaymentRefund({
        transactionId: captureResult.payment.id,
        amount: 1000,
        reason: "Customer requested cancellation with valid notice",
        initiatedBy: "Admin Sunita",
      });

      expect(refund).toBeDefined();
      expect(refund.status).toBe("PROCESSED");
      expect(refund.amount).toBe(1000);

      // Step 4: Verify appointment and transaction status reflected atomically
      const refetchedApt = await dbRepo.getAppointmentById(apt.id);
      expect(refetchedApt?.paymentStatus).toBe(PaymentStatus.REFUNDED);
    });

    it("rejects refund amounts exceeding the captured payment value", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Kavita Rao",
        customerPhone: "7707000463",
        serviceIds: ["srv_1"],
        packageId: "pkg_2",
        appointmentDate: "2026-11-23",
        startTime: "10:30",
        advanceAmount: 1000,
      });

      const order = await dbRepo.recordRazorpayOrder({
        appointmentId: apt.id,
        orderId: `order_refund_over_${Date.now()}`,
        amountInPaise: 100000,
        purpose: "ADVANCE_DEPOSIT",
      });

      const captureResult = await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayPaymentId: `pay_refund_over_${Date.now()}`,
        razorpayOrderId: order.order.orderId,
        razorpaySignature: "mock_sig_valid",
        signatureValid: true,
        amountInPaise: 100000,
      });

      // Attempting to refund ₹50,000 on a ₹2,000 transaction must be rejected
      await expect(
        dbRepo.recordPaymentRefund({
          transactionId: captureResult.payment.id,
          amount: 50000,
          reason: "Malicious over-refund attempt",
          initiatedBy: "Admin",
        })
      ).rejects.toThrow(/exceeds/i);
    });
  });

  // -------------------------------------------------------------
  // 3. Persistent AdminSession & Revocation
  // -------------------------------------------------------------
  describe("3. Persistent AdminSession Management", () => {
    it("stores active admin session and survives session verification lookups", async () => {
      const token = signToken({
        userId: "admin_test_usr",
        role: ROLES.SUPER_ADMIN,
        phone: "7707000463",
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const session = await dbRepo.recordAdminSession({
        userId: "admin_test_usr",
        token,
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        expiresAt,
      });

      expect(session).toBeDefined();
      expect(session.token).toBe(token);

      const isActive = await dbRepo.isSessionActive(token);
      expect(isActive).toBe(true);
    });

    it("revokes admin session on logout preventing token reuse", async () => {
      const token = signToken({
        userId: "admin_revoked_usr",
        role: ROLES.ADMIN,
        phone: "9831722983",
      });

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await dbRepo.recordAdminSession({
        userId: "admin_revoked_usr",
        token,
        expiresAt,
      });

      const activeBefore = await dbRepo.isSessionActive(token);
      expect(activeBefore).toBe(true);

      // Perform logout revocation
      await dbRepo.revokeAdminSession(token);

      const activeAfter = await dbRepo.isSessionActive(token);
      expect(activeAfter).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 4. Data Integrity & Monetary Precision
  // -------------------------------------------------------------
  describe("4. Data Integrity & Monetary Calculations", () => {
    it("converts INR rupees to exact integer paise avoiding floating-point drift", () => {
      const rupeeAmount = 2499.5;
      const paise = Math.round(rupeeAmount * 100);
      expect(paise).toBe(249950);
      expect(Number.isInteger(paise)).toBe(true);

      const smallAmount = 450;
      const smallPaise = Math.round(smallAmount * 100);
      expect(smallPaise).toBe(45000);
    });

    it("enforces unique constraint idempotency on duplicate webhook events", async () => {
      const eventId = `evt_webhook_${Date.now()}`;

      // First webhook delivery
      const firstDelivery = await dbRepo.recordWebhookEvent({
        eventId,
        eventType: "payment.captured",
        payload: JSON.stringify({ id: eventId, status: "captured" }),
      });

      expect(firstDelivery.isDuplicate).toBe(false);

      // Second identical webhook delivery (network retry)
      const secondDelivery = await dbRepo.recordWebhookEvent({
        eventId,
        eventType: "payment.captured",
        payload: JSON.stringify({ id: eventId, status: "captured" }),
      });

      expect(secondDelivery.isDuplicate).toBe(true);
    });

    it("retrieves service add-ons catalog with correct pricing", async () => {
      const addons = await dbRepo.getServiceAddons();
      expect(addons).toBeDefined();
      expect(addons.length).toBeGreaterThan(0);

      const hairExt = addons.find((a) => a.id === "addon_hair_ext" || a.name.includes("Hair Extensions"));
      expect(hairExt).toBeDefined();
      expect(hairExt?.price).toBeGreaterThan(0);
    });
  });
});
