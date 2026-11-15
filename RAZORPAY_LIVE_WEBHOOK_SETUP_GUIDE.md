# RAZORPAY LIVE WEBHOOK SETUP & INTEGRATION GUIDE
## The Jawed Habib Salon – Lalganj

**Document Type:** Technical Operations & Payment Integration Guide  
**Project:** The Jawed Habib Salon – Lalganj  
**Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Vaishali, Bihar – 844121  
**Operating Hours:** Monday – Sunday: 10:00 AM – 10:00 PM (Open all 7 days)  
**Production Domain:** `https://www.thejawedhabibsalons.in`  
**API Webhook Route:** `/api/webhooks/razorpay`  
**Status:** Verified & Production Ready  

---

## 1. Executive Overview

Razorpay Webhooks provide asynchronous, server-to-server confirmation of payment lifecycle events. In client-side checkouts (such as the Razorpay Modal or UPI redirection), network interruptions, closed browser tabs, or mobile app switching can prevent client callbacks from completing. Webhooks ensure that every payment authorized by the customer is reliably recorded in the salon's Neon PostgreSQL database, triggers immediate transactional receipt emails, and updates salon appointment calendars without human intervention.

This guide provides step-by-step instructions for the salon administrator and technical team to configure, secure, and verify the Razorpay Live Webhook endpoint.

---

## 2. Webhook Endpoint Specifications

| Specification | Configuration Value |
| :--- | :--- |
| **Full Webhook URL** | `https://www.thejawedhabibsalons.in/api/webhooks/razorpay` |
| **HTTP Method** | `POST` |
| **Payload Format** | `application/json` (Raw body preserved for HMAC verification) |
| **Authentication Header** | `X-Razorpay-Signature` (HMAC SHA-256 hex digest) |
| **Runtime Environment** | Next.js Node.js Server Runtime (`runtime = 'nodejs'`) |
| **Caching Policy** | Force Dynamic (`export const dynamic = 'force-dynamic'`) |
| **Expected Response Time** | `< 400ms` (Instant response with async email triggering) |
| **Success Response** | `200 OK` with `{ success: true, received: true, event: "...", eventId: "..." }` |
| **Duplicate Response** | `200 OK` with `{ status: "ok", message: "Duplicate...", duplicate: true }` |

---

## 3. Subscribed Webhook Events

Configure **only** the following 4 official Razorpay events in the Razorpay Dashboard. All other events are ignored gracefully:

| Event Name | Trigger Condition | System Action |
| :--- | :--- | :--- |
| `order.paid` | Customer completes payment and order amount is fully captured. | Verifies signature, marks `Appointment` status as `CONFIRMED`, creates/updates `PaymentRecord` with status `SUCCESS`, and triggers transactional email receipt to client. |
| `payment.captured` | Payment authorization has been auto-captured (`payment_capture: 1`). | Secondary confirmation for direct payment links/UPI intents; ensures payment state idempotency and prevents unrecorded captures. |
| `payment.failed` | Customer card declined, UPI timeout, or bank authentication failure. | Records `PaymentRecord` with status `FAILED` and gateway failure reason; keeps appointment slot open for retry. |
| `refund.processed` | Salon concierge or admin initiates refund from Razorpay dashboard or Admin portal. | Updates `PaymentRecord` with refund amount, records refund transaction in database, and logs admin audit event. |

---

## 4. Webhook Secret Generation & Storage

The webhook secret is a shared secret key used to verify that incoming webhook payloads originate from Razorpay and have not been tampered with in transit.

### 4.1 Generating a Cryptographically Secure Secret
Run either of the following commands on your secure terminal:

