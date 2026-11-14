# The Jawed Habib Salon – Lalganj
# BOOKING AND PAYMENT SYNCHRONIZATION REPORT

**Execution Date:** 2026-11-14  
**Audit Scope:** End-to-End Booking Creation, Payment Processing, Webhook Synchronization & Ledger Balancing  
**Overall Verdict:** `VERIFIED WORKING`

---

## 1. Architectural Resolution: Booking Lifecycle Order

### 1.1 Previous Ambiguity
Past documentation presented conflicting views on whether an `Appointment` record in PostgreSQL should be created:
- **Option A:** Prior to initiating checkout (storing in `PENDING` / `UNPAID` state).
- **Option B:** Only after payment signature verification succeeds.

### 1.2 Canonical Production Architecture
The platform strictly implements **Option A** with transactional lifecycle synchronization:
```
[Customer Selects Date & Service]
              │
              ▼
    POST /api/appointments
   (Zod validation, slot conflict check, slot hold release)
              │
              ▼
   Creates DB Appointment:
   - status: PENDING
   - paymentStatus: UNPAID
   - appointmentNumber: JH-LAL-2026-XXXXXX
              │
              ▼
   POST /api/payments/create-order
   (Validates appointmentId, checks amount in paise, creates Razorpay Order)
              │
              ▼
   [Customer Completes Razorpay Modal Checkout]
              │
              ▼
    POST /api/payments/verify
   (Server-side HMAC SHA256 signature check: order_id + payment_id)
              │
              ├─ Valid Signature ──► Updates Appointment:
              │                      - status: CONFIRMED
              │                      - paymentStatus: PARTIALLY_PAID (or PAID)
              │                      - depositAmount: Recorded
              │                      - remainingAmount: (total - deposit)
              │                      - Inserts PaymentRecord (SUCCESS)
              │
              └─ Tampered / Failed ─► Logs PaymentRecord (FAILED)
                                     - Appointment remains PENDING / UNPAID
                                     - Zero balance credited
```

### 1.3 Key Architectural Advantages
1. **No Lost Bookings:** If a customer's payment drops due to network failure, bank OTP delay, or modal dismissal, the appointment record remains securely tracked in `PENDING` status. The salon desk can view it and collect payment at the counter without requiring the customer to fill out the form again.
2. **Deterministic Tracking:** The Razorpay Order contains notes referencing the exact `appointmentId`, creating an immutable foreign key relationship across systems.
3. **Double-Booking Immunity:** Because the slot is reserved upon `POST /api/appointments`, other concurrent users cannot claim the same time slot while checkout is in progress.

---

## 2. Advance Deposit & Remaining Balance Rules

| Booking Type | Total Service Amount | Minimum Advance | Maximum Advance | Applied Policy | Remaining Balance Collected |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard Hair / Skin** | ₹1,500 | ₹1,000 | ₹2,500 | Flat ₹1,000 Deposit | ₹500 at counter |
| **Low Value Service** | ₹400 (under ₹1,000) | ₹1,000 | ₹2,500 | `CAP_AT_SERVICE_PRICE` (₹400) | ₹0 (Paid in full) |
| **Royal Bridal Package** | ₹18,000 | ₹1,000 | ₹2,500 | Configured ₹2,500 Deposit | ₹15,500 at counter |
| **Luxury Package** | ₹8,000 | ₹1,000 | ₹2,500 | Configured ₹2,000 Deposit | ₹6,000 at counter |

All advance deposits are converted to integer paise (`amountInPaise = Math.round(depositAmount * 100)`) before calling Razorpay API, preventing floating-point truncation errors.

---

## 3. Cryptographic Verification & Webhook Deduplication

### 3.1 HMAC SHA256 Signature Verification
In `src/app/api/payments/verify/route.ts`:
```typescript
const generatedSignature = crypto
  .createHmac("sha256", webhookSecret)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest("hex");

const isValid = crypto.timingSafeEqual(
  Buffer.from(generatedSignature),
  Buffer.from(razorpay_signature)
);
```
Timing-safe equality prevents timing side-channel attacks.

### 3.2 Idempotency & Webhook Deduplication
- Both `/api/payments/verify` and `/api/webhooks/razorpay` check for existing transactions by `gatewayPaymentId` or `gatewayOrderId`.
- If an order has already been processed and credited, subsequent verification requests return `{ success: true, isDuplicate: true }` without modifying the remaining balance or creating duplicate ledger rows.

### 3.3 Offline Counter Balance Collection
- The reception desk records remaining balances using `POST /api/admin/payments/offline`.
- Once the remaining balance reaches ₹0.00, `paymentStatus` transitions automatically to `PAID`, with full audit logging in `AuditLog` and `PaymentRecord`.

---

## 4. Test Verification Summary
- **Test File:** `src/__tests__/razorpay-payment-integration.test.ts` (22/22 Tests Passed)
- **Test File:** `src/__tests__/razorpay-admin-gateway.test.ts` (11/11 Tests Passed)
- **Test File:** `src/__tests__/backend-security-and-15-scenarios.test.ts` (15/15 Tests Passed)
- **All findings classified as:** `VERIFIED WORKING`.
