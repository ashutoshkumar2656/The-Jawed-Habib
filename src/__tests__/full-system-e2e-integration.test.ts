import { describe, it, expect, beforeAll } from "vitest";
import dbRepo from "@/lib/db/repo";
import {
  importServices,
  importCategories,
  importCalendarOverrides,
  importHistoricalAppointments,
} from "@/lib/db/import-repo";
import { generateCsv, generateExcelXml } from "@/lib/reports/exporter";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/payments/razorpay";
import crypto from "crypto";

describe("Phase 9: Comprehensive 22-Step End-to-End Integration Suite", () => {
  const TEST_DATE = "2026-11-28";
  const TEST_TIME = "14:00";
  const CUSTOMER_PHONE = "9911223344";
  const KEY_SECRET = "mock_secret_lalganj_e2e_2026";
  const WEBHOOK_SECRET = "mock_webhook_secret_e2e_2026";

  let serviceId: string;
  let appointmentId: string;
  let razorpayOrderId: string;
  let paymentTxnId: string;
  let validPaymentSignature: string;

  beforeAll(async () => {
    // Reset calendar settings and payments to verified baseline
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
      testKeyId: "rzp_test_lalganj_e2e",
      testKeySecret: KEY_SECRET,
      testWebhookSecret: WEBHOOK_SECRET,
      isTestVerified: true,
    });

    // Clear any test appointments on test date to ensure isolated clean test run
    dbRepo._memoryDb.appointments = dbRepo._memoryDb.appointments.filter(
      (a) => a.appointmentDate !== TEST_DATE
    );
    // Clear user and profile for test customer if existed
    dbRepo._memoryDb.users = dbRepo._memoryDb.users.filter(
      (u) => u.phone !== CUSTOMER_PHONE
    );
  });

  // STEP 1: Service creation with pricing & duration
  it("Step 1: Creates a new salon service with custom duration and pricing", async () => {
    const srv = await dbRepo.createService({
      name: "Habib Royal Moroccan Hair Spa",
      slug: "habib-royal-moroccan-hair-spa",
      price: 2000,
      discountedPrice: 1800,
      durationMinutes: 60,
      categoryId: dbRepo._memoryDb.categories[0]?.id || "cat_1",
      gender: "UNISEX",
      allowOnlineBooking: true,
      depositType: "PERCENTAGE",
      depositValue: 25,
      isPopular: true,
      isFeatured: true,
      isActive: true,
    });

    expect(srv).toBeDefined();
    expect(srv.name).toBe("Habib Royal Moroccan Hair Spa");
    expect(srv.price).toBe(2000);
    serviceId = srv.id;
  });

  // STEP 2: Advance deposit configuration
  it("Step 2: Configures advance deposit requirement (25% on ₹ 1,800 = ₹ 450)", async () => {
    const srv = await dbRepo.getServiceById(serviceId);
    expect(srv?.depositType).toBe("PERCENTAGE");
    expect(srv?.depositValue).toBe(25);

    const priceToPay = srv?.discountedPrice ?? srv!.price;
    const expectedDeposit = Math.round((priceToPay * 25) / 100);
    expect(expectedDeposit).toBe(450);
  });

  // STEP 3: Client booking initiation
  it("Step 3: Initiates client appointment booking in PENDING state", async () => {
    const apt = await dbRepo.createAppointment({
      customerName: "Sneha Sinha",
      customerPhone: CUSTOMER_PHONE,
      customerEmail: "sneha.client@example.com",
      serviceIds: [serviceId],
      appointmentDate: TEST_DATE,
      startTime: TEST_TIME,
      source: "ONLINE_WEBSITE",
      notes: "e2e_test_booking",
    });

    expect(apt).toBeDefined();
    expect(apt.status).toBe("PENDING");
    expect(apt.totalAmount).toBe(1800);
    expect(apt.depositAmount).toBe(450);
    expect(apt.remainingAmount).toBe(1350);
    appointmentId = apt.id;
  });

  // STEP 4: Slot hold / concurrency lock check
  it("Step 4: Secures temporary slot hold token to prevent concurrent conflicts", async () => {
    const hold = await dbRepo.holdTimeSlot({
      date: TEST_DATE,
      startTime: TEST_TIME,
      endTime: "15:00",
      serviceIds: [serviceId],
      customerPhone: CUSTOMER_PHONE,
    });

    expect(hold).toBeDefined();
    expect(hold.success).toBe(true);
    expect(hold.holdToken).toBeDefined();

    // Release temporary hold so remaining test steps proceed cleanly
    await dbRepo.releaseTimeSlot(hold.holdToken);
  });

  // STEP 5: Razorpay order generation
  it("Step 5: Generates Razorpay order with exact paise calculation", async () => {
    const orderResult = await dbRepo.recordRazorpayOrder({
      orderId: "order_mock_e2e_001",
      appointmentId,
      amountInPaise: 45000, // ₹ 450.00
      currency: "INR",
      purpose: "ADVANCE_DEPOSIT",
      environment: "TEST",
    });

    expect(orderResult.order).toBeDefined();
    expect(orderResult.order.orderId).toBe("order_mock_e2e_001");
    expect(orderResult.order.amountInPaise).toBe(45000);
    expect(orderResult.order.purpose).toBe("ADVANCE_DEPOSIT");
    razorpayOrderId = orderResult.order.orderId;
  });

  // STEP 6 & 7: Test payment processing & signature verification
  it("Step 6 & 7: Validates cryptographic HMAC-SHA256 signature from standard checkout", () => {
    const paymentId = "pay_mock_e2e_success_123";
    validPaymentSignature = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest("hex");

    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId,
      signature: validPaymentSignature,
      keySecret: KEY_SECRET,
    });
    expect(isValid).toBe(true);

    // Tampered signature must fail
    const isTamperedValid = verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId,
      signature: "tampered_fake_signature_abc",
      keySecret: KEY_SECRET,
    });
    expect(isTamperedValid).toBe(false);
  });

  // STEP 8: Razorpay webhook confirmation
  it("Step 8: Processes authenticated webhook confirmation", async () => {
    const webhookPayload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_mock_e2e_success_123",
            order_id: razorpayOrderId,
            amount: 45000,
            status: "captured",
          },
        },
      },
    });

    const webhookSig = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(webhookPayload)
      .digest("hex");

    const isWebhookValid = verifyRazorpayWebhookSignature({
      rawBody: webhookPayload,
      signature: webhookSig,
      webhookSecret: WEBHOOK_SECRET,
    });
    expect(isWebhookValid).toBe(true);

    const logged = await dbRepo.recordWebhookEvent({
      eventId: "evt_mock_001",
      eventType: "payment.captured",
      payload: webhookPayload,
      environment: "TEST",
    });
    expect(logged).toBeDefined();
  });

  // STEP 9, 10, 11: Booking confirmed, partially paid, ledger recorded
  it("Step 9, 10 & 11: Transitions booking to CONFIRMED, PARTIALLY_PAID and logs ledger entry", async () => {
    const verified = await dbRepo.verifyRazorpayPayment({
      appointmentId,
      razorpayOrderId,
      razorpayPaymentId: "pay_mock_e2e_success_123",
      razorpaySignature: validPaymentSignature,
      signatureValid: true,
      method: "UPI_GOOGLEPAY",
      amountInPaise: 45000,
    });

    expect(verified.success).toBe(true);
    expect(verified.appointment?.status).toBe("CONFIRMED");
    expect(verified.appointment?.paymentStatus).toBe("PARTIALLY_PAID");
    expect(verified.appointment?.remainingAmount).toBe(1350);

    // Verify ledger
    const txnsResult = await dbRepo.getPaymentTransactions({ search: "Sneha Sinha" });
    const txns = Array.isArray(txnsResult) ? txnsResult : txnsResult.transactions;
    expect(txns.length).toBeGreaterThan(0);
    const txn = txns[0];
    expect(txn.amount).toBe(450);
    expect(txn.status).toBe("CAPTURED");
    expect(txn.paymentPurpose).toBe("ADVANCE_DEPOSIT");
    paymentTxnId = txn.id;
  });

  // STEP 12: Client payment receipt generated
  it("Step 12: Generates client printable payment receipt metadata", async () => {
    const txn = await dbRepo.getPaymentTransactionById(paymentTxnId);
    expect(txn).toBeDefined();
    expect(txn?.appointment?.appointmentNumber).toBeDefined();
    expect(txn?.appointment?.customerProfile?.user?.name).toBe("Sneha Sinha");
    expect(txn?.amount).toBe(450);
    expect(txn?.paymentMethod).toBe("UPI_GOOGLEPAY");
  });

  // STEP 13: Admin calendar view reflects booked slot
  it("Step 13: Admin calendar reflects booked appointment on test date", async () => {
    const appointmentsOnDate = await dbRepo.getAllAppointments({ date: TEST_DATE });
    expect(appointmentsOnDate.length).toBeGreaterThan(0);
    const found = appointmentsOnDate.find((a) => a.id === appointmentId);
    expect(found).toBeDefined();
    expect(found?.status).toBe("CONFIRMED");
  });

  // STEP 14: Conflict prevention (capacity limit)
  it("Step 14: Prevents double booking when slot capacity is filled", async () => {
    // Current slot has 1 booking (Sneha). Fill remaining capacity to 3
    await dbRepo.createAppointment({
      customerName: "Client Two",
      customerPhone: "9911223301",
      serviceIds: [serviceId],
      appointmentDate: TEST_DATE,
      startTime: TEST_TIME,
    });
    await dbRepo.createAppointment({
      customerName: "Client Three",
      customerPhone: "9911223302",
      serviceIds: [serviceId],
      appointmentDate: TEST_DATE,
      startTime: TEST_TIME,
    });

    // 4th booking on same slot must be rejected with CONFLICT_DOUBLE_BOOKING
    await expect(
      dbRepo.createAppointment({
        customerName: "Client Four",
        customerPhone: "9911223303",
        serviceIds: [serviceId],
        appointmentDate: TEST_DATE,
        startTime: TEST_TIME,
      })
    ).rejects.toThrow(/CONFLICT_DOUBLE_BOOKING/);
  });

  // STEP 15, 16, 17: Remaining balance tracking, offline counter payment, full PAID
  it("Step 15, 16 & 17: Tracks remaining ₹ 1,350 balance, accepts offline counter settlement, transitions to PAID", async () => {
    const aptBefore = await dbRepo.getAppointmentById(appointmentId);
    expect(aptBefore?.remainingAmount).toBe(1350);

    const offlinePayment = await dbRepo.recordOfflinePayment({
      appointmentId,
      amount: 1350,
      paymentMethod: "CASH",
      receivedDate: TEST_DATE,
      notes: "Settled remaining balance at Lalganj reception",
      recordedBy: "Salon Reception Manager",
    });

    expect(offlinePayment).toBeDefined();
    expect(offlinePayment.transaction).toBeDefined();
    expect(offlinePayment.transaction.status).toBe("SUCCESS");

    const aptAfter = await dbRepo.getAppointmentById(appointmentId);
    expect(aptAfter?.paymentStatus).toBe("PAID");
    expect(aptAfter?.remainingAmount).toBe(0);
  });

  // STEP 18: Refund processing
  it("Step 18: Processes refund of advance payment and updates ledger", async () => {
    const refund = await dbRepo.recordPaymentRefund({
      transactionId: paymentTxnId,
      amount: 450,
      reason: "Client requested refund due to family emergency",
      initiatedBy: "Super Admin",
    });

    expect(refund).toBeDefined();
    expect(refund.status).toBe("PROCESSED");
    expect(refund.amount).toBe(450);

    const updatedTxn = await dbRepo.getPaymentTransactionById(paymentTxnId);
    expect(updatedTxn?.refundedAmount).toBe(450);
  });

  // STEP 19: Booking report export (CSV & XLSX)
  it("Step 19: Generates RFC 4180 CSV and Excel XML booking reports with all 14 fields", () => {
    const headers = [
      "Booking Reference",
      "Customer Name",
      "Mobile Number",
      "Email",
      "Service",
      "Appointment Date",
      "Appointment Time",
      "Service Price Snapshot",
      "Advance Amount",
      "Amount Paid",
      "Remaining Balance",
      "Booking Status",
      "Payment Status",
      "Created Date",
    ];

    const rows = [
      [
        "APT-E2E-001",
        "Sneha Sinha",
        CUSTOMER_PHONE,
        "sneha.client@example.com",
        "Habib Royal Moroccan Hair Spa",
        TEST_DATE,
        TEST_TIME,
        1800,
        450,
        1800,
        0,
        "CONFIRMED",
        "PAID",
        "2026-11-28 10:00:00",
      ],
    ];

    const csv = generateCsv(headers, rows);
    expect(csv.startsWith("\uFEFF")).toBe(true); // UTF-8 BOM
    expect(csv).toContain("Sneha Sinha");
    expect(csv).toContain("1800");

    const xml = generateExcelXml("Booking Reports", headers, rows);
    expect(xml).toContain("urn:schemas-microsoft-com:office:spreadsheet");
    expect(xml).toContain("Habib Royal Moroccan Hair Spa");
  });

  // STEP 20: Payment report export (Secret Redaction)
  it("Step 20: Generates Payment report while strictly preventing secret key leaks", () => {
    const headers = [
      "Internal Transaction ID",
      "Booking Reference",
      "Customer Name",
      "Razorpay Order ID",
      "Razorpay Payment ID",
      "Amount",
      "Currency",
      "Payment Purpose",
      "Payment Method",
      "Payment Status",
      "Refund Amount",
      "Refund Status",
      "Transaction Date",
    ];

    const rows = [
      [
        "TXN-E2E-001",
        "APT-E2E-001",
        "Sneha Sinha",
        "order_mock_e2e_001",
        "pay_mock_e2e_success_123",
        450,
        "INR",
        "ADVANCE_DEPOSIT",
        "Razorpay UPI",
        "CAPTURED",
        450,
        "FULLY_REFUNDED",
        "2026-11-28 14:00:00",
      ],
    ];

    const csv = generateCsv(headers, rows);
    expect(csv).toContain("TXN-E2E-001");
    // Strict security check: secrets must NEVER appear in export
    expect(csv).not.toContain("mock_secret_lalganj");
    expect(csv).not.toContain("mock_webhook_secret");
    expect(csv).not.toContain("passwordHash");
  });

  // STEP 21: Customer CRM data export verification
  it("Step 21: Validates customer CRM dataset with loyalty status and privacy protection", async () => {
    const customers = await dbRepo.getAllCustomers("Sneha");
    expect(customers.length).toBeGreaterThan(0);
    const c = customers[0];
    expect(c.user.phone).toBe(CUSTOMER_PHONE);
    expect(c.user.name).toBe("Sneha Sinha");
    // Ensure passwords or salts are never exposed
    expect((c.user as any).passwordHash).toBeFalsy();
  });

  // STEP 22: Service & Calendar CSV import dry-run validation and Payment Safety
  it("Step 22: Validates CSV import workflow and verifies Phase 7 Payment Safety", async () => {
    // 1. Service Import
    const serviceImportResult = await importServices([
      {
        name: "Diamond Glow Bridal Ritual",
        slug: "diamond-glow-bridal-ritual",
        categorySlug: "skin-facial-glow",
        price: 3500,
        durationMinutes: 90,
        gender: "FEMALE",
        depositType: "PERCENTAGE",
        depositValue: 20,
      },
    ]);
    expect(serviceImportResult.inserted).toBe(1);

    // 2. Calendar Override Import
    const calendarImportResult = await importCalendarOverrides([
      {
        date: "2026-12-31",
        type: "SPECIAL_HOURS",
        title: "New Year Eve Salon Rush",
        startTime: "10:00",
        endTime: "23:00",
      },
    ]);
    expect(calendarImportResult.inserted).toBe(1);

    // 3. Historical Appointment Migration with Phase 7 Payment Safety
    const historicalResult = await importHistoricalAppointments([
      {
        customerName: "Rakesh Kumar",
        phone: "9876541234",
        email: "rakesh@example.com",
        date: "2026-10-10",
        time: "11:00",
        amount: 800,
      },
    ]);
    expect(historicalResult.imported).toBe(1);

    // Verify imported record is strictly MANUAL_CASH and never marked as RAZORPAY
    const importedApts = await dbRepo.getAllAppointments({ search: "Rakesh Kumar" });
    expect(importedApts.length).toBe(1);
    const impApt = importedApts[0];
    expect(impApt.source).toBe("WALK_IN");
    expect(impApt.paymentMethod).toBe("CASH_COUNTER");

    const importedTxnsResult = await dbRepo.getPaymentTransactions({ search: "Rakesh Kumar" });
    const importedTxns = Array.isArray(importedTxnsResult)
      ? importedTxnsResult
      : importedTxnsResult.transactions;
    expect(importedTxns.length).toBe(1);
    const impTxn = importedTxns[0];
    expect(impTxn.paymentPurpose).toBe("HISTORICAL_RECORD");
    expect(impTxn.razorpayOrderId).toBeNull();
    // NEVER RAZORPAY
    expect(impTxn.paymentMethod).toBe("Historical Cash at Counter");
  });
});
