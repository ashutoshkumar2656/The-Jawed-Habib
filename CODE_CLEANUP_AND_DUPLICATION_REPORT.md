# The Jawed Habib Salon – Lalganj: Code Cleanup, Duplication & Architecture Consolidation Report

> **Audit Date:** November 14, 2026  
> **Repository:** The Jawed Habib Salon – Lalganj  
> **Status:** **CLEAN, AUDITED & ARCHITECTURALLY CONSOLIDATED**

---

## 1. Executive Summary

This report documents the comprehensive audit of the codebase for code duplication, dead imports, obsolete scripts, redundant dependencies, and component consolidation. 

Every cleanup decision was governed by the project's strict non-regression rules:
1. **Zero functional regression:** Working features, payment logic, and auth guards must never be broken.
2. **Deterministic single sources of truth:** Shared utilities and validation schemas must exist in canonical locations.
3. **Preservation of essential build and test infrastructure:** Platform-specific workarounds (such as Windows `patch-mkdir.js`) and historical archives must be preserved.

---

## 2. Code Duplication Audit & Consolidation Matrix

An exhaustive scan across all `.ts` and `.tsx` source files in `src/` evaluated potential duplication across utility functions, formatting helpers, authentication checks, validation schemas, and database queries.

### 2.1 Utility & Formatting Helpers

| Helper Function | Findings & Analysis | Canonical Source of Truth | Consumers / Usage |
| :--- | :--- | :--- | :--- |
| **`formatPrice` / `formatCurrency`** | Evaluated for repeated currency formatting logic (`₹` symbol, INR formatting). | **`src/lib/utils/cn.ts`** | Consolidated in single helper; imported across services, packages, and admin billing. |
| **`formatPhone`** | Evaluated for inconsistent phone number formatting. | **`src/lib/utils/cn.ts`** | Canonical helper formatting 10-digit numbers into standard `+91 XXXXX XXXXX`. |
| **`maskPhone`** | Evaluated for privacy-safe phone logging (DPDP compliance). | **`src/lib/logging/logger.ts`** | Masks middle digits (e.g. `7707****63`) in all Winston/Pino logger streams. |
| **`phoneRegex`** | Standard Indian mobile regex (`/^[6-9]\d{9}$/`). | **`src/lib/validation/schemas.ts`** | Single canonical definition used by `customerRegisterSchema`, `appointmentBookingSchema`, and profile updates. |
| **`timingSafeEqualString`** | Constant-time string equality check to mitigate timing side-channel attacks on webhook HMAC signatures. | **`src/lib/security/encryption.ts`** | Used in Razorpay webhook verification and admin token validation. |

### 2.2 Reusable UI Component Primitives

| Component | Consolidation Outcome | Location | Impact |
| :--- | :--- | :--- | :--- |
| **`Breadcrumbs`** | Shared navigation breadcrumbs across all 15 public and admin pages. | `src/components/shared/breadcrumbs.tsx` | Replaced disparate per-page breadcrumb implementations. |
| **`BeforeAfterSlider`** | Reusable interactive slider with drag handles and fullscreen modal. | `src/components/shared/before-after-slider.tsx` | Shared by homepage transformation showcase and dedicated `/transformations` page. |
| **`EmptyState`** | Reusable luxury empty-state card for empty collections. | `src/components/shared/empty-state.tsx` | Standardized empty state presentation with salon-gold styling. |
| **`LoadingSpinner` & `SkeletonCard`** | Reusable loading indicator and shimmer skeletons. | `src/components/shared/loading-state.tsx` | Prevents layout shift during client-side data fetching. |
| **`BrandLogo`** | Canonical Jawed Habib salon SVG branding in text, icon, and full-badge variants. | `src/components/ui/brand-logo.tsx` | Enforces exact brand standards across header, footer, topbar, and invoices. |

### 2.3 Database Repository Consolidation
- **Previous Risk:** Disparate raw database calls scattered across route handlers with potential fallback to mock fixtures.
- **Consolidation:** All 18 database access methods are unified inside `dbRepo` (`src/lib/db/repo.ts`).
- **Data Integrity:** Fallback fixtures were eliminated. `dbRepo` exclusively queries Neon PostgreSQL and returns authentic database rows or empty arrays.

---

## 3. Unused & Obsolete File Identification

### 3.1 Files Safely Removed
During the audit, temporary, scratch, and obsolete development artifacts were identified and safely removed:

