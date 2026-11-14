# VERCEL PRODUCTION ENVIRONMENT CONFIGURATION CHECKLIST
## The Jawed Habib Salon – Lalganj, Bihar

- **Live Canonical Production URL:** `https://www.thejawedhabibsalons.in`
- **Hosting Platform:** Vercel (Next.js App Router Preset)
- **Database Provider:** Neon Serverless PostgreSQL (`aws-ap-southeast-1`)
- **Payment Gateway:** Razorpay Standard Checkout & Webhooks
- **Media Storage:** Cloudinary CDN
- **Document Version:** 1.0.0 (Production Stabilization Release)
- **Generated:** November 14, 2026

---

## 1. Executive Summary & Purpose

A thorough inspection of all source code, environment schemas (`src/lib/env.ts`), database datasource definitions (`prisma/schema.prisma`), package scripts (`package.json`), encryption routines (`src/lib/security/encryption.ts`), Razorpay integrations (`src/lib/payments/razorpay.ts`, `src/app/api/payments/*`), Cloudinary endpoints (`src/app/api/admin/upload/route.ts`), and deployment guides (`docs/*`) was conducted.

### Why This Checklist Is Urgent
Live diagnostic probing of `https://www.thejawedhabibsalons.in/api/health` confirmed that **none of the critical backend environment variables (`DATABASE_URL`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_API_KEY`) are currently configured in the Vercel Production Environment**.

This omission causes:
1. **Total database disconnection:** All appointments, customer profiles, and audit records evaporate on serverless container spin-down.
2. **Payment gateway failure:** Razorpay order creation fails with HTTP 401 Unauthorized, automatically triggering a deceptive "Pay at the Desk" fallback.
3. **Admin session insecurity:** Authentication falls back to a publicly known hardcoded development secret.
4. **Media upload failures:** Admin uploads attempt to write to Vercel's read-only serverless filesystem.

Configuring the variables detailed below in the **Vercel Project Dashboard** is mandatory to restore production stability, security, and data persistence.

---

## 2. Master Environment Variables Matrix

| Variable Name | Required? | Where to Obtain Value | Scope / Environments | Secret? | Configured on Vercel Live? | Used By |
| :--- | :---: | :--- | :--- | :---: | :---: | :---: |
| **`DATABASE_URL`** | **CRITICAL** | Neon Console > Project > Branch `production` > Pooled connection string | Production, Preview, Development | **YES** | **NO (Missing)** | Backend |
| **`DIRECT_URL`** | **CRITICAL** | Neon Console > Project > Branch `production` > Direct unpooled connection string | Production, Preview, Development | **YES** | **NO (Missing)** | Backend (Prisma Migrations) |
| **`JWT_SECRET`** | **CRITICAL** | Generate 32+ char random string via `openssl rand -base64 32` | Production, Preview, Development | **YES** | **NO (Missing)** | Backend |
| **`PAYMENT_ENCRYPTION_KEY`**| **CRITICAL** | Generate 32+ char hex key via `openssl rand -hex 32` | Production, Preview, Development | **YES** | **NO (Missing)** | Backend |
| **`RAZORPAY_KEY_ID`** | **CRITICAL** | Razorpay Dashboard > Settings > API Keys (`rzp_test_...` or `rzp_live_...`) | Production, Preview, Development | **NO** | **NO (Missing)** | Backend & Client payload |
| **`RAZORPAY_KEY_SECRET`** | **CRITICAL** | Razorpay Dashboard > Settings > API Keys | Production, Preview, Development | **YES** | **NO (Missing)** | Backend |
| **`RAZORPAY_WEBHOOK_SECRET`**| **CRITICAL** | Razorpay Dashboard > Settings > Webhooks (set when creating webhook) | Production, Preview, Development | **YES** | **NO (Missing)** | Backend |
| **`NEXT_PUBLIC_APP_URL`** | **CRITICAL** | Canonical live site domain: `https://www.thejawedhabibsalons.in` | Production, Preview, Development | **NO** | **NO (Defaulted)** | Frontend & Backend |
| **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`** | **REQUIRED** | Cloudinary Console > Dashboard > Cloud Name | Production, Preview, Development | **NO** | **NO (Missing)** | Frontend & Backend |
| **`CLOUDINARY_API_KEY`** | **REQUIRED** | Cloudinary Console > Dashboard > API Key | Production, Preview, Development | **YES** | **NO (Missing)** | Backend |
| **`CLOUDINARY_API_SECRET`** | **REQUIRED** | Cloudinary Console > Dashboard > API Secret | Production, Preview, Development | **YES** | **NO (Missing)** | Backend |
| **`CLOUDINARY_UPLOAD_PRESET`** | **OPTIONAL** | Cloudinary Console > Settings > Upload > Upload presets | Production, Preview, Development | **NO** | **NO (Missing)** | Backend |
| **`JWT_EXPIRES_IN`** | **OPTIONAL** | Token lifespan (e.g. `7d`, `24h`; defaults to `7d`) | Production, Preview, Development | **NO** | **NO (Defaults)** | Backend |
| **`ADMIN_DEFAULT_EMAIL`** | **OPTIONAL** | Initial admin user email for `prisma/seed.ts` (e.g. `admin@jawedhabib-lalganj.in`) | Development / Seeding | **NO** | **NO (Optional)** | Backend |
| **`ADMIN_DEFAULT_PASSWORD`**| **OPTIONAL** | Initial admin password for `prisma/seed.ts` | Development / Seeding | **YES** | **NO (Optional)** | Backend |
| **`NEXT_PUBLIC_SALON_NAME`**| **OPTIONAL** | Brand ground truth (defaults to `The Jawed Habib Salon – Lalganj`) | Production, Preview, Development | **NO** | **NO (Hardcoded default)**| Frontend |
| **`NEXT_PUBLIC_SALON_PHONE_PRIMARY`** | **OPTIONAL** | Primary hotline (defaults to `7707000463`) | Production, Preview, Development | **NO** | **NO (Hardcoded default)**| Frontend |
| **`NEXT_PUBLIC_SALON_PHONE_SECONDARY`** | **OPTIONAL** | Secondary phone (defaults to `9831722983`) | Production, Preview, Development | **NO** | **NO (Hardcoded default)**| Frontend |
| **`NEXT_PUBLIC_SALON_PHONE_TERTIARY`** | **OPTIONAL** | Tertiary phone (defaults to `9580000175`) | Production, Preview, Development | **NO** | **NO (Hardcoded default)**| Frontend |
| **`NEXT_PUBLIC_SALON_WHATSAPP`** | **OPTIONAL** | WhatsApp concierge (defaults to `917707000463`) | Production, Preview, Development | **NO** | **NO (Hardcoded default)**| Frontend |
| **`NEXT_PUBLIC_SALON_INSTAGRAM`** | **OPTIONAL** | Official Instagram URL (defaults to brand URL) | Production, Preview, Development | **NO** | **NO (Hardcoded default)**| Frontend |
| **`NEXT_PUBLIC_SALON_MAPS_URL`** | **OPTIONAL** | Google Maps location URL (defaults to brand URL) | Production, Preview, Development | **NO** | **NO (Hardcoded default)**| Frontend |
| **`SMTP_HOST`** | **OPTIONAL** | SMTP Relay Host (e.g. `smtp.gmail.com` or SendGrid) | Production (if email enabled) | **NO** | **NO (Optional)** | Backend |
| **`SMTP_PORT`** | **OPTIONAL** | SMTP Relay TLS Port (`587` or `465`) | Production (if email enabled) | **NO** | **NO (Optional)** | Backend |
| **`SMTP_USER`** | **OPTIONAL** | SMTP username / email address | Production (if email enabled) | **NO** | **NO (Optional)** | Backend |
| **`SMTP_PASSWORD`** | **OPTIONAL** | SMTP app password or API key | Production (if email enabled) | **YES** | **NO (Optional)** | Backend |

---

## 3. Category-by-Category Deep Dive

### 3.1 Category 1: Database & Persistence (Neon Serverless PostgreSQL)

The application utilizes Prisma ORM with a **dual-datasource topology** (`prisma/schema.prisma` lines 7–11):
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

#### 1. `DATABASE_URL` (Connection Pooled)
- **Role:** Handles all serverless API requests, appointment lookups, customer records, and admin dashboards.
- **Why Pooled:** Vercel spins up tens or hundreds of concurrent serverless containers. Connecting directly would quickly exhaust PostgreSQL connection limits. The Neon PgBouncer pooler (`-pooler`) manages connection reuse.
- **Format:**
  ```text
  postgresql://neondb_owner:<PASSWORD>@<HOST>-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
  ```
- **Constraint:** Must append `?sslmode=require`.

#### 2. `DIRECT_URL` (Direct Connection)
- **Role:** Exclusively used by Prisma CLI during schema migrations (`prisma migrate deploy`).
- **Why Direct:** PgBouncer transaction pooling blocks PostgreSQL session-level advisory locks required by Prisma migration operations.
- **Format:**
  ```text
  postgresql://neondb_owner:<PASSWORD>@<HOST>.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
  ```

---

### 3.2 Category 2: Cryptographic Security & Authentication

#### 1. `JWT_SECRET`
- **Role:** Signs and verifies session tokens stored in the `habib_session_token` HTTP-only cookie.
- **Source Reference:** `src/lib/auth/jwt.ts` line 3 & `src/lib/env.ts` line 114.
- **Security Rule:** In production, `src/lib/env.ts` enforces that `JWT_SECRET` must:
  - Be at least 32 characters long.
  - NOT equal `"development-jwt-secret-key-32-chars-long-minimum"`.
  - NOT equal `"fallback-development-secret-minimum-32-chars"`.
  - NOT equal `"super-secret-jwt-key-replace-in-production-min-32-chars"`.
- **Generation Command:**
  ```bash
  openssl rand -base64 32
  ```

#### 2. `PAYMENT_ENCRYPTION_KEY`
- **Role:** Serves as the master derivation seed for authenticated **AES-256-GCM** encryption of Razorpay keys stored in database table `PaymentGatewaySettingRecord`.
- **Source Reference:** `src/lib/security/encryption.ts` lines 7–14.
- **Security Rule:** Must be a cryptographically random 32-byte hexadecimal string.
- **Generation Command:**
  ```bash
  openssl rand -hex 32
  ```

---

### 3.3 Category 3: Razorpay Payment Gateway & Webhooks

#### 1. `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
- **Role:** Authenticates server-to-server REST API requests to create orders via `https://api.razorpay.com/v1/orders` (`src/lib/payments/razorpay.ts`).
- **Current Failure:** When missing, code falls back to `rzp_test_lalganj_mock`. Razorpay returns HTTP 401, triggering the silent fallback to "Pay at the Desk" / "Pay at Salon Counter".
- **Prefix Conventions:**
  - Test Mode: `rzp_test_...`
  - Live Mode: `rzp_live_...`

#### 2. `RAZORPAY_WEBHOOK_SECRET`
- **Role:** Verifies the cryptographic HMAC SHA-256 signature in the `X-Razorpay-Signature` request header for incoming webhooks at `/api/webhooks/razorpay` (`src/app/api/webhooks/razorpay/route.ts`).
- **Events to Subscribe in Razorpay Dashboard:**
  - `order.paid`
  - `payment.captured`
  - `payment.failed`
  - `refund.processed`
- **Webhook Target URL:**
  ```text
  https://www.thejawedhabibsalons.in/api/webhooks/razorpay
  ```

---

### 3.4 Category 4: Media Asset Storage (Cloudinary CDN)

- **Source Reference:** `src/app/api/admin/upload/route.ts` lines 98–136.
- **Why Cloudinary is Required in Production:**
  Vercel serverless functions execute in a read-only container environment. Local disk writes to `public/uploads/` will fail or be lost when the container is recycled.
- **Required Variables:**
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloud name identifier (e.g. `jawed-habib-lalganj`).
  - `CLOUDINARY_API_KEY`: Alphanumeric API key.
  - `CLOUDINARY_API_SECRET`: Private signing secret used to compute SHA-1 signatures for authenticated asset uploads.
  - `CLOUDINARY_UPLOAD_PRESET`: Upload preset name configured in Cloudinary (e.g. `jawed_habib_lalganj`).

---

### 3.5 Category 5: Canonical URLs & Public Brand Ground Truth

#### 1. `NEXT_PUBLIC_APP_URL`
- **Role:** Used in metadata generators, OpenGraph image cards, `sitemap.xml`, `robots.txt`, and Razorpay redirection handlers (`src/config/site.ts`, `src/app/layout.tsx`).
- **Canonical Production Value:**
  ```text
  https://www.thejawedhabibsalons.in
  ```
- **Warning:** Do not use `http://localhost:3000` or the unaliased apex `https://thejawedhabibsalons.in` (which returns a 308 redirect).

#### 2. Salon Brand Information Variables
These are defined in `src/lib/constants/brand.ts` as permanent ground truth and can be left to their built-in defaults:
- `NEXT_PUBLIC_SALON_NAME`: `"The Jawed Habib Salon – Lalganj"`
- `NEXT_PUBLIC_SALON_PHONE_PRIMARY`: `"7707000463"`
- `NEXT_PUBLIC_SALON_PHONE_SECONDARY`: `"9831722983"`
- `NEXT_PUBLIC_SALON_PHONE_TERTIARY`: `"9580000175"`
- `NEXT_PUBLIC_SALON_WHATSAPP`: `"917707000463"`
- `NEXT_PUBLIC_SALON_INSTAGRAM`: `"https://www.instagram.com/the_jawedhabib_lalganj/"`
- `NEXT_PUBLIC_SALON_MAPS_URL`: `"https://maps.app.goo.gl/TVx48xoWEu8dMvXT9"`

---

## 4. Discrepancies, Missing Variables & Conflicts Identified

### 4.1 Missing Variables on Live Vercel Production
Probed `https://www.thejawedhabibsalons.in/api/health` directly:
```json
{
  "status": "degraded",
  "configuration": {
    "valid": false,
    "databaseConfigured": false,
    "jwtConfigured": false,
    "razorpayConfigured": false,
    "storageConfigured": false
  }
}
```
**All five core subsystems are unconfigured in Vercel.**

### 4.2 Development Placeholders in Code
The following insecure placeholders exist as fallbacks in the codebase and must be superseded by real Vercel environment variables:
1. `src/lib/auth/jwt.ts`: `"fallback-development-secret-minimum-32-chars"`
2. `src/lib/security/encryption.ts`: `"jawed-habib-lalganj-secure-encryption-key-2026"`
3. `src/lib/db/repo.ts`: `"rzp_test_lalganj_mock"` and `"mock_secret_lalganj_2026"`
4. `.env.example`: `ADMIN_DEFAULT_PASSWORD="ReplaceWithStrongPassword2026!"`

### 4.3 Duplicate / Overlapping Variable Names
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` vs `CLOUDINARY_CLOUD_NAME`:
  In `src/app/api/admin/upload/route.ts` line 98:
  ```typescript
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  ```
  **Resolution:** Define `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in Vercel; it satisfies both backend upload logic and frontend image renderers.
- `DIRECT_URL` vs `DATABASE_URL_UNPOOLED`:
  Prisma schema explicitly expects `DIRECT_URL` (`prisma/schema.prisma` line 10). Ensure `DIRECT_URL` is configured in Vercel.
- `NEXT_PUBLIC_APP_URL` vs `APP_URL`:
  `.env.example` lists both. The Next.js application codebase strictly reads `NEXT_PUBLIC_APP_URL`.

### 4.4 Outdated URLs in Project Documentation
- In `docs/ENVIRONMENT_VARIABLES.md`, the example URL was listed as `https://thejawedhabib-lalganj.com`.
  **Correction:** The live registered domain is `https://www.thejawedhabibsalons.in`.
- In `docs/DATABASE_SETUP_GUIDE.md`, project endpoint was documented as `ep-floral-cloud-13319422...`, whereas local `.env` had `ep-holy-sunset-azrlr93h...`.
  **Resolution:** Always use the active connection string from the [Neon Console](https://console.neon.tech/) under project `floral-cloud-13319422` (`br-soft-term-azrq0aq8`).

---

## 5. Step-by-Step Vercel Configuration Execution Checklist

Follow this exact operational checklist in the **Vercel Project Dashboard**:

### Step 5.1: Navigate to Vercel Environment Settings
1. Open [Vercel Dashboard](https://vercel.com/).
2. Select project **`The Jawed Habib`** (or matching repo `The-Jawed-Habib`).
3. Click **Settings** (top navigation) > **Environment Variables** (left sidebar).

---

### Step 5.2: Configure Core Production Variables

Check off each variable as it is saved in Vercel:

- [ ] **`DATABASE_URL`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `postgresql://neondb_owner:<PASSWORD>@<HOST>-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
  - **Notes:** Pooled connection string from Neon Console. Must include `-pooler` and `?sslmode=require`.

- [ ] **`DIRECT_URL`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `postgresql://neondb_owner:<PASSWORD>@<HOST>.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
  - **Notes:** Direct unpooled connection string from Neon Console.

- [ ] **`JWT_SECRET`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `[Generate a random 32+ char string via openssl rand -base64 32]`
  - **Notes:** Must be kept secret. Never share or commit.

- [ ] **`PAYMENT_ENCRYPTION_KEY`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `[Generate a 32-byte hex key via openssl rand -hex 32]`
  - **Notes:** Master key for AES-256-GCM gateway credential encryption.

- [ ] **`RAZORPAY_KEY_ID`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `rzp_test_...` (for test mode) or `rzp_live_...` (for live mode)
  - **Notes:** Obtained from Razorpay Dashboard > Settings > API Keys.

- [ ] **`RAZORPAY_KEY_SECRET`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `[Razorpay API Secret corresponding to the Key ID above]`
  - **Notes:** Private key. Never expose with `NEXT_PUBLIC_`.

- [ ] **`RAZORPAY_WEBHOOK_SECRET`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `[Webhook Secret entered in Razorpay Dashboard > Settings > Webhooks]`
  - **Notes:** Required for webhook HMAC SHA256 validation.

- [ ] **`NEXT_PUBLIC_APP_URL`**
  - **Environment Target:** Check **Production**
  - **Value:** `https://www.thejawedhabibsalons.in`
  - **Notes:** Canonical site domain.

- [ ] **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `[Cloudinary Cloud Name]`
  - **Notes:** Required for asset transformation and CDN URLs.

- [ ] **`CLOUDINARY_API_KEY`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `[Cloudinary API Key]`
  - **Notes:** Required for server-side upload authentication.

- [ ] **`CLOUDINARY_API_SECRET`**
  - **Environment Target:** Check **Production**, **Preview**, **Development**
  - **Value:** `[Cloudinary API Secret]`
  - **Notes:** Private key for computing Cloudinary upload signatures.

---

### Step 5.3: Apply Database Migrations
Before deploying the updated environment, apply any pending Prisma migrations to the Neon production branch:
```bash
npx prisma migrate deploy
```
*(Uses `DIRECT_URL` to apply migrations safely without resetting tables or losing data).*

---

### Step 5.4: Trigger Clean Redeployment on Vercel
Environment variable changes on Vercel do **not** take effect until a new deployment is built:
1. In Vercel Dashboard, go to **Deployments**.
2. Select the latest production deployment.
3. Click the three dots (`...`) > **Redeploy**.
4. **Ensure "Redeploy with existing Build Cache" is UNCHECKED** (do a clean build so `prisma generate` and Next.js pick up new environment configurations).
5. Click **Redeploy**.

---

## 6. Post-Deployment Verification Commands

Once Vercel finishes building, verify the system health by running these non-destructive tests:

### 1. Verify System Configuration Health
```bash
curl -s https://www.thejawedhabibsalons.in/api/health | jq .
```
**Expected Output:**
```json
{
  "status": "healthy",
  "environment": "production",
  "configuration": {
    "valid": true,
    "databaseConfigured": true,
    "jwtConfigured": true,
    "razorpayConfigured": true,
    "storageConfigured": true
  }
}
```

### 2. Verify PostgreSQL Database Connectivity
```bash
curl -s https://www.thejawedhabibsalons.in/api/health/database | jq .
```
**Expected Output:**
```json
{
  "status": "healthy",
  "database": "connected",
  "provider": "postgresql"
}
```

### 3. Verify Payment Preflight Checks (as Admin)
```bash
curl -s -H "Cookie: habib_session_token=YOUR_ADMIN_TOKEN" https://www.thejawedhabibsalons.in/api/admin/payment-gateway/razorpay/preflight | jq .
```
**Expected Output:**
- `readyForLive: true` (or verified test mode)
- `masterKeyConfigured: true`
- `databasePersistenceVerified: true`

---
*Checklist compiled and certified for The Jawed Habib Salon – Lalganj production operations.*

