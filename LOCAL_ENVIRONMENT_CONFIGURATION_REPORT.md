# The Jawed Habib Salon – Lalganj
# Local Environment Configuration Report

> **Inspected Files:** `.env` (Local Workspace) & `.env.example` (Tracked Git Template)  
> **Inspection Date:** November 15, 2026  
> **Security Policy:** No plaintext secrets or passwords printed  
> **Audit Status:** VERIFIED & CLASSIFIED  

---

## 1. Local Environment Files Status

| File Name | Present on Disk? | Tracked by Git? | File Size | Sensitivity | Notes |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **`.env`** | **YES** | **NO (Ignored)** | 1,903 bytes | `CONFIDENTIAL` | Contains active local test secrets and database connection strings |
| **`.env.example`** | **YES** | **YES** | 6,843 bytes | `PUBLIC_TEMPLATE` | Authoritative documentation template for developers & Vercel setup |
| **`.env.local`** | NO | NO | N/A | N/A | Optional developer override file (not currently present) |
| **`.env.production`** | NO | NO | N/A | N/A | Prohibited from Git tracking; managed via Vercel Dashboard |
| **`.env.development`**| NO | NO | N/A | N/A | Uses default `.env` |

---

## 2. Variable Comparison: `.env` vs `.env.example`

| Variable Name | Present in `.env` | Present in `.env.example` | Local Format Check | Local Configuration Assessment |
| :--- | :---: | :---: | :--- | :--- |
| **`DATABASE_URL`** | **YES** | **YES** | Valid PostgreSQL URL with pooled connection parameter | **CONFIGURED (Local Neon Pooler)** |
| **`DIRECT_URL`** | **YES** | **YES** | Valid direct unpooled connection string | **CONFIGURED (Local Neon Direct)** |
| **`JWT_SECRET`** | **YES** | **YES** | String >= 32 characters | **CONFIGURED (Local Secret)** |
| **`JWT_EXPIRES_IN`** | **YES** | **YES** | Standard format (`7d`) | **CONFIGURED** |
| **`ADMIN_DEFAULT_EMAIL`** | **YES** | **YES** | Valid email format | **CONFIGURED** |
| **`ADMIN_DEFAULT_PASSWORD`**| **YES** | **YES** | Valid password string | **CONFIGURED** |
| **`PAYMENT_ENCRYPTION_KEY`**| **YES** | **YES** | 64-char hex string (32 bytes AES-256) | **CONFIGURED** |
| **`RAZORPAY_KEY_ID`** | **YES** | **YES** | Starts with `rzp_test_` | **CONFIGURED (Test Mode)** |
| **`RAZORPAY_KEY_SECRET`** | **YES** | **YES** | Valid secret string | **CONFIGURED (Test Mode)** |
| **`RAZORPAY_WEBHOOK_SECRET`**| **YES**| **YES** | Valid secret string | **CONFIGURED (Test Mode)** |
| **`CLOUDINARY_API_KEY`** | **YES** | **YES** | Valid numeric API key string | **CONFIGURED** |
| **`CLOUDINARY_API_SECRET`** | **YES** | **YES** | Valid alphanumeric secret string | **CONFIGURED** |
| **`CLOUDINARY_UPLOAD_PRESET`**| **YES**| **YES** | Valid preset name | **CONFIGURED** |
| **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`**| **YES** | **YES** | Valid cloud name string | **CONFIGURED** |
| **`APP_URL`** | **YES** | **YES** | Valid URL (`http://localhost:3000`) | **CONFIGURED** |
| **`NEXT_PUBLIC_APP_URL`** | **YES** | **YES** | Valid URL (`http://localhost:3000`) | **CONFIGURED** |
| **`NEXT_PUBLIC_SALON_NAME`**| **YES** | **YES** | "The Jawed Habib Salon – Lalganj" | **CONFIGURED** |
| **`NEXT_PUBLIC_SALON_PHONE_PRIMARY`** | **YES** | **YES** | "7707000463" | **CONFIGURED** |
| **`NEXT_PUBLIC_SALON_PHONE_SECONDARY`** | **YES** | **YES** | "9831722983" | **CONFIGURED** |
| **`NEXT_PUBLIC_SALON_PHONE_TERTIARY`** | **YES** | **YES** | "9580000175" | **CONFIGURED** |
| **`NEXT_PUBLIC_SALON_WHATSAPP`** | **YES** | **YES** | "917707000463" | **CONFIGURED** |
| **`NEXT_PUBLIC_SALON_INSTAGRAM`** | **YES** | **YES** | Valid Instagram URL | **CONFIGURED** |
| **`NEXT_PUBLIC_SALON_MAPS_URL`** | **YES** | **YES** | Valid Google Maps URL | **CONFIGURED** |
| **`NODE_ENV`** | **YES** | **YES** | "development" | **CONFIGURED** |
| **`CRON_SECRET`** | NO | **YES** | Missing locally | **OPTIONAL IN DEV** (Bypassed in dev mode) |
| **`RESEND_API_KEY`** | NO | **YES** | Missing locally | **SKIPPED IN DEV** (Emails logged to console/outbox) |
| **`EMAIL_FROM`** | NO | **YES** | Missing locally | Defaults to `notifications@thejawedhabibsalons.in` |
| **`EMAIL_REPLY_TO`** | NO | **YES** | Missing locally | Defaults to `contact@jawedhabib-lalganj.in` |
| **`CONTACT_NOTIFICATION_EMAIL`** | NO | **YES** | Missing locally | Required for live admin enquiry email alerts |
| **`GOOGLE_SHEETS_ENABLED`**| NO | **YES** | Missing locally | Defaults to `false` (Google Sheets disabled) |
| **`GOOGLE_SHEET_ID`** | NO | **YES** | Missing locally | Optional (Sync disabled when omitted) |
| **`GOOGLE_SERVICE_ACCOUNT_EMAIL`**| NO | **YES** | Missing locally | Optional |
| **`GOOGLE_PRIVATE_KEY`** | NO | **YES** | Missing locally | Optional |
| **`SMTP_HOST`** / `USER` / `PASS` | NO | **YES** | Missing locally | Optional fallback SMTP |

---

## 3. Analysis of Local Configuration Health

1. **Database Access:**
   - `.env` specifies a pooled connection to Neon (`aws-ap-southeast-1`).
   - Automated test suites mock Prisma client calls or connect safely.
2. **Payment Gateway Mode:**
   - `.env` contains test credentials (`rzp_test_...`).
   - `dbRepo.getRazorpayCredentials("TEST")` resolves cleanly.
   - Live credentials are deliberately absent from the local development file.
3. **Session & Security:**
   - `JWT_SECRET` and `PAYMENT_ENCRYPTION_KEY` are populated with cryptographically strong values.
4. **Media CDN:**
   - Cloudinary upload variables are configured.

---

## 4. Local Environment Recommendations

1. **Keep `.env` strictly untracked:** Confirmed `.env` is present in `.gitignore` and has never been committed.
2. **Add `CRON_SECRET` to local `.env` if testing cron endpoints directly:** Setting a test value like `test_cron_secret_123` allows manual invocation of `/api/cron/reminders`.
3. **Add `RESEND_API_KEY` for live email testing:** When local developers need to verify real inbox delivery, a developer Resend API key can be added to `.env`.
