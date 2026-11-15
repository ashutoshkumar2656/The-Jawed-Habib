# The Jawed Habib Salon – Lalganj
# Third-Party API Configuration Report

> **Scope:** Cloudinary, Resend Email, Google Sheets, Google Maps, WhatsApp, and Vercel Cron  
> **Inspection Date:** November 15, 2026  
> **Security Mandate:** Complete Credential Masking & Integration Status Analysis  

---

## 1. Table E — Cloudinary Media Storage Configuration

| Configuration Item | Required Variable | Current Local Status | Production Vercel Status | Source Implementation Reference | Purpose & Behavior |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Cloud Name (Public)** | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | PRESENT | UNKNOWN (Needs Verification) | `src/app/api/admin/upload/route.ts`, `src/lib/env.ts` | Used to construct CDN delivery URLs with automatic format & quality optimization |
| **API Key (Secret)** | `CLOUDINARY_API_KEY` | PRESENT | UNKNOWN (Needs Verification) | `src/app/api/admin/upload/route.ts` | Authenticates backend administrative image uploads |
| **API Secret (Secret)**| `CLOUDINARY_API_SECRET` | PRESENT | UNKNOWN (Needs Verification) | `src/app/api/admin/upload/route.ts` | Signs administrative upload signatures |
| **Upload Preset** | `CLOUDINARY_UPLOAD_PRESET` | PRESENT | UNKNOWN (Needs Verification) | `src/lib/env.ts` | Specifies asset folder (`jawed-habib-lalganj`) and auto-tagging |

### Cloudinary Integration Details:
- **Admin Media Library (`/admin/media`):** Admin can upload gallery assets and before/after transformation pairs directly to Cloudinary.
- **Serverless Resilience:** The endpoint `/api/admin/upload` reads the file buffer in memory and streams it to Cloudinary via REST API, avoiding local filesystem writes on Vercel's read-only serverless environment.

---

## 2. Table F — Email and Customer Notification Configuration

| Configuration Item | Required Variable | Current Local Status | Production Vercel Status | Implementation File | Purpose & Behavior |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Email Provider API Key**| `RESEND_API_KEY` | MISSING | UNKNOWN (Owner Action) | `src/lib/email/resend.ts` | Authenticates with Resend REST API (`https://api.resend.com/emails`) |
| **Sender Identity** | `EMAIL_FROM` | MISSING | UNKNOWN (Owner Action) | `src/lib/email/resend.ts` | Verified domain sender: `The Jawed Habib Salon <appointments@thejawedhabibsalons.in>` |
| **Reply-To Address** | `EMAIL_REPLY_TO` | MISSING | UNKNOWN (Owner Action) | `src/lib/email/resend.ts` | Salon reception reply email: `contact@jawedhabib-lalganj.in` |
| **Contact Alert Email** | `CONTACT_NOTIFICATION_EMAIL` | MISSING | UNKNOWN (Owner Action) | `src/lib/email/service.ts` | Recipient address for instant notifications when a visitor submits the contact form |
| **Admin Outbox System** | Built-in Database Outbox | **ACTIVE** | **ACTIVE** | `src/lib/email/service.ts`, `prisma/schema.prisma` | Every notification is logged in PostgreSQL `EmailLog` table; if API key is missing, skips gracefully with `[EMAIL_SKIPPED]` log |

### Email Workflows Implemented:
1. **Booking Confirmation:** Sent immediately upon payment verification or offline booking creation; includes Reference, date/time, service details, and address.
2. **Payment Receipt:** Sent after payment capture; includes Razorpay payment ID, breakdown of advance paid, and balance due.
3. **Appointment Reminders:** Dispatched 24 hours prior to appointment by daily automated cron job.
4. **Post-Service Thank You:** Sent following appointment completion with feedback and review links.
5. **Contact Form Notification:** Dispatches customer enquiry message directly to the front-desk inbox.

---

## 3. Google Sheets Enquiry Integration

| Configuration Item | Required Variable | Current Status | Implementation File | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| **Google Sheets Feature Flag**| `GOOGLE_SHEETS_ENABLED` | MISSING (Defaults to `false`) | `src/lib/sheets/google-sheets.ts` | Master switch enabling enquiry row appending |
| **Spreadsheet ID** | `GOOGLE_SHEET_ID` | MISSING | `src/lib/sheets/google-sheets.ts` | Target Google Sheet document ID |
| **Service Account Client**| `GOOGLE_SERVICE_ACCOUNT_EMAIL`| MISSING | `src/lib/sheets/google-sheets.ts` | GCP Service account email |
| **Service Account Key** | `GOOGLE_PRIVATE_KEY` | MISSING | `src/lib/sheets/google-sheets.ts` | PEM-encoded RSA private key |

### Graceful Fallback Behavior:
- When Google Sheets credentials are omitted, the application logs a non-blocking diagnostic message and safely persists the enquiry directly in the Neon PostgreSQL database without failing the user's submission.

---

## 4. Google Maps, WhatsApp & External Concierge Links

| Service | Target URL | Implementation Reference | Status |
| :--- | :--- | :--- | :---: |
| **Google Maps Pin** | `https://maps.app.goo.gl/TVx48xoWEu8dMvXT9` | `src/lib/constants/brand.ts` | **ACTIVE & VERIFIED** |
| **WhatsApp Front Desk** | `https://wa.me/917707000463` | `src/lib/constants/brand.ts`, `src/components/shared/floating-contact.tsx` | **ACTIVE & VERIFIED** |
| **Official Instagram** | `https://www.instagram.com/the_jawedhabib_lalganj/` | `src/lib/constants/brand.ts` | **ACTIVE & VERIFIED** |

---

## 5. Vercel Daily Hobby Cron Job

| Scheduled Task | Cron Expression | UTC Trigger | IST Equivalent | Endpoint | Authentication |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Daily Reminders & Expiry**| `30 2 * * *` | 02:30 UTC | **08:00 AM IST** | `/api/cron/reminders` | Header: `Authorization: Bearer <CRON_SECRET>` |

- **Configuration File:** `vercel.json`
- **Security Guard:** When `CRON_SECRET` is configured in Vercel, requests lacking the secret are rejected with HTTP 401 Unauthorized.
