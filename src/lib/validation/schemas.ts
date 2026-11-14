import { z } from "zod";

// Phone validation: Indian standard 10 digit number starting with 6, 7, 8, or 9
export const phoneRegex = /^[6-9]\d{9}$/;

// -------------------------------------------------------------
// Authentication Schemas
// -------------------------------------------------------------
export const customerRegisterSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  phone: z.string().regex(phoneRegex, "Valid 10-digit Indian phone number is required (e.g. 7707000463)"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().max(255).optional(),
});

export const loginSchema = z.object({
  phoneOrEmail: z.string().min(3, "Phone or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  phoneOrEmail: z.string().min(3, "Phone or email is required"),
});

export const resetPasswordSchema = z.object({
  phoneOrEmail: z.string().min(3, "Phone or email is required"),
  tokenOrPin: z.string().min(4, "Verification token or PIN is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  alternatePhone: z.string().regex(phoneRegex, "Valid 10-digit phone number").optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  anniversary: z.string().optional().or(z.literal("")),
  preferredStaffId: z.string().optional().or(z.literal("")),
});

// -------------------------------------------------------------
// Appointment Schemas
// -------------------------------------------------------------

/**
 * Normalizes user-submitted appointment time from either 12-hour AM/PM format
 * (e.g. "11:30 AM", "01:00 PM", "2:30 pm") or 24-hour format (e.g. "11:30", "14:30")
 * into canonical 24-hour "HH:MM" format.
 */
export function normalizeTimeTo24h(timeStr: string): string {
  if (!timeStr || typeof timeStr !== "string") return timeStr;
  const trimmed = timeStr.trim();
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const period = match12[3].toUpperCase();
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  }
  const match24 = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    if (hours >= 0 && hours <= 23 && parseInt(minutes, 10) >= 0 && parseInt(minutes, 10) <= 59) {
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    }
  }
  return trimmed;
}

export const appointmentBookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().regex(phoneRegex, "Please enter a valid 10-digit Indian phone number"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  serviceIds: z.array(z.string()).min(1, "Please select at least one service"),
  packageId: z.string().optional().nullable(),
  staffId: z.string().optional().nullable(),
  appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid appointment date is required",
  }),
  startTime: z
    .string()
    .transform(normalizeTimeTo24h)
    .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "Invalid time format (HH:MM or hh:mm AM/PM required)",
    }),
  couponCode: z.string().optional().nullable(),
  holdToken: z.string().optional().nullable(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
  bridalRequirements: z.string().max(1000, "Requirements cannot exceed 1000 characters").optional().nullable(),
  eventDate: z.string().optional().nullable(),
  weddingVenue: z.string().max(200, "Venue cannot exceed 200 characters").optional().nullable(),
  selectedAddons: z.array(z.string()).optional().default([]),
  advanceAmount: z.number().min(0, "Advance amount cannot be negative").optional(),
  source: z.enum(["ONLINE_WEBSITE", "PHONE_CALL", "WALK_IN", "WHATSAPP"]).optional().default("ONLINE_WEBSITE"),
});

export const appointmentRescheduleSchema = z.object({
  appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid appointment date is required",
  }),
  startTime: z
    .string()
    .transform(normalizeTimeTo24h)
    .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "Invalid time format (HH:MM or hh:mm AM/PM required)",
    }),
  staffId: z.string().optional().nullable(),
  rescheduleReason: z.string().max(300).optional(),
  customerPhone: z.string().optional(),
});

export const appointmentCancelSchema = z.object({
  reason: z.string().min(5, "Please give a brief reason for cancellation (min 5 characters)").max(300),
  customerPhone: z.string().optional(),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional().nullable(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format").optional().nullable(),
  serviceIds: z.string().optional().default("srv_1"), // comma separated
  staffId: z.string().optional().nullable(),
}).refine((data) => !!data.date || !!data.month, {
  message: "Either date (YYYY-MM-DD) or month (YYYY-MM) must be provided",
});

// -------------------------------------------------------------
// Payment Schemas & Razorpay Integration
// -------------------------------------------------------------
export const paymentOrderSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  gateway: z.enum(["RAZORPAY", "CASHFREE", "PAYTM"]).default("RAZORPAY"),
  paymentPurpose: z.enum(["ADVANCE_DEPOSIT", "FULL_PAYMENT", "REMAINING_BALANCE"]).default("ADVANCE_DEPOSIT").optional(),
});

