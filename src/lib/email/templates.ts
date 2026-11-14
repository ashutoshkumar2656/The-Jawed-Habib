/**
 * Transactional Email Templates (Responsive HTML & Plain-Text)
 * The Jawed Habib Salon – Lalganj
 * Luxury Black & Champagne Gold Brand Theme
 */

import { BRAND_CONFIG } from "@/lib/constants/brand";
import type {
  BookingConfirmationEmailPayload,
  PaymentReceiptEmailPayload,
  AppointmentReminderEmailPayload,
  PostServiceThankYouEmailPayload,
  AdminEnquiryNotificationPayload,
} from "./types";

/**
 * Escape HTML special characters to prevent HTML/XSS injection in emails
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Standard Luxury Email Container Wrapper
 */
function emailLayout(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0b0b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #f7f4ee;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .email-container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #111111;
      border: 1px solid #2a251e;
      border-radius: 8px;
      overflow: hidden;
    }
    .gold-text {
      color: #c6a56b;
    }
    .muted-text {
      color: #999999;
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #0b0b0b; color: #f7f4ee;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0b0b0b;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #111111; border: 1px solid #2a251e; border-radius: 8px; overflow: hidden; margin: 0 auto;">
          
          <!-- Brand Header -->
          <tr>
            <td style="padding: 32px 28px 24px; text-align: center; border-bottom: 1px solid #24201a; background: linear-gradient(180deg, #181512 0%, #111111 100%);">
              <div style="font-family: Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #c6a56b; margin-bottom: 4px;">
                THE JAWED HABIB
              </div>
              <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #dfca9e; font-weight: 600;">
                SALON &bull; LALGANJ, BIHAR
              </div>
            </td>
          </tr>

          <!-- Dynamic Content Body -->
          <tr>
            <td style="padding: 32px 28px 28px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Salon Signature & Contact Footer -->
          <tr>
            <td style="padding: 24px 28px 28px; background-color: #0d0d0d; border-top: 1px solid #24201a; text-align: center; font-size: 12px; color: #888888; line-height: 1.6;">
              <p style="margin: 0 0 8px; color: #dfca9e; font-weight: 600;">
                ${escapeHtml(BRAND_CONFIG.fullName)} &bull; Lalganj Branch
              </p>
              <p style="margin: 0 0 8px; color: #999999;">
                1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opp. Manglam Mart, Lalganj, Bihar &ndash; 844121
              </p>
              <p style="margin: 0 0 12px; color: #cccccc;">
                Concierge Phone: <a href="tel:+91${BRAND_CONFIG.contact.primaryPhone}" style="color: #c6a56b; text-decoration: none;">+91 ${BRAND_CONFIG.contact.primaryPhone}</a> | 
                <a href="tel:+91${BRAND_CONFIG.contact.secondaryPhone}" style="color: #c6a56b; text-decoration: none;">+91 ${BRAND_CONFIG.contact.secondaryPhone}</a>
              </p>
              <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #1a1815; font-size: 11px; color: #666666;">
                Hours: 10:00 AM &ndash; 10:00 PM (All 7 Days) &bull; Official Digital Booking & Notifications
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// 1. BOOKING CONFIRMATION EMAIL
// ============================================================================

export function renderBookingConfirmationEmail(payload: BookingConfirmationEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Your Appointment is Booked – The Jawed Habib Salon, Lalganj";

  let statusBadgeColor = "#c6a56b";
  let statusBadgeBg = "#261e12";
  let paymentNoticeHtml = "";
  let paymentNoticeText = "";

  if (payload.paymentScenario === "ADVANCE_PAID") {
    statusBadgeColor = "#34d399";
    statusBadgeBg = "#064e3b";
    paymentNoticeHtml = `
      <div style="background-color: #064e3b22; border: 1px solid #05966955; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px;">
        <div style="font-weight: 600; color: #34d399; font-size: 13px; margin-bottom: 4px;">
          &#10003; Advance Payment Confirmed
        </div>
        <div style="font-size: 12px; color: #d1fae5; line-height: 1.5;">
          Your advance deposit of <strong>${formatCurrency(payload.amountPaid)}</strong> has been verified and securely captured. Your scheduled slot is locked in. The remaining balance of <strong>${formatCurrency(payload.remainingBalance)}</strong> can be paid at the salon counter after your service.
        </div>
      </div>
    `;
    paymentNoticeText = `Payment Confirmed: Advance deposit of ${formatCurrency(payload.amountPaid)} has been received and verified. Remaining balance of ${formatCurrency(payload.remainingBalance)} is payable at the salon counter.`;
  } else if (payload.paymentScenario === "PAY_AT_SALON") {
    statusBadgeColor = "#60a5fa";
    statusBadgeBg = "#1e3a5f";
    paymentNoticeHtml = `
      <div style="background-color: #1e3a5f22; border: 1px solid #3b82f655; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px;">
        <div style="font-weight: 600; color: #93c5fd; font-size: 13px; margin-bottom: 4px;">
          &#9432; Pay at Salon Counter Option Selected
        </div>
        <div style="font-size: 12px; color: #dbeafe; line-height: 1.5;">
          Your appointment request has been accepted. You can complete the full payment of <strong>${formatCurrency(payload.totalServiceAmount)}</strong> via Cash, UPI, or Card at our reception desk upon arrival.
        </div>
      </div>
    `;
    paymentNoticeText = `Payment Option: Pay at Salon Counter. Total amount of ${formatCurrency(payload.totalServiceAmount)} is payable at the counter upon arrival.`;
  } else {
    // PAYMENT_PENDING
    statusBadgeColor = "#fbbf24";
    statusBadgeBg = "#3d2e07";
    paymentNoticeHtml = `
      <div style="background-color: #3d2e0733; border: 1px solid #d9770655; border-radius: 6px; padding: 14px 18px; margin-bottom: 24px;">
        <div style="font-weight: 600; color: #fde68a; font-size: 13px; margin-bottom: 4px;">
          &#9888; Advance Payment Pending
        </div>
        <div style="font-size: 12px; color: #fef3c7; line-height: 1.5;">
          Your booking request has been received. If you were in the middle of online checkout, you may complete your advance payment via our salon concierge or complete payment at our counter upon arrival.
        </div>
      </div>
    `;
    paymentNoticeText = `Payment Status: Pending advance payment. You may settle this with our concierge or at the salon counter.`;
  }

  const servicesDisplay = payload.serviceNames.join(", ");
  const packageDisplay = payload.packageName ? `<div style="font-size: 13px; color: #dfca9e; margin-top: 3px;">Package: ${escapeHtml(payload.packageName)}</div>` : "";
  const addonsDisplay = payload.addons && payload.addons.length > 0 ? `<div style="font-size: 12px; color: #888888; margin-top: 3px;">Add-ons: ${escapeHtml(payload.addons.join(", "))}</div>` : "";

  const contentHtml = `
    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 600; color: #ffffff; margin: 0 0 8px;">
      Appointment Request Received
    </h1>
    <p style="font-size: 14px; color: #cccccc; margin: 0 0 20px; line-height: 1.6;">
      Dear <strong style="color: #ffffff;">${escapeHtml(payload.customer.name)}</strong>,<br>
      Thank you for choosing <strong>The Jawed Habib Salon &ndash; Lalganj</strong>. We are delighted to receive your appointment request.
    </p>

    ${paymentNoticeHtml}

    <div style="background-color: #171512; border: 1px solid #2a251e; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #26221c; padding-bottom: 12px; margin-bottom: 14px;">
        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Booking Reference</span>
        <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #c6a56b;">${escapeHtml(payload.appointmentNumber)}</span>
      </div>

      <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13px; line-height: 1.6;">
        <tr>
          <td width="38%" style="color: #888888;">Customer Name</td>
          <td style="color: #ffffff; font-weight: 600;">${escapeHtml(payload.customer.name)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Registered Phone</td>
          <td style="color: #ffffff;">+91 ${escapeHtml(payload.customer.phone)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Selected Service(s)</td>
          <td style="color: #ffffff;">
            ${escapeHtml(servicesDisplay)}
            ${packageDisplay}
            ${addonsDisplay}
          </td>
        </tr>
        <tr>
          <td style="color: #888888;">Appointment Date</td>
          <td style="color: #ffffff; font-weight: 600;">${escapeHtml(payload.appointmentDate)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Scheduled Time</td>
          <td style="color: #ffffff; font-weight: 600;">${escapeHtml(payload.startTime)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Salon Address</td>
          <td style="color: #cccccc; font-size: 12px;">${escapeHtml(payload.salonAddress)}</td>
        </tr>
      </table>
    </div>

    <!-- Financial Breakdown -->
    <div style="background-color: #151310; border: 1px solid #24201a; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #c6a56b; font-weight: 700; margin-bottom: 12px;">
        Financial Summary
      </div>
      <table width="100%" cellpadding="4" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td style="color: #888888;">Total Service Amount</td>
          <td align="right" style="color: #ffffff; font-weight: 600;">${formatCurrency(payload.totalServiceAmount)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Advance Payment Required</td>
          <td align="right" style="color: #cccccc;">${formatCurrency(payload.advancePaymentRequired)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Amount Paid So Far</td>
          <td align="right" style="color: #34d399; font-weight: 600;">${formatCurrency(payload.amountPaid)}</td>
        </tr>
        <tr style="border-top: 1px solid #26221c;">
          <td style="padding-top: 8px; color: #dfca9e; font-weight: 600;">Remaining Balance at Salon</td>
          <td align="right" style="padding-top: 8px; color: #dfca9e; font-weight: 700; font-size: 15px;">${formatCurrency(payload.remainingBalance)}</td>
        </tr>
      </table>
    </div>

    <div style="font-size: 13px; color: #cccccc; line-height: 1.6; margin-bottom: 16px;">
      <strong>Note:</strong> We recommend arriving <strong>15 minutes prior</strong> to your reservation time so our team can provide your consultation and service smoothly.
    </div>
  `;

  const text = `Dear ${payload.customer.name},

Thank you for choosing The Jawed Habib Salon – Lalganj.
Your appointment request has been successfully received.

Your Booking Details:
- Booking Reference: ${payload.appointmentNumber}
- Customer Name: ${payload.customer.name}
- Phone: +91 ${payload.customer.phone}
- Selected Service: ${servicesDisplay}${payload.packageName ? `\n- Package: ${payload.packageName}` : ""}
- Appointment Date: ${payload.appointmentDate}
- Appointment Time: ${payload.startTime}
- Salon Address: ${payload.salonAddress}

Financial Summary:
- Total Service Amount: ${formatCurrency(payload.totalServiceAmount)}
- Advance Payment Required: ${formatCurrency(payload.advancePaymentRequired)}
- Amount Paid: ${formatCurrency(payload.amountPaid)}
- Remaining Balance: ${formatCurrency(payload.remainingBalance)}
- Booking Status: ${payload.bookingStatus}
- Payment Status: ${payload.paymentStatus}

${paymentNoticeText}

We recommend arriving 15 minutes before your scheduled appointment.
For queries or modifications, please call +91 ${payload.salonPhone}.

The Jawed Habib Salon – Lalganj
1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opp. Manglam Mart, Lalganj, Bihar – 844121`;

  return { subject, html: emailLayout(subject, contentHtml), text };
}


export function renderPaymentReceiptEmail(payload: PaymentReceiptEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Payment Receipt – The Jawed Habib Salon – ${payload.appointmentNumber}`;

  const contentHtml = `
    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 600; color: #ffffff; margin: 0 0 6px;">
      Official Payment Receipt
    </h1>
    <p style="font-size: 13px; color: #dfca9e; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 20px;">
      Receipt Ref: ${escapeHtml(payload.receiptNumber)}
    </p>

    <p style="font-size: 14px; color: #cccccc; margin: 0 0 20px; line-height: 1.6;">
      Dear <strong style="color: #ffffff;">${escapeHtml(payload.customer.name)}</strong>,<br>
      Thank you for your payment. Your transaction has been successfully verified and recorded. An official tax invoice PDF has been generated and attached to this email for your records.
    </p>

    <!-- Payment Highlight Box -->
    <div style="background: linear-gradient(135deg, #1f1b14 0%, #171511 100%); border: 1px solid #3d3323; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #c6a56b; margin-bottom: 4px;">
        Amount Paid in This Transaction
      </div>
      <div style="font-size: 32px; font-weight: 700; color: #34d399; font-family: -apple-system, sans-serif;">
        ${formatCurrency(payload.amountPaidInThisTransaction)}
      </div>
      <div style="font-size: 12px; color: #aaaaaa; margin-top: 4px;">
        Method: <strong>${escapeHtml(payload.paymentMethod)}</strong> &bull; ${escapeHtml(payload.paymentDate)}
      </div>
    </div>

    <!-- Details Table -->
    <div style="background-color: #171512; border: 1px solid #2a251e; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
      <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td width="40%" style="color: #888888;">Receipt Number</td>
          <td style="color: #ffffff; font-family: monospace; font-weight: 700;">${escapeHtml(payload.receiptNumber)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Booking Reference</td>
          <td style="color: #c6a56b; font-family: monospace; font-weight: 700;">${escapeHtml(payload.appointmentNumber)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Customer Name</td>
          <td style="color: #ffffff; font-weight: 600;">${escapeHtml(payload.customer.name)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Customer Email</td>
          <td style="color: #cccccc;">${escapeHtml(payload.customer.email)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Transaction Reference</td>
          <td style="color: #ffffff; font-family: monospace; font-size: 12px;">${escapeHtml(payload.transactionReference)}</td>
        </tr>
        ${
          payload.razorpayPaymentId
            ? `<tr>
                <td style="color: #888888;">Razorpay Payment ID</td>
                <td style="color: #34d399; font-family: monospace; font-size: 12px;">${escapeHtml(payload.razorpayPaymentId)}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="color: #888888;">Service Description</td>
          <td style="color: #ffffff;">${escapeHtml(payload.serviceDescription)}</td>
        </tr>
      </table>
    </div>

    <!-- Balance Breakdown -->
    <div style="background-color: #151310; border: 1px solid #24201a; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #c6a56b; font-weight: 700; margin-bottom: 12px;">
        Statement Breakdown
      </div>
      <table width="100%" cellpadding="5" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td style="color: #888888;">Total Service Amount</td>
          <td align="right" style="color: #ffffff; font-weight: 600;">${formatCurrency(payload.totalServiceAmount)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Amount Paid This Transaction</td>
          <td align="right" style="color: #34d399; font-weight: 600;">${formatCurrency(payload.amountPaidInThisTransaction)}</td>
        </tr>
        ${
          payload.previouslyPaidAmount > 0
            ? `<tr>
                <td style="color: #888888;">Previously Paid</td>
                <td align="right" style="color: #aaaaaa;">${formatCurrency(payload.previouslyPaidAmount)}</td>
              </tr>`
            : ""
        }
        <tr style="border-top: 1px solid #26221c;">
          <td style="padding-top: 8px; color: #dfca9e; font-weight: 600;">Remaining Balance</td>
          <td align="right" style="padding-top: 8px; color: ${payload.remainingBalance > 0 ? "#fbbf24" : "#34d399"}; font-weight: 700; font-size: 15px;">
            ${formatCurrency(payload.remainingBalance)}
          </td>
        </tr>
        <tr>
          <td style="color: #888888;">Payment Status</td>
          <td align="right" style="color: #c6a56b; font-weight: 600;">${escapeHtml(payload.paymentStatus)}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #999999; line-height: 1.6; margin: 0;">
      A PDF receipt copy is attached to this email. You may also present this email or receipt number at the salon counter upon arrival.
    </p>
  `;

  const text = `Payment Receipt – The Jawed Habib Salon – ${payload.appointmentNumber}

Dear ${payload.customer.name},

Thank you for your payment. Your transaction has been successfully verified and recorded.

Receipt Details:
- Receipt Number: ${payload.receiptNumber}
- Booking Reference: ${payload.appointmentNumber}
- Customer Name: ${payload.customer.name}
- Customer Email: ${payload.customer.email}
- Payment Date & Time: ${payload.paymentDate}
- Payment Method: ${payload.paymentMethod}
- Transaction Reference: ${payload.transactionReference}
${payload.razorpayPaymentId ? `- Razorpay Payment ID: ${payload.razorpayPaymentId}\n` : ""}- Service Description: ${payload.serviceDescription}

Statement Breakdown:
- Total Service Amount: ${formatCurrency(payload.totalServiceAmount)}
- Amount Paid in This Transaction: ${formatCurrency(payload.amountPaidInThisTransaction)}
${payload.previouslyPaidAmount > 0 ? `- Previously Paid: ${formatCurrency(payload.previouslyPaidAmount)}\n` : ""}- Remaining Balance: ${formatCurrency(payload.remainingBalance)}
- Current Payment Status: ${payload.paymentStatus}

An official PDF receipt has been generated and attached to this email.

The Jawed Habib Salon – Lalganj
1st Floor, Tinpulwa Chowk, Lalganj, Bihar – 844121`;

  return { subject, html: emailLayout(subject, contentHtml), text };
}


export function renderAppointmentReminderEmail(payload: AppointmentReminderEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Appointment Reminder – Your Salon Visit is Today!";

  const servicesDisplay = payload.serviceNames.join(", ");

  const contentHtml = `
    <div style="background-color: #231b10; border: 1px solid #5a421b; border-radius: 6px; padding: 12px 18px; margin-bottom: 20px; text-align: center;">
      <span style="font-size: 12px; font-weight: 700; color: #dfca9e; letter-spacing: 2px; text-transform: uppercase;">
        TODAY'S RESERVATION &bull; SCHEDULED VISIT
      </span>
    </div>

    <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: 600; color: #ffffff; margin: 0 0 10px;">
      We're Getting Ready for Your Visit!
    </h1>
    <p style="font-size: 14px; color: #cccccc; margin: 0 0 20px; line-height: 1.6;">
      Dear <strong style="color: #ffffff;">${escapeHtml(payload.customer.name)}</strong>,<br>
      This is a friendly reminder that your appointment at <strong>The Jawed Habib Salon &ndash; Lalganj</strong> is scheduled for today.
    </p>

    <!-- Appointment Highlight -->
    <div style="background-color: #171512; border: 1px solid #2a251e; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
      <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td width="38%" style="color: #888888;">Booking Reference</td>
          <td style="color: #c6a56b; font-family: monospace; font-weight: 700; font-size: 14px;">${escapeHtml(payload.appointmentNumber)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Service Scheduled</td>
          <td style="color: #ffffff; font-weight: 600;">
            ${escapeHtml(servicesDisplay)}
            ${payload.packageName ? `<div style="color: #dfca9e; font-size: 12px; margin-top: 2px;">${escapeHtml(payload.packageName)}</div>` : ""}
          </td>
        </tr>
        <tr>
          <td style="color: #888888;">Appointment Date</td>
          <td style="color: #ffffff; font-weight: 600;">${escapeHtml(payload.appointmentDate)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Scheduled Time</td>
          <td style="color: #34d399; font-weight: 700; font-size: 15px;">${escapeHtml(payload.startTime)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Salon Address</td>
          <td style="color: #cccccc; font-size: 12px;">${escapeHtml(payload.salonAddress)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Contact Number</td>
          <td style="color: #ffffff;">+91 ${escapeHtml(payload.salonPhone)}</td>
        </tr>
      </table>
    </div>

    <!-- Critical Arrival Notice -->
    <div style="background: linear-gradient(135deg, #1c1810 0%, #15120c 100%); border-left: 4px solid #c6a56b; border-radius: 4px; padding: 16px 20px; margin-bottom: 24px;">
      <div style="font-weight: 700; color: #dfca9e; font-size: 13px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">
        Important Arrival Notice
      </div>
      <div style="font-size: 13px; color: #ffffff; line-height: 1.6;">
        &ldquo;We recommend arriving <strong>15 minutes before</strong> your scheduled appointment so our team can prepare and provide your service on time.&rdquo;
      </div>
    </div>

    <!-- Quick Actions -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${escapeHtml(payload.googleMapsUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #c6a56b; color: #111111; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 4px; text-decoration: none; letter-spacing: 0.5px; margin-right: 8px;">
        Open Google Maps Directions &rarr;
      </a>
      <a href="tel:+91${escapeHtml(payload.salonPhone)}" style="display: inline-block; background-color: #24201a; color: #f7f4ee; border: 1px solid #3d3323; font-weight: 600; font-size: 13px; padding: 12px 20px; border-radius: 4px; text-decoration: none;">
        Call Salon: +91 ${escapeHtml(payload.salonPhone)}
      </a>
    </div>
  `;

  const text = `Appointment Reminder – Your Salon Visit is Today!

Dear ${payload.customer.name},

This is a friendly reminder that your appointment at The Jawed Habib Salon – Lalganj is scheduled for today.

Appointment Details:
- Booking Reference: ${payload.appointmentNumber}
- Service Name: ${servicesDisplay}${payload.packageName ? ` (${payload.packageName})` : ""}
- Appointment Date: ${payload.appointmentDate}
- Appointment Time: ${payload.startTime}
- Salon Address: ${payload.salonAddress}
- Contact Number: +91 ${payload.salonPhone}

IMPORTANT ARRIVAL MESSAGE:
"We recommend arriving 15 minutes before your scheduled appointment so our team can prepare and provide your service on time."

Salon Directions:
${payload.googleMapsUrl}

Need to speak with us? Call +91 ${payload.salonPhone}.

The Jawed Habib Salon – Lalganj`;

  return { subject, html: emailLayout(subject, contentHtml), text };
}


export function renderPostServiceThankYouEmail(payload: PostServiceThankYouEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Thank You for Visiting – The Jawed Habib Salon, Lalganj";

  const servicesDisplay = payload.serviceNames.join(", ");

  const contentHtml = `
    <div style="text-align: center; padding: 10px 0 20px;">
      <div style="font-size: 32px; color: #c6a56b; margin-bottom: 8px;">&#10022;</div>
      <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 600; color: #ffffff; margin: 0 0 10px;">
        Thank You for Visiting Us!
      </h1>
      <p style="font-size: 13px; color: #dfca9e; letter-spacing: 2px; text-transform: uppercase; margin: 0;">
        The Jawed Habib Salon &bull; Lalganj
      </p>
    </div>

    <p style="font-size: 14px; color: #cccccc; margin: 0 0 20px; line-height: 1.7;">
      Dear <strong style="color: #ffffff;">${escapeHtml(payload.customer.name)}</strong>,<br>
      Thank you for visiting <strong>The Jawed Habib Salon &ndash; Lalganj</strong>. We truly appreciate your trust in our salon and hope you enjoyed your luxury experience with our creative team.
    </p>

    <!-- Visit Details Summary -->
    <div style="background-color: #171512; border: 1px solid #2a251e; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #c6a56b; font-weight: 700; margin-bottom: 12px;">
        Salon Visit Record
      </div>
      <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13px;">
        <tr>
          <td width="38%" style="color: #888888;">Customer Name</td>
          <td style="color: #ffffff; font-weight: 600;">${escapeHtml(payload.customer.name)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Booking Reference</td>
          <td style="color: #c6a56b; font-family: monospace; font-weight: 700;">${escapeHtml(payload.appointmentNumber)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Service Provided</td>
          <td style="color: #ffffff;">${escapeHtml(servicesDisplay)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Appointment Date</td>
          <td style="color: #cccccc;">${escapeHtml(payload.appointmentDate)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Service Completed</td>
          <td style="color: #34d399; font-weight: 600;">${escapeHtml(payload.completionDate)}</td>
        </tr>
        <tr>
          <td style="color: #888888;">Total Settle Amount</td>
          <td style="color: #ffffff; font-weight: 600;">${formatCurrency(payload.totalPaid)}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #14120f; border: 1px solid #24201a; border-radius: 6px; padding: 18px 20px; text-align: center; margin-bottom: 24px;">
      <p style="font-family: Georgia, serif; font-size: 16px; color: #f7f4ee; font-style: italic; margin: 0 0 10px;">
        &ldquo;We look forward to welcoming you again!&rdquo;
      </p>
      <p style="font-size: 12px; color: #999999; margin: 0;">
        Follow our latest transformations, trends, and seasonal packages on Instagram:
        <br>
        <a href="https://www.instagram.com/the_jawedhabib_lalganj/" target="_blank" rel="noopener noreferrer" style="color: #c6a56b; text-decoration: none; font-weight: 600;">
          @the_jawedhabib_lalganj
        </a>
      </p>
    </div>
  `;

  const text = `Dear ${payload.customer.name},

Thank you for visiting The Jawed Habib Salon – Lalganj.
We truly appreciate your trust in our salon and hope you enjoyed your experience with our team.

Visit Summary:
- Customer Name: ${payload.customer.name}
- Booking Reference: ${payload.appointmentNumber}
- Service Provided: ${servicesDisplay}
- Appointment Date: ${payload.appointmentDate}
- Service Completion Date: ${payload.completionDate}
- Total Settled: ${formatCurrency(payload.totalPaid)}

We look forward to welcoming you again!

For appointments and enquiries:
Phone: +91 ${payload.salonPhone}
Address: 1st Floor, Tinpulwa Chowk, Lalganj, Bihar – 844121
Instagram: https://www.instagram.com/the_jawedhabib_lalganj/

The Jawed Habib Salon – Lalganj`;

  return { subject, html: emailLayout(subject, contentHtml), text };
}


// ============================================================================
export function renderAdminEnquiryNotificationEmail(
  payload: AdminEnquiryNotificationPayload
): { subject: string; html: string; text: string } {
  const subject = `New Website Enquiry Received – The Jawed Habib Salon, Lalganj`;
  const rawPhone = payload.mobileNumber || (payload as any).phone || "";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const customerName = payload.customerName || (payload as any).name || "Valued Client";
  const serviceInterest = payload.serviceInterest || "General Inquiry";
  const enquiryRef = payload.enquiryNumber || payload.enquiryId || (payload as any).id || "ENQ-NEW";
  const source = payload.source || (payload as any).type || "Website Contact Form";
  const status = payload.status || "NEW";
  const submissionDate = payload.submissionDate || "Today";
  const submissionTime = payload.submissionTime || "";
  const adminPortalUrl = payload.adminPortalUrl || "https://www.thejawedhabibsalons.in/admin/enquiries";
  const waUrl = `https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
    customerName
  )},%20this%20is%20The%20Jawed%20Habib%20Salon,%20Lalganj.%20We%20received%20your%20inquiry%20regarding%20${encodeURIComponent(
    serviceInterest
  )}.`;

  const contentHtml = `
    <div style="margin-bottom: 24px; text-align: center;">
      <span style="display: inline-block; background-color: #241c10; color: #c6a56b; border: 1px solid #c6a56b; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px;">
        New Inbound Lead
      </span>
      <h2 style="font-family: Georgia, serif; font-size: 22px; color: #ffffff; margin: 16px 0 6px; font-weight: 700;">
        New Website Enquiry Received
      </h2>
      <p style="font-size: 13px; color: #b3b3b3; margin: 0;">
        A customer has submitted an online query through the salon contact portal.
      </p>
    </div>

    <!-- Lead Key Highlights Card -->
    <div style="background-color: #14120f; border: 1px solid #24201a; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #8e8e93; font-size: 12px; width: 40%;">Reference ID:</td>
          <td style="padding: 6px 0; color: #c6a56b; font-family: monospace; font-size: 13px; font-weight: 700;">
            ${escapeHtml(enquiryRef)}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #8e8e93; font-size: 12px;">Customer Name:</td>
          <td style="padding: 6px 0; color: #ffffff; font-size: 13px; font-weight: 600;">
            ${escapeHtml(customerName)}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #8e8e93; font-size: 12px;">Mobile Phone:</td>
          <td style="padding: 6px 0; color: #c6a56b; font-family: monospace; font-size: 13px; font-weight: 700;">
            <a href="tel:+91${cleanPhone}" style="color: #c6a56b; text-decoration: none;">+91 ${escapeHtml(cleanPhone)}</a>
          </td>
        </tr>
        ${
          payload.email
            ? `<tr>
          <td style="padding: 6px 0; color: #8e8e93; font-size: 12px;">Customer Email:</td>
          <td style="padding: 6px 0; color: #ffffff; font-size: 13px;">
            <a href="mailto:${escapeHtml(payload.email)}" style="color: #ffffff; text-decoration: none;">${escapeHtml(payload.email)}</a>
          </td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding: 6px 0; color: #8e8e93; font-size: 12px;">Service Interest:</td>
          <td style="padding: 6px 0; color: #ffffff; font-size: 13px; font-weight: 600;">
            ${escapeHtml(serviceInterest)}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #8e8e93; font-size: 12px;">Submission Date:</td>
          <td style="padding: 6px 0; color: #ffffff; font-size: 13px;">
            ${escapeHtml(submissionDate)} at ${escapeHtml(submissionTime)} (IST)
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #8e8e93; font-size: 12px;">Lead Status:</td>
          <td style="padding: 6px 0; color: #34d399; font-size: 12px; font-weight: 700;">
            ${escapeHtml(status)}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #8e8e93; font-size: 12px;">Submission Source:</td>
          <td style="padding: 6px 0; color: #9ca3af; font-size: 12px;">
            ${escapeHtml(source)}
          </td>
        </tr>
      </table>
    </div>

    <!-- Complete Customer Message -->
    <div style="background-color: #0b0b0b; border: 1px solid #c6a56b; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
      <h3 style="font-size: 12px; color: #c6a56b; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 10px; font-weight: 700;">
        Customer Message Content
      </h3>
      <p style="font-size: 13px; color: #f7f4ee; line-height: 1.6; margin: 0; white-space: pre-wrap;">
        ${escapeHtml(payload.message)}
      </p>
    </div>

    <!-- Quick Action Buttons -->
    <div style="text-align: center; margin: 28px 0 16px;">
      <table style="margin: 0 auto; border-collapse: separate; border-spacing: 10px;">
        <tr>
          <td>
            <a href="tel:+91${cleanPhone}" style="display: inline-block; background-color: #c6a56b; color: #0b0b0b; font-weight: 700; font-size: 12px; text-decoration: none; padding: 10px 18px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
              Call Customer
            </a>
          </td>
          <td>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #064e3b; color: #34d399; border: 1px solid #059669; font-weight: 700; font-size: 12px; text-decoration: none; padding: 10px 18px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
              Open WhatsApp
            </a>
          </td>
          <td>
            <a href="${escapeHtml(adminPortalUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; border: 1px solid #333333; font-weight: 600; font-size: 12px; text-decoration: none; padding: 10px 18px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
              Admin Portal
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = `New Website Enquiry Received – The Jawed Habib Salon, Lalganj

Reference ID: ${payload.enquiryNumber}
Customer Name: ${payload.customerName}
Mobile Number: +91 ${cleanPhone}
${payload.email ? `Customer Email: ${payload.email}\n` : ""}Service Interest: ${payload.serviceInterest}
Submission Date: ${payload.submissionDate} at ${payload.submissionTime} (IST)
Status: ${payload.status}
Source: ${payload.source}

Customer Message:
"${payload.message}"

Quick Contact:
- Phone: tel:+91${cleanPhone}
- WhatsApp: ${waUrl}
- Admin Portal: ${payload.adminPortalUrl}

The Jawed Habib Salon – Lalganj`;

  return { subject, html: emailLayout(subject, contentHtml), text };
}
