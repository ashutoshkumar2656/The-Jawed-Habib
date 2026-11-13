# DATABASE SETUP & ARCHITECTURE GUIDE: NEON POSTGRESQL & PRISMA ORM
**Project:** The Jawed Habib Salon – Lalganj, Bihar  
**GitHub Repository:** `ashutoshkumar2656/The-Jawed-Habib`  
**Database Engine:** Neon Serverless PostgreSQL 16 (`aws-ap-southeast-1`)  
**ORM:** Prisma ORM (`@prisma/client` ^5.22.0)  
**Schema File:** `prisma/schema.prisma`  
**Document Author:** Senior Backend Engineer & PostgreSQL Database Architect  
**Version:** Production Release v1.0.0  

---

## 1. Database Provider & Infrastructure Topology

**The Jawed Habib Salon – Lalganj** utilizes **Neon Serverless PostgreSQL** hosted in the `aws-ap-southeast-1` (Asia Pacific – Singapore) region to provide ultra-low latency, automatic autoscaling, connection pooling via PgBouncer, and branching.

### Infrastructure Topology
- **Provider:** Neon (Serverless PostgreSQL)
- **Project ID:** `floral-cloud-13319422` (`my-first-project`)
- **Organization ID:** `org-shy-paper-63341120`
- **Active Branch:** `production` (`br-soft-term-azrq0aq8`)
- **Default Database:** `neondb`
- **Default Database Role:** `neondb_owner`
- **Region:** `aws-ap-southeast-1` (Singapore)
- **Connection Mode:** Dual architecture (Pooled for serverless runtimes + Direct for migrations)

---

## 2. Database Architecture & Entity Relationships

The schema models salon operations across 33 normalized tables and 10 relational domains.

### 2.1 Core Relational Domains
1. **User & Authentication:**
   - `User`: Base identity record for customers, staff, and administrators.
   - `CustomerProfile`: CRM entity storing visit history, total spent, date of birth, and preferred stylist.
   - `Role` & `Permission`: Fine-grained RBAC supporting `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`, and `CUSTOMER`.
   - `Notification`: In-app notification alerts for appointment updates and system reminders.
   - `AuditLog`: Immutable audit trail tracking user/admin actions.
2. **Service Catalog & Categories:**
   - `ServiceCategory`: Categorization (Hair Care, Skin & Facials, Bridal & Pre-Bridal, Royal Grooming).
   - `Service`: Service catalog with pricing, duration, gender targeting, and online booking flags.
   - `Package`: Bundled salon packages (e.g. Bridal packages) with service inclusions and discounted pricing.
   - `Brand`: Professional cosmetic brands used in salon operations.
3. **Staff & Schedule Management:**
   - `Staff`: Stylists with designations, specialties, rating, and working days.
   - `StaffService`: Join table mapping staff members to services with custom durations/prices.
   - `AvailabilityRule`: Weekly operating hours (Monday to Sunday, 10:00 AM – 10:00 PM).
   - `BlockedSlot`: Temporary chair blackouts and leave periods.
4. **Appointments & Bookings:**
   - `Appointment`: Customer booking record with appointment number (`JH-YYYYMMDD-XXXX`), status, date, and payment status.
   - `AppointmentService`: Line-item services attached to an appointment.
   - `TimeSlotHoldRecord`: Temporary atomic slot reservation during customer checkout.
   - `CalendarSettingRecord`: Global booking buffer, advance notice, and slot duration configuration.
5. **Media & Content:**
   - `GalleryImage`: Categorized ambience and styling station photos.
   - `Transformation`: Before & After makeover comparison records.
   - `Video`: Styling demos and salon tours.
   - `Review`: Verified customer reviews with approval and moderation status.
   - `Offer`: Promotional banners and active marketing discounts.
   - `Coupon`: Promo discount codes with minimum order values and validity windows.
   - `Enquiry`: Customer consultation and general inquiries.
   - `Faq`: Frequently asked questions with category sorting.
   - `SiteSetting`: Operational configurations and announcement banner metadata.
6. **Payment Auditing (Records Only):**
   - `PaymentRecord`: Transaction audit trail linked to appointments.
   - `OfflinePaymentRecord`: In-salon cash/UPI settlement logs.
   - `PaymentGatewaySettingRecord`: Encrypted database configuration.
   - `PaymentRefundRecord`: Refund audit trail.
   - `RazorpayOrderRecord`: Order tracking records.
   - `WebhookEventRecord`: Cryptographic webhook audit log.

---

## 3. Prisma Configuration

### 3.1 Datasource Definition (`prisma/schema.prisma`)
The datasource utilizes Prisma's dual-connection configuration:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 3.2 Prisma Client Singleton (`src/lib/db/prisma.ts`)
To prevent connection leaks across Next.js Serverless Function invocations, the Prisma Client is instantiated through a reusable global singleton:
```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  var globalPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.globalPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.globalPrisma = prisma;
}

export default prisma;
```

---

## 4. Environment Variables Reference

