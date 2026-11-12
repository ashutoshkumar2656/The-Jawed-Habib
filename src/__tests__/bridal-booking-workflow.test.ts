import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay";
import crypto from "crypto";
import { PaymentStatus, AppointmentStatus } from "@prisma/client";

describe("Bridal Service Booking & Salon Balance Collection System", () => {
  let testCount = 0;

  beforeEach(async () => {
    testCount++;
    // Reset calendar & payment settings to verified standards
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
      isTestVerified: true,
    });
  });

  // ---------------------------------------------------------------------------
  // 1. DYNAMIC BRIDAL CATALOGUE AUDIT & ONLINE FILTERING
  // ---------------------------------------------------------------------------
  describe("Bridal Catalogue & Online Booking Filtering", () => {
    it("returns ONLY published bridal services when bridalOnly is specified", async () => {
      const bridalServices = await dbRepo.getServices({
        bridalOnly: true,
        allowOnlineBooking: true,
      });

      expect(bridalServices.length).toBeGreaterThan(0);
      for (const s of bridalServices) {
        const sAny = s as any;
        expect(sAny.isBridal || s.categoryId === "cat_6").toBe(true);
        expect(s.allowOnlineBooking).toBe(true);
      }
    });

    it("verifies generic haircut services are non-bridal and excluded from bridalOnly queries", async () => {
      const genericHaircut = await dbRepo.getServiceById("srv_1");
      expect(genericHaircut).toBeDefined();
      expect((genericHaircut as any)?.isBridal).toBe(false);

      const bridalOnlyList = await dbRepo.getServices({ bridalOnly: true });
      const foundGeneric = bridalOnlyList.find((s) => s.id === "srv_1");
      expect(foundGeneric).toBeUndefined();
    });

    it("verifies Signature HD Bridal Makeup package has correct default advance rules", async () => {
      const signatureHd = (await dbRepo.getServiceById("srv_bridal_1")) as any;
      expect(signatureHd).toBeDefined();
      expect(signatureHd?.name).toContain("Signature HD Bridal Makeup");
      expect(signatureHd?.price).toBe(5000);
      expect(signatureHd?.isBridal).toBe(true);
      expect(signatureHd?.minAdvanceAmount).toBe(1000);
      expect(signatureHd?.maxAdvanceAmount).toBe(2500);
      expect(signatureHd?.suggestedAdvanceOptions).toEqual([1000, 1500, 2000, 2500]);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. SEQUENTIAL BOOKING ID GENERATION (JH-LAL-YYYY-XXXXXX)
  // ---------------------------------------------------------------------------
  describe("Sequential Unique Booking ID Generation", () => {
    it("generates booking IDs conforming strictly to JH-LAL-YYYY-XXXXXX", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Pooja Kumari",
        customerPhone: "9831722983",
        customerEmail: "pooja@example.com",
        serviceIds: ["srv_bridal_1"],
        appointmentDate: "2026-11-20",
        startTime: `1${testCount % 5}:00`,
        advanceAmount: 2000,
        bridalRequirements: "Lehenga draping and heavy mathapatti setting",
        source: "ONLINE_WEBSITE",
      });

      expect(apt.appointmentNumber).toBeDefined();
      const currentYear = new Date().getFullYear();
      const regex = new RegExp(`^JH-LAL-${currentYear}-\\d{6}$`);
      expect(apt.appointmentNumber).toMatch(regex);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. ADVANCE PAYMENT & REMAINING BALANCE CALCULATION
  // ---------------------------------------------------------------------------
  describe("Advance Payment Breakdown (Example: ₹5,000 Total, ₹2,000 Advance)", () => {
    it("accurately computes ₹2,000 advance and ₹3,000 balance at salon for ₹5,000 package", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Sneha Kumari",
        customerPhone: "7707000463",
        customerEmail: "sneha@example.com",
        serviceIds: ["srv_bridal_1"], // Price: ₹5,000
        appointmentDate: "2026-11-22",
        startTime: "11:00",
        advanceAmount: 2000,
        bridalRequirements: "Saree draping, flower jewelry setting, ready by 4 PM",
        source: "ONLINE_WEBSITE",
      });

      expect(apt.totalAmount).toBe(5000);
      expect(apt.depositAmount).toBe(2000);
      expect(apt.remainingAmount).toBe(3000);
      expect(apt.bridalRequirements).toBe("Saree draping, flower jewelry setting, ready by 4 PM");
      expect(apt.depositType).toBe("PARTIAL");
    });

    it("clamps advance amount within configured bounds (min: 1000, max: 2500)", async () => {
      // Below min: 500 should be clamped to 1000
      const aptBelow = await dbRepo.createAppointment({
        customerName: "Anjali Gupta",
        customerPhone: "9580000175",
        serviceIds: ["srv_bridal_1"],
        appointmentDate: "2026-11-23",
        startTime: "12:00",
        advanceAmount: 500,
        source: "ONLINE_WEBSITE",
      });
      expect(aptBelow.depositAmount).toBe(1000);
      expect(aptBelow.remainingAmount).toBe(4000);

      // Above max: 3500 should be clamped to 2500
      const aptAbove = await dbRepo.createAppointment({
        customerName: "Ritu Roy",
        customerPhone: "9580000176",
        serviceIds: ["srv_bridal_1"],
        appointmentDate: "2026-11-24",
        startTime: "13:00",
        advanceAmount: 3500,
        source: "ONLINE_WEBSITE",
      });
      expect(aptAbove.depositAmount).toBe(2500);
      expect(aptAbove.remainingAmount).toBe(2500);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. RAZORPAY ADVANCE VERIFICATION & STATUS UPDATE
  // ---------------------------------------------------------------------------
  describe("Razorpay Advance Payment Signature Verification", () => {
    it("captures ₹2,000 advance, sets PARTIALLY_PAID status, and preserves ₹3,000 balance", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Kavita Devi",
        customerPhone: "7707000463",
        serviceIds: ["srv_bridal_1"], // ₹5,000
        appointmentDate: "2026-11-25",
        startTime: "14:00",
        advanceAmount: 2000,
        source: "ONLINE_WEBSITE",
      });

      const orderId = `order_test_${Date.now()}`;
      const paymentId = `pay_test_${Date.now()}`;
      const keySecret = "mock_secret_lalganj_2026";

      // Generate valid HMAC SHA256 Signature
      const hmac = crypto.createHmac("sha256", keySecret);
      hmac.update(`${orderId}|${paymentId}`);
      const validSignature = hmac.digest("hex");

      const verifyResult = await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
        signatureValid: true,
        amountInPaise: 200000, // ₹2,000 in paise
      });

      expect(verifyResult.success).toBe(true);

      // Retrieve updated appointment from DB
      const updatedApt = await dbRepo.getAppointmentById(apt.id);
      expect(updatedApt).toBeDefined();
      expect(updatedApt?.status).toBe(AppointmentStatus.CONFIRMED);
      expect(updatedApt?.paymentStatus).toBe(PaymentStatus.PARTIALLY_PAID);
      expect(updatedApt?.depositAmount).toBe(2000);
      expect(updatedApt?.remainingAmount).toBe(3000);
    });

    it("marks booking as fully PAID when 100% advance is paid", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Deepika Singh",
        customerPhone: "9831722983",
        serviceIds: ["srv_bridal_1"], // ₹5,000
        appointmentDate: "2026-11-26",
        startTime: "15:00",
        advanceAmount: 5000,
        source: "ONLINE_WEBSITE",
      });

      const orderId = `order_full_${Date.now()}`;
      const paymentId = `pay_full_${Date.now()}`;
      const keySecret = "mock_secret_lalganj_2026";

      const hmac = crypto.createHmac("sha256", keySecret);
      hmac.update(`${orderId}|${paymentId}`);
      const validSignature = hmac.digest("hex");

      await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
        signatureValid: true,
        amountInPaise: 500000, // ₹5,000 in paise
      });

      const updatedApt = await dbRepo.getAppointmentById(apt.id);
      expect(updatedApt?.paymentStatus).toBe(PaymentStatus.PAID);
      expect(updatedApt?.depositAmount).toBe(5000);
      expect(updatedApt?.remainingAmount).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. SALON VISIT & REMAINING BALANCE SETTLEMENT
  // ---------------------------------------------------------------------------
  describe("Salon Visit: Collect Remaining Balance", () => {
    it("settles the remaining ₹3,000 at salon counter and marks appointment fully PAID", async () => {
      // 1. Client booked with ₹2,000 advance
      const apt = await dbRepo.createAppointment({
        customerName: "Simran Kaur",
        customerPhone: "7707000463",
        serviceIds: ["srv_bridal_1"], // ₹5,000
        appointmentDate: "2026-11-27",
        startTime: "16:00",
        advanceAmount: 2000,
        source: "ONLINE_WEBSITE",
      });

      // Verify initial advance payment
      await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayPaymentId: `pay_adv_${Date.now()}`,
        razorpaySignature: "valid_mock_sig",
        signatureValid: true,
        amountInPaise: 200000,
      });

      // 2. Client visits salon; Admin collects remaining ₹3,000 via CASH
      const collectionResult = await dbRepo.collectRemainingSalonPayment({
        appointmentId: apt.id,
        amount: 3000,
        paymentMethod: "CASH",
        notes: "Remaining balance paid in cash at salon reception desk",
        receivedBy: "Reception Desk - Lalganj",
      });

      expect(collectionResult.success).toBe(true);
      expect(collectionResult.appointment.paymentStatus).toBe(PaymentStatus.PAID);
      expect(collectionResult.appointment.remainingAmount).toBe(0);
      expect(collectionResult.receipt.totalAmount).toBe(5000);
      expect(collectionResult.receipt.advancePaid).toBe(2000);
      expect(collectionResult.receipt.amountCollectedNow).toBe(3000);
      expect(collectionResult.receipt.remainingBalance).toBe(0);
    });

    it("supports partial balance collection (e.g. paying ₹1,500 of ₹3,000 leaves ₹1,500)", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Meera Sen",
        customerPhone: "9580000175",
        serviceIds: ["srv_bridal_1"], // ₹5,000
        appointmentDate: "2026-11-28",
        startTime: "17:00",
        advanceAmount: 2000,
        source: "ONLINE_WEBSITE",
      });

      await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayPaymentId: `pay_adv_2_${Date.now()}`,
        razorpaySignature: "valid_mock_sig",
        signatureValid: true,
        amountInPaise: 200000,
      });

      // Collect partial ₹1,500
      const partialResult = await dbRepo.collectRemainingSalonPayment({
        appointmentId: apt.id,
        amount: 1500,
        paymentMethod: "UPI",
        notes: "Partial payment via UPI QR code",
      });

      expect(partialResult.success).toBe(true);
      expect(partialResult.appointment.paymentStatus).toBe(PaymentStatus.PARTIALLY_PAID);
      expect(partialResult.appointment.remainingAmount).toBe(1500);
      expect(partialResult.receipt.remainingBalance).toBe(1500);
    });

    it("rejects collecting more than the outstanding balance", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "Neha Jha",
        customerPhone: "7707000463",
        serviceIds: ["srv_bridal_1"],
        appointmentDate: "2026-11-29",
        startTime: "18:00",
        advanceAmount: 2000,
        source: "ONLINE_WEBSITE",
      });

      await dbRepo.verifyRazorpayPayment({
        appointmentId: apt.id,
        razorpayPaymentId: `pay_adv_3_${Date.now()}`,
        razorpaySignature: "valid_mock_sig",
        signatureValid: true,
        amountInPaise: 200000,
      });

      // Remaining is 3000; attempting to collect 4000 should fail
      await expect(
        dbRepo.collectRemainingSalonPayment({
          appointmentId: apt.id,
          amount: 4000,
          paymentMethod: "CASH",
        })
      ).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // 6. ADMIN BRIDAL SERVICES MANAGEMENT & CONFIGURATION
  // ---------------------------------------------------------------------------
  describe("Admin Bridal Service CRUD & Advance Configuration", () => {
    it("allows admin to create a new bridal package with custom advance rules", async () => {
      const newPackage: any = await dbRepo.createService({
        name: "Royal Destination Bridal Suite",
        slug: "royal-destination-bridal-suite",
        description: "Complete royal bridal styling with high-end hair extensions and 3-draping assist.",
        price: 10000,
        durationMinutes: 240,
        gender: "FEMALE" as any,
        categoryId: "cat_6",
        isBridal: true,
        allowOnlineBooking: true,
        allowAdvancePayment: true,
        minAdvanceAmount: 2000,
        maxAdvanceAmount: 5000,
        suggestedAdvanceOptions: [2000, 3000, 4000, 5000],
        allowCustomerSelectAdvance: true,
        allowFullPayment: true,
        isPopular: false,
        isFeatured: false,
        isActive: true,
      });

      expect(newPackage.id).toBeDefined();
      expect(newPackage.isBridal).toBe(true);
      expect(newPackage.minAdvanceAmount).toBe(2000);
      expect(newPackage.maxAdvanceAmount).toBe(5000);

      // Verify it appears in bridal query
      const bridalList = await dbRepo.getServices({ bridalOnly: true });
      const found = bridalList.find((s) => s.id === newPackage.id);
      expect(found).toBeDefined();
    });

    it("allows admin to update advance rules of an existing bridal package", async () => {
      const updated: any = await dbRepo.updateService("srv_bridal_1", {
        minAdvanceAmount: 1500,
        maxAdvanceAmount: 3000,
        suggestedAdvanceOptions: [1500, 2000, 2500, 3000],
      });

      expect(updated?.minAdvanceAmount).toBe(1500);
      expect(updated?.maxAdvanceAmount).toBe(3000);
      expect(updated?.suggestedAdvanceOptions).toEqual([1500, 2000, 2500, 3000]);
    });
  });
});
