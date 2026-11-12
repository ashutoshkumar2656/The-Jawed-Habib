# Project Technical Overview: The Jawed Habib Salon – Lalganj

> **Document Status**: Production Verified  
> **Last Technical Audit**: November 2026  
> **Platform Name**: The Jawed Habib Salon – Lalganj Digital Platform & Management System  
> **Business Ground Truth**: 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
> **Operating Hours**: Monday – Sunday: 10:00 AM – 10:00 PM (All 7 Days)  
> **Verified Contact**: +91 7707000463 · +91 9831722983 · +91 9580000175 | WhatsApp: +91 7707000463  
> **Developer Attribution**: Designed & Developed by [Axivon Technologies](https://axivontech.in)

---

## 1. Executive Summary & Purpose

The digital platform for **The Jawed Habib Salon – Lalganj** is an enterprise-grade web application engineered to deliver two complementary capabilities:
1. **A Luxury Public-Facing Bridal & Salon Experience**: An editorial digital storefront showcasing bridal transformations, personalized hair and beauty consultations, dynamic package selections, interactive before/after sliders, real salon photography, and a frictionless 4-step dynamic booking journey.
2. **An Autonomous Salon Operations & Content Management System (Admin Panel)**: A high-performance SaaS control center organized into 10 consolidated operational modules allowing salon administrators to manage appointments, bridal packages, stylist allocations, customer styling history, counter balance collections, calendar slot concurrency, website CMS content, media assets, and analytics exports.

---

## 2. Technology Stack Snapshot

```mermaid
flowchart TD
    subgraph Client Layer
        A1["Next.js 14.2.20 App Router"]
        A2["React 18.3.1 (Server & Client Components)"]
        A3["Tailwind CSS 3.4.15 (Luxury Theme Tokens)"]
        A4["Framer Motion 11.11.17 & Swiper 11.1.14"]
        A5["Lucide React 0.454.0"]
    end

    subgraph Server & API Layer
        B1["Next.js Route Handlers (Node.js Runtime)"]
        B2["Zod 3.23.8 Validation Layer"]
        B3["JWT Session & RBAC Auth Engine"]
        B4["Bcrypt.js 2.4.3 Password Hashing"]
        B5["AES-256-GCM Credential Encryption"]
        B6["In-Memory Sliding Window Rate Limiting"]
    end

    subgraph Dual-Tier Data Layer
        C1{"Prisma Connection Guard (canUsePrisma)"}
        C2["Tier 1: Prisma ORM 5.22.0 + PostgreSQL"]
        C3["Tier 2: In-Memory Seeded Repository (memoryDb)"]
    end

    subgraph External Integrations
        D1["Razorpay REST API (Order, Verify, Webhook)"]
        D2["Cloudinary API (Media Assets)"]
        D3["Axivon Technologies Attribution"]
    end

    Client Layer --> Server & API Layer
    Server & API Layer --> Dual-Tier Data Layer
    C1 -- "PostgreSQL Available" --> C2
    C1 -- "PostgreSQL Offline" --> C3
    Server & API Layer --> External Integrations
```

| Technology Area | Selected Tool / Library | Version | Core Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `14.2.20` | Server-side rendering (SSR), static site generation (SSG), Route Handlers, Edge middleware. |
| **Language** | TypeScript | `5.6.3` | Strict type safety (`"strict": true`, `"noEmit": true`), interfaces across props, payloads, and models. |
| **UI Library** | React / React DOM | `18.3.1` | Component-driven user interface with concurrent features and Server Component boundaries. |
| **Styling** | Tailwind CSS | `3.4.15` | Utility-first CSS extended with custom gold, red, and rich black salon design tokens. |
| **Animation** | Framer Motion & GSAP | `11.11.17` / `3.12.5` | Smooth page transitions, modal overlays, before/after image sliders, and luxury ambient glows. |
| **Carousels** | Swiper | `11.1.14` | High-touch mobile and desktop carousel sliders for bridal transformation portfolios. |
| **Iconography** | Lucide React | `0.454.0` | Accessible, tree-shakeable SVG icons for luxury salon interfaces and admin controls. |
| **Form Handling** | React Hook Form | `7.53.2` | High-performance uncontrolled form handling with minimal re-renders. |
| **Validation** | Zod | `3.23.8` | Declarative schema validation for client forms and authoritative server-side request payloads. |
| **ORM** | Prisma ORM | `5.22.0` | Type-safe database queries, migrations, relationships, and schema definitions. |
| **Primary Database** | PostgreSQL | `v14+ / 16` | Relational persistence for users, bookings, payments, packages, and calendar slots. |
| **Fallback Database** | High-Fidelity `memoryDb` | Built-in | Zero-downtime in-memory repository seeded with full salon data for local dev & offline testing. |
| **Payment Gateway** | Razorpay REST API | v1 API | Server-side order creation, HMAC-SHA256 signature verification, and webhook deduplication. |
| **Cryptography** | Node.js Crypto | Built-in | AES-256-GCM encryption for Razorpay keys; constant-time comparison for signatures. |
| **Testing** | Vitest | `2.1.4` | High-speed unit and integration testing running 19 test suites and 196 verified tests. |

---

## 3. High-Level Architectural Flow

### A. Customer Booking & Payment Journey
1. **Service Selection**: Customer browses bridal packages and salon services on `/booking` or `/packages`. Services are dynamically fetched via `/api/services` and `/api/bridal/services`.
2. **Slot Selection & Hold**: Customer chooses a date and time slot. System verifies slot occupancy via `/api/appointments/availability` and reserves a temporary 10-minute hold token via `/api/appointments/hold`.
3. **Appointment Creation**: Customer submits contact info. Server validates payload with `appointmentBookingSchema`, calculates subtotal, discounts, and required advance deposit, and records the booking with status `PENDING_PAYMENT`.
4. **Razorpay Checkout**: Backend creates an authoritative order via `/api/payments/create-order` with precise paise conversion. Customer completes payment via Razorpay Standard Checkout modal.
5. **Signature Verification & Confirmation**: Client transmits `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to `/api/payments/verify`. Backend verifies the HMAC-SHA256 signature, updates booking to `CONFIRMED` or `PARTIALLY_PAID`, and issues an instant receipt via `/api/payments/receipt/[id]`.

### B. Administrative Salon Operations
1. **Secured Login**: Administrators authenticate at `/admin/login`. Passwords are verified via `bcrypt` against database hashes. A secure, HTTP-only session cookie (`habib_session_token`) is issued with 7-day or 30-day (Remember Me) lifetime.
2. **Unified Navigation Hub**: Administrators navigate across 10 consolidated modules ([`admin-sidebar.tsx`](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/src/components/layout/admin-sidebar.tsx)) with instant sub-50ms tab switching and responsive mobile drawer navigation.
3. **Counter Payments**: Front-desk managers record remaining balance payments received in cash or UPI at the salon counter via `/api/bridal/payments/collect-remaining`, transitioning appointments to `COMPLETED` and `PAID`.
4. **Schedule & Slot Management**: Working hours (10:00 AM – 10:00 PM across all 7 days) and slot intervals (30 minutes) are managed through `/admin/calendar` via `/api/admin/calendar-settings`.

---

## 4. Repository & Workspace Conventions

- **Application Code**: Located under `src/app/` using Next.js App Router conventions:
  - `(public)/*`: Public-facing storefront pages sharing the universal luxury layout, header, and Axivon-branded footer.
  - `(auth)/*`: Client authentication portal (`/login`, `/register`, `/forgot-password`).
  - `admin/*`: Executive salon management dashboard with collapsible sidebar and topbar breadcrumbs.
  - `api/*`: 93 server-side REST route handlers.
- **Shared Primitives**: Located under `src/components/ui/` and `src/components/shared/`.
- **Authoritative Business Constants**: Centralized under `src/lib/constants/brand.ts` (`BRAND_CONFIG`).
- **Database Schema & Migrations**: Defined in `prisma/schema.prisma` with initial migration under `prisma/migrations/20261109000000_init/`.
- **Regression Verification**: Located under `src/__tests__/` and automated scripts under `scripts/`.
