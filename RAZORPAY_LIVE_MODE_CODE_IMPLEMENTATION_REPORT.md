# RAZORPAY LIVE MODE CODE IMPLEMENTATION & ARCHITECTURE REPORT
## The Jawed Habib Salon – Lalganj, Vaishali, Bihar

> **Document Type:** Production Payment Gateway Code Implementation & Architectural Hardening Report  
> **Brand Entity:** The Jawed Habib Salon  
> **Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
> **Canonical Domain:** `https://www.thejawedhabibsalons.in`  
> **Payment Gateway:** Razorpay Standard Checkout & REST API v1  
> **Status:** Code Implemented, Tested & Verified – Ready for Live Activation  

---

## 1. Executive Summary

This engineering report documents the code-level improvements, security hardening, and architectural safeguards implemented to transition **The Jawed Habib Salon – Lalganj** digital platform from Razorpay Test Mode to Live Mode.

The objective was to create a resilient, tamper-proof payment processing pipeline where genuine customer payments can be securely processed in production, while strictly guaranteeing that local development and Vercel preview deployments remain locked in Test Mode, key IDs and secrets cannot be mixed across environments, and client-side amount tampering is impossible.

---

## 2. Payment Architecture & Credential Resolution Hierarchy

### 2.1 The Two Credential Sources
The application supports two independent, secure credential sources:
1. **Vercel Server-Side Environment Variables:**
   - Production secrets configured in Vercel Project Settings (`RAZORPAY_LIVE_KEY_ID`, `RAZORPAY_LIVE_KEY_SECRET`, `RAZORPAY_LIVE_WEBHOOK_SECRET` or standard `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`).
2. **Encrypted Database Settings (`PaymentGatewaySettingRecord`):**
   - Configured via the Admin Portal (`/admin/settings/payment-gateway`).
   - Secrets are encrypted at rest using authenticated **AES-256-GCM** via `src/lib/security/encryption.ts` using a deterministic key derived from `PAYMENT_ENCRYPTION_KEY` or `JWT_SECRET`.

### 2.2 Credential Precedence & Mode Isolation (`src/lib/db/repo.ts:getRazorpayCredentials`)
To prevent conflicting sources of truth or accidental misconfigurations, `getRazorpayCredentials` implements strict deterministic resolution:

```
                                  [ Target Environment ]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
                 [ LIVE MODE ]                               [ TEST MODE ]
                       │                                           │
         ┌─────────────┴─────────────┐               ┌─────────────┴─────────────┐
         ▼                           ▼               ▼                           ▼
  [ Vercel Env Vars ]        [ Encrypted DB ] [ Vercel Env Vars ]        [ Encrypted DB / Fallback ]
  RAZORPAY_LIVE_KEY_ID       settings.liveKeyId RAZORPAY_TEST_KEY_ID     settings.testKeyId
  RAZORPAY_LIVE_KEY_SECRET   settings.liveKeySecret RAZORPAY_TEST_KEY_SECRET settings.testKeySecret
  RAZORPAY_LIVE_WEBHOOK_SECRET settings.liveWebhook RAZORPAY_TEST_WEBHOOK_SECRET settings.testWebhook
```

#### Precedence Order:
1. **Explicit Mode-Specific Environment Variables:** `RAZORPAY_LIVE_KEY_ID` / `RAZORPAY_TEST_KEY_ID` take immediate precedence.
2. **Generic Environment Variables:** `RAZORPAY_KEY_ID` is used only if its prefix strictly matches the active mode (`rzp_live_` for Live, `rzp_test_` for Test).
3. **Encrypted Database Settings:** Decrypted at runtime from `paymentGatewaySettingRecord` when environment variables are not supplied.

---

## 3. Key Safeguards & Defect Prevention

### 3.1 Strict Prefix Validation
- In **LIVE Mode**: `keyId` MUST start with `rzp_live_`. If it starts with `rzp_test_`, the engine throws an immediate exception:
  ```typescript
  if (!keyId.startsWith("rzp_live_")) {
    throw new Error(`Inconsistent credentials: Key ID does not match LIVE environment (expected prefix 'rzp_live_').`);
  }
  ```
- In **TEST Mode**: `keyId` MUST NOT start with `rzp_live_`. If a Live key is detected in Test mode, the system throws an exception to prevent charging real cards in non-production environments.

### 3.2 Environment Protection (Preview & Development Lock)
To prevent accidental real-money transactions on staging or local laptops:
```typescript
const isVitest = process.env.NODE_ENV === "test";
const isPreview = process.env.VERCEL_ENV === "preview";
const isDev = process.env.NODE_ENV === "development";

if ((isPreview || isDev) && !isVitest && targetEnv === "LIVE") {
  throw new Error(
    "Razorpay Live Mode is strictly prohibited in Preview and Development environments. Please use Test Mode."
  );
}
```

