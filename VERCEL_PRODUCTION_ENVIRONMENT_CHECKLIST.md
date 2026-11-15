# The Jawed Habib Salon – Lalganj
# Vercel Production Environment Configuration Checklist

> **Canonical Production Domain:** `https://www.thejawedhabibsalons.in`  
> **Hosting Platform:** Vercel (Next.js 14 App Router Preset)  
> **Target Environment Scope:** **Production**  
> **Audit Date:** November 15, 2026  
> **Vercel CLI Status:** Not locally authenticated; Vercel live state marked as `UNKNOWN (Requires Dashboard Verification)`  

---

## 1. Executive Summary & Vercel Dashboard Guide

To achieve 100% production functionality, durability, and security, all backend secrets and configuration parameters must be entered into the **Vercel Project Dashboard**.

### How the Salon Owner Can Configure These in Vercel:
1. Open the [Vercel Dashboard](https://vercel.com/dashboard).
2. Select the project: **`the-jawed-habib-salon-lalganj`** (or matching project name).
3. Navigate to: **Settings** > **Environment Variables**.
4. For each variable below, enter the **Key** and **Value**, select **Production** as the Environment, and click **Save**.
5. Once all variables are entered, trigger a fresh **Redeploy** from the Deployments tab to make the variables take effect.

---

## 2. Table G — Vercel Production Environment Variables Checklist

| Variable Name | Required? | Classification | Secret? | Where to Obtain Value | Scope | Current Vercel Status | Action Required |
| :--- | :---: | :--- | :---: | :--- | :---: | :---: | :--- |
| **`DATABASE_URL`** | **CRITICAL** | `DATABASE` | YES | Neon Console > Project > Branch `main` / `production` > Connection Details > Select **Pooled connection** (`pgbouncer=true`) | Production | UNKNOWN | Copy pooled connection string from Neon |
| **`DIRECT_URL`** | **CRITICAL** | `DATABASE` | YES | Neon Console > Project > Branch `main` / `production` > Connection Details > Select **Direct connection** (port 5432) | Production | UNKNOWN | Copy direct unpooled connection string from Neon |
| **`JWT_SECRET`** | **CRITICAL** | `AUTHENTICATION` | YES | Generate a random 64-character secret via `openssl rand -base64 32` | Production | UNKNOWN | Add strong 32+ char secret in Vercel |
| **`JWT_EXPIRES_IN`** | Optional | `AUTHENTICATION` | NO | Enter `7d` (or desired session duration) | Production | UNKNOWN | Set value to `7d` |
| **`PAYMENT_ENCRYPTION_KEY`** | **CRITICAL** | `PAYMENT` | YES | Generate a 32-byte hex key via `openssl rand -hex 32` | Production | UNKNOWN | Add 64-character hex key in Vercel |
| **`RAZORPAY_ENVIRONMENT`** | Recommended | `PAYMENT` | NO | Set to `TEST` initially, then update to `LIVE` upon owner approval | Production | UNKNOWN | Set `TEST` or `LIVE` |
| **`RAZORPAY_KEY_ID`** | **CRITICAL** | `PAYMENT` | NO | Razorpay Dashboard > Settings > API Keys (`rzp_test_...` or `rzp_live_...`) | Production | UNKNOWN | Enter active Razorpay Key ID |
| **`RAZORPAY_KEY_SECRET`** | **CRITICAL** | `PAYMENT` | YES | Razorpay Dashboard > Settings > API Keys | Production | UNKNOWN | Enter active Razorpay Key Secret |
| **`RAZORPAY_WEBHOOK_SECRET`** | **CRITICAL** | `PAYMENT` | YES | Razorpay Dashboard > Settings > Webhooks > Secret entered during webhook creation | Production | UNKNOWN | Enter Razorpay Webhook Secret |
| **`NEXT_PUBLIC_APP_URL`** | **CRITICAL** | `URL` | NO | `https://www.thejawedhabibsalons.in` | Production | UNKNOWN | Set canonical URL |
| **`APP_URL`** | **CRITICAL** | `URL` | NO | `https://www.thejawedhabibsalons.in` | Production | UNKNOWN | Set canonical URL |
| **`CRON_SECRET`** | **CRITICAL** | `CRON` | YES | Generate a 32-character token via `openssl rand -hex 16` | Production | UNKNOWN | Add secret to secure daily Vercel cron |
| **`RESEND_API_KEY`** | **CRITICAL** | `THIRD_PARTY` | YES | Resend Dashboard (`resend.com`) > API Keys > Create Key (`re_...`) | Production | UNKNOWN | Add Resend API key for transactional emails |
| **`EMAIL_FROM`** | **CRITICAL** | `THIRD_PARTY` | NO | `The Jawed Habib Salon <appointments@thejawedhabibsalons.in>` | Production | UNKNOWN | Enter verified sender domain email |
| **`EMAIL_REPLY_TO`** | Recommended | `THIRD_PARTY` | NO | `contact@jawedhabib-lalganj.in` | Production | UNKNOWN | Enter salon reception reply email |
| **`CONTACT_NOTIFICATION_EMAIL`** | Recommended | `THIRD_PARTY` | NO | Salon owner / manager notification inbox (e.g., `thejawedhabiblalganj@gmail.com`) | Production | UNKNOWN | Enter recipient for contact alerts |
| **`CLOUDINARY_API_KEY`** | **CRITICAL** | `THIRD_PARTY` | YES | Cloudinary Dashboard > Account Details > API Key | Production | UNKNOWN | Enter Cloudinary API Key |
| **`CLOUDINARY_API_SECRET`** | **CRITICAL** | `THIRD_PARTY` | YES | Cloudinary Dashboard > Account Details > API Secret | Production | UNKNOWN | Enter Cloudinary API Secret |
| **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`** | **CRITICAL** | `THIRD_PARTY` | NO | Cloudinary Dashboard > Account Details > Cloud Name | Production | UNKNOWN | Enter Cloud Name |
| **`CLOUDINARY_UPLOAD_PRESET`** | Optional | `THIRD_PARTY` | NO | Cloudinary Dashboard > Settings > Upload > Upload Presets | Production | UNKNOWN | Enter upload preset name |
| **`ADMIN_DEFAULT_EMAIL`** | Recommended | `AUTHENTICATION` | YES | Superadmin email address for initial seed/recovery | Production | UNKNOWN | Enter superadmin email |
| **`ADMIN_DEFAULT_PASSWORD`** | Recommended | `AUTHENTICATION` | YES | Superadmin initial password (hashed upon first seed) | Production | UNKNOWN | Enter initial password |
| **`GOOGLE_SHEETS_ENABLED`** | Optional | `THIRD_PARTY` | NO | Set `true` if syncing contact enquiries to Google Sheets | Production | UNKNOWN | Set `false` unless configured |
| **`GOOGLE_SHEET_ID`** | Optional | `THIRD_PARTY` | NO | ID string extracted from Google Spreadsheet URL | Production | UNKNOWN | Leave empty if disabled |
| **`GOOGLE_SERVICE_ACCOUNT_EMAIL`** | Optional | `THIRD_PARTY` | YES | Service account email from Google Cloud Console | Production | UNKNOWN | Leave empty if disabled |
| **`GOOGLE_PRIVATE_KEY`** | Optional | `THIRD_PARTY` | YES | PEM-formatted private key from Google Service Account JSON | Production | UNKNOWN | Leave empty if disabled |
| **`SALON_LEGAL_GSTIN`** | Optional | `LEGAL` | NO | GST Identification Number if registered | Production | UNKNOWN | Leave empty if unregistered |

---

## 3. High-Priority Configuration Groups

### Group 1: Absolute Essentials (Without which website fails)
1. **`DATABASE_URL`** & **`DIRECT_URL`**: Essential for saving customer bookings, appointment schedules, and payment audit logs to Neon PostgreSQL.
2. **`JWT_SECRET`**: Essential for admin logins and customer session cookie signatures.
3. **`NEXT_PUBLIC_APP_URL`**: Essential for canonical SEO URLs, sitemaps, and callback generation.

### Group 2: Payment Gateway Essentials
1. **`RAZORPAY_KEY_ID`** & **`RAZORPAY_KEY_SECRET`**: Required for generating online booking orders and verifying payment signatures.
2. **`RAZORPAY_WEBHOOK_SECRET`**: Required for verifying asynchronous webhooks from Razorpay at `https://www.thejawedhabibsalons.in/api/webhooks/razorpay`.
3. **`PAYMENT_ENCRYPTION_KEY`**: Required for encrypting sensitive gateway credentials stored in PostgreSQL.

### Group 3: Customer Communication Essentials
1. **`RESEND_API_KEY`**, **`EMAIL_FROM`**, **`EMAIL_REPLY_TO`**: Required for delivering booking confirmation receipts, appointment reminders, and contact enquiry alerts to customers.
2. **`CRON_SECRET`**: Required for authenticating Vercel daily automated cron requests at `/api/cron/reminders`.