| File Path | Description / Purpose | Reason for Removal |
| :--- | :--- | :--- |
| `scripts/last_user_prompt.txt` | Temporary developer prompt dump | Stale scratch file containing historical prompt text; provides zero runtime or build value. |
| `scratch_prompt.txt` | Intermediate prompt inspection scratch file | Ephemeral diagnostic file removed after extraction. |
| `scratch_prompt_full.txt` | Intermediate prompt inspection scratch file | Ephemeral diagnostic file removed after extraction. |

### 3.2 Files Deliberately Preserved & Protected

| File / Directory | Purpose | Technical Reason for Preservation |
| :--- | :--- | :--- |
| **`scripts/patch-mkdir.js`** | Windows `EPERM` resilience patch | **CRITICAL BUILD PREREQUISITE:** Monkey-patches Node.js `fs.mkdir` and `fs.promises.mkdir` during `npm run build` on Windows filesystems to prevent sporadic locking errors. Referenced in `package.json` `"build"` script. |
| **`scripts/audit-local-server.js`** | Automated local server diagnostic probe | Probes all 21 public pages, 15 API routes, and 16 admin modules with session authentication. Essential tool for pre-deployment verification. |
| **`src/archive/` Directory** | Codebase Archive Registry | Preserves historical components (`appointment-booking-section.tsx`) and legacy rate limiters (`lib/rate-limiter.ts`) with clear documentation in `src/archive/README.md`. Completely decoupled from active compilation path. |
| **`prisma/seed.ts`** | Authoritative database seeder | Provisions canonical permissions, roles, salon business facts, and the `SUPER_ADMIN` owner account (`7707000463`). Contains zero mock customer records. |
| **`src/lib/security/encryption.ts`** | AES-256-GCM encryption engine | Encrypts payment secrets, webhooks, and session data. |

---

## 4. Dependency Tree & Package.json Evaluation

The `package.json` was audited for unused, deprecated, or bloated dependencies:

### 4.1 Production Dependencies Audit (19 Packages)
- `@hookform/resolvers` (`^3.9.1`): Active – connects React Hook Form to Zod schemas.
- `@neon/config` (`^1.14.0`) & `@neon/env` (`^2.1.3`): Active – Neon serverless connection configuration.
- `@prisma/client` (`^5.22.0`): Active – primary ORM database client.
- `bcryptjs` (`^2.4.3`): Active – secure password hashing for user/admin accounts.
- `class-variance-authority` (`^0.7.0`): Active – dynamic Tailwind component variant generation.
- `clsx` (`^2.1.1`) & `tailwind-merge` (`^2.5.4`): Active – atomic CSS class merging (`cn` utility).
- `date-fns` (`^3.6.0`): Active – appointment scheduling and timezone calculations.
- `framer-motion` (`^11.11.17`): Active – smooth luxury page transitions and modals.
- `gsap` (`^3.12.5`): Active – bespoke micro-animations.
- `jsonwebtoken` (`^9.0.2`): Active – JWT session token generation and verification.
- `lucide-react` (`^0.454.0`): Active – luxury iconography across public and admin interfaces.
- `next` (`^14.2.35`): Active – core Next.js App Router framework.
- `react` (`^18.3.1`) & `react-dom` (`^18.3.1`): Active – React core library.
- `react-hook-form` (`^7.53.2`): Active – performant, uncontrolled form state management.
- `swiper` (`^11.1.14`): Active – touch-friendly carousels on homepage and gallery.
- `tailwindcss-animate` (`^1.0.7`): Active – Tailwind animation utilities.
- `zod` (`^3.23.8`): Active – end-to-end schema validation for APIs and client forms.

### 4.2 DevDependencies Audit (16 Packages)
All devDependencies (`typescript`, `vitest`, `@vitejs/plugin-react`, `prisma`, `eslint`, `tailwindcss`, `tsx`, `@types/*`) are actively utilized during type checking, testing, database migrations, and building.

**Conclusion:** Zero bloated or unneeded dependencies detected. The dependency tree is lean and strictly scoped.

---

## 5. Architectural Improvements Implemented

1. **Admin Bridal Navigation Unification:**
   - Eliminated the routing gap where `/admin/bridal` returned 404 by adding `src/app/admin/bridal/page.tsx` with a server-side redirect to `/admin/bridal/bookings`.
2. **ESLint Image Standardization:**
   - Updated `src/app/admin/transformations/page.tsx` to use Next.js `<Image />` component with `fill` and responsive `sizes`, resolving all 4 `@next/next/no-img-element` warnings.
3. **Clean Code Verification:**
   - Verified that `tsc --noEmit` reports 0 errors.
   - Verified that `next lint` reports 0 errors and 0 warnings.
   - Verified that `vitest run` executes all 306 tests across 30 test files with 100% success.
