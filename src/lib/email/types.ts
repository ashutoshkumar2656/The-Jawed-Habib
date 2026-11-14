/**
 * Transactional Email Notification System Types
 * The Jawed Habib Salon – Lalganj
 */

export type EmailEventType =
  | "BOOKING_CONFIRMATION"
  | "PAYMENT_RECEIPT"
  | "APPOINTMENT_REMINDER"
  | "POST_SERVICE_THANK_YOU";

export type EmailDeliveryStatus = "PENDING" | "ACCEPTED" | "SENT" | "FAILED";

export interface EmailCustomerSnapshot {
  name: string;
  email: string;
  phone: string;
}

export interface BookingConfirmationEmailPayload {
  appointmentId: string;
  appointmentNumber: string;
  customer: EmailCustomerSnapshot;
  serviceNames: string[];
  packageName?: string | null;
  addons?: string[];
  appointmentDate: string; // YYYY-MM-DD or formatted
  startTime: string;
  salonAddress: string;
  salonPhone: string;
  totalServiceAmount: number;
  advancePaymentRequired: number;
  amountPaid: number;
  remainingBalance: number;
  bookingStatus: string;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "REFUNDED";
  paymentScenario: "ADVANCE_PAID" | "PAYMENT_PENDING" | "PAY_AT_SALON";
}

export interface PaymentReceiptEmailPayload {
  receiptNumber: string;
  appointmentId: string;
  appointmentNumber: string;
  customer: EmailCustomerSnapshot;
  paymentDate: string;
  paymentMethod: string;
  transactionReference: string;
  razorpayPaymentId?: string | null;
  serviceDescription: string;
  totalServiceAmount: number;
  amountPaidInThisTransaction: number;
  previouslyPaidAmount: number;
  remainingBalance: number;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  pdfBuffer?: Buffer;
}

export interface AppointmentReminderEmailPayload {
  appointmentId: string;
  appointmentNumber: string;
  customer: EmailCustomerSnapshot;
  serviceNames: string[];
  packageName?: string | null;
  appointmentDate: string;
  startTime: string;
  salonAddress: string;
  salonPhone: string;
  googleMapsUrl: string;
}

export interface PostServiceThankYouEmailPayload {
  appointmentId: string;
  appointmentNumber: string;
  customer: EmailCustomerSnapshot;
  serviceNames: string[];
  appointmentDate: string;
  completionDate: string;
  totalPaid: number;
  remainingBalance: number;
  salonPhone: string;
}

export interface AdminEnquiryNotificationPayload {
  enquiryId: string;
  enquiryNumber: string;
  customerName: string;
  mobileNumber: string;
  email?: string | null;
  serviceInterest: string;
  message: string;
  submissionDate: string;
  submissionTime: string;
  status: string;
  source: string;
  adminPortalUrl: string;
  salonPhone: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  simulated?: boolean;
  error?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string; // base64 string
  contentType?: string;
}

export interface OutgoingEmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
  idempotencyKey: string;
  eventType: EmailEventType;
  appointmentId?: string | null;
  customerName?: string | null;
  metadata?: Record<string, any>;
}
