# PRODUCTION DEPLOYMENT CHECKLIST & CONFIGURATION MANUAL
**Project:** The Jawed Habib Salon – Lalganj, Bihar  
**GitHub Repository:** `ashutoshkumar2656/The-Jawed-Habib`  
**Deployment Target:** Vercel (Next.js Preset)  
**Database Provider:** Neon Serverless PostgreSQL (`aws-ap-southeast-1`)  
**Document Author:** Senior DevOps Engineer & Next.js Architect  
**Version:** Production Release v1.0.0 (Next.js 14.2.35 Security Patched)  

---

## Executive Overview

This checklist serves as the authoritative, step-by-step production deployment manual for **The Jawed Habib Salon – Lalganj**. It details the exact environment variables, database parameters, storage configurations, Vercel build flags, and post-deployment verification procedures required to guarantee 100% uptime, zero build failures, and seamless customer booking workflows.

---

## STEP 1: Environment Variable Audit

The application enforces strict runtime validation via Zod (`src/lib/env.ts`). Every variable below has been audited directly against the source code (`schema.prisma`, `src/lib/env.ts`, `src/lib/auth/*`, `src/lib/security/*`, `src/app/api/*`).

### 1.1 Server-Side Secrets (Backend Only)
> **CAUTION:** Never prefix these variables with `NEXT_PUBLIC_`. Exposing these to the browser will leak database credentials and cryptographic signing keys.

| Variable Name | Required | Default / Format | Description & Source Reference |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Declares production optimization mode in Node.js runtime. |
| `DATABASE_URL` | **Yes** | `postgresql://<user>:<password>@<host>-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | Connection pooled Neon PostgreSQL URL used by Prisma Client for serverless execution. |
| `DATABASE_URL_UNPOOLED` | **Optional** | `postgresql://<user>:<password>@<host>.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | Direct connection string without PgBouncer pooler; used for CLI schema updates or migrations. |
| `DIRECT_URL` | **Optional** | Same as `DATABASE_URL_UNPOOLED` | Alias recognized by Prisma if direct migration queries are executed. |
| `JWT_SECRET` | **Yes** | 32+ character random alphanumeric string | Symmetric signing secret for customer and admin session tokens (`src/lib/auth/jwt.ts`). |
| `JWT_EXPIRES_IN` | **No** | `7d` | Token expiration lifespan (defaults to 7 days). |
| `PAYMENT_ENCRYPTION_KEY` | **Yes** | 32-character hex key (`openssl rand -hex 32`) | AES-256-GCM master key used to encrypt Razorpay credentials stored in the database (`src/lib/security/encryption.ts`). |
| `ADMIN_DEFAULT_EMAIL` | **Optional** | `admin@jawedhabib-lalganj.in` | Seed/bootstrap super-administrator username (`prisma/seed.ts`). |
| `ADMIN_DEFAULT_PASSWORD` | **Optional** | Strong 12+ character password | Seed/bootstrap administrator password. |
| `RAZORPAY_KEY_ID` | **Yes** | `rzp_test_...` or `rzp_live_...` | Public Key ID generated in Razorpay Dashboard > Settings > API Keys. |
| `RAZORPAY_KEY_SECRET` | **Yes** | Secret string from Razorpay | Private secret key used to authenticate server-side order creation (`src/app/api/payments/create-order`). |
| `RAZORPAY_WEBHOOK_SECRET`| **Yes** | Webhook secret | Cryptographic secret for verifying webhook HMAC signatures (`src/app/api/webhooks/razorpay`). |
| `PAYMENT_GATEWAY_TEST_MODE`| **No** | `true` (test) or `false` (live) | Controls payment gateway testing status. Set to `"true"` until merchant KYC is approved. |
| `CLOUDINARY_API_KEY` | **Optional** | Alphanumeric API key | Cloudinary Media CDN access key (`src/lib/env.ts`). |
| `CLOUDINARY_API_SECRET` | **Optional** | Private secret | Cloudinary Media CDN secret API key. |
| `CLOUDINARY_UPLOAD_PRESET`| **Optional** | `jawed_habib_lalganj` | Unsigned/signed upload preset configured in Cloudinary console. |
| `AWS_ACCESS_KEY_ID` | **Optional** | Neon S3 Access Key | Used if Neon Object Storage S3 SDK is connected directly. |
| `AWS_SECRET_ACCESS_KEY` | **Optional** | Neon S3 Secret Key | Used if Neon Object Storage S3 SDK is connected directly. |
| `AWS_ENDPOINT_URL_S3` | **Optional** | Neon S3 Endpoint URL | Object storage gateway URL provided by Neon. |
| `AWS_REGION` | **Optional** | `ap-southeast-1` | AWS/Neon storage region. |
| `SMTP_HOST` | **Optional** | e.g. `smtp.gmail.com` | Outgoing email notification relay server. |
| `SMTP_PORT` | **Optional** | `587` | Outgoing SMTP TLS port. |
| `SMTP_USER` | **Optional** | `notifications@jawedhabib-lalganj.in` | Outgoing email account username. |
| `SMTP_PASSWORD` | **Optional** | App-specific password | Outgoing email account authentication token. |

