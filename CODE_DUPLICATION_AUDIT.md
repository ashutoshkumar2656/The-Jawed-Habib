# The Jawed Habib Salon – Lalganj: Code Duplication Audit Report

> **Document:** `CODE_DUPLICATION_AUDIT.md`  
> **Scope:** Phase 7 Code Duplication Audit  
> **Status:** **AUDITED & CONSOLIDATED**

---

## 1. Audit Methodology

Every directory under `src/` was analyzed for:
- Duplicated utility functions
- Redundant interface and type definitions
- Competing validation schemas
- Repeated database queries
- Duplicate formatting and date/time helpers
- Redundant frontend UI primitives

---

## 2. Findings & Consolidation

### 2.1 Currency & Number Formatting
- **Audit Findings:** Previously, currency symbols (`₹`) and rupee formatting were constructed inline in multiple UI components.
- **Consolidation:** Unified in `formatPrice(amount)` inside `src/lib/utils/cn.ts`. All service lists, package cards, cart summaries, and admin invoices now consume this single helper.

### 2.2 Phone Number Handling & Masking
- **Audit Findings:** Phone number regular expressions and display formatting existed in multiple forms.
- **Consolidation:**
  - `phoneRegex` (`/^[6-9]\d{9}$/`) is defined canonically in `src/lib/validation/schemas.ts`.
  - `formatPhone` is defined canonically in `src/lib/utils/cn.ts`.
  - `maskPhone` (for privacy compliance in logs) is defined in `src/lib/logging/logger.ts`.

### 2.3 Date & Time Scheduling Helpers
- **Audit Findings:** Slot calculations and 12h/24h time conversions were handled by `date-fns` alongside custom helper functions.
- **Consolidation:** Canonical normalization of time slots is maintained in `src/lib/validation/schemas.ts` and `src/lib/booking/calendar.ts`.

### 2.4 Navigation Breadcrumbs
- **Audit Findings:** Several public pages constructed custom chevron-separated breadcrumbs.
- **Consolidation:** Unified into `Breadcrumbs` primitive (`src/components/shared/breadcrumbs.tsx`), supporting schema.org breadcrumb markup and standardized gold hover transitions.

### 2.5 Image Comparison & Sliders
- **Audit Findings:** Before & After interactive comparison logic was consolidated into `BeforeAfterSlider` (`src/components/shared/before-after-slider.tsx`), eliminating duplicate touch/drag handlers.

### 2.6 Database Query Consolidation
- **Audit Findings:** Direct Prisma queries in API route handlers presented risk of inconsistent data shapes and fallback to mock data.
- **Consolidation:** All database operations are channeled through `dbRepo` (`src/lib/db/repo.ts`). In-memory mock fixtures on empty database results were eliminated.

---

## 3. Summary of Canonical Source Files

| Domain | Canonical File | Responsibilities |
| :--- | :--- | :--- |
| **Validation Schemas** | `src/lib/validation/schemas.ts` | Zod schemas for auth, booking, services, packages, and admin actions |
| **Brand Facts & Constants** | `src/lib/constants/brand.ts` | Official salon address, phone numbers, hours, social links |
| **Database Operations** | `src/lib/db/repo.ts` | Authoritative PostgreSQL query repository |
| **Authentication & Sessions** | `src/lib/auth/session.ts` & `jwt.ts` | Cookie parsing, JWT verification, server session lookup |
| **Payment & Security** | `src/lib/payments/razorpay.ts` & `encryption.ts` | Razorpay API integration, AES-256-GCM encryption, HMAC verification |
| **Core UI Primitives** | `src/components/ui/*` & `shared/*` | Buttons, badges, inputs, modals, breadcrumbs, sliders, empty states |
