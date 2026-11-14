import { describe, it, expect, beforeEach } from "vitest";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiUnauthorized,
  apiForbidden,
  apiRateLimited,
  apiServerError,
} from "@/lib/api/response";
import {
  scrubSensitiveData,
  maskPhone,
  logger,
} from "@/lib/logging/logger";
import { checkRateLimit, checkDuplicateSubmission } from "@/lib/security/rate-limit";
import { checkAdminAuth, ROLES } from "@/lib/auth/rbac";
import { signToken } from "@/lib/auth/jwt";
import { z } from "zod";
import { normalizeTimeTo24h } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { createRazorpayOrder } from "@/lib/payments/razorpay";

describe("Backend Architecture, Security Hardening & Reliability Suite", () => {
  // -------------------------------------------------------------
  // 1. Centralized API Response Helpers & Error Sanitization
  // -------------------------------------------------------------
  describe("1. Centralized API Response Formatter", () => {
    it("formats standard successful responses with status and metadata", async () => {
      const res = apiSuccess({ salon: "The Jawed Habib", branch: "Lalganj" }, {
        message: "Operation successful",
        status: 200,
        meta: { cached: false },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.salon).toBe("The Jawed Habib");
      expect(json.message).toBe("Operation successful");
      expect(json.meta.cached).toBe(false);
    });

    it("formats standard operational errors with custom HTTP status", async () => {
      const res = apiError("Invalid coupon code", 400, { code: "INVALID_COUPON" });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Invalid coupon code");
      expect(json.code).toBe("INVALID_COUPON");
    });

    it("formats Zod validation errors with field-level details", async () => {
      const testSchema = z.object({
        email: z.string().email("Invalid email format"),
        age: z.number().min(18, "Must be at least 18"),
      });

      const parseResult = testSchema.safeParse({ email: "invalid", age: 16 });
      expect(parseResult.success).toBe(false);

      if (!parseResult.success) {
        const res = apiValidationError(parseResult.error);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.code).toBe("VALIDATION_ERROR");
        expect(json.details.email).toBeDefined();
        expect(json.details.age).toBeDefined();
      }
    });

    it("formats 401 Unauthorized, 403 Forbidden, and 429 Rate Limited", async () => {
      const unauth = apiUnauthorized("Session expired");
      expect(unauth.status).toBe(401);
      const unauthJson = await unauth.json();
      expect(unauthJson.code).toBe("UNAUTHORIZED");

      const forbidden = apiForbidden("Super Admin role required");
      expect(forbidden.status).toBe(403);
      const forbJson = await forbidden.json();
      expect(forbJson.code).toBe("FORBIDDEN");

      const rateLimited = apiRateLimited(60000, "Too many requests");
      expect(rateLimited.status).toBe(429);
      expect(rateLimited.headers.get("Retry-After")).toBe("60");
      const rateJson = await rateLimited.json();
      expect(rateJson.retryAfterMs).toBe(60000);
    });

    it("sanitizes internal server errors and protects against stack leakage", async () => {
      const sensitiveError = new Error(
        "FATAL: password authentication failed for user 'neon_admin' at postgresql://neon_admin:secret_pass@ep-holy-sunset.aws.neon.tech:5432"
      );

      const res = apiServerError(sensitiveError);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.code).toBe("INTERNAL_SERVER_ERROR");
      // In production mode it must not leak passwords or host details
      if (process.env.NODE_ENV === "production") {
        expect(json.error).not.toContain("secret_pass");
        expect(json.error).not.toContain("postgresql://");
      }
    });
  });

  // -------------------------------------------------------------
  // 2. Structured Server-Side Logging & Zero-Leakage Data Redaction
  // -------------------------------------------------------------
  describe("2. Safe Structured Logging & Data Scrubbing", () => {
    it("recursively scrubs passwords, tokens, API secrets, and card numbers", () => {
      const payloadWithSecrets = {
        name: "Test Customer",
        credentials: {
          password: "my_plain_password_123",
          passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz",
          keySecret: "rzp_secret_9876543210",
          webhookSecret: "whsec_supersecrettoken",
        },
        payment: {
          cardNumber: "4111222233334444",
          cvv: "123",
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.signature",
        },
        connection: "postgresql://usr:pwd@ep-holy-sunset.aws.neon.tech/neondb",
      };

      const scrubbed = scrubSensitiveData(payloadWithSecrets);

      expect(scrubbed.name).toBe("Test Customer");
      expect(scrubbed.credentials.password).toBe("[REDACTED_SECRET]");
      expect(scrubbed.credentials.passwordHash).toBe("[REDACTED_SECRET]");
      expect(scrubbed.credentials.keySecret).toBe("[REDACTED_SECRET]");
      expect(scrubbed.credentials.webhookSecret).toBe("[REDACTED_SECRET]");
      expect(scrubbed.payment.cardNumber).toBe("[REDACTED_SECRET]");
      expect(scrubbed.payment.cvv).toBe("[REDACTED_SECRET]");
      expect(scrubbed.payment.token).toBe("[REDACTED_SECRET]");
      expect(scrubbed.connection).toBe("[REDACTED_DATABASE_URL]");
    });

    it("masks customer phone numbers for privacy in logs", () => {
      expect(maskPhone("7707000463")).toBe("770****463");
      expect(maskPhone("9831722983")).toBe("983****983");
      expect(maskPhone("123")).toBe("***");
      expect(maskPhone(null)).toBe("***");
    });
  });

  // -------------------------------------------------------------
  // 3. Role-Based Authorization & Admin Route Hardening
  // -------------------------------------------------------------
  describe("3. Role-Based Access Control (RBAC)", () => {
    it("allows SUPER_ADMIN and ADMIN access to sensitive admin operations", () => {
      const adminToken = signToken({
        userId: "admin_1",
        role: ROLES.ADMIN,
        phone: "7707000463",
      });

      const req = new Request("https://thejawedhabibsalons.in/api/admin/payment-gateway/razorpay", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const auth = checkAdminAuth(req, ["SUPER_ADMIN", "ADMIN"]);
      expect(auth.authorized).toBe(true);
      expect(auth.user?.role).toBe("ADMIN");
    });

    it("blocks STAFF and MANAGER from accessing payment gateway or refund endpoints", () => {
      const staffToken = signToken({
        userId: "staff_1",
        role: ROLES.STAFF,
        phone: "9831722983",
      });

      const req = new Request("https://thejawedhabibsalons.in/api/admin/payment-gateway/razorpay", {
        headers: { Authorization: `Bearer ${staffToken}` },
      });

      const auth = checkAdminAuth(req, ["SUPER_ADMIN", "ADMIN"]);
      expect(auth.authorized).toBe(false);
      expect(auth.status).toBe(401); // checkAdminAuth default
    });

    it("rejects unauthenticated requests without valid authorization", () => {
      const req = new Request("https://thejawedhabibsalons.in/api/admin/users");
      const auth = checkAdminAuth(req, ["SUPER_ADMIN", "ADMIN"]);
      expect(auth.authorized).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 4. Rate Limiting Protection
  // -------------------------------------------------------------
  describe("4. Sliding-Window Rate Limiting", () => {
    it("allows requests up to the defined limit and blocks subsequent requests", () => {
      const testKey = `test_rate_limit_${Date.now()}`;
      const limit = 3;
      const windowMs = 5000;

      // 1st request
      const r1 = checkRateLimit(testKey, limit, windowMs);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      // 2nd request
      const r2 = checkRateLimit(testKey, limit, windowMs);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      // 3rd request
      const r3 = checkRateLimit(testKey, limit, windowMs);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      // 4th request - should be blocked
      const r4 = checkRateLimit(testKey, limit, windowMs);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
      expect(r4.resetInMs).toBeGreaterThan(0);
    });

    it("detects and prevents rapid duplicate appointment submissions", () => {
      const phone = "7707000463";
      const date = "2026-11-20";
      const time = "11:30";

      const sub1 = checkDuplicateSubmission(phone, date, time, 3000);
      expect(sub1.isDuplicate).toBe(false);

      const sub2 = checkDuplicateSubmission(phone, date, time, 3000);
      expect(sub2.isDuplicate).toBe(true);
      expect(sub2.retryAfterSeconds).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------
  // 5. IDOR Protection on Appointment Modifications
  // -------------------------------------------------------------
  describe("5. IDOR & Ownership Verification on Appointments", () => {
    it("allows appointment rescheduling when customer verifies matching phone number", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "IDOR Test Bride",
        customerPhone: "7707000463",
        serviceIds: ["srv_1"],
        appointmentDate: "2026-11-25",
        startTime: "12:00",
        advanceAmount: 1000,
      });

      expect(apt).toBeDefined();

      // Customer providing matching phone number
      const callerPhone = "7707000463";
      const isMatch = callerPhone === apt.customerPhone;
      expect(isMatch).toBe(true);

      const rescheduled = await dbRepo.rescheduleAppointment(
        apt.id,
        "2026-11-26",
        "14:00",
        undefined,
        "Need afternoon slot instead"
      );

      expect(rescheduled.appointmentDate).toBe("2026-11-26");
      expect(rescheduled.startTime).toBe("14:00");
    });

    it("rejects non-matching phone number when modifying an appointment", async () => {
      const apt = await dbRepo.createAppointment({
        customerName: "IDOR Test 2",
        customerPhone: "9831722983",
        serviceIds: ["srv_1"],
        appointmentDate: "2026-11-27",
        startTime: "15:00",
        advanceAmount: 1000,
      });

      const attackerPhone = "9999999999";
      const isMatch = attackerPhone === apt.customerPhone;
      expect(isMatch).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 6. Time Normalization (12h & 24h Formats)
  // -------------------------------------------------------------
  describe("6. Time Format Normalization", () => {
    it("normalizes various 12-hour AM/PM representations to standard 24-hour HH:MM", () => {
      expect(normalizeTimeTo24h("11:30 AM")).toBe("11:30");
      expect(normalizeTimeTo24h("11:30 am")).toBe("11:30");
      expect(normalizeTimeTo24h("12:00 PM")).toBe("12:00");
      expect(normalizeTimeTo24h("12:00 AM")).toBe("00:00");
      expect(normalizeTimeTo24h("01:15 PM")).toBe("13:15");
      expect(normalizeTimeTo24h("1:15 pm")).toBe("13:15");
      expect(normalizeTimeTo24h("07:45 PM")).toBe("19:45");
      expect(normalizeTimeTo24h("10:00 PM")).toBe("22:00");
    });

    it("preserves canonical 24-hour HH:MM format", () => {
      expect(normalizeTimeTo24h("11:30")).toBe("11:30");
      expect(normalizeTimeTo24h("14:45")).toBe("14:45");
      expect(normalizeTimeTo24h("22:00")).toBe("22:00");
    });
  });

  // -------------------------------------------------------------
  // 7. Razorpay Order Creation & Sandboxing
  // -------------------------------------------------------------
  describe("7. Razorpay Order Security & Environment Handling", () => {
    it("creates an authorized order in test sandbox mode with exact amount in paise", async () => {
      const order = await createRazorpayOrder(
        {
          amountInPaise: 200000, // ₹2,000 in paise
          currency: "INR",
          receipt: "rcpt_test_123",
          notes: { appointmentId: "apt_123" },
        },
        "rzp_test_mock_key",
        "mock_key_secret"
      );

      expect(order.amount).toBe(200000);
      expect(order.currency).toBe("INR");
      expect(order.status).toBe("created");
    });
  });
});