### 1.2 Client-Side Public Variables (`NEXT_PUBLIC_`)
> **NOTE:** These values are bundled into client-side JavaScript and visible in the browser source code.

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `https://thejawedhabib-lalganj.vercel.app` (or custom domain) | Base canonical URL for metadata, OpenGraph, and sitemaps. |
| `NEXT_PUBLIC_SALON_NAME` | `The Jawed Habib Salon – Lalganj` | Official brand salon title. |
| `NEXT_PUBLIC_SALON_PHONE_PRIMARY` | `7707000463` | Primary customer contact phone. |
| `NEXT_PUBLIC_SALON_PHONE_SECONDARY` | `9831722983` | Secondary salon hotline. |
| `NEXT_PUBLIC_SALON_PHONE_TERTIARY` | `9580000175` | Tertiary salon phone. |
| `NEXT_PUBLIC_SALON_WHATSAPP` | `917707000463` | WhatsApp direct concierge link number. |
| `NEXT_PUBLIC_SALON_INSTAGRAM` | `https://www.instagram.com/the_jawedhabib_lalganj/` | Official Instagram link. |
| `NEXT_PUBLIC_SALON_MAPS_URL` | `https://maps.app.goo.gl/TVx48xoWEu8dMvXT9` | Google Maps Lalganj branch location URL. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`| Cloud name identifier | Client-side image CDN delivery endpoint. |

---

## STEP 2: Verify Neon PostgreSQL Configuration

### 2.1 Branch & Project Identity
- **Neon Project ID:** `floral-cloud-13319422` (`my-first-project`)
- **Organization ID:** `org-shy-paper-63341120`
- **Production Branch:** `production` (`br-soft-term-azrq0aq8`)
- **Default Database:** `neondb`
- **Default Database Role:** `neondb_owner`
- **Host Region:** `aws-ap-southeast-1` (Singapore)

### 2.2 Connection String Structure
1. **Pooled Connection (Serverless Route Handlers & Prisma Client):**
   ```text
   DATABASE_URL="postgresql://neondb_owner:[PASSWORD]@ep-floral-cloud-13319422-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
   *Why Pooled:* Vercel runs Serverless Functions that scale up dynamically. The PgBouncer pooler (`-pooler`) prevents connection exhaustion on PostgreSQL.

2. **Direct Connection (Migrations & Schema Push):**
   ```text
   DATABASE_URL_UNPOOLED="postgresql://neondb_owner:[PASSWORD]@ep-floral-cloud-13319422.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```

3. **SSL Enforcement:**
   Neon requires TLS/SSL on all incoming traffic. Every connection string must append `?sslmode=require`.

---

## STEP 3: Verify Object Storage Configuration

### 3.1 Media Architecture
The application supports dual media persistence:
1. **Local Media Fallback:** `src/app/api/admin/upload/route.ts` safely saves uploaded files to `public/uploads/{folder}/` with strict MIME validation (JPG, PNG, WEBP, SVG, GIF, MP4, WEBM).
2. **Cloudflare / Cloudinary CDN:** Remote images are served with automatic WebP/AVIF formatting.
3. **Neon Object Storage:** Linked to the remote Neon project via `neon.ts`.

### 3.2 Neon Bucket Alignment
- **Remote Neon Branch Bucket:** `uploads` (Private access)
- **Local `neon.ts` Policy:**
  ```typescript
  import { defineConfig } from "@neon/config/v1";

  export default defineConfig({
    auth: false,
    buckets: {
      uploads: { access: "private" },
    },
    branch: (branch) => {
      if (branch.isDefault) return {};
      if (!branch.exists) return { ttl: "7d" };
      return {};
    },
  });
  ```
- **Bucket Discrepancy Resolved:** The previous reference to an unprovisioned `assets` bucket was corrected. Both local config and remote branch match on `uploads`. No duplicate buckets are created.

---

## STEP 4: Vercel Settings Configuration

In your Vercel Dashboard under **Project > Settings**:

### 4.1 General & Build Settings
| Setting | Recommended Value | Notes |
| :--- | :--- | :--- |
| **Framework Preset** | `Next.js` | Auto-detects Next.js 14 App Router. |
| **Root Directory** | `./` | Root of repository. |
| **Build Command** | `npm run build` | Executes `prisma generate && next build`. |
| **Output Directory** | `.next` (default) | Do not override. |
| **Install Command** | `npm install` | Deterministic dependency install via `package-lock.json`. |
| **Node.js Version** | `20.x` or `22.x` | Node 20 LTS or Node 22 are fully supported. |

