# The Jawed Habib Salon – Lalganj
# VERCEL HOBBY ONCE-DAILY CRON MIGRATION REPORT

**Execution Date:** 2026-11-14  
**Target Environment:** Vercel Hobby Plan Deployment & Production (`https://www.thejawedhabibsalons.in`)  
**Deployment Gate Status:** Code changes and test suites verified locally; halted prior to Git push and Vercel deployment.

---

## 1. Executive Summary

This engineering effort addresses the production build and deployment failure on the **Vercel Hobby Plan** caused by high-frequency cron scheduling (`*/5 * * * *`). The Vercel Hobby tier enforces a strict policy permitting cron executions **at most once per calendar day**.

To resolve this limitation without requiring an unnecessary Vercel Pro upgrade ($20/month) and without compromising booking or payment data integrity, the system architecture was migrated to a **dual-layer cleanup strategy**:
1. **Authoritative Nightly Maintenance Cron (`0 0 * * *`):** Runs once daily at 00:00 UTC (~05:30 IST), executing a comprehensive sweep of abandoned checkout sessions.
2. **On-Demand Availability Cleanup Engine:** Automatically expires stale online checkout reservations (>60 minutes) in real time when any customer or API client requests booking availability.
3. **Safe Reminder Protection:** Automatically pauses high-frequency ~1-hour prior customer email reminders on Vercel Hobby to prevent mis-timed or delayed emails, while preserving all outbox logs, email templates, and transactional notifications (booking confirmations and payment receipts).
4. **Late Payment Reconciliation Protocol:** Safely captures payments even if a customer completes payment after initial reservation expiration, ensuring zero lost funds while preventing false booking confirmations if the slot was rebooked.

---

## 2. Cron Schedule Migration Details

| Parameter | Previous Schedule (Failing) | New Schedule (Hobby-Compatible) |
| :--- | :--- | :--- |
| **Cron Expression** | `*/5 * * * *` | `0 0 * * *` |
| **Execution Frequency** | Every 5 minutes (288 times / day) | Exactly once per day (1 time / day) |
| **Vercel Plan Compliance** | **Incompatible** (Fails Hobby Build) | **100% Compliant** with Vercel Hobby Plan |
| **Universal Time (UTC)** | Continuous every 5 minutes | `00:00 UTC` daily |
| **Indian Standard Time (IST)**| Continuous every 5 minutes | `05:30 – 06:29 IST` (Vercel hourly jitter window) |
| **Target Route** | `/api/cron/reminders` | `/api/cron/reminders` |

### Schedule Timing Analysis for Lalganj Salon Operations:
The Jawed Habib Salon in Lalganj operates Monday to Sunday from `10:00 AM – 10:00 PM IST`.  
The once-daily cron triggers at `00:00 UTC` (`05:30 AM IST`), approximately 4.5 hours before the salon opens. This serves as an ideal maintenance window to purge overnight abandoned checkout sessions, vacuum expired holds, and prepare the booking calendar for the day's business without imposing database load during peak customer booking hours.

---

## 3. Files Modified & Architectural Summary

| File | Subsystem | Modifications Applied |
| :--- | :--- | :--- |
| **`vercel.json`** | Hosting Config | Migrated `schedule` from `"*/5 * * * *"` to `"0 0 * * *"`. |
| **`src/app/api/appointments/availability/route.ts`** | Availability API | Integrated on-demand `dbRepo.expireAbandonedOnlineReservations(60)` before computing month or day slot availability. |
| **`src/lib/db/repo.ts`** | Database Repository | Added `autoExpireStaleReservations(60)` with a 30-second throttle to prevent redundant DB sweeps during concurrent availability queries; enhanced `getAvailableSlots` to auto-clean stale reservations; added timing safeguards in `getEligibleAppointmentsForReminder`; updated `verifyRazorpayPayment` late payment reconciliation. |
| **`src/lib/email/service.ts`** | Transactional Email | Added strict timing guards in `sendAppointmentReminder`: skips appointments whose dates have passed or whose start time today has already occurred; prevents marking unsent reminders as delivered. |
| **`src/app/api/cron/reminders/route.ts`** | Daily Cron Endpoint | Configured safe pause for automatic 1-hour reminders on Hobby (`ENABLE_SCHEDULED_REMINDERS="true"` toggle for external scheduler); returns clean JSON with zero PII and zero secrets. |
| **`src/app/api/payments/verify/route.ts`** | Payment Verification | Passes `latePaymentAfterExpiry`, `slotConflict`, and `requiresReconciliation` flags to the frontend, preventing incorrect confirmations when slots are occupied. |
| **`src/__tests__/vercel-hobby-cron-migration.test.ts`** | Automated QA Suite | 15 new test cases validating cron schedule, on-demand cleanup, booking protection, concurrency, late payments, and timing safeguards. |
| **`src/__tests__/production-reliability-and-payment-security.test.ts`** | Automated QA Suite | Typed `stats` projection for financial report isolation. |

