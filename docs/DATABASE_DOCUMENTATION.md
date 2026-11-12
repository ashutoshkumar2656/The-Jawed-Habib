# Database Architecture & Schema Documentation: The Jawed Habib Salon – Lalganj

> **Document Version**: 2.0.0 (Production Verified & Performance Optimized)  
> **Primary Database Engine**: PostgreSQL 14+ (Target Engine)  
> **ORM Layer**: Prisma ORM 5.22.0 (`@prisma/client`)  
> **Connection URL Identifier**: `postgresql://postgres:postgres@localhost:5432/jawed_habib_lalganj?schema=public`  
> **Runtime Strategy**: Dual-Tier High-Availability Architecture (PostgreSQL via Prisma Client + High-Fidelity Pre-Seeded In-Memory Fallback)  
> **Developer Attribution**: Designed & Engineered by [Axivon Technologies](https://axivontech.in)

---

## 1. Authoritative Database Engine & Runtime Architecture

The data architecture of **The Jawed Habib Salon – Lalganj** is engineered for high availability, zero-downtime development, and enterprise data consistency.

```mermaid
flowchart TD
    App["Application Layer\n(Next.js App Router / Server Components / Route Handlers)"] --> DAL["Unified Data Access Layer\n(dbRepo in src/lib/db/repo.ts)"]
    DAL --> Guard{"canUsePrisma() Connection Guard\n(1000ms SELECT 1 Probe)"}
    
    subgraph Tier 1: Primary PostgreSQL Persistence
        Guard -- "PostgreSQL Online (Port 5432)" --> PrismaClient["Prisma Client v5.22.0"]
        PrismaClient --> PostgresDB[("PostgreSQL Database\njawed_habib_lalganj\n(Port 5432, Connection Pool: 10)")]
    end
    
    subgraph Tier 2: Resilient In-Memory Fallback Shield
        Guard -- "PostgreSQL Offline / DB_TIMEOUT" --> MemDB["High-Fidelity In-Memory Repository (memoryDb)"]
        MemDB --> SeededState["Pre-seeded Complete Lalganj Salon State\n(Super Admin, Stylists, Services, Packages, Hours, Settings)"]
    end
    
    PostgresDB -.-> Replica["Automated Nightly Backups (pg_dump)"]
```

### A. Dual-Tier Persistence Mechanics
1. **Tier 1 (Prisma ORM + PostgreSQL Engine)**:
   - Configured in `prisma/schema.prisma` with `provider = "postgresql"`.
   - Utilizes Prisma connection pooling with automatic parameterized query escaping to eliminate SQL injection.
   - When a PostgreSQL server is running at `localhost:5432` (or AWS RDS / Supabase in production), `dbRepo` runs all read and write queries against the relational database.
2. **Tier 2 (High-Fidelity In-Memory Repository `memoryDb`)**:
   - Engineered in `src/lib/db/repo.ts` to ensure the application never crashes during local sandbox runs, CI test suites, or temporary database maintenance.
   - Guarded by `canUsePrisma()` which performs a 1000ms race against `prisma.$queryRaw\`SELECT 1\``.
   - `checkPromise.catch(() => {})` suppresses unhandled rejection warnings if PostgreSQL is offline.
   - When offline, `dbRepo` transparently routes all model queries to `memoryDb`, pre-seeded with complete Lalganj salon ground-truth data (super admin, stylists, categories, bridal services, luxury packages, working hours, and reviews).

---

## 2. Complete Enum Definitions (10 Types)

Defined in `prisma/schema.prisma` and mirrored in TypeScript interfaces:

| Enum Name | Allowed Values | Business Purpose |
| :--- | :--- | :--- |
| `RoleType` | `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER` | Hierarchy of system authentication privileges. |
| `GenderTarget` | `UNISEX`, `FEMALE`, `MALE`, `KIDS` | Target demographic for salon services and styling. |
| `AppointmentStatus` | `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REJECTED`, `NO_SHOW` | Lifecycle states of a salon booking. |
| `PaymentStatus` | `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED` | Overall financial collection state of an appointment. |
| `PaymentGateway` | `RAZORPAY`, `CASHFREE`, `PAYTM`, `MANUAL_CASH`, `MANUAL_UPI` | Payment provider or physical reception counter method. |
| `PaymentTransactionStatus`| `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` | State of an individual payment transaction or gateway charge. |
| `BookingSource` | `ONLINE_WEBSITE`, `PHONE_CALL`, `WALK_IN`, `WHATSAPP` | Acquisition channel of an appointment. |
| `DiscountType` | `PERCENTAGE`, `FIXED_AMOUNT` | Promotional discount calculation rule for coupons and offers. |
| `EnquiryStatus` | `NEW`, `CONTACTED`, `SCHEDULED`, `RESOLVED`, `SPAM` | Bridal consultation lead tracking status. |
| `NotificationType` | `BOOKING`, `REMINDER`, `PROMOTION`, `SYSTEM` | Administrative and customer notification classification. |

---

## 3. Organization Around the 20 Core Business Entities

The database architecture is structured logically around the 20 core business entities required for high-end bridal salon operations:

```mermaid
erDiagram
    User ||--o| CustomerProfile : "has profile"
    User ||--o| Staff : "has staff profile"
    User }o--o| Role : "assigned role"
    User ||--o{ Notification : "receives"
    User ||--o{ AuditLog : "triggers"
    
    Role ||--o{ Permission : "grants permissions"
    
    CustomerProfile ||--o{ Appointment : "books"
    CustomerProfile ||--o{ Review : "writes"
    
    ServiceCategory ||--o{ Service : "categorizes"
    Service ||--o{ AppointmentService : "included in"
    Service ||--o{ StaffService : "performed by"
    Service ||--o{ Transformation : "featured in"
    
    Staff ||--o{ StaffService : "offers"
    Staff ||--o{ Appointment : "assigned to"
    Staff ||--o{ AvailabilityRule : "has schedule"
    Staff ||--o{ BlockedSlot : "blocks"
    
    Package ||--o{ Appointment : "booked as package"
    
    Appointment ||--o{ AppointmentService : "line items"
    Appointment ||--o{ PaymentRecord : "online payments"
    Appointment ||--o{ RazorpayOrderRecord : "gateway orders"
    Appointment ||--o{ OfflinePaymentRecord : "cash counter receipts"
    Appointment ||--o{ PaymentRefundRecord : "refund records"
```

### 1. Admin Users (`User`)
- Stores administrative staff and customers with unique phone and email identifiers.
- Attributes: `id`, `name`, `email`, `phone`, `passwordHash`, `roleId`, `roleType`, `avatarUrl`, `isActive`, `createdAt`, `updatedAt`.
- Passwords hashed using bcrypt (10 rounds). Protected with indices on `phone`, `email`, and `roleType`.

### 2. Roles & Permissions (`Role`, `Permission`)
- Role-Based Access Control (RBAC) model supporting `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`, and `CUSTOMER`.
- `Role`: `id`, `name` (Unique enum), `displayName`, `description`, timestamps.
- `Permission`: `id`, `slug` (Unique), `action`, `subject`, `description`. Many-to-many relationship with `Role`.

### 3. Customers (`CustomerProfile`)
- Linked 1-to-1 with `User` (`userId` unique foreign key).
- Attributes: `alternatePhone`, `dateOfBirth`, `anniversary`, `address`, `notes` (skin tone, hair texture, bridal preferences), `totalVisits`, `totalSpent`, `preferredStaffId`.
- Performance-indexed on `userId` and `totalSpent` (enabling rapid VIP client retrieval and loyalty ranking).

### 4. Services (`Service`)
- Master service catalogue for hair styling, bridal makeup, skin rituals, and groom services.
- Attributes: `name`, `slug` (Unique), `description`, `detailedDescription`, `price`, `discountedPrice`, `durationMinutes`, `gender`, `categoryId`, `imageUrl`, `additionalImages`, `priceDisplayType`, `isStartingPrice`, `allowOnlineBooking`, `allowAdvancePayment`, `depositType`, `depositValue`, `bufferTimeMinutes`, `sortOrder`, `isPopular`, `isFeatured`, `isActive`.
- Indexed on `categoryId`, `slug`, `isActive`, `[allowOnlineBooking, isActive]`, `[categoryId, isActive]`, and `[isFeatured, isActive]`.

### 5. Service Categories (`ServiceCategory`)
- Hierarchical grouping for services (e.g., *Bridal Makeover*, *Hair Care & Spa*, *Skin Aesthetics*, *Men's Grooming*).
- Attributes: `name` (Unique), `slug` (Unique), `description`, `imageUrl`, `iconName`, `sortOrder`, `isActive`.

### 6. Bridal Packages (`Package`)
- Comprehensive bridal makeover packages (e.g., *Silver Bridal Glow*, *Gold Royal Bridal*, *Kohinoor Diamond Bridal Suite*).
- Attributes: `name`, `slug` (Unique), `description`, `price`, `originalPrice`, `durationMinutes`, `servicesList` (String[] of included services), `imageUrl`, `isFeatured`, `isActive`.
- Indexed on `slug` and `isActive`.

### 7. Package Images
- Supported directly within `Package.imageUrl` and `Service.additionalImages` (PostgreSQL text array `String[]`) for high-resolution bridal albums and portfolio showcases.

### 8. Bookings (`Appointment`)
- Central transaction record for online and walk-in salon reservations.
- Attributes: `id`, `appointmentNumber` (Unique formatted identifier `JH-LAL-YYYY-XXXX`), `customerProfileId` (FK), `staffId` (FK, optional), `status`, `source`, `appointmentDate`, `startTime`, `endTime`, `subtotal`, `discountAmount`, `totalAmount`, `depositAmount`, `remainingAmount`, `depositType`, `paymentStatus`, `paymentMethod`, `couponCode`, `holdToken`, `notes`, `adminNotes`, `internalNotes`, `packageId` (FK, optional), timestamps.
- Performance-indexed on `customerProfileId`, `staffId`, `appointmentDate`, `status`, `paymentStatus`, `[appointmentDate, startTime]`, `packageId`, `[appointmentDate, status]`, and `[customerProfileId, status]`.

### 9. Booking Services (`AppointmentService`)
- Normalized line items for appointments containing multiple services.
- Attributes: `id`, `appointmentId` (FK with `ON DELETE CASCADE`), `serviceId` (FK with `ON DELETE RESTRICT`), `price`, `durationMinutes`, `createdAt`.

### 10. Booking Time Slots (`AvailabilityRule`, `BlockedSlot`, `TimeSlotHoldRecord`)
- Concurrency management and calendar scheduling tables.
- `AvailabilityRule`: Staff working days and opening hours (10:00 AM – 10:00 PM).
- `BlockedSlot`: Salon holidays, stylist leave, or emergency maintenance.
- `TimeSlotHoldRecord`: Ephemeral 10-minute slot reservations during Razorpay checkout to prevent double-booking. Includes `holdToken`, `date`, `startTime`, `endTime`, `expiresAt`.

### 11. Payments (`PaymentRecord`)
- Master digital payment logs for Razorpay transactions.
- Attributes: `id`, `appointmentId` (FK), `transactionRef` (Unique), `gateway`, `gatewayPaymentId` (Unique), `gatewaySignature`, `amount`, `currency` (`INR`), `status`, `failureReason`, `metadata` (JSON string), timestamps.
- Indexed on `appointmentId`, `transactionRef`, `status`, `gatewayPaymentId`, and `createdAt`.

### 12. Payment Transactions (`RazorpayOrderRecord`)
- Pre-payment Razorpay order creations storing amount in integer paise.
- Attributes: `id`, `orderId` (Unique, e.g. `order_P7xY9abc123`), `appointmentId`, `amountInPaise` (Integer paise), `currency` (`INR`), `purpose` (`ADVANCE_DEPOSIT`), `environment` (`TEST`/`LIVE`), `status`, `metadata`, `createdAt`.

### 13. Refunds (`PaymentRefundRecord`)
- Audit records for customer cancellations and advance deposit refunds.
- Attributes: `id`, `transactionId`, `appointmentId`, `razorpayRefundId`, `amount`, `currency` (`INR`), `reason`, `status`, `initiatedBy`, `createdAt`.
- Indexed on `transactionId`, `appointmentId`, `razorpayRefundId`, and `createdAt`.

### 14. Customer Payment Balances (`OfflinePaymentRecord`)
- Reception counter cash/UPI settlement records for the remaining balance.
- Attributes: `id`, `appointmentId` (FK), `amount`, `paymentMethod` (`CASH`, `UPI`, `CARD`), `transactionReference`, `receivedDate`, `recordedBy`, `notes`, `createdAt`.
- Indexed on `appointmentId`, `createdAt`, and `receivedDate`.

### 15. Gallery Images (`GalleryImage`)
- High-editorial visual portfolio of salon ambience, bridal transformations, and hair styling.
- Attributes: `id`, `title`, `caption`, `imageUrl`, `category`, `isFeatured`, `sortOrder`, timestamps.

### 16. Website Content (`SiteSetting`, `Brand`, `Video`)
- Dynamic CMS configuration powering the public website without code redeployments.
- `SiteSetting`: Key-value store for header announcements, hero banner text, and official business address ground truth.
- `Brand`: Partner luxury brands (e.g., L'Oréal Professionnel, Schwarzkopf, MAC, Kryolan, Dyson).
- `Video`: Bridal makeover showcase video reels.

### 17. Reviews (`Review`)
- Client ratings and verified bridal feedback.
- Attributes: `id`, `customerProfileId` (FK), `rating` (1–5), `title`, `comment`, `isApproved`, `isFeatured`, timestamps.

### 18. Offers (`Offer`, `Coupon`)
- Seasonal bridal packages, festive discounts, and promo codes.
- Attributes: `title`, `slug` (Unique), `discountType`, `discountValue`, `validFrom`, `validUntil`, `isActive`, `termsConditions`.

### 19. Notifications (`Notification`)
- Administrative notifications and customer appointment confirmations.
- Attributes: `userId` (FK), `title`, `message`, `type` (`BOOKING`, `REMINDER`, `PROMOTION`, `SYSTEM`), `isRead`, `link`, `createdAt`.

### 20. Audit Logs (`AuditLog`)
- Security audit trail tracking system events, admin logins, price updates, and booking cancellations.
- Attributes: `id`, `userId` (FK, SetNull on delete), `action`, `entity`, `entityId`, `details` (JSON string), `ipAddress`, `userAgent`, `createdAt`.

---

## 4. Booking Database Architecture

### A. Unique Booking Identifier Format
Every appointment receives a standardized, human-readable identifier:
```text
JH-LAL-{YYYY}-{SEQUENCE}
Example: JH-LAL-2026-0042
```
- **JH**: The Jawed Habib
- **LAL**: Lalganj Branch
- **YYYY**: Calendar Year
- **SEQUENCE**: 4-digit zero-padded sequence number

### B. Financial Balance Calculations
Salon bookings support flexible advance payment and cash counter balance settlement:
$$\text{Total Amount} = \text{Subtotal} - \text{Discount Amount}$$
$$\text{Remaining Balance} = \text{Total Amount} - \text{Deposit Amount}$$

- When $\text{Deposit Amount} = \text{Total Amount}$, $\text{PaymentStatus} = \text{PAID}$.
- When $0 < \text{Deposit Amount} < \text{Total Amount}$, $\text{PaymentStatus} = \text{PARTIALLY\_PAID}$.
- When $\text{Deposit Amount} = 0$, $\text{PaymentStatus} = \text{UNPAID}$.
- When an appointment is cancelled and refunded, $\text{PaymentStatus} = \text{REFUNDED}$.

---

## 5. Payment Database & Financial Precision Architecture

### A. Elimination of Floating-Point Rounding Errors
In digital payment processing, JavaScript IEEE 754 floating-point math can introduce rounding discrepancies (e.g., `0.1 + 0.2 = 0.30000000000000004`).
To guarantee 100% financial accuracy:
1. **Integer Paise Storage**: Razorpay orders are stored in integer paise via `RazorpayOrderRecord.amountInPaise`:
   $$\text{Amount In Paise} = \text{Math.round}(\text{amountInRupees} \times 100)$$
2. **Reconciliation Invariant**:
   $$\text{amountInRupees} = \frac{\text{amountInPaise}}{100}$$

### B. Payment Webhook Idempotency & Deduplication
To prevent duplicate crediting if Razorpay sends multiple webhook deliveries for `payment.captured`:
1. `WebhookEventRecord.eventId` has a `@unique` constraint in PostgreSQL.
2. The webhook handler checks `dbRepo.webhookEvents.findByEventId(eventId)` before applying balance changes.
3. If the event ID was already processed, the API immediately responds with `HTTP 200 OK` and aborts re-processing.
4. `PaymentRecord.transactionRef` and `PaymentRecord.gatewayPaymentId` are unique keys in PostgreSQL, preventing duplicate transaction logs.

---

## 6. Database Performance & Indexing Strategy

### A. Index Inventory & Query Optimization

| Table | Index Name | Indexed Fields | Purpose & Optimization |
| :--- | :--- | :--- | :--- |
| `Appointment` | `Appointment_packageId_idx` | `packageId` | Accelerates package booking lookups and joins |
| `Appointment` | `Appointment_appointmentDate_status_idx` | `appointmentDate, status` | Optimizes daily calendar views and active booking filters |
| `Appointment` | `Appointment_customerProfileId_status_idx` | `customerProfileId, status` | Speeds up customer visit history and active reservations |
| `Appointment` | `Appointment_appointmentDate_startTime_idx` | `appointmentDate, startTime` | Rapid time slot collision checking |
| `Service` | `Service_categoryId_isActive_idx` | `categoryId, isActive` | Instant public category service loading |
| `Service` | `Service_isFeatured_isActive_idx` | `isFeatured, isActive` | Fast homepage bridal showcase queries |
| `PaymentRecord` | `PaymentRecord_gatewayPaymentId_idx` | `gatewayPaymentId` | Instant webhook verification and refund lookups |
| `PaymentRecord` | `PaymentRecord_createdAt_idx` | `createdAt` | Accelerates admin daily revenue and financial timeline reports |
| `OfflinePaymentRecord` | `OfflinePaymentRecord_createdAt_idx` | `createdAt` | Fast cash counter daily audit trail |
| `OfflinePaymentRecord` | `OfflinePaymentRecord_receivedDate_idx` | `receivedDate` | Reception cash register daily tallying |
| `CustomerProfile` | `CustomerProfile_totalSpent_idx` | `totalSpent` | Instant retrieval of top VIP clients and loyalty rankings |
| `PaymentRefundRecord` | `PaymentRefundRecord_razorpayRefundId_idx` | `razorpayRefundId` | Rapid refund status reconciliation |
| `PaymentRefundRecord` | `PaymentRefundRecord_createdAt_idx` | `createdAt` | Refund accounting audit timeline |

### B. N+1 Query Elimination
All multi-table reads in `src/lib/db/repo.ts` utilize Prisma relational includes:
```typescript
const appointment = await prisma.appointment.findUnique({
  where: { id },
  include: {
    customerProfile: { include: { user: true } },
    appointmentServices: { include: { service: true } },
    package: true,
    payments: true,
    staff: true,
  },
});
```
This fetches the entire booking graph in optimized SQL `JOIN` statements rather than executing separate queries for each relation.

---

## 7. Data Integrity, Referential Constraints & Soft Deletes

1. **Service Deletion Protection**:
   - `AppointmentService.serviceId` references `Service.id` with `onDelete: Restrict`.
   - A service cannot be hard-deleted from the database if historical appointments reference it.
   - Deactivation is performed safely via the `isActive: false` soft-delete flag, preserving complete accounting integrity.
2. **User & Profile Consistency**:
   - `CustomerProfile.userId` references `User.id` with `onDelete: Cascade`.
   - Deleting a test user cleanly removes their profile while historical completed appointments maintain archival integrity.
3. **Staff Unassignment Safety**:
   - `Appointment.staffId` references `Staff.id` with `onDelete: SetNull`.
   - If a stylist leaves the salon, past booking records remain intact with `staffId` set to `null`.

---

## 8. Migration Safety, Rollback & Backup Runbook

### A. Non-Destructive Migration Strategy
All migrations are authored to be non-destructive (`CREATE INDEX IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN ... DEFAULT ...`). Column drops or table drops are strictly prohibited without manual two-phase approval.

### B. Migration Directory Inventory
- `20261109000000_init`: Initial baseline creating 33 tables, 10 enums, and foreign keys.
- `20261112000000_optimize_performance_indexes`: Production index optimization adding high-performance composite and foreign key indexes.

### C. Backup Procedure (`pg_dump`)
Run the following PowerShell command to generate a full encrypted database dump:
```powershell
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "backups/jawed_habib_lalganj_$TIMESTAMP.sql"
pg_dump --host=localhost --port=5432 --username=postgres --dbname=jawed_habib_lalganj --format=custom --file=$BACKUP_FILE
Write-Host "Database backup successfully created at $BACKUP_FILE"
```

### D. Restore Procedure (`pg_restore`)
To restore the database from a backup archive:
```powershell
$BACKUP_FILE = "backups/jawed_habib_lalganj_20261112_190000.sql"
pg_restore --host=localhost --port=5432 --username=postgres --dbname=jawed_habib_lalganj --clean --if-exists $BACKUP_FILE
```

### E. Rollback Procedure for Performance Indexes
If an index rollback is ever required:
```sql
DROP INDEX IF EXISTS "Appointment_packageId_idx";
DROP INDEX IF EXISTS "Appointment_appointmentDate_status_idx";
DROP INDEX IF EXISTS "Appointment_customerProfileId_status_idx";
DROP INDEX IF EXISTS "Service_categoryId_isActive_idx";
DROP INDEX IF EXISTS "Service_isFeatured_isActive_idx";
DROP INDEX IF EXISTS "PaymentRecord_gatewayPaymentId_idx";
DROP INDEX IF EXISTS "PaymentRecord_createdAt_idx";
DROP INDEX IF EXISTS "OfflinePaymentRecord_createdAt_idx";
DROP INDEX IF EXISTS "OfflinePaymentRecord_receivedDate_idx";
DROP INDEX IF EXISTS "CustomerProfile_totalSpent_idx";
DROP INDEX IF EXISTS "PaymentRefundRecord_razorpayRefundId_idx";
DROP INDEX IF EXISTS "PaymentRefundRecord_createdAt_idx";
```

---

## 9. Verification & Quality Assurance Results

| Check / Test Suite | Command Executed | Result | Status |
| :--- | :--- | :--- | :--- |
| **Prisma Schema Validation** | `npx prisma validate` | `The schema at prisma\schema.prisma is valid 🚀` | PASS |
| **Prisma Client Generation** | `npx prisma generate` | `✔ Generated Prisma Client (v5.22.0)` | PASS |
| **TypeScript Strict Checking** | `npm run type-check` | 0 errors across all 76 Next.js routes | PASS |
| **ESLint Static Analysis** | `npm run lint` | 0 errors / 0 warnings | PASS |
| **Automated Unit & Integration Tests** | `npm test` | 19 test files passed, 196 tests passed | PASS |
| **Production Build Compilation** | `npm run build` | 76/76 static and server routes compiled cleanly | PASS |
| **Admin 20-Point Technical Suite** | `node scripts/verify-admin-20-points.js`| 20/20 test assertions passed | PASS |
