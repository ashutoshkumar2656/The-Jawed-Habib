# NEW_REQUIREMENTS_AUDIT_REPORT.md
## Comprehensive Codebase Audit & Architectural Migration Plan
### Project: The Jawed Habib Salon – Lalganj, Bihar
### Benchmark & Inspiration: https://jawedhabibkurji.com/

---

## 1. Executive Summary & Context

The client has updated the strategic project requirements. The previously planned multi-tier SaaS salon management platform (containing complex customer account portals, membership subscriptions, loyalty reward ledgers, gift card issuance, and multi-step customer portals) has been superseded.

The client now requires a **premium, high-converting, visually attractive salon showcase and booking platform** modeled after the reference website **https://jawedhabibkurji.com/** (Jawed Habib Luxury Bridal Studio & Salon, Kurji, Patna).

### Key Architectural Shifts:
1. **From Complex Portal to Frictionless Experience**: Replace customer login walls, loyalty balances, and membership tiers with direct, effortless appointment booking and WhatsApp consultation.
2. **High-Impact Visual Content**: Emphasize photo portfolios, video reels, salon interior ambience, bridal packages, and premium brand partnerships (L'Oréal, MAC, Charlotte Tilbury, Kryolan, Kerastase, Schwarzkopf).
3. **Streamlined Admin CMS**: Reorient the administrative portal to manage the website's live content (Appointments, Booking Calendar, Customer Enquiries, Services, Packages, Gallery Photos, Transformation Sliders, Video Reels, Customer Reviews, Active Offers, Premium Brands, FAQs, Contact Details, and Website CMS).

---

## 2. Comprehensive Codebase Audit by Subsystem

### 2.1 Frontend Architecture
- **Current Stack**: Next.js 14 App Router, TypeScript (strict mode), Tailwind CSS, Lucide React, Framer Motion, and custom UI primitives.
- **Design System**: Luxury Black (`#111111`), Rich Black (`#0B0B0B`), Champagne Gold (`#C6A56B`), Light Gold (`#DFCA9E`), Ivory (`#F7F4EE`), White (`#FFFFFF`).
- **Audit Findings**: The frontend stack and luxury design tokens are robust and align with the visual standard of `jawedhabibkurji.com`. The architectural bloat exists exclusively in the customer portal (`(customer)`) and irrelevant marketing retention modules.

### 2.2 Public Website Pages
- **Current Routes**: `/`, `/about`, `/services`, `/pricing`, `/transformations`, `/gallery`, `/team`, `/stylists`, `/offers`, `/packages`, `/consultation`, `/contact`, `/booking`, `/faq`, `/privacy`, `/terms`.
- **Audit Findings**:
  - The Homepage needs restructuring to present the 20 required sections inspired by `jawedhabibkurji.com`.
  - Inner pages provide strong SEO and detailed service breakdowns, but must be aligned with the new video, brand showcase, and WhatsApp consultation features.
  - The header currently displays a "Client Sign In" button that pushes clients into an unnecessary customer login flow.

### 2.3 Existing Components
- **Reusable Primitives**: `SectionHeader`, `Button`, `Badge`, `Card`, `Input`, `Modal`, `Toast`, `Breadcrumbs`, `LightboxModal`, `BeforeAfterSlider`, `EmptyState`, `LoadingState`, `FloatingContact`.
- **Audit Findings**: All reusable UI components are high-quality, typed, and fully reusable. New components needed: `VideoGallery`, `BrandShowcase`, `AvailabilityCalendarWidget`, `WhatsAppConsultationBanner`, `HowItWorksSteps`, and `InteriorGalleryGrid`.

### 2.4 Admin & CRM Dashboard
- **Current Routes**: `/admin/dashboard`, `/admin/appointments`, `/admin/customers`, `/admin/services`, `/admin/staff`, `/admin/packages`, `/admin/offers`, `/admin/coupons`, `/admin/reviews`, `/admin/enquiries`, `/admin/transformations`, `/admin/gallery`, `/admin/loyalty`, `/admin/memberships`, `/admin/gift-cards`, `/admin/content`, `/admin/analytics`, `/admin/users`, `/admin/settings`.
- **Audit Findings**:
  - `/admin/memberships`, `/admin/loyalty`, and `/admin/gift-cards` represent unnecessary bloat that distracts from core salon operations.
  - Admin needs dedicated modules for managing Videos (`/admin/videos`), Featured Cosmetic Brands (`/admin/brands`), and FAQs (`/admin/faqs`).
  - Appointment and enquiry management are already functional and must be preserved.

### 2.5 Customer Account & Dashboard Portal (`(customer)`)
- **Current Routes**: `/account`, `/bookings`, `/profile`.
- **Audit Findings**:
  - High friction for local salon clients in Lalganj who simply want to inspect services, view transformations, and book a chair or reach out via WhatsApp.
  - Classified for **REMOVE**: Safely decommission customer dashboard routes and redirect legacy bookmarks to `/booking`.

### 2.6 Backend APIs
- **Core Functional APIs (KEEP)**:
  - `/api/appointments` & `/api/appointments/availability`
  - `/api/services` & `/api/categories`
  - `/api/packages` & `/api/offers`
  - `/api/reviews` & `/api/enquiries`
  - `/api/staff` & `/api/coupons/validate`
  - `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` (Admin & Staff)
  - Admin CRUD handlers for all core models.
- **Bloat APIs (REMOVE)**:
  - `/api/customer/loyalty`
  - `/api/customer/appointments`
  - `/api/customer/profile`
  - `/api/admin/memberships`
  - `/api/admin/loyalty`
  - `/api/admin/gift-cards`
- **New APIs (CREATE)**:
  - `/api/videos` & `/api/admin/videos`
  - `/api/brands` & `/api/admin/brands`
  - `/api/faqs` & `/api/admin/faqs`

### 2.7 Database Schema & Relationships (Prisma)
- **Current Models (26)**:
  - `User`, `CustomerProfile`, `Role`, `Permission`, `ServiceCategory`, `Service`, `Staff`, `StaffService`, `Appointment`, `AppointmentService`, `AvailabilityRule`, `BlockedSlot`, `Review`, `GalleryImage`, `Transformation`, `Offer`, `Package`, `Enquiry`, `Coupon`, `MembershipPlan`, `CustomerMembership`, `LoyaltyTransaction`, `GiftCard`, `Notification`, `SiteSetting`, `AuditLog`.
- **Audit Findings**:
  - Models to **REMOVE**: `MembershipPlan`, `CustomerMembership`, `LoyaltyTransaction`, `GiftCard`.
  - Models to **MODIFY**:
    - `CustomerProfile`: Remove `loyaltyPoints` field and `memberships`/`loyaltyTransactions` relations. Retain customer contact info, address, notes, visit count, spend, and appointment relations.
    - `Appointment`: Remove `loyaltyTransactions` relation.
  - Models to **CREATE**:
    - `Video`: `id`, `title`, `description`, `videoUrl`, `thumbnailUrl`, `category`, `isFeatured`, `sortOrder`, `createdAt`.
    - `Brand`: `id`, `name`, `logoUrl`, `category`, `description`, `isFeatured`, `sortOrder`, `createdAt`.
    - `Faq`: `id`, `question`, `answer`, `category`, `sortOrder`, `isActive`, `createdAt`.

### 2.8 Authentication & Authorization
- **Admin/Staff Auth (KEEP)**: JWT session in httpOnly cookie (`jh_auth_token`), role-based protection (Super Admin, Admin, Manager, Staff), password hashing via bcrypt.
- **Customer Auth (DE-EMPHASIZE/REMOVE)**: Eliminate customer login walls. Appointments can be placed directly by supplying name and phone, with auto-linking to `CustomerProfile` records.

---

## 3. Comprehensive Feature Classification

| Feature / Module | Status | Rationale |
| :--- | :--- | :--- |
| **Brand Ground Truth Facts & Constants** | **KEEP** | Non-negotiable identity for Lalganj branch. |
| **Design System & Luxury Tokens** | **KEEP** | Luxury Black, Champagne Gold, Cormorant/Playfair typography. |
| **Appointment Booking Engine** | **KEEP** | Direct booking engine without login requirement. |
| **Admin Authentication & RBAC** | **KEEP** | Essential for salon owner and front desk receptionists. |
| **Admin Operations Dashboard** | **KEEP** | Live metrics on appointments, inquiries, and revenue. |
| **Service Catalog & Pricing** | **KEEP** | Full categorized menu with verified indicative pricing. |
| **Before/After Transformations Slider**| **KEEP** | Core visual proof for haircuts, color, and bridal work. |
| **Photo Portfolio / Lightbox** | **KEEP** | High-resolution salon and styling gallery. |
| **Contact, Maps & Enquiries** | **KEEP** | 3 phone numbers, Lalganj physical address, and callback forms. |
| **Homepage Layout (16 Sections)** | **MODIFY** | Upgrade to the 20 sections inspired by `jawedhabibkurji.com`. |
| **Desktop Header Navigation** | **MODIFY** | Remove "Client Sign In"; add direct WhatsApp Consultation CTA. |
| **Admin Sidebar Navigation** | **MODIFY** | Remove Loyalty/Memberships/GiftCards; add Videos, Brands, FAQs. |
| **Customer Profile Entity** | **MODIFY** | Retain contact and appointment history; drop loyalty points overhead. |
| **Customer Account Portal (`/account`)** | **REMOVE** | Unnecessary friction; redirect to direct booking. |
| **Customer Bookings Portal (`/bookings`)**| **REMOVE** | Decommission customer self-service dashboard. |
| **Customer Profile Portal (`/profile`)** | **REMOVE** | Decommission customer preference editor. |
| **Membership Management (`/admin/memberships`)** | **REMOVE** | Unnecessary subscription complexity. |
| **Loyalty Reward Ledger (`/admin/loyalty`)** | **REMOVE** | Unnecessary points economy. |
| **Gift Card Issuance (`/admin/gift-cards`)** | **REMOVE** | Unnecessary digital voucher ledger. |
| **Video Gallery Showcase** | **CREATE** | Instagram reels / makeover videos showcase. |
| **Premium Cosmetic Brands** | **CREATE** | L'Oréal, MAC, Charlotte Tilbury, Kryolan, Kerastase, Schwarzkopf. |
| **Salon Interior Ambience Gallery** | **CREATE** | Highlighting chairs, styling stations, wash lounge, VIP room. |
| **Appointment Availability Calendar** | **CREATE** | Interactive slot availability visual widget. |
| **WhatsApp Direct Consultation** | **CREATE** | 1-click consultation with pre-filled bridal/hair enquiry. |
| **How It Works 3-Step Guide** | **CREATE** | Simple 1-2-3 guide for salon guests. |
| **Dynamic FAQs Module** | **CREATE** | Common questions on patch tests, bridal trials, and booking. |

---

## 4. Safe Decommissioning & Migration Plan

1. **Step 1: Backup & Safety Check**: Verify existing appointment and customer data structures are unaffected by removing the loyalty/membership tables.
2. **Step 2: Remove Unnecessary Routes & APIs**:
   - Delete `src/app/(customer)` directory.
   - Delete `src/app/admin/memberships`, `src/app/admin/loyalty`, `src/app/admin/gift-cards`.
   - Delete `src/app/api/customer/loyalty`, `src/app/api/customer/appointments`, `src/app/api/customer/profile`.
   - Delete `src/app/api/admin/memberships`, `src/app/api/admin/loyalty`, `src/app/api/admin/gift-cards`.
3. **Step 3: Update Database Schema & Repository**:
   - Update `prisma/schema.prisma` to remove `MembershipPlan`, `CustomerMembership`, `LoyaltyTransaction`, `GiftCard`.
   - Add `Video`, `Brand`, and `Faq` models.
   - Clean up `src/lib/db/repo.ts` to remove loyalty/membership methods and add `getVideos()`, `getBrands()`, `getFaqs()` methods.
4. **Step 4: Update Admin Sidebar & Site Configuration**:
   - Clean up `src/components/layout/admin-sidebar.tsx` and `src/config/site.ts`.
5. **Step 5: Adjust Test Suites**:
   - Update `admin.test.ts`, `admin-persistence-audit.test.ts`, `auth.test.ts`, and `dashboard.test.ts` to align with the streamlined schema.
6. **Step 6: Build & Test Verification**:
   - Run `npm run type-check`, `npm run lint`, `npm test`, and `npm run build`.