---

## 4. Reservation Expiry Behavior

### 4.1 Eligibility Criteria (Strict 60-Minute Checkout Window)
To ensure customer fairness while preventing artificial calendar lockouts:
- **Eligible Source:** Strictly `source === BookingSource.ONLINE_WEBSITE`.
- **Eligible Status:** Strictly `status === AppointmentStatus.PENDING`.
- **Eligible Payment Status:** Strictly `paymentStatus === PaymentStatus.UNPAID`.
- **Age Threshold:** `createdAt < new Date(Date.now() - 60 * 60 * 1000)`.

### 4.2 Protected Reservations (Strictly Immune)
The following reservations are **never** expired, cancelled, or altered by the expiry engine:
- **Phone Bookings:** `source: BookingSource.PHONE_CALL` (reserved for walk-in/counter settlement).
- **Walk-in Bookings:** `source: BookingSource.WALK_IN` (reserved for immediate salon service).
- **Partially Paid Online Bookings:** `paymentStatus: PaymentStatus.PARTIALLY_PAID` (deposit collected).
- **Fully Paid Online Bookings:** `paymentStatus: PaymentStatus.PAID` (fully settled).
- **Confirmed Counter Bookings:** `status: AppointmentStatus.CONFIRMED`.

---

## 5. Availability-Triggered On-Demand Cleanup

Because the Vercel Hobby cron executes only once daily, relying solely on scheduled execution would cause abandoned reservations to block calendar slots for up to 24 hours.

### On-Demand Cleanup Mechanism:
1. When a client requests availability (`GET /api/appointments/availability?date=...` or `?month=...`), or when `getAvailableSlots` is invoked:
2. The engine invokes `autoExpireStaleReservations(60)`.
3. To protect Neon Serverless PostgreSQL from query floods when multiple users browse simultaneously, a **30-second internal debounce throttle** (`_lastExpiryRun`) ensures the database sweep executes at most once every 30 seconds.
4. Any `PENDING` + `UNPAID` online reservation older than 60 minutes is atomically transitioned to `CANCELLED` in Neon PostgreSQL (`updateMany` with concurrency guards).
5. Available slots are recalculated immediately after the cleanup, ensuring previously blocked slots are instantly available for new customer bookings.

---

## 6. Email Reminder Limitations & Safety Safeguards

### 6.1 The 1-Hour Reminder Dilemma on Daily Crons
A cron job running once daily at `00:00 UTC` (`05:30 IST`) cannot dispatch accurate "1-hour prior" reminders for salon appointments scattered throughout the operating day (`10:00 AM – 10:00 PM IST`). Attempting to do so would either:
- Send reminders 5 to 16 hours prematurely, or
- Fail to send reminders for afternoon/evening appointments altogether.

### 6.2 Protective Safeguards Implemented
1. **Automatic 1-Hour Reminders Safely Paused on Hobby:**  
   In `src/app/api/cron/reminders/route.ts`, automatic 1-hour reminders are safely set to `status: "PAUSED_DAILY_CRON"` by default.
2. **Never Send Late or Past Reminders:**  
   In `src/lib/email/service.ts`, `sendAppointmentReminder` checks the appointment date and start time in `Asia/Kolkata` timezone. If the appointment date is in the past, or if the start time today has already arrived or passed, the reminder is strictly skipped (`Appointment at HH:MM has already started or passed. Reminder skipped.`).
3. **No False Delivery Status:**  
   Skipped reminders are never marked as `ACCEPTED` or `SENT` in the outbox.
4. **Preserved Architecture:**  
   All email templates, outbox records (`EmailLog`), and transactional triggers (instant Booking Confirmations and Payment Receipts with PDF attachments) remain **100% active and operational**.
