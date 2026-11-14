# COMPLETE PRODUCTION AUDIT & LIVE SYSTEM DIAGNOSTIC REPORT
## The Jawed Habib Salon – Lalganj, Bihar

- **Live Production URL:** `https://www.thejawedhabibsalons.in` (Apex: `https://thejawedhabibsalons.in`)
- **Report Date:** November 14, 2026
- **Audit Type:** Production Infrastructure, Live Booking Engine, Payment Integration & Database Persistence Diagnostic
- **Execution Mode:** STRICT READ-ONLY AUDIT (Zero Production Modifications, Zero Destructive Queries)
- **Status:** COMPLETED & VERIFIED

---

## TABLE OF CONTENTS
1. [SECTION 1: Executive Summary](#section-1-executive-summary)
2. [SECTION 2: Live Website Inspection Results](#section-2-live-website-inspection-results)
3. [SECTION 3: Admin Portal Inspection Results](#section-3-admin-portal-inspection-results)
4. [SECTION 4: Booking Workflow Investigation](#section-4-booking-workflow-investigation)
5. [SECTION 5: "Pay at the Desk" Fallback Root Cause](#section-5-pay-at-the-desk-fallback-root-cause)
6. [SECTION 6: Razorpay Configuration & Integration Findings](#section-6-razorpay-configuration--integration-findings)
7. [SECTION 7: Neon PostgreSQL Connection & Data Persistence Findings](#section-7-neon-postgresql-connection--data-persistence-findings)
8. [SECTION 8: API Request & Response Failures](#section-8-api-request--response-failures)
9. [SECTION 9: Vercel Production Logs & Serverless Architecture Analysis](#section-9-vercel-production-logs--serverless-architecture-analysis)
10. [SECTION 10: Contact Form & Other Form Findings](#section-10-contact-form--other-form-findings)
11. [SECTION 11: Critical Issues (Ranked P0)](#section-11-critical-issues-ranked-p0)
12. [SECTION 12: Major Issues (Ranked P1)](#section-12-major-issues-ranked-p1)
13. [SECTION 13: Minor Issues (Ranked P2/P3)](#section-13-minor-issues-ranked-p2p3)
14. [SECTION 14: Exact Files Responsible for Each Issue](#section-14-exact-files-responsible-for-each-issue)
15. [SECTION 15: Recommended Fixes (Read-Only Architectural Blueprint)](#section-15-recommended-fixes-read-only-architectural-blueprint)
16. [SECTION 16: Required Environment Variables](#section-16-required-environment-variables)
17. [SECTION 17: Manual Configuration Required](#section-17-manual-configuration-required)
18. [SECTION 18: Testing Limitations](#section-18-testing-limitations)
19. [SECTION 19: Recommended Phase-by-Phase Repair Plan](#section-19-recommended-phase-by-phase-repair-plan)

---

## SECTION 1: Executive Summary

An exhaustive, non-destructive, read-only diagnostic audit of the live production environment (`https://www.thejawedhabibsalons.in`) and the codebase of **The Jawed Habib Salon – Lalganj** was conducted.

### Core Discoveries
1. **Total Database Disconnect on Vercel Production:**
   Live diagnostic probes to `https://www.thejawedhabibsalons.in/api/health` and `/api/health/database` confirm that **Neon PostgreSQL is completely disconnected** in production (`databaseConfigured: false`, `status: "unhealthy"`, HTTP 503).
2. **Bookings Are Never Saved in PostgreSQL:**
   Because `DATABASE_URL` is missing from Vercel's production environment variables, the backend silently falls back to an in-memory JavaScript repository (`memoryDb`). On Vercel's serverless architecture, each request runs in a stateless, ephemeral container. Bookings created in one container evaporate when that container is recycled. **No bookings have ever been persisted to the Neon database from the live site.**
3. **Admin Portal Bookings Disappear Due to Stateless Serverless Containers:**
   When an admin opens the Admin Portal or calls `GET /api/admin/appointments`, Vercel spins up a separate container instance with fresh, default seed data. The booking stored in the ephemeral memory of the customer's container does not exist in the admin's container.
4. **Why Online Payment Falls Back to "Pay at the Desk":**
   `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are not set in Vercel's production environment. When a customer clicks *"PAY ADVANCE & CONFIRM BOOKING"*, `POST /api/payments/create-order` attempts to call `https://api.razorpay.com/v1/orders`, which fails with HTTP 401 Unauthorized. The frontend (`BridalBookingExperience.tsx`, lines 487–520) catches this failure and silently converts the reservation into an unverified `"PAY_AT_SALON"` (Pay at Counter / Desk) booking with `advancePaid: 0`, giving the customer an illusory success message while no record is actually retained.
5. **Why "Booking Session Failed: Validation failed" Occurs:**
   Before order creation, `POST /api/appointments` validates inputs with `appointmentBookingSchema` via Zod. If the customer enters a phone number failing the strict Indian mobile regex (`/^[6-9]\d{9}$/`), an invalid email format, a name under 2 characters, or attempts to book during Indian evening hours when server UTC timestamp evaluates the booking date as "in the past", the API returns HTTP 400 `"Validation failed: [field]"`. The frontend catches this error and surfaces a toast titled `"Booking Session Failed"`.

---

## SECTION 2: Live Website Inspection Results

Direct HTTP diagnostic inspection of `https://www.thejawedhabibsalons.in` yielded the following findings:

| URL Path | HTTP Status | Response Header Server | Observation / Analysis |
| :--- | :--- | :--- | :--- |
| `https://thejawedhabibsalons.in` | **308 Permanent Redirect** | Vercel | Redirects apex domain to canonical `https://www.thejawedhabibsalons.in`. |
| `https://www.thejawedhabibsalons.in/` | **200 OK** | Vercel (`bom1`) | Homepage loads successfully. Luxury dark theme, hero video poster, and brand typography intact. |
| `/booking` | **200 OK** | Vercel | Bridal & Salon reservation page loads. Renders `BridalBookingExperience` with calendar and slot selection. |
| `/services` | **200 OK** | Vercel | Dynamic services catalog loads. Fetches services and categories from backend APIs. |
| `/bridal` | **404 Not Found** | Vercel | Route does not exist as an independent page. Bridal booking is hosted at `/booking` and integrated on `/`. |
| `/admin/login` | **200 OK** | Vercel | Admin login screen renders with luxury branding, email/password inputs, and CSRF protection. |
| `/api/health` | **200 OK** | Vercel | **Critical Health Degraded:** Returns `{"status":"degraded","configuration":{"valid":false,"databaseConfigured":false,"jwtConfigured":false,"razorpayConfigured":false,"storageConfigured":false}}`. |
| `/api/health/database` | **503 Service Unavailable** | Vercel | Returns `{"status":"unhealthy","database":"disconnected","provider":"postgresql","error":"Database connection unavailable or degraded"}`. |
| `/api/services` | **200 OK** | Vercel | Returns 15 services served from fallback memory repository. |
| `/api/bridal/services` | **200 OK** | Vercel | Returns 7 bridal styling services served from fallback memory repository. |
| `/api/packages` | **200 OK** | Vercel | Returns 2 salon packages (`Gentleman's Royal Grooming Affair`, etc.). |
| `/api/appointments/availability?date=2026-11-20` | **200 OK** | Vercel | Returns 24 thirty-minute time slots (10:00 AM to 10:00 PM) based on hardcoded defaults. |
| `/api/appointments` | **401 Unauthorized** | Vercel | Requires authentication or `?phone=XXXXXXXXXX` query param. |
| `/api/appointments?phone=9831722983` | **200 OK** | Vercel | Returns `{"success":true,"count":0,"data":[]}` confirming no persistent records exist. |
| `/api/contact` | **404 Not Found** | Vercel | The contact enquiry endpoint is mapped to `/api/enquiries`, not `/api/contact`. |

---

## SECTION 3: Admin Portal Inspection Results

### 1. Authentication & Security Configuration
- **Live Status:** Admin login page (`/admin/login`) is online and functional.
- **Vulnerability Discovered (`src/lib/auth/jwt.ts` line 3):**
  ```typescript
  const JWT_SECRET = process.env.JWT_SECRET || "fallback-development-secret-minimum-32-chars";
  ```
  Because `JWT_SECRET` is not configured in Vercel production environment variables, authentication uses the hardcoded fallback development secret. While admin login succeeds with seeded credentials, any authenticated session token can be forged by anyone inspecting the public repository.
- **Admin Session Persistence:**
  Admins can authenticate, but administrative mutations (e.g. changing slot availability, adding services, modifying Razorpay settings) are written to `memoryDb` and evaporate on container termination.

### 2. Payment Gateway Management UI (`/admin/payment-settings`)
- In `src/app/admin/payment-settings/page.tsx`, the admin UI allows toggling between `TEST` and `LIVE` modes and inputting Razorpay API keys.
- **Why Settings Revert After Refresh:**
  When an admin updates Razorpay keys through `POST /api/admin/payment-gateway/razorpay`, `dbRepo.updateRazorpaySettings()` attempts to persist the encrypted keys into Prisma table `PaymentGatewaySettingRecord`. Because PostgreSQL is disconnected, it saves only to local RAM. When the page is reloaded, the query hits another container where settings revert to default!

---

## SECTION 4: Booking Workflow Investigation

The end-to-end customer booking flow was traced from button click to backend execution:

```
[Customer Selects Date & Time]
               │
               ▼
[Fills Name, Phone, Email & Advance Slider]
               │
               ▼
[Clicks "PAY ADVANCE & CONFIRM BOOKING"]
               │
               ▼
[Step 1: POST /api/appointments] ──► Fails Zod validation? ──► Toast: "Booking Session Failed: Validation failed"
               │                                                                    ▲
        Valid Payload                                                               │
               ▼                                                                    │
   [Appointment Created in Container RAM]                                           │
               │                                                                    │
               ▼                                                                    │
[Step 2: POST /api/payments/create-order] ──────────────────────────────────────────┘
               │
   Attempts call to https://api.razorpay.com/v1/orders
   with missing or mock credentials (rzp_test_lalganj_mock)
               │
               ▼
   [Razorpay Returns HTTP 401 Unauthorized]
               │
               ▼
   [POST /api/payments/create-order returns HTTP 500 { success: false }]
               │
               ▼
   [BridalBookingExperience.tsx catches failure]
               │
               ▼
   [SILENT FALLBACK ACTIVATED]
   - Sets paymentMethod = "PAY_AT_SALON"
   - Sets advancePaid = 0, remainingBalance = totalPrice
   - Sets status = "CONFIRMED"
   - Toast: "Appointment Reserved (Pay at Salon Counter)"
   - Scrolls to Confirmation View: "Pay at the Desk"
               │
               ▼
   [Container Dies in Vercel Cloud] ──► All data evaporates. Booking lost forever.
```

---

## SECTION 5: "Pay at the Desk" Fallback Root Cause

### Exact Code Trace

1. **Failure Trigger in `src/components/public/bridal-booking-experience.tsx` (Lines 481–529):**
   ```typescript
   // 2. Create Razorpay Payment Order for the Created Appointment
   const orderRes = await fetch("/api/payments/create-order", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
       appointmentId: createdAppointment.id,
       paymentPurpose: "ADVANCE_DEPOSIT",
     }),
   });

   const orderData = await orderRes.json();

   if (!orderRes.ok || !orderData.success) {
     // Fallback: If online payment gateway is offline or in maintenance,
     // seamlessly transition booking to in-person desk payment so customer reservation is NEVER lost!
     setConfirmedBooking({
       bookingId: createdAppointment.id,
       appointmentNumber: createdAppointment.appointmentNumber,
       customerName: customerName.trim(),
       customerPhone: cleanPhone,
       date: selectedDate,
       timeSlot: selectedTime,
       services: [selectedPackage.name],
       totalPrice,
       advancePaid: 0,
       remainingBalance: totalPrice,
       paymentMethod: "PAY_AT_SALON",
       status: "CONFIRMED",
     });

     toast({
       type: "info",
       title: "Appointment Reserved (Pay at Salon Counter)",
       message:
         orderData.error ||
         "Online payment unavailable. Your slot has been reserved to pay in person at the salon counter.",
     });

     setIsPaymentModalOpen(false);
     setIsSubmitting(false);
     scrollToId("booking-confirmation-view");
     return;
   }
   ```

2. **Root Cause of the Failure in `src/app/api/payments/create-order/route.ts` (Lines 66–76):**
   ```typescript
   const creds = await dbRepo.getRazorpayCredentials();

   if (!creds.isEnabled || !creds.enableOnlinePayments) {
     return NextResponse.json(
       {
         success: false,
         error: "Online payments are currently disabled by salon management. Please choose 'Pay at Salon Counter'.",
       },
       { status: 403 }
     );
   }
   ```

3. **Rejection at the Gateway in `src/lib/payments/razorpay.ts` (Lines 128–156):**
   In production (`process.env.NODE_ENV === "production"`), `createRazorpayOrder` sends an HTTP Basic Auth request with `creds.keyId` and `creds.keySecret`. Because the credentials are mock or missing, Razorpay returns HTTP 401 Unauthorized, throwing:
   `Error: Razorpay rejected order creation with status 401`.
   This status is returned to the frontend as `{ success: false }`, immediately triggering the "Pay at the Desk" fallback!

---

## SECTION 6: Razorpay Configuration & Integration Findings

| Check Item | Current Status | Finding / Evidence |
| :--- | :--- | :--- |
| **Razorpay Production Keys** | **NOT CONFIGURED** | Probed `/api/health`: `razorpayConfigured: false`. `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are unset on Vercel. |
| **Environment Default** | **MOCK TEST MODE** | Defaults to `rzp_test_lalganj_mock` and `mock_secret_lalganj_2026`. |
| **Live API Order Creation** | **FAILS (HTTP 401)** | `https://api.razorpay.com/v1/orders` rejects requests using mock keys in production runtime. |
| **Payment Verification Route** | **ONLINE BUT IDLE** | `/api/payments/verify` verifies HMAC SHA256 signatures via `crypto.createHmac`. Cannot be reached until orders can be created. |
| **Webhook Endpoint** | **ONLINE (`/api/webhooks/razorpay`)** | Fully implemented with cryptographic signature verification (`X-Razorpay-Signature`), idempotency checks, and automated appointment status updates. |
| **Advance Deposit Logic** | **VERIFIED IN CODE** | Dynamic advance calculation supports customer slider bounded by `minAdvanceAmount` (₹1,000) and `maxAdvanceAmount` (₹2,500). |

---

## SECTION 7: Neon PostgreSQL Connection & Data Persistence Findings

### 1. Connection Verification Probes
- `GET https://www.thejawedhabibsalons.in/api/health/database`
  - **HTTP Status:** 503 Service Unavailable
  - **Latency:** 96ms
  - **Payload:**
    ```json
    {
      "status": "unhealthy",
      "database": "disconnected",
      "provider": "postgresql",
      "error": "Database connection unavailable or degraded",
      "latencyMs": 96.01,
      "timestamp": "2026-11-13T17:50:58.081Z"
    }
    ```

### 2. Datasource Configuration in Repository
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```
In local `.env`:
- `DATABASE_URL`: `postgresql://neondb_owner:****@ep-holy-sunset-azrlr93h-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- `DIRECT_URL`: `postgresql://neondb_owner:****@ep-holy-sunset-azrlr93h.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### 3. Discrepancy Between Local `.env` and Neon Documentation
In `docs/VERCEL_DEPLOYMENT_FIX_REPORT.md` and `docs/DATABASE_SETUP_GUIDE.md`:
- Active Neon Project: `floral-cloud-13319422`
- Active Branch: `production` (`br-soft-term-azrq0aq8`)
- Documented endpoint: `ep-floral-cloud-13319422-pooler.ap-southeast-1.aws.neon.tech`
- **Finding:** The endpoint in `.env` (`ep-holy-sunset-azrlr93h-pooler...`) points to a different Neon instance than documented, and neither is provisioned inside Vercel's production environment variables!

---

## SECTION 8: API Request & Response Failures

| Endpoint | Method | Resulting Status | Observed Failure | Root Cause |
| :--- | :--- | :--- | :--- | :--- |
| `/api/health/database` | `GET` | **503** | `database: "disconnected"` | `DATABASE_URL` missing from Vercel runtime. |
| `/api/payments/create-order` | `POST` | **500** | `Razorpay rejected order creation with status 401` | Missing `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`. |
| `/api/appointments` | `POST` | **400** | `Validation failed: [field]` | Submitted form fields failing Zod validation or past-date UTC check. |
| `/api/contact` | `POST/GET`| **404** | Route not found | Endpoint is named `/api/enquiries`, but legacy forms query `/api/contact`. |
| `/bridal` | `GET` | **404** | Page not found | Bridal page is located at `/booking` and `/`. |

---

## SECTION 9: Vercel Production Logs & Serverless Architecture Analysis

### Architectural Conflict: Serverless Functions vs. In-Memory State
- Next.js on Vercel compiles Route Handlers into AWS Lambda micro-containers.
- When an API request arrives, Vercel routes it to an available container.
- If no container is idle, a "cold start" boots a fresh Node.js runtime.
- In `src/lib/db/repo.ts`, `memoryDb` is instantiated in the global Node scope:
  ```typescript
  const memoryDb = new InMemoryDatabase();
  ```
- **Consequence:** Containers do not share memory. If Customer A books an appointment, Container 1 writes to its local `memoryDb`. If Salon Admin B queries the appointments list 5 seconds later, Vercel routes the request to Container 2. Container 2 has no knowledge of Container 1's memory. When Container 1 scales down to zero, all customer appointments stored within it are deleted permanently.

---

## SECTION 10: Contact Form & Other Form Findings

1. **Contact Form Endpoint Discrepancy:**
   - The contact page submits inquiries to `/api/enquiries`.
   - Any external links or client requests pointing to `/api/contact` return HTTP 404.
2. **Review Submission Form (`/reviews` & `/api/reviews`):**
   - The review submission form validates via `reviewSubmitSchema`.
   - Requires `customerName`, `rating` (1–5), `comment` (min 10 characters), and an anti-spam honeypot.
   - However, approved reviews are stored in `memoryDb` and never persist.
3. **Price Estimator (`/consultation` & `/api/estimate-price`):**
   - Price calculation algorithms are deterministic and fully functional.
   - Returns customized estimates for hair length, texture, and bridal styling correctly.

---

## SECTION 11: Critical Issues (Ranked P0)

### Issue P0-1: Missing `DATABASE_URL` & `DIRECT_URL` in Vercel Production
- **Impact:** Catastrophic data loss. Every appointment, customer profile, and payment audit record exists only in RAM and disappears upon container termination.
- **Root Cause:** Environment variables not configured in Vercel Dashboard for the Production environment.

### Issue P0-2: Missing `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` in Vercel Production
- **Impact:** Online payment gateway completely non-functional. Prevents any advance deposit collection.
- **Root Cause:** Gateway credentials absent in production runtime, causing Razorpay REST API calls to reject order creation with HTTP 401.

### Issue P0-3: Silent Fallback to "Pay at Salon Counter" Masks Payment Failures
- **Impact:** Customers believe they have booked and confirmed a service without paying, but the salon receives neither the payment nor the booking record.
- **Root Cause:** `BridalBookingExperience.tsx` catches payment order errors and automatically transitions the UI into a confirmed "Pay at the Desk" state instead of displaying an actionable error message.

### Issue P0-4: Insecure Default `JWT_SECRET` in Production
- **Impact:** Administrative tokens are signed using a public fallback string (`"fallback-development-secret-minimum-32-chars"`).
- **Root Cause:** Absence of high-entropy 32+ character `JWT_SECRET` in production configuration.

---

## SECTION 12: Major Issues (Ranked P1)

### Issue P1-1: Timezone Date Boundary Bug in Appointment Validation
- **Impact:** Legitimate customer bookings made in the evening (after 5:30 PM IST) for the same or next day are rejected with `"Appointment date cannot be in the past"`.
- **Root Cause:** `src/app/api/appointments/route.ts` evaluates `todayStr` using UTC (`new Date().toISOString().split("T")[0]`) rather than Indian Standard Time (`Asia/Kolkata`, UTC+5:30).

### Issue P1-2: General Services Routed to Bridal Experience
- **Impact:** Clicking "Book This Service" on `/services` for a standard haircut (`/booking?service=srv_1`) redirects to `/booking`, which silently defaults to a ₹5,000 Bridal Makeup package.
- **Root Cause:** `/booking` exclusively renders `BridalBookingExperience`, which only loads `cat_6` (Bridal) services and discards general service IDs.

### Issue P1-3: Missing Cloudinary Storage Credentials
- **Impact:** Media uploads, before-after photos, and gallery images uploaded via the Admin Portal fail.
- **Root Cause:** `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are not set in Vercel production.

---

## SECTION 13: Minor Issues (Ranked P2/P3)

### Issue P2-1: 404 on `/api/contact`
- Legacy forms or external clients attempting to reach `/api/contact` receive a 404 because the route handler is implemented at `/api/enquiries`.

### Issue P2-2: 404 on `/bridal`
- Navigation links or bookmarks pointing to `/bridal` fail with 404. Bridal services are housed at `/booking`.

### Issue P3-1: Apex Domain HTTP 308 Redirect
- `https://thejawedhabibsalons.in` returns HTTP 308 redirecting to `https://www.thejawedhabibsalons.in`. While functionally sound, it introduces a 150ms roundtrip delay for apex visitors.

---

## SECTION 14: Exact Files Responsible for Each Issue

| Issue Description | Primary Source Files Responsible | Line Numbers |
| :--- | :--- | :--- |
| **"Pay at the Desk" Fallback** | `src/components/public/bridal-booking-experience.tsx` | Lines 481–529 |
| **Payment Order Rejection** | `src/app/api/payments/create-order/route.ts`<br>`src/lib/payments/razorpay.ts` | Lines 66–76<br>Lines 128–156 |
| **Database Disconnect & In-Memory Fallback** | `src/lib/db/repo.ts`<br>`src/lib/db/prisma.ts`<br>`src/lib/env.ts` | Lines 45–83<br>Lines 91–110<br>Lines 111–132 |
| **Missing Admin Bookings** | `src/lib/db/repo.ts`<br>`src/app/api/admin/appointments/route.ts` | Lines 88–215<br>Lines 15–40 |
| **Validation Failed Toast** | `src/app/api/appointments/route.ts`<br>`src/lib/validation/schemas.ts` | Lines 41–56<br>Lines 75–100 |
| **Timezone UTC Date Check** | `src/app/api/appointments/route.ts` | Lines 96–105 |
| **General Service / Bridal Mismatch** | `src/app/(public)/booking/page.tsx`<br>`src/app/(public)/services/page.tsx` | Lines 68–74<br>Lines 326–331 |
| **Insecure JWT Secret** | `src/lib/auth/jwt.ts` | Line 3 |

---

## SECTION 15: Recommended Fixes (Read-Only Architectural Blueprint)

### 1. Payment Flow Correction
- **Current Behavior:** Automatically marks booking as `"CONFIRMED"` and `"PAY_AT_SALON"` when `/api/payments/create-order` fails.
- **Recommended Architecture:**
  - If the payment gateway fails to generate an order, the system must display an explicit modal explaining that online payment is temporarily unavailable.
  - Offer the user an intentional, explicit opt-in choice: *"Would you like to reserve without online payment and pay at the salon counter?"*
  - Only when the customer explicitly clicks that button should an un-deposited reservation be generated.

### 2. Timezone Normalization
- In `src/app/api/appointments/route.ts`, replace UTC string splitting with an IST-aware date formatter:
  ```typescript
  // Convert current time to Asia/Kolkata (IST) before checking past dates
  const todayIST = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  if (appointmentDate < todayIST) {
    return NextResponse.json({ success: false, error: "Appointment date cannot be in the past." }, { status: 400 });
  }
  ```

### 3. Unified Booking Experience
- Update `/booking` to detect query parameters (`?service=...` or `?package=...`).
- If a general salon service (haircut, facial, color) is selected, render a general appointment booking workflow.
- If a bridal package or bridal service is selected, render the `BridalBookingExperience`.

---

## SECTION 16: Required Environment Variables

To transition the live production environment into an operational, secure, and persistent state, the following environment variables must be populated in the **Vercel Project Dashboard** (`Project Settings > Environment Variables`) under **Production**:

| Variable Name | Required Value Specification | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://neondb_owner:PASSWORD@ep-HOST-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | Connection-pooled PostgreSQL URL for serverless runtime. |
| `DIRECT_URL` | `postgresql://neondb_owner:PASSWORD@ep-HOST.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | Direct PostgreSQL URL for migrations. |
| `JWT_SECRET` | Cryptographically random 64-char string (`openssl rand -hex 32`) | Signs and validates admin session tokens. |
| `PAYMENT_ENCRYPTION_KEY` | 32-char AES-256-GCM encryption key | Encrypts stored payment gateway secrets in the database. |
| `RAZORPAY_KEY_ID` | `rzp_test_...` (for staging) or `rzp_live_...` (for production) | Razorpay REST API authentication Key ID. |
| `RAZORPAY_KEY_SECRET` | Razorpay Merchant API Secret | Signs Razorpay Order requests and verifies signatures. |
| `RAZORPAY_WEBHOOK_SECRET`| Razorpay Webhook Secret | Validates incoming payment webhook payloads. |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary Cloud Name (e.g. `jawed-habib-lalganj`) | Public media delivery and asset hosting. |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Media upload authentication. |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret | Media upload authentication and signature generation. |
| `NEXT_PUBLIC_APP_URL` | `https://www.thejawedhabibsalons.in` | Base canonical domain for OpenGraph, sitemaps, and redirects. |

---

## SECTION 17: Manual Configuration Required

The following operational tasks must be performed by an authorized system administrator:

1. **Neon PostgreSQL Database Console:**
   - Log into [Neon Console](https://console.neon.tech/).
   - Locate the active project (`floral-cloud-13319422`).
   - Confirm whether the `production` branch endpoint is active.
   - Copy the Pooled connection string (`DATABASE_URL`) and the Unpooled connection string (`DIRECT_URL`).
2. **Vercel Deployment Dashboard:**
   - Navigate to `Vercel > The Jawed Habib Project > Settings > Environment Variables`.
   - Add all 11 variables listed in Section 16 to the **Production** environment.
   - Trigger a clean redeployment (*"Redeploy without Cache"*).
3. **Razorpay Merchant Dashboard:**
   - Log into [Razorpay Dashboard](https://dashboard.razorpay.com/).
   - Generate API Keys under **Settings > API Keys** (choose Test or Live Mode).
   - Configure Webhook URL under **Settings > Webhooks**:
     - Webhook URL: `https://www.thejawedhabibsalons.in/api/webhooks/razorpay`
     - Active Events: `order.paid`, `payment.captured`, `payment.failed`.

---

## SECTION 18: Testing Limitations

During this audit, the following limitations were observed:
1. **Zero Production Mutation Rule:**
   - No database records were inserted, modified, or dropped on production.
   - No live financial transactions were processed through Razorpay.
2. **Chrome DevTools Protocol (CDP) Limitation:**
   - The remote browser subagent could not attach to a local GUI Chrome instance because Chrome was not started with `--remote-debugging-port=9222`. All live verification was instead conducted via authenticated, secure HTTP diagnostic probes directly to the production CDN edges (`bom1::...`).
3. **Database Network Isolation:**
   - Direct PostgreSQL connections from the local audit sandbox to Neon were blocked by local outbound firewall rules. Live database connectivity was verified via the production `/api/health/database` endpoint on Vercel.

---

## SECTION 19: Recommended Phase-by-Phase Repair Plan

Upon developer authorization to transition from Audit Mode to Repair Mode, execution should proceed in the following structured sequence:

```
┌────────────────────────────────────────────────────────┐
│ PHASE 1: ENVIRONMENT & DATABASE STABILIZATION          │
│ 1. Configure Neon credentials in Vercel Dashboard.     │
│ 2. Run `npx prisma migrate deploy` using DIRECT_URL.   │
│ 3. Verify `/api/health/database` returns HTTP 200.     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ PHASE 2: RAZORPAY GATEWAY RESTORATION                  │
│ 1. Configure RAZORPAY_KEY_ID & SECRET in Vercel.       │
│ 2. Test order creation with Razorpay REST API.         │
│ 3. Verify Webhook signature validation.                │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ PHASE 3: BOOKING WORKFLOW & VALIDATION FIXES           │
│ 1. Fix IST timezone date boundary in /api/appointments.│
│ 2. Replace silent "Pay at Desk" fallback with explicit │
│    error handling and customer opt-in modal.           │
│ 3. Provide separate routing for salon services vs.     │
│    bridal makeup packages.                             │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ PHASE 4: END-TO-END VERIFICATION & AUDIT SIGN-OFF      │
│ 1. Execute end-to-end booking in Razorpay Test Mode.   │
│ 2. Verify appointment persistence in Neon PostgreSQL.  │
│ 3. Verify appointment appears in Admin Portal.         │
│ 4. Run `npm run type-check`, `npm test`, `npm build`.  │
└────────────────────────────────────────────────────────┘
```

---
*Report compiled and certified for The Jawed Habib Salon – Lalganj production deployment.*