export const paymentVerifySchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  transactionRef: z.string().optional(),
  gatewayPaymentId: z.string().optional(),
  gatewaySignature: z.string().optional(),
  // Razorpay standard checkout callback names
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
});

export const adminRazorpaySettingsSchema = z.object({
  gatewayName: z.string().default("Razorpay"),
  isEnabled: z.boolean().default(true),
  environment: z.enum(["TEST", "LIVE"]).default("TEST"),
  currency: z.string().default("INR"),
  displayName: z.string().min(2, "Display name required").default("The Jawed Habib Salon - Lalganj"),
  enableOnlinePayments: z.boolean().default(true),
  enableAdvancePayments: z.boolean().default(true),
  enableFullPayments: z.boolean().default(true),
  enableRemainingCollection: z.boolean().default(true),
  allowOfflineRecording: z.boolean().default(true),
  // Advance Payment Business Policy Settings
  minAdvanceAmount: z.number().min(0, "Minimum advance must be >= 0").default(1000).optional(),
  maxAdvanceAmount: z.number().min(0, "Maximum advance must be >= 0").default(2500).optional(),
  defaultAdvanceAmount: z.number().min(0, "Default advance must be >= 0").default(1000).optional(),
  suggestedAdvanceOptions: z.array(z.number()).default([1000, 1500, 2000, 2500]).optional(),
  allowCustomerSelectAdvance: z.boolean().default(true).optional(),
  belowMinPolicy: z.enum(["CAP_AT_SERVICE_PRICE", "CHARGE_FULL_PRICE"]).default("CAP_AT_SERVICE_PRICE").optional(),
  // Test Mode Credentials
  testKeyId: z.string().optional().nullable(),
  testKeySecret: z.string().optional().nullable(),
  testWebhookSecret: z.string().optional().nullable(),
  // Live Mode Credentials
  liveKeyId: z.string().optional().nullable(),
  liveKeySecret: z.string().optional().nullable(),
  liveWebhookSecret: z.string().optional().nullable(),
  confirmedLiveActivation: z.boolean().optional(),
});

export const adminRefundSchema = z.object({
  paymentTransactionId: z.string().min(1, "Transaction ID required"),
  amount: z.number().positive("Refund amount must be greater than zero"),
  reason: z.string().min(3, "Reason required").max(300),
  isFullRefund: z.boolean().default(false),
});

export const adminOfflinePaymentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID required"),
  amount: z.number().positive("Payment amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "UPI", "CARD"]),
  transactionReference: z.string().max(100).optional().nullable(),
  receivedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Valid date required"),
  recordedBy: z.string().min(2, "Staff/Admin name required"),
  notes: z.string().max(500).optional().nullable(),
});

// -------------------------------------------------------------
// Reviews & Feedback
// -------------------------------------------------------------
export const reviewSubmitSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000),
});

// -------------------------------------------------------------
// Enquiry & Contact
// -------------------------------------------------------------
export const enquirySchema = z.object({
  name: z.string().min(2, "Name is required (at least 2 characters)").max(100),
  phone: z.string().regex(phoneRegex, "Valid 10-digit Indian phone number is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  serviceInterest: z.string().optional().nullable(),
  type: z.enum(["GENERAL", "SERVICE", "CONSULTATION", "BRIDAL"]).optional().default("GENERAL"),
  source: z.string().optional().default("Website Contact Form"),
  message: z.string().min(3, "Please provide a brief message (min 3 characters)").max(2000),
  // Anti-spam honeypot field (should remain empty)
  _honey: z.string().optional(),
});

// -------------------------------------------------------------
// Price Estimator & Beauty Consultation
// -------------------------------------------------------------
export const priceEstimatorSchema = z.object({
  serviceIds: z.array(z.string()).min(1, "Select at least one service"),
  hairLength: z.enum(["SHORT", "MEDIUM", "LONG", "EXTRA_LONG"]).optional().default("MEDIUM"),
  hairTexture: z.enum(["STRAIGHT", "WAVY", "CURLY", "COILY"]).optional().default("STRAIGHT"),
  couponCode: z.string().optional().nullable(),
});

export const consultationRecommendSchema = z.object({
  gender: z.enum(["FEMALE", "MALE", "UNISEX"]),
  hairType: z.string().min(2),
  primaryConcern: z.string().min(2), // e.g. "Dandruff & Frizzy Hair", "Hair Fall", "Tan & Dull Skin"
  occasion: z.string().optional(), // e.g. "Wedding", "Festival", "Daily Maintenance"
  budgetRange: z.enum(["STANDARD", "PREMIUM", "LUXURY"]).optional().default("PREMIUM"),
});

// -------------------------------------------------------------
// Admin Management Schemas
// -------------------------------------------------------------
export const adminAppointmentStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PENDING_PAYMENT",
    "CONFIRMED",
    "CHECKED_IN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
    "NO_SHOW",
    "PAYMENT_FAILED",
  ]),
  staffId: z.string().optional().nullable(),
  adminNotes: z.string().max(500).optional().nullable(),
  internalNotes: z.string().max(1000).optional().nullable(),
  rescheduledDate: z.string().optional().nullable(),
  rescheduledTime: z.string().optional().nullable(),
});

