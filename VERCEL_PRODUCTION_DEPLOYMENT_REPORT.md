# The Jawed Habib Salon – Lalganj
# VERCEL PRODUCTION DEPLOYMENT REPORT

**Execution Date:** 2026-11-14  
**Target Environment:** Vercel Production (`https://www.thejawedhabibsalons.in`)  
**Status Classification:** `PREPARED & VERIFIED` – AWAITING DEVELOPER DEPLOYMENT APPROVAL

---

## 1. Vercel Deployment Configuration

### 1.1 Project & Domain Architecture
- **Framework:** Next.js (App Router)
- **Node.js Runtime:** Node.js 20.x
- **Build Command:** `node -r ./scripts/patch-mkdir.js node_modules/next/dist/bin/next build` (or `npm run build`)
- **Output Directory:** `.next`
- **Canonical Custom Domains:**
  - `https://www.thejawedhabibsalons.in` (Primary Production Domain with SSL)
  - `https://thejawedhabibsalons.in` (Apex Domain redirected to www)

### 1.2 Scheduled Background Crons (`vercel.json`)
The application includes automated appointment reminders via Vercel Cron:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```
The endpoint is protected by `CRON_SECRET` in the `Authorization: Bearer <CRON_SECRET>` header.

---

## 2. Pre-Deployment Verification Checklist

| Gate | Check Item | Verification Method | Result |
| :---: | :--- | :--- | :---: |
| **1** | TypeScript Strict Compilation | `npm run type-check` | `PASS` (0 Errors) |
| **2** | ESLint Code Quality Rules | `npm run lint` | `PASS` (0 Warnings) |
| **3** | Vitest Automated Test Suites | `npm test` | `PASS` (31/31 Suites, 317/317 Tests) |
| **4** | Production Route Build | `npm run build` | `PASS` (60/60 Routes Compiled) |
| **5** | Rendered Production HTML | `node scripts/verify-rendered-html.js` | `PASS` (0 Missing Types, 0 Invalid Elements) |
| **6** | Duplicate HTML ID Scan | `node scripts/check-duplicate-ids.js` | `PASS` (0 Duplicate IDs) |
| **7** | Neon PostgreSQL Migrations | `npx prisma migrate status` | `PASS` (Up to Date) |
| **8** | Database Connectivity Probe | `node scripts/test-db.js` | `PASS` (Connected) |
| **9** | Local Server Live Route Probe | `node scripts/audit-local-server.js` | `PASS` (All Routes 200 OK) |
| **10**| Razorpay Mode Safety | Gateway Config Inspection | `PASS` (Strictly Test Mode) |

---

## 3. Production Environment Variables Verification

Ensure the following variables are configured in the Vercel Project Settings:

1. `NODE_ENV`: `production`
2. `APP_URL`: `https://www.thejawedhabibsalons.in`
3. `NEXT_PUBLIC_APP_URL`: `https://www.thejawedhabibsalons.in`
4. `DATABASE_URL`: Neon pooled connection URL (with `?sslmode=require`)
5. `DIRECT_URL`: Neon direct connection URL
6. `JWT_SECRET`: 64-character high-entropy secret
7. `PAYMENT_ENCRYPTION_KEY`: 32-byte hexadecimal master encryption key
8. `RAZORPAY_KEY_ID`: `rzp_test_...`
9. `RAZORPAY_KEY_SECRET`: Razorpay test secret
10. `RAZORPAY_WEBHOOK_SECRET`: Razorpay webhook secret
11. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
12. `CLOUDINARY_API_KEY`: Cloudinary API key
13. `CLOUDINARY_API_SECRET`: Cloudinary API secret
14. `CRON_SECRET`: Vercel Cron authentication secret

---

## 4. Deployment Approval Gate

> **CRITICAL DIRECTIVE:**  
> In compliance with user instructions ("Do not deploy automatically. Do not deploy without separate approval."), deployment to Vercel production has NOT been automatically triggered.
> 
> **To proceed with deployment upon developer approval:**
> ```bash
> git add .
> git commit -m "fix(production): complete public website audit, button repair, timezone resilience and booking synchronization"
> git push origin main
> ```
> Or via Vercel CLI:
> ```bash
> vercel --prod
> ```

---

## 5. Post-Deployment Smoke Test Protocol

Once deployed to production, execute the following non-destructive verification:
1. `GET https://www.thejawedhabibsalons.in/api/health` -> Verify status `200` with `"status": "healthy"`.
2. `GET https://www.thejawedhabibsalons.in/api/health/database` -> Verify status `200` with `"database": "connected"`.
3. Open `https://www.thejawedhabibsalons.in/` in a browser -> Verify luxury black-and-gold aesthetic, hero buttons, and smooth scrolling to `#bridal-experience`.
4. Open `https://www.thejawedhabibsalons.in/booking` -> Select date, service, and verify time slots render dynamically.
5. Verify phone links open `tel:7707000463` and WhatsApp links open `https://wa.me/917707000463`.