### 3.3 Zero Secret Exposure
- Neither `RAZORPAY_KEY_SECRET` nor `RAZORPAY_WEBHOOK_SECRET` is ever passed to client components.
- The client checkout flow only receives `keyId` dynamically in the JSON response of `/api/payments/create-order`.
- The Admin Portal displays masked placeholders (`••••••••••••`) and never emits plaintext secrets over administrative GET endpoints.

---

## 4. Server-Side Price Calculation & Order Creation (`/api/payments/create-order`)

1. **Database Source of Truth:**
   - The payable amount is calculated exclusively on the server from `appointment.depositAmount` (default ₹1,000 for advance) or `appointment.totalAmount`.
   - Any client-submitted amount payload (e.g. `manipulatedAmount: 1`) is ignored and stripped by Zod validation.
2. **Integer Paise Conversion:**
   - Amounts are mathematically rounded to integer paise (`Math.round(payableINR * 100)`), avoiding floating-point rounding errors.
3. **Appointment Status Verification:**
   - Order creation is rejected with HTTP 400 if `appointment.status` is `CANCELLED`, `NO_SHOW`, `REJECTED`, or `PAID`.
4. **Order Tracking & Audit:**
   - Order metadata irrevocably binds `{ appointmentId, appointmentNumber, purpose, environment, branch: "Lalganj" }` into Razorpay's order record.

---

## 5. Timing-Safe Payment Verification (`/api/payments/verify`)

1. **HMAC SHA-256 Calculation:**
   $$\text{Expected Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{Live Secret})$$
2. **Timing-Safe Equality:**
   - Compares expected vs received signature via `crypto.timingSafeEqual` in `timingSafeEqualString`.
3. **Rate Limiting:**
   - Enforces sliding window rate limiting (30 requests / 10 minutes per IP).
4. **Instrument Cross-Contamination Guard:**
   - If a LIVE order is presented with a TEST payment ID (`pay_test_...`), verification is blocked with a security violation.
5. **Idempotency:**
   - Duplicate verification calls for already-processed payments return the cached success state without duplicate ledger entries.

---

## 6. Live Webhook Implementation (`/api/webhooks/razorpay`)

- **URL:** `https://www.thejawedhabibsalons.in/api/webhooks/razorpay`
- **Method:** `POST`
- **Signature Verification:** Validates `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET` using raw request text (`req.text()`).
- **Deduplication:** Event IDs are recorded in `WebhookEventRecord`. Replays return HTTP 200 `{ duplicate: true }` without re-crediting.
- **Supported Live Events:**
  1. `order.paid`: Captures advance deposit, updates appointment to `CONFIRMED`.
  2. `payment.captured`: Confirms capture and triggers digital payment receipt email.
  3. `payment.failed`: Records failed transaction reason without granting appointment credit.
  4. `refund.processed`: Logs refund record and updates ledger balance.

---

## 7. Late Payment Recovery Workflow

In the event that an abandoned reservation expires (60 minutes) and is marked `CANCELLED`, but the customer completes payment later on their bank page:
- **Money is NEVER discarded:** The payment is recorded as `SUCCESS` with full transaction IDs.
- **Slot Free:** If the chair remains available, the booking is restored to `CONFIRMED`.
- **Slot Occupied:** If another client booked the slot, the booking remains `CANCELLED`, metadata records `{ reconciliationStatus: "MANUAL_RECONCILIATION_REQUIRED" }`, and an alert is dispatched to the front desk concierge to reschedule or refund.

---

## 8. Automated Test Coverage

The implementation is validated by the test suite in `src/__tests__/razorpay-live-mode-migration-readiness.test.ts`:
- Rejection of missing live credentials when Live mode is requested. Passed.
- Rejection of `rzp_test_` key in Live mode. Passed.
- Rejection of `rzp_live_` key in Test mode. Passed.
- Successful resolution of Live credentials from environment variables. Passed.
- Server-side price calculation rejecting manipulated frontend amounts. Passed.
- Order creation rejection on cancelled/rejected appointments. Passed.
- Forged signature rejection. Passed.
- Payment verification idempotency and replay safety. Passed.
- Webhook signature validation and missing header rejection. Passed.
- Webhook deduplication preventing double crediting. Passed.
- Late payment recovery with slot conflict containment. Passed.

---

## 9. Conclusion

The code implementation for Razorpay Live Mode is complete, tested, and production hardened. The platform will safely transition to processing live payments as soon as the salon owner adds the Live credentials and enables Live Mode.