### 4.1 Connection Strings
| Variable Name | Connection Target | Usage Context |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon PgBouncer Pooler (`-pooler.ap-southeast-1.aws.neon.tech`) | Serverless route handlers, Next.js build, and runtime queries. |
| `DIRECT_URL` | Direct Neon PostgreSQL instance (`.ap-southeast-1.aws.neon.tech`) | `prisma migrate deploy`, `prisma db push`, and schema migrations. |
| `DATABASE_URL_UNPOOLED`| Same as `DIRECT_URL` | Standard Neon environment alias for direct migrations. |

### 4.2 Security Directives
- **SSL Required:** All connections to Neon must specify `?sslmode=require`.
- **Secret Protection:** Never commit `.env` or `.env.local` to Git. Ensure `.gitignore` contains `.env`, `.env.local`, `.env.neon`, and `.neon`.
- **Zero Client Exposure:** Never prefix database connection strings with `NEXT_PUBLIC_`.

---

## 5. Neon Connection Instructions

### 5.1 Obtaining Connection Strings from Neon Console
1. Log in to the [Neon Console](https://console.neon.tech/).
2. Select project **`floral-cloud-13319422`** (`my-first-project`).
3. Select branch **`production`**.
4. In the **Connection Details** card:
   - Check **Pooled connection** and copy the string for `DATABASE_URL`.
   - Uncheck **Pooled connection** and copy the direct string for `DIRECT_URL`.

### 5.2 Local Configuration (`.env.local`)
Create a local `.env.local` file (never committed to GitHub):
```bash
# Pooled connection (for normal dev execution)
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-floral-cloud-13319422-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Direct connection (for Prisma migrations)
DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-floral-cloud-13319422.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

---

## 6. Migration Instructions & Zero-Data-Loss Safety

> **CRITICAL PRODUCTION RULE:** Never execute `prisma migrate reset` against the production database. Doing so drops all tables and deletes all customer and booking records.

### 6.1 Applying Existing Migrations to Production
To safely apply pending schema migrations to the Neon production database:
```bash
npx prisma migrate deploy
```
*Note: `migrate deploy` uses `DIRECT_URL` to apply unapplied migration SQL files deterministically without resetting tables or prompting for confirmation.*

### 6.2 Checking Migration Status
```bash
npx prisma migrate status
```

### 6.3 Creating a New Migration in Development
```bash
npx prisma migrate dev --name your_migration_name
```

---

## 7. Backup and Recovery Considerations

### 7.1 Neon Point-in-Time Restore (PITR)
Neon automatically records write-ahead logs (WAL), enabling point-in-time recovery to any second within the retention window:
1. In the Neon Console, go to **Branches**.
2. Select **Create Branch**.
3. Choose **Point in time** and specify the exact timestamp before an incident occurred.
4. Neon creates an instant copy of the database at that exact moment without affecting the running production branch.

### 7.2 Manual SQL Dump (Logical Backup)
```bash
# Export schema and data using pg_dump with direct connection
pg_dump "postgresql://neondb_owner:PASSWORD@ep-floral-cloud-13319422.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 8. Vercel Environment Setup

In the Vercel Dashboard under **Project > Settings > Environment Variables**:
1. Add `DATABASE_URL` (set value to Neon pooled connection string). Select **Production**, **Preview**, and **Development**.
2. Add `DIRECT_URL` (set value to Neon direct unpooled connection string).
3. Ensure the Build Command in `package.json` is:
   ```json
   "build": "prisma generate && next build"
   ```
4. Ensure the Postinstall script in `package.json` is:
   ```json
   "postinstall": "prisma generate"
   ```

---

## 9. Database Health-Check Endpoint (`/api/health/database`)

The application provides a dedicated, zero-credential-leakage database health endpoint at `/api/health/database`.

### Endpoint Specifications
- **Route:** `GET /api/health/database`
- **Runtime:** `nodejs`
- **Execution Mode:** `force-dynamic`
- **Query Executed:** `SELECT 1 as connected` (lightweight, zero impact)
- **Timeout:** 3,000 ms

### Healthy Response (HTTP 200)
```json
{
  "status": "healthy",
  "database": "connected",
  "provider": "postgresql",
  "latencyMs": 14.8,
  "timestamp": "2026-11-13T06:38:00.000Z"
}
```

### Unhealthy Response (HTTP 503)
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "provider": "postgresql",
  "error": "Database connection unavailable or degraded",
  "latencyMs": 3001.2,
  "timestamp": "2026-11-13T06:38:00.000Z"
}
```

*Security Guarantee: No database URLs, passwords, usernames, or internal network hostnames are ever disclosed in the response payload.*

---

## 10. Query Optimization & Indexing Reference

All high-frequency transactional and search queries are backed by compound B-tree indexes:
- **`Appointment` Indexes:**
  - `@@index([appointmentDate, startTime])` — Instant calendar slot lookup.
  - `@@index([customerProfileId, status])` — Customer booking history filtering.
  - `@@index([appointmentDate, status])` — Admin day schedule views.
- **`Service` Indexes:**
  - `@@index([allowOnlineBooking, isActive])` — Customer booking wizard catalog filter.
  - `@@index([categoryId, isActive])` — Service menu display by category.
- **`TimeSlotHoldRecord` Indexes:**
  - `@@index([holdToken])` & `@@index([expiresAt])` — Non-blocking concurrency hold eviction.

---
*Guide approved and certified by Senior Backend & PostgreSQL Architecture Team.*
