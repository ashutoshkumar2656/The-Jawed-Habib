# RAZORPAY LIVE ENVIRONMENT VARIABLE & CONFIGURATION CHECKLIST
## The Jawed Habib Salon – Lalganj, Vaishali, Bihar

> **Document Type:** Production Environment Variable Specification & Deployment Checklist  
> **Brand Entity:** The Jawed Habib Salon  
> **Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
> **Domain:** `https://www.thejawedhabibsalons.in`  
> **Security Classification:** Confidential Operations Architecture  

---

## 1. Executive Summary

This checklist specifies the exact environment variables required by the codebase for Razorpay Test and Live operations across **Development**, **Preview**, and **Production** environments in Vercel.

No actual secret keys or passwords are printed in this document. It serves as an authoritative guide for the salon owner and deployment administrator.

---

## 2. Environment Variable Inventory Matrix

| Variable Name | Classification | Required Scope | Purpose | Status in Code | Action Needed for Live Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | Public / Server | Production | Live Key ID (`rzp_live_...`) issued by Razorpay Dashboard | Supported | Replace test key with Live Key ID in Vercel Production |
| `RAZORPAY_KEY_SECRET` | Strict Secret | Production | Live Key Secret issued by Razorpay Dashboard | Supported | Set Live Key Secret in Vercel Production |
| `RAZORPAY_WEBHOOK_SECRET` | Strict Secret | Production | Secret created when setting up webhook in Razorpay | Supported | Set Live Webhook Secret in Vercel Production |
| `RAZORPAY_ENVIRONMENT` | Configuration | Production | Explicit mode override (`LIVE` or `TEST`) | Supported | Set to `LIVE` in Vercel Production |
| `PAYMENT_ENCRYPTION_KEY` | Strict Secret | Dev, Preview, Prod | 32+ character master key for AES-256-GCM database encryption | Supported | Retain existing key; never rotate without DB re-encryption |
| `RAZORPAY_TEST_KEY_ID` | Public / Server | Dev, Preview | Explicit test key ID (`rzp_test_...`) | Supported | Optional override for development/preview |
| `RAZORPAY_TEST_KEY_SECRET` | Strict Secret | Dev, Preview | Explicit test key secret | Supported | Optional override for development/preview |
| `RAZORPAY_TEST_WEBHOOK_SECRET`| Strict Secret | Dev, Preview | Explicit test webhook secret | Supported | Optional override for development/preview |
| `RAZORPAY_LIVE_KEY_ID` | Public / Server | Production | Dedicated Live Key ID (`rzp_live_...`) | Supported | Alternative explicit variable for Live mode |
| `RAZORPAY_LIVE_KEY_SECRET` | Strict Secret | Production | Dedicated Live Key Secret | Supported | Alternative explicit variable for Live mode |
| `RAZORPAY_LIVE_WEBHOOK_SECRET`| Strict Secret | Production | Dedicated Live Webhook Secret | Supported | Alternative explicit variable for Live mode |
| `NEXT_PUBLIC_APP_URL` | Public Client | Dev, Preview, Prod | Canonical domain (`https://www.thejawedhabibsalons.in`) | Supported | Pre-configured in Vercel |

---

## 3. Environment Scoping Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. DEVELOPMENT (Local Machines):                                            │
│    • Enforced Mode: TEST ONLY                                               │
│    • Variables: RAZORPAY_KEY_ID=rzp_test_...                                │
│    • Protection: Live Mode execution throws an immediate exception          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PREVIEW (Pull Request & Staging Deployments on Vercel):                  │
│    • Enforced Mode: TEST ONLY                                               │
│    • Variables: RAZORPAY_KEY_ID=rzp_test_...                                │
│    • Protection: Live Mode execution throws an immediate exception          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PRODUCTION (https://www.thejawedhabibsalons.in):                         │
│    • Mode: LIVE (after explicit activation)                                 │
│    • Variables: RAZORPAY_KEY_ID=rzp_live_...                                │
│    • Protection: Strictly requires rzp_live_ prefix & live secret           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Relationship Between Vercel Variables and Admin Portal Settings

The platform features two credential management options designed to work harmoniously:

1. **Option A: Vercel Environment Variables (Recommended for Production)**
   - The owner adds `RAZORPAY_KEY_ID` (or `RAZORPAY_LIVE_KEY_ID`), `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` directly in the Vercel Project Settings for the **Production** environment.
   - When set, these server-level variables take immediate precedence.
2. **Option B: Admin Portal Encrypted Settings (`/admin/settings/payment-gateway`)**
   - The owner navigates to the Admin Portal, enters the Live Key ID and Live Secret, runs the **"Test Gateway Connection"** pre-flight check, and activates Live Mode with explicit confirmation.
   - Secrets are encrypted with AES-256-GCM before being saved in Neon PostgreSQL.
3. **Harmonious Precedence:**
   - If Vercel environment variables are present and match the active mode (`rzp_live_...`), they are used automatically.
   - If Vercel variables are left blank, the system securely falls back to the decrypted Admin Portal database settings.
   - Neither source can accidentally mix a Test Key ID with a Live Secret or vice versa.

---

## 5. Pre-Activation Checklist for Salon Owner

Before switching to Live Mode in production, verify:

- [ ] **Razorpay Account Status:** Salon business KYC is fully approved by Razorpay and account is activated.
- [ ] **Bank Settlement Account:** Salon bank account (for Lalganj branch revenue) is linked and verified in Razorpay Dashboard.
- [ ] **Live API Keys Generated:** Navigated to Razorpay Dashboard > Settings > API Keys > "Generate Live Key".
- [ ] **Live Webhook Created:** Webhook created pointing to `https://www.thejawedhabibsalons.in/api/webhooks/razorpay`.
- [ ] **Prefix Verified:** Live Key ID strictly begins with `rzp_live_`.
- [ ] **Vercel Scope Selected:** Environment variables applied strictly to **Production** scope (leaving Preview and Development in Test Mode).
- [ ] **Redeployment:** Production deployment triggered in Vercel to load the new environment variables into the serverless runtime.

---

## 6. Conclusion

The environment variable architecture is modular, safe, and prevents cross-environment credential leaks. The salon owner can choose between Vercel Project Settings or the encrypted Admin Portal interface to supply live credentials.
