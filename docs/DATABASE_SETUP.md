# Database Setup & Maintenance Guide: The Jawed Habib Salon – Lalganj

**Database Engine**: PostgreSQL 14+ / 16  
**ORM**: Prisma ORM (`@prisma/client` ^5.22.0)  
**Location**: `prisma/schema.prisma`  

---

## 1. Overview of Database Entities

The database schema models the entire enterprise operations of the salon across 26 normalized tables:

| Entity | Table Name | Purpose |
| :--- | :--- | :--- |
| `User` | `users` | All authentication accounts (customers, staff, and administrators) |
| `CustomerProfile` | `customer_profiles` | Client CRM metrics, addresses, loyalty balance, and preferences |
| `Role` / `UserRole` | `roles`, `user_roles` | Granular Role-Based Access Control (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER`) |
| `ServiceCategory` | `service_categories` | Haircuts, chemical styling, facials, bridal makeup, grooming |
| `Service` | `services` | Individual treatments, duration, starting price, and active flags |
| `Staff` | `staff` | Certified stylist directory, ratings, designations, and availability |
| `Appointment` | `appointments` | Booked client chair reservations, date/time slots, and statuses |
| `AppointmentService` | `appointment_services` | Line-item join table between appointments and selected services |
| `BlockedSlot` | `blocked_slots` | Maintenance or VIP blackout booking slots |
| `Review` | `reviews` | Customer ratings, reviews, and homepage moderation flags |
| `GalleryImage` | `gallery_images` | Interior and styling station media assets |
| `Transformation` | `transformations` | Before & After makeover split comparison records |
| `Offer` | `offers` | Seasonal marketing promotional campaigns |
| `Package` | `packages` | Bundled combo packages with calculated customer savings |
| `Coupon` | `coupons` | Promo codes, minimum order value, and discount limits |
| `MembershipPlan` | `membership_plans` | VIP Silver, Gold, Platinum annual plans |
| `CustomerMembership` | `customer_memberships`| Active subscriber memberships |
| `LoyaltyTransaction` | `loyalty_transactions`| Reward points ledger (earned, redeemed, adjusted) |
| `GiftCard` | `gift_cards` | Prepaid gift vouchers with active remaining balance |
| `Enquiry` | `enquiries` | Customer contact and consultation inbound inquiries |
| `SiteSetting` | `site_settings` | Operational policies, GST rates, and announcement bar CMS |
| `AuditLog` | `audit_logs` | Immutable audit trail for administrative adjustments |

---

## 2. Local Database Initialization

### 1. Start Local PostgreSQL Service
Ensure PostgreSQL is running locally on port 5432:
```bash
# Check postgres status
pg_isready -h localhost -p 5432
```

### 2. Create the Database
```sql
CREATE DATABASE jawed_habib_lalganj;
CREATE USER salon_admin WITH ENCRYPTED PASSWORD 'salon_secure_password';
GRANT ALL PRIVILEGES ON DATABASE jawed_habib_lalganj TO salon_admin;
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Migrations
```bash
npx prisma migrate dev --name init_salon_schema
```

### 5. Seed Database with Initial Services & Admin Account
```bash
npm run prisma:seed
```

---

## 3. Remote Serverless Database (Neon Tech) Setup

1. In your Neon dashboard, copy your direct connection string and connection pooling string.
2. In `.env`:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.ap-south-1.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://[user]:[password]@[endpoint].ap-south-1.aws.neon.tech/neondb?sslmode=require"
   ```
3. Deploy migrations to Neon:
   ```bash
   npx prisma migrate deploy
   ```
4. Populate initial data:
   ```bash
   npm run prisma:seed
   ```

---

## 4. In-Memory Resilient Repository Fallback

The application features a production-grade dual-mode repository (`src/lib/db/repo.ts`). If a live PostgreSQL database is temporarily disconnected or undergoing scheduled maintenance, the repository automatically falls back to its in-memory seed store. This ensures:
- Zero crashes on local demonstration machines.
- Instant availability for automated testing and CI/CD without requiring live database network access.
- Seamless hydration when connecting to a remote PostgreSQL instance.

---

## 5. Automated Backup & Disaster Recovery Recommendations

1. **Daily Automated Snapshots**:
   - If using Neon, automated daily point-in-time recovery (PITR) is enabled by default.
   - For standard PostgreSQL on VPS/AWS RDS:
     ```bash
     # Daily automated dump script
     pg_dump -h localhost -U salon_admin -d jawed_habib_lalganj -F c -b -v -f "/backups/jawed_habib_$(date +\%Y\%m\%d).dump"
     ```
2. **Offsite Storage**: Synchronize dumps to AWS S3 or Cloudflare R2 bucket with 30-day retention.
3. **Restoration Command**:
   ```bash
   pg_restore -h localhost -U salon_admin -d jawed_habib_lalganj -v "/backups/jawed_habib_20261109.dump"
   ```