5. **Future Activation:**  
   When management integrates an external cron service (such as GitHub Actions, cron-job.org, or Upstash) or upgrades to Vercel Pro, automatic reminders can be instantly activated by setting `ENABLE_SCHEDULED_REMINDERS="true"` in environment variables.

---

## 7. Payment Safety: Late Callbacks & Expired Appointments

A critical edge case occurs when a customer takes longer than 60 minutes on their bank/UPI app, causing the reservation to expire, after which the bank webhook or verification callback confirms the payment.

### Reconciliation Protocol:
1. **Payment is Never Lost:**  
   The transaction is durably recorded in Neon PostgreSQL `PaymentRecord` with `status: SUCCESS`, linking the Razorpay Payment ID (`pay_...`), amount, and timestamp. Customer payment status is updated to `PAID` or `PARTIALLY_PAID`.
2. **Conflict Check:**  
   The engine checks whether the appointment's slot on that date and time was already rebooked by another customer:
   - **Scenario A (Slot Still Free):**  
     The appointment is reinstated to `status: CONFIRMED` with note `[LATE_PAYMENT_RESTORED]`. Admin is notified.
   - **Scenario B (Slot Already Rebooked):**  
     To prevent an incorrect booking confirmation, the appointment **remains `CANCELLED`**. It is tagged with `[LATE_PAYMENT_RECONCILIATION]`, an urgent admin alert is dispatched (`URGENT: Late Payment Received for Overbooked Slot`), and the API returns:  
     `"Payment captured successfully, but your reservation had expired and the slot was rebooked. Our team will contact you to reschedule or refund."`

---

## 8. Security Verification of Cron Endpoint

- **CRON_SECRET Verification:**  
  Requests without a valid `Bearer <token>` or `x-cron-secret` header are rejected with HTTP 401 (`Unauthorized: Invalid CRON_SECRET token`).
- **Zero Secrets or PII Leaked:**  
  The endpoint returns only aggregate counts (`{ eligibleCount: 0, sentCount: 0, reservationsExpired: { dbCount: 0, memCount: 0 } }`), with zero customer names, phone numbers, or database connection details.
- **Method Support:**  
  Accepts both `GET` (Vercel standard) and `POST` (webhook standard).

---

## 9. Automated Verification Results

All automated test suites, type checking, linting, and Next.js production builds were executed locally:

```bash
npm run type-check   # Result: 0 Errors (Exit code 0)
npm run lint         # Result: 0 Warnings, 0 Errors (Exit code 0)
npm test             # Result: 37/37 Test Files Passed, 398/398 Tests Passed (Exit code 0)
npm run build        # Result: 63/63 Static & Dynamic Routes Generated (Exit code 0)
```

### Test Suite Highlights (`src/__tests__/vercel-hobby-cron-migration.test.ts`):
- `1. Vercel Hobby Cron Configuration`: 1/1 passed.
- `2. Reservation Expiry Policies & Immune Bookings`: 5/5 passed.
- `3. On-Demand Availability Cleanup`: 2/2 passed.
- `4. Late Payment Safety After Reservation Expiry`: 2/2 passed.
- `5. Daily Cron Endpoint Security & Behavior`: 3/3 passed.
- `6. Email Reminder Timing Safeguards`: 2/2 passed.

---

## 10. Remaining Risks & Operational Notes

1. **Vercel Hobby Execution Jitter:**  
   Vercel Hobby schedules crons once per calendar day with up to 1-hour execution jitter (`05:30 – 06:29 IST`). Because the salon opens at `10:00 AM IST`, this jitter has zero impact on salon operations.
2. **Customer Email Reminders:**  
   As documented, automatic ~1-hour reminders are safely paused on Hobby. Transactional booking confirmations and payment receipts continue to send instantly upon booking/payment. If management wishes to activate 1-hour reminders in the future without upgrading to Vercel Pro, a free external cron job calling `/api/cron/reminders` with `x-cron-secret` every 15 minutes and `ENABLE_SCHEDULED_REMINDERS="true"` can be configured.
3. **Database Health:**  
   Neon Serverless PostgreSQL connection pooling (`-pooler` endpoint) and non-destructive migrations remain completely stable and unaffected.