export const adminServiceSchema = z.object({
  name: z.string().min(2, "Service name required").max(100),
  slug: z.string().min(2).max(100),
  description: z.string().max(1000).optional().nullable(),
  detailedDescription: z.string().max(5000).optional().nullable(),
  price: z.number().min(0, "Price must be positive"),
  discountedPrice: z.number().min(0).optional().nullable(),
  isStartingPrice: z.boolean().default(false).optional(),
  priceDisplayType: z.enum(["FIXED", "STARTING_FROM", "CONTACT_FOR_PRICE"]).default("FIXED").optional(),
  durationMinutes: z.number().int().min(5).max(480),
  gender: z.enum(["UNISEX", "FEMALE", "MALE", "KIDS"]).default("UNISEX"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional().nullable(),
  galleryImages: z.array(z.string()).default([]).optional(),
  additionalImages: z.array(z.string()).default([]).optional(),
  isBridal: z.boolean().default(false).optional(),
  allowOnlineBooking: z.boolean().default(true).optional(),
  allowAdvancePayment: z.boolean().default(true).optional(),
  depositType: z.enum(["NO_DEPOSIT", "FIXED", "PERCENTAGE", "FULL"]).default("FIXED").optional(),
  depositValue: z.number().min(0).default(0).optional(),
  minAdvanceAmount: z.number().min(0).default(1000).optional(),
  maxAdvanceAmount: z.number().min(0).default(2500).optional(),
  suggestedAdvanceOptions: z.array(z.number()).default([1000, 1500, 2000, 2500]).optional(),
  allowCustomerSelectAdvance: z.boolean().default(true).optional(),
  allowFullPayment: z.boolean().default(true).optional(),
  depositPaymentMode: z.string().default("ADVANCE_OPTIONS").optional(),
  bufferTimeMinutes: z.number().int().min(0).max(120).default(0).optional(),
  bookingAvailability: z.string().optional().nullable(),
  isPopular: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0).optional(),
});

export const collectRemainingPaymentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID required"),
  amount: z.number().positive("Collected amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "RAZORPAY", "OTHER"]),
  transactionReference: z.string().max(100).optional().nullable(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Valid payment date required"),
  receivedBy: z.string().min(2, "Receiver staff/admin name required"),
  notes: z.string().max(500).optional().nullable(),
});

// -------------------------------------------------------------
// Calendar Configuration & Slot Capacity Schemas
// -------------------------------------------------------------
export const weeklySessionSchema = z.object({
  name: z.string().default("General"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:MM format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:MM format"),
});

export const weeklyDaySchema = z.object({
  day: z.string(),
  isOpen: z.boolean().default(true),
  openingTime: z.string().default("10:00"),
  closingTime: z.string().default("22:00"),
  sessions: z.array(weeklySessionSchema).default([]),
});

export const breakTimeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Break name required"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:MM format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "HH:MM format"),
  applicableDays: z.array(z.string()).default(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  isActive: z.boolean().default(true),
});