```bash
# Using OpenSSL (Recommended)
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
*Example generated secret:* `f9b8c2d1e04a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c`

### 4.2 Configuring the Secret in Hosting Environments
1. **Vercel Production Environment:**
   - Key: `RAZORPAY_LIVE_WEBHOOK_SECRET`
   - Value: `<YOUR_GENERATED_64_CHAR_SECRET>`
   - Target Environment: **Production only**
2. **Neon Database Gateway Settings (Encrypted at Rest):**
   - Alternatively, enter this secret in the Admin Portal under:
     `Admin Portal` → `Settings` → `Payment Gateway` → `Live Webhook Secret`
   - The value is automatically encrypted using AES-256-GCM before database insertion.

---

## 5. Step-by-Step Configuration in Razorpay Dashboard

### Step 1: Sign in to Razorpay
1. Open the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch the dashboard mode toggle in the top navigation from **Test Mode** to **Live Mode**.

### Step 2: Navigate to Webhook Settings
1. In the left-hand navigation sidebar, click on **Settings** (gear icon).
2. Click on the **Webhooks** tab.
3. Click the **+ Add New Webhook** button in the top right corner.

### Step 3: Enter Webhook Details
In the modal dialog, fill in the following fields:

1. **Webhook URL:**
   ```
   https://www.thejawedhabibsalons.in/api/webhooks/razorpay
   ```
2. **Secret:**
   Paste your generated high-entropy webhook secret (from Section 4.1).
3. **Alert Email:**
   Enter the salon operational email (e.g., `contact@thejawedhabibsalons.in` or primary manager email) to receive alerts if webhook delivery fails repeatedly.
4. **Secret Expiry:**
   Leave blank (No expiration).

### Step 4: Select Active Events
Check the boxes for the following events under the **Payment Events** and **Order Events** categories:
- [x] `order.paid`
- [x] `payment.captured`
- [x] `payment.failed`
- [x] `refund.processed`

*(Do NOT select irrelevant events such as subscription, invoice, or payout events to prevent unnecessary server load.)*

### Step 5: Save & Activate
1. Click **Create Webhook**.
2. Verify that the webhook appears in the active list with a green **Active** badge.

---

## 6. Webhook Security Architecture & Verification Mechanics

```
┌─────────────────────────┐          POST rawBody + Header           ┌────────────────────────────────┐
│   Razorpay Cloud API    │ ───────────────────────────────────────> │  Next.js Webhook Route         │
│ (https://api.razorpay)  │          X-Razorpay-Signature            │  /api/webhooks/razorpay        │
└─────────────────────────┘                                          └────────────────────────────────┘
                                                                                      │
                                                                           1. Extract rawBody
                                                                           2. Fetch Webhook Secret
                                                                                      │
                                                                                      ▼
                                                                     ┌────────────────────────────────┐
                                                                     │ HMAC SHA-256 Verification      │
                                                                     │ crypto.timingSafeEqual()       │
                                                                     └────────────────────────────────┘
                                                                           │                    │
                                                                      Valid│                    │Invalid
                                                                           ▼                    ▼
                                                            ┌──────────────────────┐   ┌──────────────┐
                                                            │ Deduplication Check  │   │ 400 Bad Req  │
                                                            │ (WebhookEventRecord) │   │ Reject & Log │
                                                            └──────────────────────┘   └──────────────┘
                                                              │                  │
                                                      New Evt │                  │Duplicate Evt
                                                              ▼                  ▼
                                                    ┌──────────────────┐   ┌───────────────────────────┐
                                                    │ Process Event    │   │ Return 200 OK             │
                                                    │ & Send Receipts  │   │ (Duplicate Acknowledged)  │
                                                    └──────────────────┘   └───────────────────────────┘
```

### 6.1 Raw Body Preservation
Signature verification requires the exact unmodified binary/text payload transmitted by Razorpay. The webhook route handler reads:
```typescript
const rawBody = await req.text();
```
Parsing JSON before signature verification alters whitespace and key ordering, which causes signature mismatch. JSON parsing is executed only after HMAC verification succeeds.

### 6.2 Constant-Time Signature Comparison
To prevent timing-based side-channel attacks, the signature verification uses constant-time string comparison:
```typescript
const expectedSignature = crypto
  .createHmac("sha256", webhookSecret)
  .update(rawBody)
  .digest("hex");

const isValid = timingSafeEqualString(expectedSignature, signature);
```
If signatures do not match, the request is immediately rejected with HTTP 400 and logged in the security audit trail.

### 6.3 Idempotency & Deduplication Guard
Razorpay implements an automated retry policy: if your server does not respond with HTTP 200 within 5 seconds, Razorpay retries webhook delivery up to 24 hours with exponential backoff.

To prevent duplicate booking confirmations or duplicate customer emails:
1. Every incoming webhook has a unique `event.id` (e.g., `evt_PkK82n9slw01`).
2. The route invokes `dbRepo.recordWebhookEvent({ eventId, eventType, ... })`.
3. If `eventId` already exists in `WebhookEventRecord`, the database flags `isDuplicate: true`.
4. The handler immediately returns HTTP 200:
   ```json
   {
     "status": "ok",
     "message": "Duplicate webhook event already processed.",
     "duplicate": true
   }
   ```
5. No duplicate database mutations or email triggers occur.

---

## 7. Edge Case Handling: Late Payments on Expired Slots

In high-demand salon hours (e.g., bridal season or weekend slots at Tinpulwa Chowk), a customer might initiate checkout, delay completing payment for 15 minutes while the temporary reservation expires, and then complete the UPI payment.

Our system handles this gracefully:
1. **Slot Still Open:** If the booking was marked `CANCELLED` due to checkout timeout, but the slot has not been reserved by anyone else, the webhook automatically re-confirms the reservation (`AppointmentStatus.CONFIRMED`), applies the payment, and notifies the customer.
2. **Slot Occupied by Another Client:** If another client booked the same stylist or chair in the interim:
   - Payment is safely recorded in Neon PostgreSQL with full transaction IDs (no money is lost).
   - Appointment remains `CANCELLED`.
   - Admin notes are updated with: `[LATE_PAYMENT_RECONCILIATION] Payment of ₹X captured... but slot is occupied.`
   - High-priority Admin Notification is created: `"ACTION REQUIRED: Late Payment on Expired Booking"`.
   - Salon concierge contacts the client directly via phone (`7707000463`) to reschedule or process an instant refund.

---

## 8. Webhook Testing & Verification Runbook

### 8.1 Testing in Razorpay Sandbox / Test Mode
Before activating Live Mode, test the webhook handler using Razorpay Test Mode:
1. Ensure `RAZORPAY_TEST_WEBHOOK_SECRET` is configured.
2. In Razorpay Test Dashboard → Webhooks, click **Test Webhook**.
3. Select event `payment.captured`.
4. Verify response in Razorpay dashboard:
   - HTTP Status: `200 OK`
   - Response Body: `{"success":true,"received":true,"event":"payment.captured"}`
5. Verify in Admin Portal → Activity Log that the webhook event is recorded.

### 8.2 Testing in Live Mode (Post-Activation)
1. Complete Razorpay KYC and activate Live Mode.
2. Configure the Live Webhook URL and Secret in Razorpay Dashboard.
3. Perform a real ₹1 test transaction using a personal UPI ID.
4. Verify in Razorpay Dashboard → Webhooks → Delivery Logs:
   - Status: `Delivered` (Green)
   - Response code: `200`
5. Verify customer receives booking receipt email automatically.

---

## 9. Webhook Maintenance & Troubleshooting

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| **HTTP 400: Invalid webhook signature** | Webhook secret mismatch between Razorpay Dashboard and Vercel environment variables. | Copy the exact secret from Vercel `RAZORPAY_LIVE_WEBHOOK_SECRET` and re-save it in the Razorpay Webhook configuration. |
| **HTTP 400: Missing X-Razorpay-Signature header** | Request was sent without required Razorpay signature header (e.g., manual browser request). | Expected behavior. Only valid Razorpay server requests are accepted. |
| **Webhook Delivery Retries (Timeouts)** | Slow cold start or external network latency. | Ensure Next.js runtime is `nodejs` and handler returns response before initiating long-running external tasks. |
| **Customer reports paid, but booking pending** | Customer dropped connection before redirect; webhook delayed. | Check Razorpay Webhook Delivery logs. If pending, click "Resend Payload". System will process idempotently. |

---

*Document Author: Senior Payment Systems Engineer*  
*Verified for Production Release: The Jawed Habib Salon – Lalganj*