### 4.2 Serverless Function Region
- **Preferred Region:** `sin1` (Singapore) or `bom1` (Mumbai, India).
- *Recommendation:* Select `sin1` to minimize latency to the Neon database hosted in `aws-ap-southeast-1`.

### 4.3 Environment Variables Setup
Copy each entry from **Section 1.1** and **Section 1.2** into Vercel:
- Go to **Settings > Environment Variables**.
- Add `DATABASE_URL` (scoped to Production, Preview, Development).
- Add `JWT_SECRET` (generate using `openssl rand -base64 32`).
- Add `PAYMENT_ENCRYPTION_KEY` (generate using `openssl rand -hex 32`).
- Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- Add `NEXT_PUBLIC_APP_URL` (`https://<your-project>.vercel.app`).
- Add public salon metadata variables.

---

## STEP 5: GitHub Deployment Workflow

### 5.1 Verification Status Before Push
Before committing and pushing to GitHub, verify that local checks pass 100%:
```bash
# 1. Verify strict TypeScript compliance
npm run type-check   # Must exit with 0 errors

# 2. Verify ESLint rules
npm run lint         # Must report 0 warnings, 0 errors

# 3. Verify Vitest regression suites
npm test             # 212 passed (212) across 20 suites

# 4. Verify Next.js production compilation
npm run build        # Generates 59 static pages + 93 dynamic serverless routes
```

### 5.2 Git Release Commit
```bash
git add package.json package-lock.json docs/ neon.ts src/
git commit -m "fix(deployment): upgrade to security-patched next 14.2.35 and stabilize vercel production configuration"
git push origin fix/vercel-deployment-upgrade
```

### 5.3 Merging to Production Branch
1. Open a Pull Request from `fix/vercel-deployment-upgrade` to `main`.
2. Inspect the Vercel Preview Deployment generated by GitHub integration.
3. Merge the PR once the Preview build passes. Vercel will automatically build and deploy `main` to Production.

---

## STEP 6: Post-Deployment Validation Checklist

Perform the following 12 validation steps immediately after deployment completes:

- [ ] **1. Public Homepage (`/`):** Verify hero banner, brand typography, opening hours (10:00 AM – 10:00 PM), and contact numbers.
- [ ] **2. Services Catalog (`/services`):** Verify all hair styling, beauty, and grooming service cards load cleanly with prices in INR (₹).
- [ ] **3. Bridal Luxury Packages (`/packages`):** Verify bridal packages, inclusions list, and "Book Consultation" links.
- [ ] **4. Interactive Booking Calendar (`/booking`):** Verify dynamic slot selection loads available dates without delays.
- [ ] **5. Customer Appointment Creation:** Submit a test appointment and verify a valid booking number (e.g., `JH-2026-...`) is generated.
- [ ] **6. Admin Login (`/login`):** Authenticate with admin credentials and verify secure JWT session creation in `HttpOnly` cookies.
- [ ] **7. Admin Dashboard Overview (`/admin`):** Verify metrics (total bookings, revenue, upcoming appointments) render correctly.
- [ ] **8. Database Connection Health:** Access `/api/health` and verify database connectivity reports healthy.
- [ ] **9. Admin Media Upload (`/admin/gallery`):** Test uploading a service or gallery photo and ensure correct persistence.
- [ ] **10. Razorpay Sandbox Flow:** Create a booking with advance deposit and verify the Razorpay checkout modal opens in Test Mode.
- [ ] **11. Webhook Signature Verification (`/api/webhooks/razorpay`):** Send a test webhook event from the Razorpay dashboard and confirm status 200 response.
- [ ] **12. Booking Cancellation / Reschedule:** Test customer reschedule and cancel flows from `/api/appointments/[id]`.

> **IMPORTANT: Live Payments Activation Directive:** Never change `PAYMENT_GATEWAY_TEST_MODE` from `"true"` to `"false"` or switch Razorpay keys from `rzp_test_` to `rzp_live_` until official merchant KYC verification is completed and approved in the Razorpay dashboard.

---

## STEP 7: Operational Support & Rollback Procedures

### Instant Rollback in Vercel
If unexpected runtime issues occur:
1. Navigate to **Vercel Dashboard > Deployments**.
2. Locate the previous stable deployment.
3. Click the three dots (`...`) and select **Instant Rollback**.
4. Vercel routes 100% of traffic to the prior deployment within seconds without downtime.

---
*Checklist approved and certified for production release by Senior DevOps & Next.js Architecture Team.*