export const blockedDateSchema = z.object({
  id: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD required"),
  blockEntireDay: z.boolean().default(true),
  isFullDay: z.boolean().optional(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  isSpecialHours: z.boolean().default(false).optional(),
  specialOpenTime: z.string().optional().nullable(),
  specialCloseTime: z.string().optional().nullable(),
  reason: z.string().max(300).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const calendarSettingsSchema = z.object({
  // Section A: Basic Calendar Settings
  calendarName: z.string().min(2).default("The Jawed Habib Lalganj Booking Calendar"),
  status: z.enum(["ENABLED", "DISABLED"]).default("ENABLED"),
  timeZone: z.string().default("Asia/Kolkata"),
  calendarView: z.enum(["month", "week", "day"]).default("month"),
  bookingAdvancePeriod: z.number().int().min(1).max(365).default(14),
  minimumBookingNotice: z.number().int().min(0).max(72).default(2),
  maximumAdvanceBookingPeriod: z.number().int().min(1).max(365).default(30),
  enableSameDayBooking: z.boolean().default(true),
  allowReschedule: z.boolean().default(true),
  allowCancel: z.boolean().default(true),

  // Section B: Weekly Working Hours
  weeklyHours: z.array(weeklyDaySchema).default([]),

  // Section C: Appointment Time Slot Settings
  slotInterval: z.number().int().min(5).max(120).default(30),
  defaultAppointmentDuration: z.number().int().min(5).max(480).default(30),
  maxBookingsPerSlot: z.number().int().min(1).max(50).default(3),
  bufferBefore: z.number().int().min(0).max(60).default(0),
  bufferAfter: z.number().int().min(0).max(60).default(5),
  allowMultipleCustomers: z.boolean().default(true),
  enableAutoSlotGeneration: z.boolean().default(true),

  // Section D: Break Time Management
  breaks: z.array(breakTimeSchema).default([]),

  // Section E: Holidays & Blocked Dates
  blockedDates: z.array(blockedDateSchema).default([]),

  // Section F: Booking Capacity
  maxAppointmentsPerDay: z.number().int().min(1).max(500).default(40),
  maxAppointmentsPerSlot: z.number().int().min(1).max(50).default(3),
  maxAppointmentsPerService: z.number().int().min(1).max(100).default(15),
  maxSimultaneousAppointments: z.number().int().min(1).max(50).default(4),
  allowOverlapping: z.boolean().default(false),
  slotHoldMinutes: z.number().int().min(1).max(60).default(10),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2, "Category name required"),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const adminStaffSchema = z.object({
  name: z.string().min(2, "Staff name required"),
  phone: z.string().regex(phoneRegex, "Valid 10-digit phone required"),
  email: z.string().email().optional().nullable(),
  designation: z.string().min(2, "Designation required"),
  bio: z.string().optional().nullable(),
  experienceYears: z.number().int().min(0).default(3),
  specialties: z.array(z.string()).default([]),
  workingDays: z.array(z.string()).default(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  startTime: z.string().default("10:00"),
  endTime: z.string().default("22:00"),
  isAvailable: z.boolean().default(true),
});

export const adminTransformationSchema = z.object({
  title: z.string().min(2, "Title required"),
  description: z.string().optional().nullable(),
  beforeImageUrl: z
    .string()
    .min(1, "Before image URL required")
    .refine(
      (url) => url.startsWith("https://") || url.startsWith("http://") || url.startsWith("/"),
      { message: "Before image must be a valid HTTPS URL or local path" }
    ),
  afterImageUrl: z
    .string()
    .min(1, "After image URL required")
    .refine(
      (url) => url.startsWith("https://") || url.startsWith("http://") || url.startsWith("/"),
      { message: "After image must be a valid HTTPS URL or local path" }
    ),
  serviceId: z.string().optional().nullable(),
  staffId: z.string().optional().nullable(),
  category: z.string().default("Hair").optional(),
  clientGender: z.enum(["UNISEX", "FEMALE", "MALE", "KIDS"]).default("UNISEX"),
  isFeatured: z.boolean().default(true),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().int().default(0),
});

export const adminGallerySchema = z.object({
  title: z.string().min(2, "Title required"),
  caption: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Image URL required"),
  category: z.string().min(1, "Category required"),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true).optional(),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().int().default(0),
});

export const adminOfferSchema = z.object({
  title: z.string().min(2, "Title required"),
  slug: z.string().min(2),
  description: z.string().min(5),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).default("PERCENTAGE"),
  discountValue: z.number().min(1),
  couponCode: z.string().optional().nullable(),
  discountBadge: z.string().optional().nullable(),
  bannerImageUrl: z.string().optional().nullable(),
  validFrom: z.string(),
  validUntil: z.string(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0).optional(),
  termsConditions: z.array(z.string()).default([]),
});

export const adminPackageSchema = z.object({
  name: z.string().min(2, "Package name required"),
  slug: z.string().min(2),
  description: z.string().min(5),
  category: z.string().default("Special Packages").optional(),
  price: z.number().min(0),
  originalPrice: z.number().min(0),
  durationMinutes: z.number().int().min(15).default(60),
  servicesList: z.array(z.string()).min(1, "At least one service description required"),
  inclusions: z.array(z.string()).default([]).optional(),
  bookingDeposit: z.number().min(0).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0).optional(),
});

export const adminCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).default("FIXED_AMOUNT"),
  discountValue: z.number().min(1),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().optional().nullable(),
  validFrom: z.string(),
  validUntil: z.string(),
  usageLimit: z.number().int().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const adminVideoSchema = z.object({
  title: z.string().min(2, "Video title required"),
  description: z.string().optional().nullable(),
  videoUrl: z.string().url("Valid video URL required"),
  thumbnailUrl: z.string().optional().nullable(),
  category: z.string().default("Transformations"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().int().default(0),
});

export const adminBrandSchema = z.object({
  name: z.string().min(2, "Brand name required"),
  logoUrl: z.string().optional().nullable(),
  category: z.string().default("Cosmetics & Haircare"),
  description: z.string().optional().nullable(),
  isFeatured: z.boolean().default(true),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.number().int().default(0),
});

export const adminFaqSchema = z.object({
  question: z.string().min(5, "Question required"),
  answer: z.string().min(5, "Answer required"),
  category: z.string().default("General"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const adminEnquiryUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "SCHEDULED", "RESOLVED", "SPAM"]).optional(),
  adminNotes: z.string().max(2000).optional().nullable(),
  emailStatus: z.enum(["PENDING", "SENT", "FAILED", "SIMULATED"]).optional(),
  googleSheetsStatus: z.enum(["PENDING", "SYNCED", "FAILED", "DISABLED"]).optional(),
  lastError: z.string().optional().nullable(),
});

export const adminUserCreateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(phoneRegex, "Valid 10-digit phone required"),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6),
  roleType: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"]),
});

