# Razorpay Exact Vercel Environment Configuration Checklist
**Project:** The Jawed Habib Salon – Lalganj  
**Production Domain:** `https://www.thejawedhabibsalons.in`  
**Physical Salon Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Vaishali, Bihar – 844121  
**Operating Hours:** Monday – Sunday, 10:00 AM – 10:00 PM  
**Primary Contact:** +91 7707000463 | Secondary: +91 9831722983 | +91 9580000175  

---

## 1. Master Environment Variable Matrix

This checklist defines every environment variable recognized by the application's runtime validation layer (`src/lib/env.ts`) and database credential resolver (`src/lib/db/repo.ts:getRazorpayCredentials`).

| Variable Name | Environment Target | Visibility | Mandatory for Live | Description & Format |
| :--- | :--- | :--- | :--- | :--- |
| **`RAZORPAY_ENVIRONMENT`** | Production | **Server Only** | **YES** | Master operational mode. Set strictly to `LIVE` for live payments or `TEST` for sandbox. |
| **`RAZORPAY_LIVE_KEY_ID`** | Production | **Server Only** | **YES** | Razorpay Live Key ID generated from Razorpay Dashboard. Must start with `rzp_live_`. |
| **`RAZORPAY_LIVE_KEY_SECRET`** | Production | **Server Only** | **YES** | Razorpay Live Key Secret. High-security string. Must be provided alongside `RAZORPAY_LIVE_KEY_ID`. |
| **`RAZORPAY_LIVE_WEBHOOK_SECRET`** | Production | **Server Only** | **YES** | Shared secret configured in Razorpay Dashboard Webhooks for live events. |
| **`NEXT_PUBLIC_PAYMENT_MODE`** | Production | **Public / Client** | **YES (Cosmetic)** | Controls UI badges on booking pages. Set to `LIVE` in production, or `TEST` to display sandbox notices. |
| **`ENCRYPTION_KEY`** | Production / Preview | **Server Only** | **YES** | 32-byte secret (hex or utf-8) used for AES-256-GCM encryption of database settings. Must remain persistent. |
| **`CRON_SECRET`** | Production | **Server Only** | **YES** | Bearer token for authenticating Vercel Daily Cron reminder endpoints (`/api/cron/reminders`). |

### Optional / Legacy Fallback Variables

| Variable Name | Role & Behavior |
| :--- | :--- |
| `RAZORPAY_TEST_KEY_ID` | Explicit Test Mode Key ID (starts with `rzp_test_`). Used when `RAZORPAY_ENVIRONMENT=TEST`. |
| `RAZORPAY_TEST_KEY_SECRET` | Test Mode Secret. |
| `RAZORPAY_TEST_WEBHOOK_SECRET` | Test Mode Webhook Secret. |
| `RAZORPAY_KEY_ID` | Legacy fallback. If prefix matches active mode (`rzp_live_` for LIVE, `rzp_test_` for TEST), it is accepted if mode-specific variable is absent. |
| `RAZORPAY_KEY_SECRET` | Legacy fallback secret. |
| `RAZORPAY_WEBHOOK_SECRET` | Legacy fallback webhook secret. |

---

## 2. Server Authority vs Client UI Distinction

### Critical Security Rule:
> **`NEXT_PUBLIC_PAYMENT_MODE` is NEVER trusted by the payment engine.**

1. **How the Server Determines Mode:**
   - In `src/lib/db/repo.ts:getRazorpayCredentials()`, the server checks:
     `const targetEnv = environmentOverride || process.env.RAZORPAY_ENVIRONMENT || settings.environment || "TEST";`
   - It NEVER evaluates `NEXT_PUBLIC_PAYMENT_MODE`.
2. **What Happens if `NEXT_PUBLIC_PAYMENT_MODE=LIVE` while Server is in TEST:**
   - The browser will display the "Live" badge, but any order creation requests (`POST /api/payments/create-order`) and signature verifications will execute strictly against Test keys. Customers cannot be charged real money without server variables configured.
3. **What Happens if `RAZORPAY_ENVIRONMENT=LIVE` with Test Keys:**
   - The server immediately rejects requests with an explicit error:
     `Inconsistent credentials: Key ID does not match LIVE environment (expected prefix 'rzp_live_', received 'rzp_test_...')`.
   - Transactions cannot proceed in an inconsistent state.

---

## 3. Step-by-Step Vercel Production Configuration Guide

1. Log in to the **Vercel Dashboard**: `https://vercel.com/dashboard`.
2. Navigate to the project: **The Jawed Habib Salon – Lalganj**.
3. Go to **Settings** > **Environment Variables**.
4. Add the following key-value pairs selecting **Production** environment only:

```bash
# 1. Master Server Mode
RAZORPAY_ENVIRONMENT=LIVE

# 2. Live API Credentials (Atomic Pair)
RAZORPAY_LIVE_KEY_ID=rzp_live_XXXXXXXXXXXXXXXXXX
RAZORPAY_LIVE_KEY_SECRET=YYYYYYYYYYYYYYYYYYYYYYYY

# 3. Live Webhook Secret
RAZORPAY_LIVE_WEBHOOK_SECRET=ZZZZZZZZZZZZZZZZZZZZZZZZ

# 4. Client Display Badge
NEXT_PUBLIC_PAYMENT_MODE=LIVE
```

5. **Verify `ENCRYPTION_KEY` Exists:**
   - Ensure `ENCRYPTION_KEY` is already defined in Production.
   - Do NOT regenerate or alter `ENCRYPTION_KEY`, as doing so would invalidate any previously encrypted settings in Neon PostgreSQL.
6. **Trigger Production Redeployment:**
   - After saving all variables in Vercel, navigate to **Deployments** > Select current production deployment > Click **Redeploy** (with "Use existing Build Cache" unchecked).
   - This ensures the newly injected environment variables take effect in Node.js serverless functions.
