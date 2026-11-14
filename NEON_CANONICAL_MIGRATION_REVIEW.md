# THE JAWED HABIB SALON – LALGANJ
## NEON CANONICAL MIGRATION REVIEW & DEPLOYMENT CHECKPOINT

**Document Reference:** `NEON_CANONICAL_MIGRATION_REVIEW.md`  
**Date:** 14 November 2026  
**Target Environment:** Neon Serverless PostgreSQL (`ep-holy-sunset-azrlr93h.c-3.ap-southeast-1.aws.neon.tech:5432/neondb`)  
**Prisma ORM Version:** v5.22.0  
**Migration Mode:** Option A — Canonical Initial Baseline Deployment  
**Status:** **CLEAN & VERIFIED — AUTHORIZED FOR INITIALIZATION**  

---

## 1. FILES CREATED OR CHANGED

1. **`prisma/migrations_archive/`** (Archive Directory Created):
   - Safely preserves original historical migration directories without deletion:
     - `20261109000000_init/migration.sql`
     - `20261112000000_optimize_performance_indexes/migration.sql`
     - `20261113000000_production_database_architecture/migration.sql`
     - `migration_lock.toml`
2. **`prisma/migrations/20261114000000_canonical_initial_database_architecture/migration.sql`** (Canonical Baseline Created):
   - Complete 34,030-byte UTF-8 SQL migration generated directly from validated `prisma/schema.prisma`.
3. **`prisma/migrations/migration_lock.toml`**:
   - Locked to `provider = "postgresql"`.
4. **`scripts/verify-canonical-sql.js`**:
   - Automated parser verifying zero destructive statements, 10 enums, 37 tables, 117 indexes, and 28 foreign keys.

---

## 2. EXACT SCHEMA COVERAGE

The canonical migration `20261114000000_canonical_initial_database_architecture` completely provisions:

