# The Jawed Habib Salon – Lalganj
# Vercel Preview Environment Configuration Checklist

> **Target Environment Scope:** **Preview Deployments** (Git Branches & Pull Requests)  
> **Hosting Platform:** Vercel  
> **Security Mandate:** Strict Isolation from Production Customer Data & Payment Gateways  
> **Date:** November 15, 2026  

---

## 1. Executive Summary & Environment Isolation Directives

Vercel generates an isolated Preview deployment for every pull request and feature branch. To guarantee zero data corruption, zero false customer notifications, and zero accidental live financial transactions during development and code review, the **Preview Environment** must obey strict environmental isolation principles:

1. **NO Production Database in Preview:** Preview deployments must connect to a dedicated Neon database branch (e.g., `preview` or `staging`) or a separate test database. Never use the production database branch in Preview.
2. **NO Live Razorpay Credentials in Preview:** The application codebase strictly bars `RAZORPAY_ENVIRONMENT=LIVE` when `VERCEL_ENV === "preview"` (enforced in `src/lib/db/repo.ts`). Only Test Mode (`rzp_test_...`) is permitted in Preview.
3. **NO Production Transactional Emails to Customers:** Preview deployments must use simulated or sandbox email credentials to prevent sending accidental test reminders or confirmations to real salon customers.

---

## 2. Table H — Vercel Preview Environment Variables

| Variable Name | Classification | Secret? | Required Value / Configuration for Preview | Scope | Reason for Isolation |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **`DATABASE_URL`** | `DATABASE` | YES | Neon Staging / Preview Branch Pooled Connection String | Preview | Prevents test bookings and QA testing from polluting production records |
| **`DIRECT_URL`** | `DATABASE` | YES | Neon Staging / Preview Branch Direct Connection String | Preview | Allows migrations to be tested safely on preview branches |
| **`JWT_SECRET`** | `AUTHENTICATION` | YES | Distinct 32+ character staging secret | Preview | Isolates preview user session tokens from production |
| **`PAYMENT_ENCRYPTION_KEY`** | `PAYMENT` | YES | Distinct 32-byte hex key for preview encryption | Preview | Prevents decrypting production secrets with staging keys |
| **`RAZORPAY_ENVIRONMENT`** | `PAYMENT` | NO | `TEST` (Hardcoded / Mandatory) | Preview | Enforces test mode; live payments are blocked by code in preview |
| **`RAZORPAY_KEY_ID`** | `PAYMENT` | NO | Razorpay **Test** Key ID (`rzp_test_...`) | Preview | Prevents real customer cards or UPI handles from being charged |
| **`RAZORPAY_KEY_SECRET`** | `PAYMENT` | YES | Razorpay **Test** Key Secret | Preview | Allows full simulation of checkout, signature verification, and webhook |
| **`RAZORPAY_WEBHOOK_SECRET`** | `PAYMENT` | YES | Razorpay **Test** Webhook Secret | Preview | Allows simulated webhook dispatch from test runners |
| **`NEXT_PUBLIC_APP_URL`** | `URL` | NO | Leave blank or set to `https://$VERCEL_URL` | Preview | Allows dynamic Vercel preview URLs to resolve properly |
| **`CRON_SECRET`** | `CRON` | YES | Staging cron secret token | Preview | Allows manual testing of cron endpoints without production auth |
| **`RESEND_API_KEY`** | `THIRD_PARTY` | YES | Sandbox Resend API Key (or leave unset to use Mock Outbox) | Preview | Avoids emailing real customers during PR reviews |
| **`EMAIL_FROM`** | `THIRD_PARTY` | NO | `The Jawed Habib Salon Preview <test@thejawedhabibsalons.in>` | Preview | Clear indicator of test origin |
| **`CLOUDINARY_API_KEY`** | `THIRD_PARTY` | YES | Cloudinary Staging Key or Shared Sandbox | Preview | Allows image upload testing in preview pull requests |
| **`CLOUDINARY_API_SECRET`** | `THIRD_PARTY` | YES | Cloudinary Staging Secret | Preview | Signed upload verification |
| **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`**| `THIRD_PARTY`| NO | Cloudinary Cloud Name | Preview | Image delivery |

---

## 3. How to Configure Preview Variables in Vercel Dashboard

1. Navigate to **Vercel Project Settings** > **Environment Variables**.
2. When creating or editing each variable:
   - Check the **Preview** checkbox.
   - Uncheck the **Production** checkbox.
3. Enter the staging or test-specific value.
4. Click **Save**.

This ensures that whenever a pull request is created or updated, Vercel automatically deploys the code with the safe preview configuration.