// -------------------------------------------------------------
// Type Exports
// -------------------------------------------------------------
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AppointmentBookingInput = z.infer<typeof appointmentBookingSchema>;
export type AppointmentRescheduleInput = z.infer<typeof appointmentRescheduleSchema>;
export type AppointmentCancelInput = z.infer<typeof appointmentCancelSchema>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type PriceEstimatorInput = z.infer<typeof priceEstimatorSchema>;
export type ConsultationRecommendInput = z.infer<typeof consultationRecommendSchema>;

export type AdminAppointmentStatusInput = z.infer<typeof adminAppointmentStatusSchema>;
export type AdminServiceInput = z.infer<typeof adminServiceSchema>;
export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
export type AdminStaffInput = z.infer<typeof adminStaffSchema>;
export type AdminTransformationInput = z.infer<typeof adminTransformationSchema>;
export type AdminGalleryInput = z.infer<typeof adminGallerySchema>;
export type AdminOfferInput = z.infer<typeof adminOfferSchema>;
export type AdminPackageInput = z.infer<typeof adminPackageSchema>;
export type AdminCouponInput = z.infer<typeof adminCouponSchema>;
export type AdminVideoInput = z.infer<typeof adminVideoSchema>;
export type AdminBrandInput = z.infer<typeof adminBrandSchema>;
export type AdminFaqInput = z.infer<typeof adminFaqSchema>;
export type AdminEnquiryUpdateInput = z.infer<typeof adminEnquiryUpdateSchema>;
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;
export type CalendarSettingsInput = z.infer<typeof calendarSettingsSchema>;
export type WeeklyDayInput = z.infer<typeof weeklyDaySchema>;
export type BreakTimeInput = z.infer<typeof breakTimeSchema>;
export type BlockedDateInput = z.infer<typeof blockedDateSchema>;
export type AdminRazorpaySettingsInput = z.infer<typeof adminRazorpaySettingsSchema>;
export type AdminRefundInput = z.infer<typeof adminRefundSchema>;
export type AdminOfflinePaymentInput = z.infer<typeof adminOfflinePaymentSchema>;
export type CollectRemainingPaymentInput = z.infer<typeof collectRemainingPaymentSchema>;