### A. Enums (10)
- `RoleType` (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER`)
- `GenderTarget` (`UNISEX`, `FEMALE`, `MALE`, `KIDS`)
- `AppointmentStatus` (`PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REJECTED`, `NO_SHOW`)
- `PaymentStatus` (`UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED`)
- `PaymentGateway` (`RAZORPAY`, `CASHFREE`, `PAYTM`, `MANUAL_CASH`, `MANUAL_UPI`)
- `PaymentTransactionStatus` (`PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`)
- `BookingSource` (`ONLINE_WEBSITE`, `PHONE_CALL`, `WALK_IN`, `WHATSAPP`)
- `DiscountType` (`PERCENTAGE`, `FIXED_AMOUNT`)
- `EnquiryStatus` (`NEW`, `CONTACTED`, `SCHEDULED`, `RESOLVED`, `SPAM`)
- `NotificationType` (`BOOKING`, `REMINDER`, `PROMOTION`, `SYSTEM`)

### B. Tables (37 Total: 36 Core Models + 1 Implicit Join Table)
1. `User` (User accounts, phone numbers, bcrypt password hashes)
2. `CustomerProfile` (CRM profiles, loyalty points, visit histories, lifetime spend)
3. `AdminSession` (Cryptographic JWT session records, IP/device metadata, revocation)
4. `Role` (RBAC role definitions)
5. `Permission` (Granular capability permissions)
6. `ServiceCategory` (Categories, visual slugs, icon names)
7. `Service` (Catalog, pricing, starting prices, advance deposit rules)
8. `ServiceAddon` (Dynamic bridal and salon add-on catalog)
9. `Staff` (Stylists, experience, designations, shifts)
10. `StaffService` (Stylist-service capability mapping)
11. `Appointment` (Complete reservation records with `packageId`, `depositAmount`, `remainingAmount`, `depositType`, `holdToken`, `internalNotes`)
12. `AppointmentService` (Itemized services per booking)
13. `AppointmentAddon` (Itemized add-ons per booking)
14. `AvailabilityRule` (Weekly recurring staff availability)
15. `BlockedSlot` (Staff leave and salon time-off)
16. `Review` (Customer reviews and ratings)
17. `GalleryImage` (Interior and bridal showcase gallery)
18. `Transformation` (Before/after customer transformations)
19. `Offer` (Seasonal campaigns, coupons, and terms)
20. `Package` (Curated salon bundles)
21. `Enquiry` (Contact and bridal desk inquiries)
22. `Coupon` (Discount coupon codes and limits)
23. `Video` (Curated video portfolio)
24. `Brand` (Luxury product partner brands MAC, L'Oréal, etc.)
25. `Faq` (Frequently asked questions)
26. `Notification` (In-app notifications)
27. `SiteSetting` (System settings key-value store)
28. `AuditLog` (Compliance and admin activity logs)
29. `PaymentRecord` (Payment transactions, order references, gateway status)
30. `CalendarSettingRecord` (Global operating calendar hours, notice policies)
31. `TimeSlotHoldRecord` (Temporary slot reservations during active checkout)
32. `PaymentGatewaySettingRecord` (Encrypted Razorpay credentials, mode, policies)
33. `RazorpayOrderRecord` (Backend generated Razorpay order records)
34. `PaymentRefundRecord` (Refund logs and transaction tracking)
35. `WebhookEventRecord` (Webhook payload deduplication and audit)
36. `OfflinePaymentRecord` (Counter cash/card balance collection receipts)
37. `_RolePermissions` (Implicit many-to-many join table between `Role` and `Permission`)

### C. Appointment Model Coverage
- `packageId`: **INCLUDED** (nullable foreign key to `Package.id`)
- `depositAmount`: **INCLUDED** (`Float @default(0.0)`)
- `remainingAmount`: **INCLUDED** (`Float @default(0.0)`)
- `depositType`: **INCLUDED** (`String @default("NO_DEPOSIT")`)
- `holdToken`: **INCLUDED** (`String?`)
- `internalNotes`: **INCLUDED** (`String?`)

---

## 3. MIGRATION SQL REVIEW & SAFETY VERIFICATION

The canonical SQL was inspected and passed all 10 validation checks:

| Check | Requirement | Result |
| :--- | :--- | :--- |
| **1. Table References** | No references to tables before creation | **PASSED** (All `CREATE TABLE` precede `ALTER TABLE ADD CONSTRAINT`) |
| **2. Column References** | No references to missing columns | **PASSED** (`Appointment(packageId)` exists before index creation) |
| **3. Foreign-Key Order** | Correct foreign-key creation sequence | **PASSED** (28 constraints added after all referenced tables exist) |
| **4. Enum Order** | Correct enum creation sequence | **PASSED** (10 enums created before table definitions) |
| **5. Relation Definitions** | Matches `@relation` definitions | **PASSED** (All 1-1, 1-many, many-many relations mapped) |
| **6. Destructive Statements** | No `DROP TABLE`, `DROP COLUMN`, `TRUNCATE` | **PASSED** (Exact DROP count: 0) |
| **7. Duplicate Prevention** | No duplicate table or constraint names | **PASSED** (All 37 table names unique) |
| **8. Schema Completeness** | No missing models from `schema.prisma` | **PASSED** (Includes `Video`, `Brand`, `Faq`, `AdminSession`) |
| **9. Schema Validation** | `npx prisma validate` passes | **PASSED** (Schema valid) |
| **10. Status Consistency** | `npx prisma migrate status` ready | **PASSED** (1 migration ready to apply) |

---

## 4. DATABASE TARGET SAFETY VERIFICATION

A live read-only verification was executed immediately prior to checkpoint generation:

- **Target Database:** `neondb`
- **Connected Role:** `neondb_owner`
- **Host Endpoint:** `ep-holy-sunset-azrlr93h.c-3.ap-southeast-1.aws.neon.tech` (Port 5432)
- **SSL Status:** Verified Active (`sslmode=require&channel_binding=require`)
- **Current Table Count:** Exactly **0 tables**
- **Existing Records:** Exactly **0 records**
- **Migration History Table:** `_prisma_migrations` does not exist
- **Safety Rating:** **100% SAFE** (No existing customer or application data can be affected)

---

## 5. FINAL DEPLOYMENT EXECUTION COMMAND

The canonical baseline is applied using Prisma's official production migration command:

```bash
npx prisma migrate deploy
```

*Note: In accordance with developer instructions, this operation uses official `prisma migrate deploy`. It does not use `prisma migrate reset`, `prisma db push`, or manual `DROP` statements.*

---
*End of Review · Canonical Baseline Ready for Deployment*
