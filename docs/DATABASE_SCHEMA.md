# Database Schema Documentation: The Jawed Habib Salon – Lalganj

## 1. Overview & Architecture
The salon data platform runs on **PostgreSQL** with **Prisma ORM**.
It is fully normalized across 26 discrete entities to manage customer accounts, appointments, stylist schedules, service catalogs, inventory/memberships, loyalty programs, marketing offers, and operational audit trails.

Timezone for all business schedules and appointments: `Asia/Kolkata`.
Operating hours: Monday to Sunday, 10:00 AM – 10:00 PM (All 7 days).

---

## 2. All 26 Normalized Entities

| # | Entity Name | Table Description | Key Relations |
| :--- | :--- | :--- | :--- |
| 1 | `User` | Base authentication table for all platform users | `CustomerProfile?`, `Staff?`, `Role?`, `Notification[]`, `AuditLog[]` |
| 2 | `CustomerProfile` | Customer CRM, addresses, dates, loyalty points | `User`, `Appointment[]`, `Review[]`, `CustomerMembership[]`, `LoyaltyTransaction[]` |
| 3 | `Role` | System roles (SUPER_ADMIN, ADMIN, MANAGER, STAFF, CUSTOMER) | `User[]`, `Permission[]` |
| 4 | `Permission` | Granular permission slugs (e.g. `appointments:manage`) | `Role[]` |
| 5 | `ServiceCategory` | Taxonomy classification for services | `Service[]` |
| 6 | `Service` | Catalog items with durations, gender tags & prices | `ServiceCategory`, `StaffService[]`, `AppointmentService[]`, `Transformation[]` |
| 7 | `Staff` | Stylist profile, bio, specialties, ratings | `User`, `StaffService[]`, `Appointment[]`, `AvailabilityRule[]`, `BlockedSlot[]` |
| 8 | `StaffService` | Many-to-many junction mapping staff skills to services | `Staff`, `Service` |
| 9 | `Appointment` | Central appointment transaction record with double-booking check | `CustomerProfile`, `Staff?`, `AppointmentService[]`, `LoyaltyTransaction[]` |
| 10 | `AppointmentService`| Services included in a specific appointment basket | `Appointment`, `Service` |
| 11 | `AvailabilityRule` | Weekly working schedules per stylist (days 0-6, start/end) | `Staff?` |
| 12 | `BlockedSlot` | Temporary breaks, salon holidays, or stylist leave slots | `Staff?` |
| 13 | `Review` | Customer feedback & ratings (moderated with `isApproved`) | `CustomerProfile` |
| 14 | `GalleryImage` | Media gallery showcasing salon ambience & hairstyles | Standalone |
| 15 | `Transformation` | Interactive Before & After image comparison records | `Service?`, `Staff?` |
| 16 | `Offer` | Promotional campaigns, banners, and validity windows | Standalone |
| 17 | `Package` | Bundled salon treatments with bundled pricing | Standalone |
| 18 | `Enquiry` | Lead captures from website contact, bridal, or consultation | Standalone |
| 19 | `Coupon` | Discount promo codes with minimum order constraints | Standalone |
| 20 | `MembershipPlan` | VIP membership tiers (e.g. Habib Royal Privilege Club) | `CustomerMembership[]` |
| 21 | `CustomerMembership`| Active customer subscription to membership plans | `CustomerProfile`, `MembershipPlan` |
| 22 | `LoyaltyTransaction`| Points ledger (EARNED, REDEEMED, BONUS) | `CustomerProfile`, `Appointment?` |
| 23 | `GiftCard` | Redeemable digital salon vouchers | Standalone |
| 24 | `Notification` | In-app alerts for booking confirmations, reminders, promos | `User` |
| 25 | `SiteSetting` | Key-value store for business hours, phones, addresses | Standalone |
| 26 | `AuditLog` | Immutable event log of staff & administrative actions | `User?` |

---

## 3. Database Enums

```prisma
enum RoleType {
  SUPER_ADMIN
  ADMIN
  MANAGER
  STAFF
  CUSTOMER
}

enum GenderTarget {
  UNISEX
  FEMALE
  MALE
  KIDS
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  REJECTED
  NO_SHOW
}

enum PaymentStatus {
  UNPAID
  PARTIALLY_PAID
  PAID
  REFUNDED
}

enum BookingSource {
  ONLINE_WEBSITE
  PHONE_CALL
  WALK_IN
  WHATSAPP
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}

enum EnquiryStatus {
  NEW
  CONTACTED
  SCHEDULED
  RESOLVED
  SPAM
}

enum NotificationType {
  BOOKING
  REMINDER
  PROMOTION
  SYSTEM
}
```

---

## 4. Migration & Seeding
- Migrations are saved in: `prisma/migrations/20261109000000_init/migration.sql`.
- Seed script is configured in: `prisma/seed.ts` (executed via `npm run prisma:seed`).
- Pre-seeded data includes:
  - Super admin account (`7707000463`)
  - Certified master stylists (Vikram Sharma, Pooja Singh, Anjali Kumari)
  - 6 service categories & 11 core salon services
  - Indicative prices: Standard Haircut (₹299), Haircut with Hairwash (₹299-₹399), Global Hair Colour (₹2,499), Party Makeup (₹1,499-₹1,999)
  - Promotional coupons (`WELCOME100`, `GOLDGLOW20`)
  - Annual VIP club (`Habib Royal Privilege Club`)
