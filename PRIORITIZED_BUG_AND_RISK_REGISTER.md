# PRIORITIZED BUG, DEFECT & RISK REGISTER
## The Jawed Habib Salon – Lalganj (Quality Assurance Risk Ledger)

**Document Reference:** `PRIORITIZED_BUG_AND_RISK_REGISTER.md`  
**Execution Date:** November 15, 2026  
**Auditing Authority:** Principal QA Automation Lead & Application Security Engineer  
**Salon Ground Truth Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Vaishali, Bihar – 844121  
**Contact Numbers:** +91 7707000463 | +91 9831722983 | +91 9580000175  
**Register Status:** **ALL HISTORICAL DEFECTS RESOLVED | OPERATIONAL CONFIGURATION PENDING OWNER**  

---

## 1. Executive Summary & Defect Lifecycle Status

This register documents all confirmed defects, historical anomalies, and operational configuration requirements discovered during the comprehensive audit of **The Jawed Habib Salon – Lalganj**.

### Defect Scorecard:
* **Total P0 (Critical) Defects:** 1 Recorded — **1 Resolved (100% Closed)**
* **Total P1 (High) Defects:** 2 Recorded — **2 Resolved (100% Closed)**
* **Total P2 (Medium) Defects:** 1 Recorded — **1 Resolved (100% Closed)**
* **Pending Owner Configuration Items:** 3 Items (Standard Production Setup)

---

## 2. Resolved Historical Defects (100% Closed)

### ISSUE-001: Next.js Webpack Runtime Module Factory Failure (`options.factory.call`)
* **Issue ID:** `BUG-001`
* **Severity:** **P0 — CRITICAL** (Prevented opening Admin Login page)
* **Affected Module:** `/admin/login` (`http://localhost:3000/admin/login`)
* **Observed Behavior:** Browser displayed *"Something went wrong. An unexpected error occurred while loading this page."* Console threw `TypeError: Cannot read properties of undefined (reading 'call')`.
* **Expected Behavior:** Admin Login page renders cleanly with credentials input and authentication form.
* **Confirmed Root Cause:** `next.config.mjs` was configuring `Cache-Control: public, max-age=31536000, immutable` in local development mode. The browser served stale disk-cached chunks containing obsolete module IDs, causing `__webpack_modules__[moduleId]` to evaluate to `undefined`.
* **Evidence & Location:** `next.config.mjs` lines 1–15; `src/app/admin/AdminLayoutClient.tsx` lines 1–25.
* **Resolution Applied:** Guarded `headers()` in `next.config.mjs` with `if (process.env.NODE_ENV !== "production") return [];`. Decoupled dashboard chrome in `AdminLayoutClient.tsx` via `dynamic()`.
* **Status:** **FIXED AND VERIFIED (CLOSED)**

---

### ISSUE-002: React SSR Hydration Mismatch on Bridal Navigation Anchor
* **Issue ID:** `BUG-002`
* **Severity:** **P1 — HIGH** (Console exception and hydration remount trigger)
* **Affected Module:** Public Navigation Header (`src/components/layout/header.tsx`)
* **Observed Behavior:** React 18 threw: `Error: Text content does not match server-rendered HTML. Server: "Bridal" Client: "Bridal Services"`.
* **Expected Behavior:** Server-rendered HTML and client-rendered virtual DOM evaluate identical text content.
* **Confirmed Root Cause:** Git commit `a928c07` originally had `{ title: "Bridal Services", href: "/#packages" }`, which was later changed to `{ title: "Bridal", href: "/bridal" }` in commit `f4ddbe6`. The browser retained the old chunk from disk cache due to the development `immutable` caching header.
* **Evidence & Location:** `src/config/site.ts` line 18; `src/components/layout/header.tsx` lines 168–193.
* **Resolution Applied:** Eliminated development cache headers. Standardized deterministic navigation constants in `siteConfig.mainNav`. Verified via automated tests in `admin-login-runtime-verification.test.ts`.
* **Status:** **FIXED AND VERIFIED (CLOSED)**

---

### ISSUE-003: Prisma Database Service Update Relation Failure (`categoryId`)
* **Issue ID:** `BUG-003`
* **Severity:** **P1 — HIGH** (Prevented editing existing services in Admin Portal)
* **Affected Module:** Services & Packages Admin (`/admin/services`, `/api/admin/services/[id]`)
* **Observed Behavior:** Prisma threw `Unknown argument 'categoryId'. Did you mean 'category'?`.
* **Expected Behavior:** Service updates successfully persist category relation changes in Neon PostgreSQL.
* **Confirmed Root Cause:** The client payload contained `{ categoryId: "..." }`, which was passed directly to Prisma update data instead of building relation connect syntax.
* **Evidence & Location:** `src/lib/db/repo.ts` lines 7878–7904.
* **Resolution Applied:** Refactored `updateService` and `createService` to look up the category record and construct `category: { connect: { id: cat.id } }`.
* **Status:** **FIXED AND VERIFIED (CLOSED)**

---

### ISSUE-004: Windows File Lock Contention During Production Builds (`EPERM`/`EBUSY`)
* **Issue ID:** `BUG-004`
* **Severity:** **P2 — MEDIUM** (Caused intermittent build failures on Windows environments)
* **Affected Module:** Next.js Build Pipeline (`npm run build`)
* **Observed Behavior:** Build worker threw `EPERM: operation not permitted` while reading shared compiled chunks.
* **Expected Behavior:** Build runs cleanly to completion on all developer workstations.
* **Confirmed Root Cause:** Windows file handle locking conflicts during multi-threaded Next.js static page generation.
* **Evidence & Location:** `scripts/patch-mkdir.js` lines 1–35.
* **Resolution Applied:** Extended `patch-mkdir.js` with an automated retry loop for `fs.readFileSync` and `fs.mkdirSync` with exponential backoff.
* **Status:** **FIXED AND VERIFIED (CLOSED)**

---

## 3. Pending Operational & Configuration Items (Owner Action)

| Config ID | Severity | Area / Module | Description | Dependency / Action Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`CFG-001`** | **P1 — HIGH** | Razorpay Gateway | Activate Live Mode for real customer payments | Complete Razorpay Business Website Verification; add `RAZORPAY_LIVE_KEY_ID` & `RAZORPAY_LIVE_KEY_SECRET` in Vercel. | **PENDING OWNER** |
| **`CFG-002`** | **P2 — MEDIUM**| Media Uploads | Cloudinary Cloud Storage Integration | Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in Vercel (fallback active). | **PENDING OWNER** |
| **`CFG-003`** | **P2 — MEDIUM**| Cron Reminders | Vercel Daily Cron Runner Authentication | Set `CRON_SECRET` in Vercel environment to authorize `/api/cron/reminders`. | **PENDING OWNER** |
| **`CFG-004`** | **P3 — LOW** | Framework Core | Next.js 15 & React 19 Major Upgrade Roadmap | Defer until after live salon launch and operational stabilization. | **PLANNED FUTURE** |

---

## 4. Defect Prevention Directives

1. **Strict TypeScript & Zod Validation:** Never introduce untyped `any` or unvalidated request payloads.
2. **Environment-Guarded Caching:** Never serve `immutable` cache headers in local development environments.
3. **Decoupled Route Shells:** Always keep unauthenticated authentication routes isolated from heavy dashboard chrome.
4. **Idempotent Webhook Processing:** Always verify HMAC-SHA256 signatures with timing-safe equality and record unique event IDs.
