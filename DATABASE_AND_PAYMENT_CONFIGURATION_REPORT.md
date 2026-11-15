# The Jawed Habib Salon – Lalganj
# Database and Payment Configuration Report

> **Scope:** Neon Serverless PostgreSQL & Razorpay Payment Gateway Integration  
> **Inspection Date:** November 15, 2026  
> **Compliance Standard:** Zero Plaintext Credential Storage, Timing-Safe Signatures, Zero Accidental Live Charges  
> **Status:** AUDITED & ARCHITECTURALLY VERIFIED  

---

## 1. Table C — Neon PostgreSQL Database Configuration

| Configuration Item | Implementation Specification | Source Code Reference | Safety / Security Standard |
| :--- | :--- | :--- | :--- |
| **Provider** | Neon Serverless PostgreSQL (`ap-southeast-1` Singapore) | `prisma/schema.prisma` | Enterprise-grade TLS 1.3 encryption in transit |
| **Pooled Connection (`DATABASE_URL`)** | Connects through PgBouncer pooler (`-pooler.c-3.ap-southeast-1.aws.neon.tech:5432`) | `src/lib/db/prisma.ts`, `src/lib/env.ts` | Eliminates connection exhaustion during high-concurrency serverless spikes |
| **Direct Connection (`DIRECT_URL`)** | Connects directly to PostgreSQL master (port 5432 without pooler) | `prisma/schema.prisma` | Required by Prisma CLI for schema migrations and advisory locks |
| **Active Schema Tables** | 38 tables across Salon Management, Appointments, CRM, Payments, CMS, and Outbox | `prisma/schema.prisma` | Canonical migration applied; relational foreign keys & indexes |
| **Repository Resilience** | Dual-mode persistence in `src/lib/db/repo.ts`: seamlessly connects to Neon Prisma, with safe in-memory fallback during offline testing | `src/lib/db/repo.ts` | Prevents serverless container crashes during transient network latency |
| **Database Health Probe** | Read-only SQL query (`SELECT 1`) endpoint at `/api/health/database` | `src/app/api/health/database/route.ts` | Provides uptime and query latency monitoring without exposing connection strings |
| **Sensitive Field Masking** | Passwords hashed via `bcryptjs` (salt 10); payment secrets encrypted via AES-256-GCM | `src/lib/security/encryption.ts` | Zero plaintext credentials in database rows |

---

## 2. Table D — Razorpay Payment Gateway Configuration

| Configuration Item | Implementation Specification | Source Code Reference | Security Verification Status |
| :--- | :--- | :--- | :--- |
| **Test Merchant Key ID** | `RAZORPAY_TEST_KEY_ID` or `RAZORPAY_KEY_ID` (starts with `rzp_test_`) | `src/lib/db/repo.ts` | **CONFIGURED & VERIFIED** (In Test Mode) |
| **Test Merchant Secret** | `RAZORPAY_TEST_KEY_SECRET` or `RAZORPAY_KEY_SECRET` | `src/lib/db/repo.ts` | **CONFIGURED & VERIFIED** (In Test Mode) |
| **Test Webhook Secret** | `RAZORPAY_TEST_WEBHOOK_SECRET` or `RAZORPAY_WEBHOOK_SECRET` | `src/lib/db/repo.ts` | **CONFIGURED & VERIFIED** (In Test Mode) |
| **Live Merchant Key ID** | `RAZORPAY_LIVE_KEY_ID` (must start with `rzp_live_`) | `src/lib/db/repo.ts` | **BLOCKED (Awaiting Owner Action & Live Activation)** |
| **Live Merchant Secret** | `RAZORPAY_LIVE_KEY_SECRET` | `src/lib/db/repo.ts` | **BLOCKED (Awaiting Owner Action & Live Activation)** |
| **Live Webhook Secret** | `RAZORPAY_LIVE_WEBHOOK_SECRET` | `src/lib/db/repo.ts` | **BLOCKED (Awaiting Owner Action & Live Activation)** |
| **Gateway Encryption Key** | `PAYMENT_ENCRYPTION_KEY` (32-byte hex for AES-256-GCM) | `src/lib/security/encryption.ts` | **CONFIGURED** in local environment |
| **Webhook Endpoint URL** | `https://www.thejawedhabibsalons.in/api/webhooks/razorpay` | `src/app/api/webhooks/razorpay/route.ts` | Verified endpoint; supports `order.paid`, `payment.captured`, `payment.failed`, `refund.processed` |
| **Signature Verification** | Timing-safe HMAC SHA-256 via `crypto.timingSafeEqual` | `src/lib/payments/razorpay.ts` | Prevents timing attacks on signature validation |
| **Server-Side Price Authority** | Orders calculate prices strictly from server DB catalog; client-submitted totals are ignored | `src/app/api/payments/create-order/route.ts` | Prevents client-side price tampering or fraud |
| **Webhook Deduplication** | Webhook events are checked against `PaymentRecord.gatewayPaymentId` idempotency cache | `src/app/api/webhooks/razorpay/route.ts` | Prevents double-crediting if Razorpay retries webhook delivery |

---

## 3. Test vs Live Mode Isolation Architecture

```
                  ┌───────────────────────────────────────────────┐
                  │ Target Environment: TEST                      │
                  ├───────────────────────────────────────────────┤
                  │ Key ID prefix MUST BE 'rzp_test_'             │
                  │ Live keys ('rzp_live_') STRICTLY REJECTED     │
                  │ Test mock fallbacks permitted in unit tests   │
                  └───────────────────────────────────────────────┘

                  ┌───────────────────────────────────────────────┐
                  │ Target Environment: LIVE                      │
                  ├───────────────────────────────────────────────┤
                  │ Key ID prefix MUST BE 'rzp_live_'             │
                  │ Test keys ('rzp_test_') STRICTLY REJECTED     │
                  │ Atomic pair required: ID + SECRET both set   │
                  │ Strictly barred in Preview & Dev environments │
                  └───────────────────────────────────────────────┘
```

1. **Prefix Validation Guard:** If `RAZORPAY_TEST_KEY_ID` contains a live prefix (`rzp_live_`), the system immediately throws an exception: `"Inconsistent credentials: Live Key ID detected while running in Test Mode."`
2. **Atomic Pair Validation:** The system refuses to activate Live Mode if only one half of the credential pair is supplied.
3. **Double Crediting Protection:** If a customer pays and the client confirms the payment, subsequent webhook arrivals for the same `paymentId` detect the existing completed transaction and safely return HTTP 200 without double recording.
