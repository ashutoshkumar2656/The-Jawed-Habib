import { describe, it, expect, beforeEach, vi } from "vitest";
import dbRepo from "@/lib/db/repo";
import emailService from "@/lib/email/service";
import resendClient from "@/lib/email/resend";
import {
  renderBookingConfirmationEmail,
  renderPaymentReceiptEmail,
  renderAppointmentReminderEmail,
  renderPostServiceThankYouEmail,
  escapeHtml,
} from "@/lib/email/templates";
import { EmailEventType, EmailDeliveryStatus } from "@prisma/client";
import { getKolkataDateString, getKolkataTimeString } from "@/lib/utils/timezone";

describe("Transactional Customer Email Notification & Outbox System", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await dbRepo.resetCalendarSettings();
  });

  // ==========================================================================
  // TEST A: BOOKING CONFIRMATION EMAIL
  // ==========================================================================
  describe("TEST A – Booking Confirmation Workflow", () => {
    it("dispatches booking confirmation to exact booking snapshot email with accurate details", async () => {
      const created = await dbRepo.createAppointment({
        customerName: "Sita Kumari",
        customerPhone: "9831722983",
        customerEmail: "sita.kumari@qa-test.in",
        serviceIds: ["srv_1"],
        appointmentDate: "2026-11-20",
        startTime: "11:00",
        notes: "Bridal consultation with senior stylist",
      });

      expect(created).toBeDefined();
      expect(created.appointmentNumber).toBeDefined();

      const sendSpy = vi.spyOn(resendClient, "send");

      const result = await emailService.sendBookingConfirmation(created.id);
      expect(result.success).toBe(true);

      // Verify Resend was invoked with customer's email snapshot
      expect(sendSpy).toHaveBeenCalledTimes(1);
      const callArgs = sendSpy.mock.calls[0][0];
      expect(callArgs.to).toContain("sita.kumari@qa-test.in");
      expect(callArgs.subject).toBe("Your Appointment is Booked – The Jawed Habib Salon, Lalganj");
      expect(callArgs.html).toContain(created.appointmentNumber);
      expect(callArgs.html).toContain("Sita Kumari");

      // Verify Outbox Log was recorded
      const logs = await dbRepo.getEmailLogs({ appointmentId: created.id });
      expect(logs.length).toBeGreaterThanOrEqual(1);
      const confirmLog = logs.find((l: any) => l.eventType === EmailEventType.BOOKING_CONFIRMATION);
      expect(confirmLog).toBeDefined();
      expect(confirmLog.customerEmail).toBe("sita.kumari@qa-test.in");
      expect(["ACCEPTED", "SENT"]).toContain(confirmLog.deliveryStatus);
    });

    it("skips gracefully when customer provided no email address without throwing an error", async () => {
      const created = await dbRepo.createAppointment({
        customerName: "Walk-in Guest",
        customerPhone: "9580000175",
        customerEmail: undefined, // No email provided
        serviceIds: ["srv_2"],
        appointmentDate: "2026-11-20",
        startTime: "14:00",
      });

      const result = await emailService.sendBookingConfirmation(created.id);
      expect(result.success).toBe(false);
      expect(result.error).toContain("No customer email address");

      // No outbox event created
      const logs = await dbRepo.getEmailLogs({ appointmentId: created.id });
      expect(logs.length).toBe(0);
    });
  });

  // ==========================================================================
  // TEST B: ONLINE PAYMENT RECEIPT WITH ATTACHED PDF
  // ==========================================================================
  describe("TEST B – Online Payment Receipt Workflow", () => {
    it("generates verified receipt, attaches server-side PDF, and computes balances correctly", async () => {
      const created = await dbRepo.createAppointment({
        customerName: "Pooja Verma",
        customerPhone: "9473263768",
        customerEmail: "pooja.verma@qa-test.in",
        serviceIds: ["srv_1"],
        appointmentDate: "2026-11-21",
        startTime: "11:00",
      });

      // Verify online payment of ₹2,000 advance
      const verified = await dbRepo.verifyRazorpayPayment({
        appointmentId: created.id,
        razorpayOrderId: "order_qa_12345",
        razorpayPaymentId: "pay_qa_67890",
        razorpaySignature: "dummy_sig",
        signatureValid: true,
        amountInPaise: 200000, // ₹2,000
      });

      expect(verified.payment).toBeDefined();

      const sendSpy = vi.spyOn(resendClient, "send");

      const result = await emailService.sendPaymentReceipt({
        appointmentId: created.id,
        transactionId: verified.payment?.id,
      });

      expect(result.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledTimes(1);

      const callArgs = sendSpy.mock.calls[0][0];
      expect(callArgs.to).toContain("pooja.verma@qa-test.in");
      expect(callArgs.subject).toContain(`Payment Receipt – The Jawed Habib Salon – ${created.appointmentNumber}`);

      // Verify PDF Attachment
      expect(callArgs.attachments).toBeDefined();
      expect(callArgs.attachments?.length).toBe(1);
      const pdfAttachment = callArgs.attachments![0];
      expect(pdfAttachment.filename).toBe(`Receipt-${created.appointmentNumber}.pdf`);
      expect(pdfAttachment.contentType).toBe("application/pdf");

      // Verify PDF Buffer Validity
      const pdfBuffer = Buffer.from(pdfAttachment.content, "base64");
      expect(pdfBuffer.slice(0, 8).toString("ascii")).toContain("%PDF-1.4");
      expect(pdfBuffer.length).toBeGreaterThan(1000);

      // Verify Financial Ledger in Email HTML
      expect(callArgs.html).toContain("₹2,000"); // Amount Paid in This Transaction
      expect(callArgs.html).toContain(created.appointmentNumber);

      // Verify Outbox Record
      const logs = await dbRepo.getEmailLogs({ appointmentId: created.id });
      const receiptLog = logs.find((l: any) => l.eventType === EmailEventType.PAYMENT_RECEIPT);
      expect(receiptLog).toBeDefined();
      expect(receiptLog.paymentRecordId).toBe(verified.payment?.id);
    });
  });

  // ==========================================================================
  // TEST C: OFFLINE PAYMENT RECEIPT (COUNTER BALANCE)
  // ==========================================================================
  describe("TEST C – Offline Payment Receipt Workflow", () => {
    it("generates a distinct receipt for subsequent salon counter settlement", async () => {
      const created = await dbRepo.createAppointment({
        customerName: "Rahul Sharma",
        customerPhone: "7707000463",
        customerEmail: "rahul.sharma@qa-test.in",
        serviceIds: ["srv_2"],
        appointmentDate: "2026-11-22",
        startTime: "11:00",
      });

      // Record counter offline cash collection
      const offlineResult = await dbRepo.recordOfflinePayment({
        appointmentId: created.id,
        amount: 350,
        paymentMethod: "CASH",
        receivedDate: "2026-11-22",
        recordedBy: "Manager Vikash",
        notes: "Full settlement at salon counter",
      });

      const offPay = (offlineResult as any).offlineRecord || (offlineResult as any).offlinePayment;
      expect(offPay).toBeDefined();

      const sendSpy = vi.spyOn(resendClient, "send");

      const result = await emailService.sendPaymentReceipt({
        appointmentId: created.id,
        offlinePaymentId: offPay?.id,
      });

      expect(result.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledTimes(1);

      const callArgs = sendSpy.mock.calls[0][0];
      expect(callArgs.html).toContain("Salon Counter (CASH)");
      expect(callArgs.html).toContain("₹350");
      expect(callArgs.attachments?.[0].filename).toBe(`Receipt-${created.appointmentNumber}.pdf`);
    });
  });

  // ==========================================================================
  // TEST D: APPOINTMENT REMINDER (~1 HOUR PRIOR)
  // ==========================================================================
  describe("TEST D – Automated Appointment Reminder", () => {
    it("dispatches reminder with directions link and 15-minute arrival recommendation", async () => {
      const created = await dbRepo.createAppointment({
        customerName: "Ananya Roy",
        customerPhone: "9831722983",
        customerEmail: "ananya.roy@qa-test.in",
        serviceIds: ["srv_1"],
        appointmentDate: "2026-11-23",
        startTime: "11:30",
      });

      // Mark CONFIRMED
      await dbRepo.updateAppointmentStatus(created.id, { status: "CONFIRMED" });

      const sendSpy = vi.spyOn(resendClient, "send");

      const result = await emailService.sendAppointmentReminder(created.id);
      expect(result.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledTimes(1);

      const callArgs = sendSpy.mock.calls[0][0];
      expect(callArgs.subject).toBe("Appointment Reminder – Your Salon Visit is Today!");
      expect(callArgs.html).toContain("15 minutes before");
      expect(callArgs.html).toContain("maps.app.goo.gl");
      expect(callArgs.html).toContain(created.appointmentNumber);
    });

    it("never sends reminder if appointment is cancelled or rejected", async () => {
      const created = await dbRepo.createAppointment({
        customerName: "Cancelled Client",
        customerPhone: "9580000175",
        customerEmail: "cancelled@qa-test.in",
        serviceIds: ["srv_2"],
        appointmentDate: "2026-11-23",
        startTime: "14:00",
      });

      await dbRepo.updateAppointmentStatus(created.id, { status: "CANCELLED" });

      const result = await emailService.sendAppointmentReminder(created.id);
      expect(result.success).toBe(false);
      expect(result.error).toContain("not eligible");
    });
  });

  // ==========================================================================
  // TEST E: POST-SERVICE THANK YOU EMAIL
  // ==========================================================================
  describe("TEST E – Post-Service Thank You Workflow", () => {
    it("triggers thank-you message only when appointment status becomes COMPLETED", async () => {
      const created = await dbRepo.createAppointment({
        customerName: "Kavita Devi",
        customerPhone: "9473263768",
        customerEmail: "kavita.devi@qa-test.in",
        serviceIds: ["srv_1"],
        appointmentDate: "2026-11-24",
        startTime: "13:00",
      });

      // Mark as COMPLETED
      await dbRepo.updateAppointmentStatus(created.id, { status: "COMPLETED" });

      const sendSpy = vi.spyOn(resendClient, "send");

      const result = await emailService.sendPostServiceThankYou(created.id);
      expect(result.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledTimes(1);

      const callArgs = sendSpy.mock.calls[0][0];
      expect(callArgs.subject).toBe("Thank You for Visiting – The Jawed Habib Salon, Lalganj");
      expect(callArgs.html).toContain("We look forward to welcoming you again!");
      expect(callArgs.html).toContain("Kavita Devi");
      expect(callArgs.html).toContain(created.appointmentNumber);
    });
  });

  // ==========================================================================
  // TEST F: DUPLICATE PREVENTION & IDEMPOTENCY
  // ==========================================================================
  describe("TEST F – Idempotency & Duplicate Suppression", () => {
    it("suppresses repeated duplicate dispatches across multiple rapid invocations", async () => {
      const created = await dbRepo.createAppointment({
        customerName: "Neha Gupta",
        customerPhone: "7707000463",
        customerEmail: "neha.gupta@qa-test.in",
        serviceIds: ["srv_2"],
        appointmentDate: "2026-11-25",
        startTime: "11:00",
      });

      const sendSpy = vi.spyOn(resendClient, "send");

      // First call -> sends
      const res1 = await emailService.sendBookingConfirmation(created.id);
      expect(res1.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledTimes(1);

      // Second call with same appointment ID -> suppressed
      const res2 = await emailService.sendBookingConfirmation(created.id);
      expect(res2.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledTimes(1); // STILL 1, no duplicate sent!

      // Third call -> also suppressed
      const res3 = await emailService.sendBookingConfirmation(created.id);
      expect(res3.success).toBe(true);
      expect(sendSpy).toHaveBeenCalledTimes(1); // STILL 1
    });
  });

  // ==========================================================================
  // TEST G: FAILURE ISOLATION & RETRY CAPABILITY
  // ==========================================================================
  describe("TEST G – Failure Resilience & Retry Handling", () => {
    it("preserves booking record on provider outage and enables successful administrator retry", async () => {
      const created = await dbRepo.createAppointment({
        customerName: "Amit Kumar",
        customerPhone: "9831722983",
        customerEmail: "amit.kumar@qa-test.in",
        serviceIds: ["srv_2"],
        appointmentDate: "2026-11-26",
        startTime: "11:00",
      });

      // 1. Simulate provider outage
      vi.spyOn(resendClient, "send").mockResolvedValueOnce({
        success: false,
        error: "HTTP 503 Provider Service Unavailable",
      });

      const failedResult = await emailService.sendBookingConfirmation(created.id);
      expect(failedResult.success).toBe(false);

      // Verify Appointment remains 100% intact!
      const aptCheck = await dbRepo.getAppointmentById(created.id);
      expect(aptCheck).toBeDefined();
      expect(aptCheck?.appointmentNumber).toBe(created.appointmentNumber);

      // Verify Outbox Log recorded FAILED status with error message
      const logs = await dbRepo.getEmailLogs({ appointmentId: created.id });
      expect(logs.length).toBe(1);
      expect(logs[0].deliveryStatus).toBe("FAILED");
      expect(logs[0].lastError).toContain("503");

      // 2. Administrator Retries delivery after provider recovers
      vi.spyOn(resendClient, "send").mockResolvedValueOnce({
        success: true,
        messageId: "msg_recovered_12345",
      });

      const retryResult = await emailService.retryFailedEmail(logs[0].id);
      expect(retryResult.success).toBe(true);

      // Verify Outbox Status is updated to ACCEPTED
      const updatedLogs = await dbRepo.getEmailLogs({ appointmentId: created.id });
      expect(["ACCEPTED", "SENT"]).toContain(updatedLogs[0].deliveryStatus);
    });
  });

  // ==========================================================================
  // TEST H: ASIA/KOLKATA TIMEZONE AND CRON SCHEDULER
  // ==========================================================================
  describe("TEST H – Timezone Precision & Cron Worker", () => {
    it("processes scheduled reminders accurately using Asia/Kolkata timezone", async () => {
      const todayKolkata = getKolkataDateString();
      const timeKolkata = getKolkataTimeString();

      // Find an available slot today within the salon working hours
      const availability = await dbRepo.getAvailableSlots(todayKolkata, ["srv_2"]);
      const openSlot = availability.slots.find((s) => s.isAvailable);

      if (openSlot) {
        const created = await dbRepo.createAppointment({
          customerName: "Priya Sharma",
          customerPhone: "9580000175",
          customerEmail: "priya.sharma@qa-test.in",
          serviceIds: ["srv_2"],
          appointmentDate: todayKolkata,
          startTime: openSlot.time,
        });

        await dbRepo.updateAppointmentStatus(created.id, { status: "CONFIRMED" });

        // Calculate minutes between now and slot
        const [curH, curM] = timeKolkata.split(":").map(Number);
        const [slotH, slotM] = openSlot.time.split(":").map(Number);
        const diffMinutes = (slotH * 60 + slotM) - (curH * 60 + curM);

        // Call scheduler with window encompassing the slot
        const cronResult = await emailService.processScheduledReminders(Math.max(120, diffMinutes + 30));
        expect(cronResult.eligibleCount).toBeGreaterThanOrEqual(1);
        expect(cronResult.sentCount).toBeGreaterThanOrEqual(1);

        // Running cron again immediately skips duplicate
        const cronRun2 = await emailService.processScheduledReminders(Math.max(120, diffMinutes + 30));
        expect(cronRun2.sentCount).toBe(0); // Duplicate suppressed!
      } else {
        // Fallback for outside salon opening hours: verify scheduler runs cleanly
        const cronResult = await emailService.processScheduledReminders(75);
        expect(cronResult).toBeDefined();
        expect(Array.isArray(cronResult.errors)).toBe(true);
      }
    });

    it("safely escapes HTML characters to prevent XSS injection in templates", () => {
      const escaped = escapeHtml('<script>alert("xss")</script> & "special" \'quotes\'');
      expect(escaped).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &quot;special&quot; &#039;quotes&#039;"
      );
    });
  });
});
