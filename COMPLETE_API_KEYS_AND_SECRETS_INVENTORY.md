# The Jawed Habib Salon – Lalganj
# Complete API Keys and Secrets Inventory

> **Document Type:** Application Security & Secrets Inventory  
> **Target Application:** The Jawed Habib Salon – Lalganj  
> **Production Domain:** `https://www.thejawedhabibsalons.in`  
> **Inspection Date:** November 15, 2026  
> **Audit Standard:** OWASP ASVS v4.0 / Zero Credential Leakage  

---

## 1. Executive Summary

This inventory provides an authoritative, code-verified audit of every API key, secret token, cryptographic key, database credential, and authentication parameter referenced in the codebase. Every variable was traced from source code references (`process.env.*`) through schemas (`src/lib/env.ts`), service classes, route handlers, and operational scripts.

No plain-text secret values are printed in this report. All credentials are categorized by classification, sensitivity, lifecycle scope, and configuration status.

---

## 2. Complete Inventory of Keys & Secrets

| # | Variable Name | Classification | Sensitivity | Purpose & Description | Source File Reference(s) | Dev Scope | Preview Scope | Prod Scope | Local Status | Vercel Live Status |
| :- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **1** | `DATABASE_URL` | `DATABASE` | `SERVER_SECRET` | PostgreSQL connection string for pooled queries via PgBouncer | `src/lib/env.ts`, `src/lib/db/repo.ts`, `prisma/schema.prisma` | Optional | Required | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **2** | `DIRECT_URL` | `DATABASE` | `SERVER_SECRET` | PostgreSQL direct unpooled connection string for migrations & DDL | `prisma/schema.prisma`, `scripts/*` | Optional | Required | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **3** | `JWT_SECRET` | `AUTHENTICATION` | `SERVER_SECRET` | HMAC-SHA256 secret key for signing customer & admin session tokens (min 32 chars) | `src/lib/auth/jwt.ts`, `src/lib/env.ts`, `src/lib/security/encryption.ts` | Fallback | Required | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **4** | `JWT_EXPIRES_IN` | `AUTHENTICATION` | `CONFIG` | Session duration for JWT auth cookies (e.g., `7d`, `24h`) | `src/lib/auth/jwt.ts`, `src/lib/env.ts` | Optional | Optional | Optional | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **5** | `ADMIN_DEFAULT_EMAIL` | `AUTHENTICATION` | `SERVER_SECRET` | Seed and recovery email for superadmin account | `prisma/seed.ts`, `src/lib/db/repo.ts` | Optional | Optional | Recommended | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **6** | `ADMIN_DEFAULT_PASSWORD` | `AUTHENTICATION` | `SERVER_SECRET` | Initial bcrypt seed password for superadmin account | `prisma/seed.ts`, `src/lib/db/repo.ts` | Optional | Optional | Recommended | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **7** | `ADMIN_EMAIL` | `AUTHENTICATION` | `SERVER_SECRET` | Primary alert destination email for administrative notifications | `src/lib/email/service.ts` | Optional | Optional | Recommended | MISSING | UNKNOWN (Dashboard Verification Req) |
| **8** | `PAYMENT_ENCRYPTION_KEY` | `PAYMENT` | `SERVER_SECRET` | AES-256-GCM 32-byte hex key for encrypting database gateway secrets | `src/lib/security/encryption.ts`, `src/lib/env.ts` | Optional | Required | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **9** | `RAZORPAY_KEY_ID` | `PAYMENT` | `PUBLIC/SERVER` | Razorpay Merchant Key ID (starts with `rzp_test_` or `rzp_live_`) | `src/lib/env.ts`, `src/lib/db/repo.ts`, `src/lib/payments/razorpay.ts` | Optional | Required | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **10** | `RAZORPAY_KEY_SECRET` | `PAYMENT` | `SERVER_SECRET` | Razorpay Merchant Secret for order creation & signature verification | `src/lib/env.ts`, `src/lib/db/repo.ts`, `src/lib/payments/razorpay.ts` | Optional | Required | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **11** | `RAZORPAY_WEBHOOK_SECRET` | `PAYMENT` | `SERVER_SECRET` | Secret key used to verify incoming Razorpay webhook event signatures | `src/lib/env.ts`, `src/lib/db/repo.ts`, `src/app/api/webhooks/razorpay` | Optional | Required | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **12** | `RAZORPAY_ENVIRONMENT` | `PAYMENT` | `CONFIG` | Payment environment mode (`TEST` or `LIVE`) | `src/lib/db/repo.ts`, `src/lib/env.ts` | Optional | Optional | Recommended | PRESENT (`TEST`) | UNKNOWN (Dashboard Verification Req) |
| **13** | `RAZORPAY_TEST_KEY_ID` | `PAYMENT` | `PUBLIC/SERVER` | Dedicated test merchant key ID (`rzp_test_...`) | `src/lib/db/repo.ts` | Optional | Optional | Optional | MISSING (Uses KEY_ID) | UNKNOWN (Dashboard Verification Req) |
| **14** | `RAZORPAY_TEST_KEY_SECRET` | `PAYMENT` | `SERVER_SECRET` | Dedicated test merchant secret | `src/lib/db/repo.ts` | Optional | Optional | Optional | MISSING (Uses KEY_SECRET) | UNKNOWN (Dashboard Verification Req) |
| **15** | `RAZORPAY_TEST_WEBHOOK_SECRET` | `PAYMENT` | `SERVER_SECRET` | Dedicated test webhook signature secret | `src/lib/db/repo.ts` | Optional | Optional | Optional | MISSING (Uses WEBHOOK_SECRET) | UNKNOWN (Dashboard Verification Req) |
| **16** | `RAZORPAY_LIVE_KEY_ID` | `PAYMENT` | `PUBLIC/SERVER` | Live merchant key ID (`rzp_live_...`) for production activation | `src/lib/db/repo.ts` | Not Permitted | Not Permitted | **CRITICAL (When Live)** | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **17** | `RAZORPAY_LIVE_KEY_SECRET` | `PAYMENT` | `SERVER_SECRET` | Live merchant API secret for production activation | `src/lib/db/repo.ts` | Not Permitted | Not Permitted | **CRITICAL (When Live)** | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **18** | `RAZORPAY_LIVE_WEBHOOK_SECRET`| `PAYMENT` | `SERVER_SECRET` | Live webhook secret for production webhook verification | `src/lib/db/repo.ts` | Not Permitted | Not Permitted | **CRITICAL (When Live)** | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **19** | `CLOUDINARY_API_KEY` | `THIRD_PARTY` | `SERVER_SECRET` | Cloudinary REST API key for authenticated media uploads & management | `src/app/api/admin/upload/route.ts`, `src/lib/env.ts` | Optional | Recommended | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **20** | `CLOUDINARY_API_SECRET` | `THIRD_PARTY` | `SERVER_SECRET` | Cloudinary REST API secret for signing media asset uploads | `src/app/api/admin/upload/route.ts`, `src/lib/env.ts` | Optional | Recommended | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **21** | `CLOUDINARY_CLOUD_NAME` | `THIRD_PARTY` | `SERVER_SECRET` | Cloudinary account cloud name (server-side alias) | `src/app/api/admin/upload/route.ts` | Optional | Recommended | Recommended | MISSING (Uses NEXT_PUBLIC) | UNKNOWN (Dashboard Verification Req) |
| **22** | `CLOUDINARY_UPLOAD_PRESET` | `THIRD_PARTY` | `CONFIG` | Preset folder and transformation rules for uploads | `src/lib/env.ts`, `src/app/api/admin/upload/route.ts` | Optional | Optional | Optional | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **23** | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `THIRD_PARTY` | `PUBLIC` | Public cloud name used for constructing optimized image URLs | `src/app/api/admin/upload/route.ts`, `src/lib/env.ts` | Optional | Recommended | **CRITICAL** | PRESENT | UNKNOWN (Dashboard Verification Req) |
| **24** | `CRON_SECRET` | `CRON` | `SERVER_SECRET` | Bearer token authorization secret protecting daily appointment reminder cron | `src/app/api/cron/reminders/route.ts` | Optional | Recommended | **CRITICAL** | MISSING (Local) | UNKNOWN (Dashboard Verification Req) |
| **25** | `ENABLE_SCHEDULED_REMINDERS` | `CRON` | `CONFIG` | Boolean flag enabling automatic daily reminder execution | `src/app/api/cron/reminders/route.ts` | Optional | Optional | Optional | MISSING (Defaults to true) | UNKNOWN (Dashboard Verification Req) |
| **26** | `RESEND_API_KEY` | `THIRD_PARTY` | `SERVER_SECRET` | Resend REST API key (`re_...`) for transactional customer email delivery | `src/lib/email/resend.ts` | Optional | Recommended | **CRITICAL** | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **27** | `EMAIL_FROM` | `THIRD_PARTY` | `CONFIG` | Sender email identity (e.g. `The Jawed Habib Salon <appointments@thejawedhabibsalons.in>`) | `src/lib/email/resend.ts` | Optional | Recommended | **CRITICAL** | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **28** | `EMAIL_REPLY_TO` | `THIRD_PARTY` | `CONFIG` | Reply-to email address (e.g. `contact@jawedhabib-lalganj.in`) | `src/lib/email/resend.ts` | Optional | Recommended | Recommended | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **29** | `CONTACT_NOTIFICATION_EMAIL` | `THIRD_PARTY` | `CONFIG` | Destination email for front-desk contact form alerts | `src/lib/email/service.ts` | Optional | Recommended | Recommended | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **30** | `SMTP_HOST` | `THIRD_PARTY` | `CONFIG` | Fallback SMTP mail server hostname | `src/lib/env.ts` | Optional | Optional | Optional | MISSING | UNKNOWN (Dashboard Verification Req) |
| **31** | `SMTP_PORT` | `THIRD_PARTY` | `CONFIG` | Fallback SMTP mail server port (e.g., 587, 465) | `src/lib/env.ts` | Optional | Optional | Optional | MISSING | UNKNOWN (Dashboard Verification Req) |
| **32** | `SMTP_USER` | `THIRD_PARTY` | `SERVER_SECRET` | Fallback SMTP account username | `src/lib/env.ts` | Optional | Optional | Optional | MISSING | UNKNOWN (Dashboard Verification Req) |
| **33** | `SMTP_PASSWORD` | `THIRD_PARTY` | `SERVER_SECRET` | Fallback SMTP account password | `src/lib/env.ts` | Optional | Optional | Optional | MISSING | UNKNOWN (Dashboard Verification Req) |
| **34** | `GOOGLE_SHEETS_ENABLED` | `THIRD_PARTY` | `CONFIG` | Toggle for Google Sheets enquiry synchronization (`true` / `false`) | `src/lib/sheets/google-sheets.ts` | Optional | Optional | Optional | MISSING (Defaults to false) | UNKNOWN (Dashboard Verification Req) |
| **35** | `GOOGLE_SHEET_ID` | `THIRD_PARTY` | `CONFIG` | Target Google Spreadsheet ID for enquiry rows | `src/lib/sheets/google-sheets.ts` | Optional | Optional | Optional | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **36** | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `THIRD_PARTY` | `SERVER_SECRET` | Service account client email (`...@...iam.gserviceaccount.com`) | `src/lib/sheets/google-sheets.ts` | Optional | Optional | Optional | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **37** | `GOOGLE_PRIVATE_KEY` | `THIRD_PARTY` | `SERVER_SECRET` | RSA private key for Google Cloud service account authentication | `src/lib/sheets/google-sheets.ts` | Optional | Optional | Optional | MISSING (Owner Action) | UNKNOWN (Dashboard Verification Req) |
| **38** | `SALON_LEGAL_GSTIN` | `LEGAL` | `CONFIG` | GST Identification Number if registered | `src/lib/constants/brand.ts` | Optional | Optional | Optional | MISSING (Unregistered / Owner Action) | UNKNOWN (Dashboard Verification Req) |

---

## 3. Cryptographic & Encryption Architecture

1. **Database Gateway Secret Encryption:**
   - Handled via `src/lib/security/encryption.ts` using AES-256-GCM.
   - Requires `PAYMENT_ENCRYPTION_KEY` (32 bytes). If unset, gracefully falls back to `JWT_SECRET`.
   - Never stores plain-text Razorpay secrets in database rows.
2. **Session Authentication:**
   - Handled via `src/lib/auth/jwt.ts` using HMAC-SHA256.
   - Enforces a minimum 32-character key length in production.
   - Automatically rejects hardcoded development defaults when `NODE_ENV === "production"`.

---

## 4. Key Isolation & Safety Rules

- **Zero Test Keys in Live Mode:** `dbRepo.getRazorpayCredentials("LIVE")` strictly validates that Key ID begins with `rzp_live_` and throws a `Security Violation` if test secrets or mock values are detected.
- **Zero Live Keys in Test Mode:** `dbRepo.getRazorpayCredentials("TEST")` strictly validates that Key ID does not begin with `rzp_live_`.
- **Environment Barricade:** Live payments are unconditionally barred in Preview and Development environments (`VERCEL_ENV === "preview"` or `NODE_ENV === "development"`).
