# RAZORPAY PAYMENT SECURITY AUDIT & LIFECYCLE VERIFICATION
## The Jawed Habib Salon – Lalganj, Vaishali, Bihar

> **Document Type:** Financial Application Security & Payment Gateway Audit  
> **Target Domain:** `https://www.thejawedhabibsalons.in`  
> **Payment Gateway:** Razorpay Standard Checkout & REST API  
> **Active Environment:** Test Mode (`rzp_test_...`)  
> **Audit Status:** Fully Verified (AES-256-GCM Encrypted, HMAC SHA256 Signature Verification, Deduplicated Webhooks)

---

## 1. Executive Summary & Core Security Guarantees

The salon's financial revenue and customer transactions are safeguarded through an end-to-end server-verified payment process. The frontend client is never trusted as proof of payment.

### Security Guarantees Matrix

| Security Dimension | Architectural Enforcement | Verification Status |
| :--- | :--- | :--- |
| **Server-Side Pricing** | Prices retrieved directly from DB; client amounts completely ignored | **VERIFIED WORKING** |
| **Integer Paise Precision** | All orders converted to integer paise (`Math.round(amount * 100)`) | **VERIFIED WORKING** |
| **Order Creation Guard** | Cancelled, expired, or fully paid bookings cannot create orders | **FIXED AND VERIFIED** |
| **HMAC SHA256 Verification** | Computed using server-side secret with timing-safe comparison | **VERIFIED WORKING** |
| **Raw Body Webhook Parsing** | Request body preserved as raw text before signature calculation | **VERIFIED WORKING** |
| **Webhook Event Deduplication** | `eventId` recorded transactionally; duplicate deliveries dropped safely | **VERIFIED WORKING** |
| **Late Payment Reconciliation** | Expired bookings with re-booked slots preserve CANCELLED state and alert admin | **FIXED AND VERIFIED** |
| **Mode Isolation (Test vs Live)** | Test payment IDs strictly prohibited on Live orders; Test mode active | **VERIFIED WORKING** |
| **Secret Encryption (AES-GCM)** | Key Secret and Webhook Secret encrypted with authenticated AES-256-GCM | **VERIFIED WORKING** |
| **Masked Credentials in UI** | Only masked representations (`••••••••`) projected in admin responses | **VERIFIED WORKING** |

---

## 2. Server-Side Order Creation Workflow (`/api/payments/create-order`)

1. **IP Rate Limiting:** Enforces maximum 20 order requests per 10 minutes per IP (`order_ip_${clientIp}`) to prevent automated order flooding.
2. **Status Validation:** Rejects any appointment where `status` is `CANCELLED`, `NO_SHOW`, or `REJECTED`, preventing customers with stale tabs from initiating payments on expired slots.
3. **Double-Payment Prevention:** Rejects payment initiation if the appointment's `paymentStatus` is already `PAID`.
4. **Authoritative Amount Determination:**
   - `FULL_PAYMENT`: Fetches total price from appointment record in database.
   - `REMAINING_BALANCE`: Calculates `remainingAmount` from database records.
   - `ADVANCE_DEPOSIT`: Clamps advance amount within configured bounds (`minAdvanceAmount` and `maxAdvanceAmount`).
5. **Gateway Call:** Calls Razorpay REST API with basic authentication header (`Buffer.from(keyId + ":" + keySecret).toString("base64")`) and persists `orderId` in `razorpayOrderRecord`.

---

## 3. Payment Signature Verification (`/api/payments/verify`)

1. **Required Payload:** Validates presence of `appointmentId`, `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
2. **Rate Limiting:** Protects endpoint against brute-force attacks by limiting to 30 requests per 10 minutes per IP (`verify_ip_${clientIp}`).
3. **Cryptographic Verification (`verifyRazorpayPaymentSignature`):**
   ```typescript
   const expectedSignature = crypto
     .createHmac("sha256", keySecret)
     .update(`${orderId}|${paymentId}`)
     .digest("hex");

   return timingSafeEqualString(expectedSignature, signature);
   ```
4. **Timing-Safe Comparison:** `crypto.timingSafeEqual` prevents side-channel timing attacks.
5. **Idempotency:** If the transaction was already captured (`existingTx.status === "SUCCESS"`), returns `isDuplicate: true` without double-crediting balances.

---

## 4. Webhook Security & Event Ingestion (`/api/webhooks/razorpay`)

1. **Raw Body Preservation:** Extracts `const rawBody = await req.text()` before JSON parsing to ensure byte-for-byte HMAC integrity.
2. **Signature Header:** Reads `x-razorpay-signature` and compares with `crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex")`.
3. **Deduplication Check (`recordWebhookEvent`):**
   - Stores `eventId` with `isProcessed: true`.
   - If an event arrives with an existing `eventId`, responds with HTTP 200 `{ duplicate: true }` and halts processing immediately.
4. **Supported Events:**
   - `order.paid`: Updates appointment deposit, adjusts remaining balance, marks payment CAPTURED.
   - `payment.captured`: Synchronizes transaction status and dispatches email receipt.
   - `payment.failed`: Records failure reason from gateway.
   - `refund.processed`: Records refund record transactionally.

---

## 5. Late Payment on Expired / Cancelled Bookings

### The Problem
If an unpaid online reservation timed out after the 60-minute checkout window, the system marked it `CANCELLED`. If the customer completed payment afterward, a naive system might overwrite the status to `CONFIRMED`, potentially creating a double-booking if another client had already taken the slot.

### The Engineering Solution
In `dbRepo.verifyRazorpayPayment`:
1. The payment is **never discarded**; it is captured as `SUCCESS` to ensure financial accuracy.
2. If `appointment.status === CANCELLED`, the system inspects the database to determine if the slot (`appointmentDate`, `startTime`, `endTime`) is occupied by another active booking (`PENDING`, `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS`).
3. **If slot is occupied:**
   - Appointment remains `CANCELLED`.
   - Payment metadata records `{ latePaymentAfterExpiry: true, slotConflict: true, reconciliationStatus: "MANUAL_RECONCILIATION_REQUIRED" }`.
   - Admin alert dispatched: `"[ACTION REQUIRED] Late payment of ₹... received for expired booking ..., but slot is occupied. Contact client to reschedule or refund."`
   - Audit log recorded: `LATE_PAYMENT_SLOT_CONFLICT`.
4. **If slot is free:**
   - Appointment is re-confirmed (`status: CONFIRMED`).
   - Audit log recorded: `LATE_PAYMENT_RESTORED`.

---

## 6. Test Mode Isolation & Secret Protection

- **Active Mode:** Test Mode (`rzp_test_...`) remains active across the application.
- **Live Mode Gate:** Activating Live Mode requires non-empty Live credentials, valid decryption, explicit user confirmation payload, and a successful test ping to the gateway.
- **Zero Secret Leakage:**
  - Credentials in database are encrypted using authenticated `aes-256-gcm`.
  - Admin APIs only project masked values (`maskKeyId`, `maskSecret`).
  - No secret keys are exposed in client bundles or public API responses.
