/**
 * Central Transactional Email Notification Service
 * The Jawed Habib Salon – Lalganj
 * Reliable Outbox Pattern, Deduplication, and Failure Isolation
 */

import dbRepo from "@/lib/db/repo";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { EmailEventType, EmailDeliveryStatus } from "@prisma/client";
import { resendClient } from "./resend";
import {
  renderBookingConfirmationEmail,
  renderPaymentReceiptEmail,
  renderAppointmentReminderEmail,
  renderPostServiceThankYouEmail,
  renderAdminEnquiryNotificationEmail,
} from "./templates";
import { generateReceiptPdfBuffer } from "../pdf/receipt";
import type {
  BookingConfirmationEmailPayload,
  PaymentReceiptEmailPayload,
  AppointmentReminderEmailPayload,
  PostServiceThankYouEmailPayload,
  EmailSendResult,
} from "./types";

export class EmailNotificationService {
  /**
   * Helper: Formats Date value to YYYY-MM-DD or readable string
   */
  private formatDate(dateVal: any): string {
    if (!dateVal) return "";
    if (typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      return dateVal;
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  }

  // ==========================================================================
  // 1. BOOKING CONFIRMATION
  // ==========================================================================
  async sendBookingConfirmation(appointmentId: string): Promise<EmailSendResult> {
    try {
      const apt = await dbRepo.getAppointmentById(appointmentId);
      if (!apt) {
        return { success: false, error: `Appointment ${appointmentId} not found` };
      }

      // Customer Snapshot: strictly use booking-time snapshot to protect privacy
      const customerEmail = apt.customerEmail?.trim().toLowerCase();
      if (!customerEmail || !customerEmail.includes("@")) {
        console.log(`[EMAIL_SKIPPED] No valid customer email for booking ${apt.appointmentNumber}`);
        return { success: false, error: "No customer email address on booking." };
      }

      const customerName = apt.customerName?.trim() || "Valued Client";
      const customerPhone = apt.customerPhone?.trim() || "";

      // Deduplication idempotency key
      const idempotencyKey = `CONFIRMATION:${apt.id}`;

      // Extract service names
      const serviceNames: string[] = [];
      if (apt.appointmentServices && Array.isArray(apt.appointmentServices)) {
        for (const as of apt.appointmentServices) {
          if (as.service?.name) serviceNames.push(as.service.name);
        }
      }
      if (serviceNames.length === 0) serviceNames.push("Salon Reservation");

      let packageName: string | null = null;
      if ((apt as any).package?.name) {
        packageName = (apt as any).package.name;
      } else if (apt.packageId) {
        const pkg = await dbRepo.getPackageById(apt.packageId);
        if (pkg) packageName = pkg.name;
      }

      // Addons
      const addons: string[] = [];
      if ((apt as any).appointmentAddons && Array.isArray((apt as any).appointmentAddons)) {
        for (const aa of (apt as any).appointmentAddons) {
          if (aa.addon?.name) addons.push(aa.addon.name);
        }
      }

      // Determine Payment Scenario
      let paymentScenario: "ADVANCE_PAID" | "PAYMENT_PENDING" | "PAY_AT_SALON" = "PAY_AT_SALON";
      const depositReq = apt.depositAmount || 0;
      const isPaidOnline = ["PAID", "PARTIALLY_PAID"].includes(apt.paymentStatus);

      if (isPaidOnline && depositReq > 0) {
        paymentScenario = "ADVANCE_PAID";
      } else if (depositReq > 0 && apt.paymentStatus === "UNPAID") {
        paymentScenario = "PAYMENT_PENDING";
      } else {
        paymentScenario = "PAY_AT_SALON";
      }

      const payload: BookingConfirmationEmailPayload = {
        appointmentId: apt.id,
        appointmentNumber: apt.appointmentNumber,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        serviceNames,
        packageName,
        addons,
        appointmentDate: this.formatDate(apt.appointmentDate),
        startTime: apt.startTime,
        salonAddress: BRAND_CONFIG.location.fullAddress,
        salonPhone: BRAND_CONFIG.contact.primaryPhone,
        totalServiceAmount: apt.totalAmount || 0,
        advancePaymentRequired: depositReq,
        amountPaid: isPaidOnline ? depositReq : 0,
        remainingBalance: apt.remainingAmount ?? apt.totalAmount,
        bookingStatus: apt.status,
        paymentStatus: apt.paymentStatus as any,
        paymentScenario,
      };

      const { subject, html, text } = renderBookingConfirmationEmail(payload);

      // Record in Outbox
      const { isDuplicate, emailLog } = await dbRepo.recordEmailEvent({
        appointmentId: apt.id,
        customerEmail,
        customerName,
        eventType: EmailEventType.BOOKING_CONFIRMATION,
        idempotencyKey,
        subject,
        bodyText: text,
        metadata: {
          appointmentNumber: apt.appointmentNumber,
          paymentScenario,
          totalAmount: apt.totalAmount,
        },
      });

      if (isDuplicate) {
        return {
          success: true,
          messageId: emailLog?.providerMessageId || "DUPLICATE_SUPPRESSED",
          simulated: true,
        };
      }

      // Dispatch Email
      const result = await resendClient.send({
        to: customerEmail,
        subject,
        html,
        text,
      });

      // Update Outbox Status
      await dbRepo.updateEmailLogStatus(emailLog.id, {
        deliveryStatus: result.success ? EmailDeliveryStatus.ACCEPTED : EmailDeliveryStatus.FAILED,
        providerMessageId: result.messageId || null,
        lastError: result.error || null,
        sentAt: result.success ? new Date() : null,
      });

      return result;
    } catch (err: any) {
      console.error("[SEND_BOOKING_CONFIRMATION_FAILED]", err);
      return { success: false, error: err.message };
    }
  }

  // ==========================================================================
  // 2. PAYMENT RECEIPT WITH ATTACHED PDF
  // ==========================================================================
  async sendPaymentReceipt(params: {
    appointmentId: string;
    transactionId?: string;
    offlinePaymentId?: string;
  }): Promise<EmailSendResult> {
    try {
      const apt = await dbRepo.getAppointmentById(params.appointmentId);
      if (!apt) {
        return { success: false, error: `Appointment ${params.appointmentId} not found` };
      }

      const customerEmail = apt.customerEmail?.trim().toLowerCase();
      if (!customerEmail || !customerEmail.includes("@")) {
        console.log(`[EMAIL_SKIPPED] No customer email for receipt: ${apt.appointmentNumber}`);
        return { success: false, error: "No customer email address on booking." };
      }

      const customerName = apt.customerName?.trim() || "Valued Client";
      const customerPhone = apt.customerPhone?.trim() || "";

      // Deduplication idempotency key includes transaction/payment identity
      const txKey = params.transactionId || params.offlinePaymentId || "DEFAULT_TX";
      const idempotencyKey = `RECEIPT:${apt.id}:${txKey}`;

      // Look up specific transaction details if provided
      let tx: any = null;
      let offlinePay: any = null;
      let amountPaidInThisTransaction = 0;
      let paymentMethod = "Razorpay Online";
      let transactionReference = `TXN_${apt.appointmentNumber}`;
      let razorpayPaymentId: string | null = null;

      if (params.transactionId) {
        tx = await dbRepo.getPaymentTransactionById(params.transactionId);
        if (tx) {
          amountPaidInThisTransaction = tx.amount;
          transactionReference = tx.transactionRef || `TXN_${tx.id.slice(0, 8)}`;
          razorpayPaymentId = tx.gatewayPaymentId || null;
          paymentMethod = tx.gateway === "RAZORPAY" ? "Razorpay Online" : tx.gateway;
        }
      } else if (params.offlinePaymentId) {
        offlinePay = await dbRepo.getOfflinePaymentById(params.offlinePaymentId);
        if (!offlinePay) {
          const offList = await dbRepo.getOfflinePayments(apt.id);
          offlinePay = offList.find((p: any) => p.id === params.offlinePaymentId) || offList[0];
        }
        if (offlinePay) {
          amountPaidInThisTransaction = offlinePay.amount;
          transactionReference = offlinePay.transactionReference || `OFFLINE_${offlinePay.id.slice(0, 8)}`;
          paymentMethod = `Salon Counter (${offlinePay.paymentMethod})`;
        }
      }

      // If neither transaction was passed, infer from appointment state
      if (!amountPaidInThisTransaction) {
        amountPaidInThisTransaction = (apt.depositAmount ?? 0) > 0 ? (apt.depositAmount ?? 0) : apt.totalAmount;
      }

      // Calculate previously paid & remaining balance
      const totalServiceAmount = apt.totalAmount || 0;
      const remainingBalance = apt.remainingAmount ?? Math.max(0, totalServiceAmount - amountPaidInThisTransaction);
      const previouslyPaidAmount = Math.max(0, totalServiceAmount - remainingBalance - amountPaidInThisTransaction);

      const receiptNumber = `RCPT-${apt.appointmentNumber}-${txKey.slice(-6).toUpperCase()}`;

      // Extract service description
      let serviceDescription = "Salon Treatment";
      if (apt.appointmentServices && apt.appointmentServices.length > 0) {
        serviceDescription = apt.appointmentServices.map((as: any) => as.service?.name || "Service").join(", ");
      }
      if ((apt as any).package?.name) {
        serviceDescription = `${serviceDescription} (${(apt as any).package.name})`;
      }

      const receiptPayload: PaymentReceiptEmailPayload = {
        receiptNumber,
        appointmentId: apt.id,
        appointmentNumber: apt.appointmentNumber,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        paymentDate: new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
        paymentMethod,
        transactionReference,
        razorpayPaymentId,
        serviceDescription,
        totalServiceAmount,
        amountPaidInThisTransaction,
        previouslyPaidAmount,
        remainingBalance,
        paymentStatus: remainingBalance <= 0 ? "PAID" : "PARTIALLY_PAID",
      };

      // Generate Official Vector PDF Receipt on Server
      const pdfBuffer = generateReceiptPdfBuffer(receiptPayload);

      const { subject, html, text } = renderPaymentReceiptEmail(receiptPayload);

      // Record in Outbox
      const { isDuplicate, emailLog } = await dbRepo.recordEmailEvent({
        appointmentId: apt.id,
        paymentRecordId: params.transactionId || null,
        offlinePaymentId: params.offlinePaymentId || null,
        customerEmail,
        customerName,
        eventType: EmailEventType.PAYMENT_RECEIPT,
        idempotencyKey,
        subject,
        bodyText: text,
        metadata: {
          receiptNumber,
          amountPaidInThisTransaction,
          remainingBalance,
          transactionReference,
        },
      });

      if (isDuplicate) {
        return {
          success: true,
          messageId: emailLog?.providerMessageId || "DUPLICATE_RECEIPT_SUPPRESSED",
          simulated: true,
        };
      }

      // Dispatch Email with Attached PDF
      const result = await resendClient.send({
        to: customerEmail,
        subject,
        html,
        text,
        attachments: [
          {
            filename: `Receipt-${apt.appointmentNumber}.pdf`,
            content: pdfBuffer.toString("base64"),
            contentType: "application/pdf",
          },
        ],
      });

      // Update Outbox Status
      await dbRepo.updateEmailLogStatus(emailLog.id, {
        deliveryStatus: result.success ? EmailDeliveryStatus.ACCEPTED : EmailDeliveryStatus.FAILED,
        providerMessageId: result.messageId || null,
        lastError: result.error || null,
        sentAt: result.success ? new Date() : null,
      });

      return result;
    } catch (err: any) {
      console.error("[SEND_PAYMENT_RECEIPT_FAILED]", err);
      return { success: false, error: err.message };
    }
  }

  // ==========================================================================
  // 3. APPOINTMENT REMINDER (~1 Hour Prior)
  // ==========================================================================
  async sendAppointmentReminder(appointmentId: string): Promise<EmailSendResult> {
    try {
      const apt = await dbRepo.getAppointmentById(appointmentId);
      if (!apt) {
        return { success: false, error: `Appointment ${appointmentId} not found` };
      }

      // Check status: never send for cancelled, rejected, or completed
      if (!["CONFIRMED", "PENDING"].includes(apt.status)) {
        return { success: false, error: `Appointment status ${apt.status} is not eligible for reminder` };
      }

      const customerEmail = apt.customerEmail?.trim().toLowerCase();
      if (!customerEmail || !customerEmail.includes("@")) {
        return { success: false, error: "No customer email address on booking." };
      }

      const customerName = apt.customerName?.trim() || "Valued Client";
      const customerPhone = apt.customerPhone?.trim() || "";

      const aptDateStr = this.formatDate(apt.appointmentDate);
      const idempotencyKey = `REMINDER:${apt.id}:${aptDateStr}:${apt.startTime}`;

      const serviceNames: string[] = [];
      if (apt.appointmentServices && Array.isArray(apt.appointmentServices)) {
        for (const as of apt.appointmentServices) {
          if (as.service?.name) serviceNames.push(as.service.name);
        }
      }
      if (serviceNames.length === 0) serviceNames.push("Salon Reservation");

      const payload: AppointmentReminderEmailPayload = {
        appointmentId: apt.id,
        appointmentNumber: apt.appointmentNumber,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        serviceNames,
        packageName: (apt as any).package?.name || null,
        appointmentDate: aptDateStr,
        startTime: apt.startTime,
        salonAddress: BRAND_CONFIG.location.fullAddress,
        salonPhone: BRAND_CONFIG.contact.primaryPhone,
        googleMapsUrl: BRAND_CONFIG.location.googleMapsUrl,
      };

      const { subject, html, text } = renderAppointmentReminderEmail(payload);

      // Record in Outbox
      const { isDuplicate, emailLog } = await dbRepo.recordEmailEvent({
        appointmentId: apt.id,
        customerEmail,
        customerName,
        eventType: EmailEventType.APPOINTMENT_REMINDER,
        idempotencyKey,
        subject,
        bodyText: text,
        metadata: {
          appointmentDate: aptDateStr,
          startTime: apt.startTime,
        },
      });

      if (isDuplicate) {
        return {
          success: true,
          messageId: emailLog?.providerMessageId || "DUPLICATE_REMINDER_SUPPRESSED",
          simulated: true,
        };
      }

      // Dispatch Email
      const result = await resendClient.send({
        to: customerEmail,
        subject,
        html,
        text,
      });

      // Update Outbox Status
      await dbRepo.updateEmailLogStatus(emailLog.id, {
        deliveryStatus: result.success ? EmailDeliveryStatus.ACCEPTED : EmailDeliveryStatus.FAILED,
        providerMessageId: result.messageId || null,
        lastError: result.error || null,
        sentAt: result.success ? new Date() : null,
      });

      return result;
    } catch (err: any) {
      console.error("[SEND_APPOINTMENT_REMINDER_FAILED]", err);
      return { success: false, error: err.message };
    }
  }

  // ==========================================================================
  // 4. POST-SERVICE THANK YOU (Completed Trigger)
  // ==========================================================================
  async sendPostServiceThankYou(appointmentId: string): Promise<EmailSendResult> {
    try {
      const apt = await dbRepo.getAppointmentById(appointmentId);
      if (!apt) {
        return { success: false, error: `Appointment ${appointmentId} not found` };
      }

      // Verify status is COMPLETED
      if (apt.status !== "COMPLETED") {
        return { success: false, error: `Appointment status is ${apt.status}, expected COMPLETED` };
      }

      const customerEmail = apt.customerEmail?.trim().toLowerCase();
      if (!customerEmail || !customerEmail.includes("@")) {
        return { success: false, error: "No customer email address on booking." };
      }

      const customerName = apt.customerName?.trim() || "Valued Client";
      const customerPhone = apt.customerPhone?.trim() || "";

      const idempotencyKey = `THANK_YOU:${apt.id}`;

      const serviceNames: string[] = [];
      if (apt.appointmentServices && Array.isArray(apt.appointmentServices)) {
        for (const as of apt.appointmentServices) {
          if (as.service?.name) serviceNames.push(as.service.name);
        }
      }
      if (serviceNames.length === 0) serviceNames.push("Salon Service");

      const payload: PostServiceThankYouEmailPayload = {
        appointmentId: apt.id,
        appointmentNumber: apt.appointmentNumber,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        serviceNames,
        appointmentDate: this.formatDate(apt.appointmentDate),
        completionDate: new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        }).format(apt.completedAt || new Date()),
        totalPaid: apt.totalAmount || 0,
        remainingBalance: apt.remainingAmount || 0,
        salonPhone: BRAND_CONFIG.contact.primaryPhone,
      };

      const { subject, html, text } = renderPostServiceThankYouEmail(payload);

      // Record in Outbox
      const { isDuplicate, emailLog } = await dbRepo.recordEmailEvent({
        appointmentId: apt.id,
        customerEmail,
        customerName,
        eventType: EmailEventType.POST_SERVICE_THANK_YOU,
        idempotencyKey,
        subject,
        bodyText: text,
        metadata: {
          completedAt: apt.completedAt || new Date().toISOString(),
        },
      });

      if (isDuplicate) {
        return {
          success: true,
          messageId: emailLog?.providerMessageId || "DUPLICATE_THANK_YOU_SUPPRESSED",
          simulated: true,
        };
      }

      // Dispatch Email
      const result = await resendClient.send({
        to: customerEmail,
        subject,
        html,
        text,
      });

      // Update Outbox Status
      await dbRepo.updateEmailLogStatus(emailLog.id, {
        deliveryStatus: result.success ? EmailDeliveryStatus.ACCEPTED : EmailDeliveryStatus.FAILED,
        providerMessageId: result.messageId || null,
        lastError: result.error || null,
        sentAt: result.success ? new Date() : null,
      });

      return result;
    } catch (err: any) {
      console.error("[SEND_POST_SERVICE_THANK_YOU_FAILED]", err);
      return { success: false, error: err.message };
    }
  }

  // ==========================================================================
  // 5. SCHEDULED REMINDERS CRON RUNNER
  // ==========================================================================
  async processScheduledReminders(windowMinutes: number = 75): Promise<{
    eligibleCount: number;
    sentCount: number;
    skippedCount: number;
    errors: string[];
  }> {
    const eligibleAppointments = await dbRepo.getEligibleAppointmentsForReminder(windowMinutes);
    let sentCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const apt of eligibleAppointments) {
      try {
        const result = await this.sendAppointmentReminder(apt.id);
        if (result.success) {
          sentCount++;
        } else {
          skippedCount++;
          if (result.error) errors.push(`${apt.appointmentNumber}: ${result.error}`);
        }
      } catch (err: any) {
        skippedCount++;
        errors.push(`${apt.appointmentNumber}: ${err.message}`);
      }
    }

    return {
      eligibleCount: eligibleAppointments.length,
      sentCount,
      skippedCount,
      errors,
    };
  }

  // ==========================================================================
  // 6. RETRY FAILED EMAIL EVENT
  // ==========================================================================
  async retryFailedEmail(emailLogId: string): Promise<EmailSendResult> {
    try {
      const log = await dbRepo.getEmailLogById(emailLogId);
      if (!log) {
        return { success: false, error: "Email log not found" };
      }

      if (!log.appointmentId) {
        return { success: false, error: "Cannot retry email with no associated appointment" };
      }

      // Re-trigger according to event type
      switch (log.eventType) {
        case EmailEventType.BOOKING_CONFIRMATION:
          return await this.sendBookingConfirmation(log.appointmentId);
        case EmailEventType.PAYMENT_RECEIPT:
          return await this.sendPaymentReceipt({
            appointmentId: log.appointmentId,
            transactionId: log.paymentRecordId || undefined,
            offlinePaymentId: log.offlinePaymentId || undefined,
          });
        case EmailEventType.APPOINTMENT_REMINDER:
          return await this.sendAppointmentReminder(log.appointmentId);
        case EmailEventType.POST_SERVICE_THANK_YOU:
          return await this.sendPostServiceThankYou(log.appointmentId);
        default:
          return { success: false, error: `Unknown event type ${log.eventType}` };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ==========================================================================
  // 7. ADMIN CONTACT ENQUIRY NOTIFICATION
  // ==========================================================================
  async sendAdminEnquiryNotification(enquiry: any): Promise<EmailSendResult> {
    try {
      if (!enquiry) {
        return { success: false, error: "Enquiry data is missing" };
      }

      const adminRecipient =
        process.env.CONTACT_NOTIFICATION_EMAIL?.trim() ||
        process.env.ADMIN_EMAIL?.trim() ||
        BRAND_CONFIG.contact.email ||
        "support@thejawedhabibsalons.in";

      const createdAt = enquiry.createdAt ? new Date(enquiry.createdAt) : new Date();
      const submissionDate = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(createdAt);

      const submissionTime = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(createdAt);

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.APP_URL ||
        "https://www.thejawedhabibsalons.in";

      const { subject, html, text } = renderAdminEnquiryNotificationEmail({
        enquiryId: enquiry.id,
        enquiryNumber: enquiry.enquiryNumber || enquiry.id,
        customerName: enquiry.name,
        mobileNumber: enquiry.phone,
        email: enquiry.email || null,
        serviceInterest: enquiry.serviceInterest || "General Inquiry",
        message: enquiry.message,
        submissionDate,
        submissionTime,
        status: enquiry.status || "NEW",
        source: enquiry.source || enquiry.type || "Website Contact Form",
        adminPortalUrl: `${appUrl}/admin/enquiries`,
        salonPhone: BRAND_CONFIG.contact.phones[0] || "7707000463",
      });

      const res = await resendClient.send({
        to: adminRecipient,
        subject,
        html,
        text,
      });

      return res;
    } catch (err: any) {
      console.error("[ENQUIRY_EMAIL_NOTIFICATION_FAILED]:", err.message || err);
      return { success: false, error: err.message || "Failed to dispatch enquiry notification" };
    }
  }
}

export const emailService = new EmailNotificationService();
export default emailService;
