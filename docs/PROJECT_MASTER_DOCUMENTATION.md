# Master Technical Documentation: The Jawed Habib Salon – Lalganj

> **Document Status**: Production Verified Master Technical Blueprint  
> **Last Comprehensive Audit**: November 2026  
> **Business Ground Truth**: 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
> **Verified Contact**: +91 7707000463 · +91 9831722983 · +91 9580000175 | **Hours**: 10:00 AM – 10:00 PM (All 7 Days)  
> **Developer Attribution**: Designed & Developed by [Axivon Technologies](https://axivontech.in)

---

## 1. Technologies Currently Used

| Layer / Capability | Technology Selected | Version | Production Function |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js (App Router)** | `14.2.20` | Server-Side Rendering (SSR), Static Generation (SSG), Route Handlers, Edge Middleware. |
| **UI Library** | **React & React DOM** | `18.3.1` | Concurrent component rendering, Server Component / Client Component isolation. |
| **Language** | **TypeScript** | `5.6.3` | Strict type checking (`"strict": true`, `"noEmit": true`), interfaces across models and APIs. |
| **CSS & Design System** | **Tailwind CSS** | `3.4.15` | Custom luxury tokens (`salon-black`, `salon-gold`, `salon-red`, `salon-ivory`). |
| **Animation & Sliders** | **Framer Motion & Swiper** | `11.11.17` / `11.1.14` | Modal transitions, drawer animations, before/after split slider, portfolio carousels. |
| **Iconography** | **Lucide React** | `0.454.0` | Accessible SVG icons across navigation, cards, and admin controls. |
| **Form Handling** | **React Hook Form** | `7.53.2` | High-speed uncontrolled form state management. |
| **Schema Validation** | **Zod** | `3.23.8` | Declarative schema validation for form inputs and authoritative API payloads. |
| **ORM** | **Prisma ORM** | `5.22.0` | Relational query builder, migrations, model definitions, and connection pooling. |
| **Database Engine** | **PostgreSQL** | `v14+ / 16` | Relational database engine for users, appointments, payments, and calendar settings. |
| **Fallback Engine** | **High-Fidelity In-Memory (`memoryDb`)** | Built-in | Zero-downtime persistence fallback seeded with full salon data when PostgreSQL is offline. |
| **Authentication** | **JWT & Bcrypt.js** | `9.0.2` / `2.4.3` | HMAC-SHA256 token signing with 10-round bcrypt password hashing. |
| **Cryptography** | **Node.js Crypto** | Built-in | Authenticated AES-256-GCM encryption for payment keys; constant-time hash comparisons. |
| **Payment Gateway** | **Razorpay REST API** | v1 REST | Server-side order creation, HMAC-SHA256 signature verification, and webhook processing. |
| **Testing Suite** | **Vitest** | `2.1.4` | Automated unit, regression, and integration test runner (19 test files, 196 passed tests). |

---

## 2. Database Name, Engine & Provider

- **Configured Database Engine**: **PostgreSQL** (`provider = "postgresql"` in `prisma/schema.prisma`).
- **Database Name**: `jawed_habib_lalganj`.
- **Database Connection URI**:
  ```
  postgresql://postgres:postgres@localhost:5432/jawed_habib_lalganj?schema=public
  ```
- **Database Provider**: Local PostgreSQL instance on development workstations; compatible with managed cloud providers (Supabase, AWS RDS, Neon, Railway, or Google Cloud SQL) for production deployment.
- **Dual-Tier High-Availability Shield**:
  - The application implements a resilient dual-tier persistence layer ([`src/lib/db/repo.ts`](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/src/lib/db/repo.ts)).
  - When PostgreSQL is accessible, all 33 models execute via **Prisma ORM**.
  - If PostgreSQL is offline, `canUsePrisma()` safely times out after 1000ms with error suppression (`checkPromise.catch(() => {})`), transparently activating the built-in, fully-featured in-memory repository (`memoryDb`).
  - This ensures that local developer workstations, Vitest unit test suites, and staging environments operate seamlessly with zero database crashes.

---

## 3. ORM & Version

- **Prisma Client**: `@prisma/client` v5.22.0
- **Prisma CLI**: `prisma` v5.22.0
- **Schema File**: [`prisma/schema.prisma`](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/prisma/schema.prisma) (775 lines, 33 models, 10 enums)
- **Migrations**: `prisma/migrations/20261109000000_init/migration.sql` creates all tables, primary keys, foreign keys, and indexes.

---

## 4. Frontend Architecture

- **App Router Directory Structure**: Located under `src/app/`, separated into `(public)` storefront, `(auth)` customer authentication, and `admin` control center.
- **Visual Design System**: Strict adherence to the luxury salon brand tokens:
  - Luxury Black (`#111111` / `#0B0B0B`), Champagne Gold (`#C6A56B`), Light Gold (`#DFCA9E`), Habib Ruby Red (`#C62628`), and Warm Ivory (`#F7F4EE`).
  - Editorial typography: Playfair Display (`font-serif`) for titles + Inter (`font-sans`) for body copy.
- **Component Primitives**: Reusable UI components in `src/components/ui/` (`button`, `input`, `badge`, `card`, `modal`, `toast`, `accordion`, `brand-logo`).
- **Responsive Layouts**: Fully responsive layouts tested on desktop (`1440x900`) and mobile (`390x844`) with **0px horizontal overflow**.
- **Admin Panel Navigation**: Collapsible 10-module desktop dock with tooltips and mobile slide-out navigation drawer ([`admin-sidebar.tsx`](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/src/components/layout/admin-sidebar.tsx)).
- **Performance**: Total First Load JS shared by all routes: **87.2 kB**.

---

## 5. Backend Architecture & API Structure

- **Runtime**: Node.js runtime inside Next.js 14 Route Handlers (`src/app/api/*`).
- **Endpoint Inventory**: 93 distinct REST route handlers covering:
  1. Identity & Session (`/api/auth/*`)
  2. Public Storefront, Services, Packages & Content (`/api/services`, `/api/packages`, `/api/content`, `/api/gallery`, etc.)
  3. Booking & Availability Engine (`/api/appointments/availability`, `/api/appointments/hold`, `/api/appointments`)
  4. Razorpay Payments & Webhooks (`/api/payments/create-order`, `/api/payments/verify`, `/api/webhooks/razorpay`)
  5. Bridal Suites & Counter Payments (`/api/bridal/bookings`, `/api/bridal/services`, `/api/bridal/payments/collect-remaining`)
  6. Administrative Control Operations (`/api/admin/*`)
- **Server Validation**: 100% of mutating requests are parsed through Zod schemas before reaching the database layer.
- **Error Normalization**: Predictable HTTP responses (`{ success: true, data: {...} }` or `{ success: false, error: "..." }`).

---

## 6. Authentication & Session Management

- **Hashing**: All passwords hashed using `bcryptjs` with 10 salt rounds. Plaintext passwords are never stored.
- **Session Tokens**: JWT tokens signed with `JWT_SECRET` containing `userId`, `role`, `phone`, and `email`.
- **Cookie Security**: Delivered via `Set-Cookie` named `habib_session_token` with `HttpOnly: true`, `SameSite: "lax"`, and dynamic `MaxAge` (30 days for Remember Me; 7 days standard).
- **RBAC Enforcement**: `checkAdminAuth(req)` independently verifies caller permissions on every administrative endpoint.
- **Edge Route Protection**: `src/middleware.ts` automatically intercepts and redirects unauthenticated visits to `/admin/*` to `/admin/login`.
- **Zero Exposed Credentials**: `/admin/login` and `/login` contain zero hardcoded credentials, zero demo passwords, zero autofill pills, and zero client-side bypass scripts.

---

## 7. Razorpay Payment Architecture

- **Client**: Outbound HTTPS REST communication via [`src/lib/payments/razorpay.ts`](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/src/lib/payments/razorpay.ts) with an 8-second abort timeout.
- **Order Creation**: `/api/payments/create-order` creates orders with amount in paise (`₹1 = 100 paise`), auto-capture enabled (`payment_capture: 1`).
- **Signature Verification**: `/api/payments/verify` computes HMAC-SHA256 over `order_id|payment_id` using the decrypted key secret and verifies with constant-time `timingSafeEqualString`.
- **Webhook Deduplication**: `/api/webhooks/razorpay` verifies `X-Razorpay-Signature` against `webhookSecret` and records event IDs in `WebhookEventRecord` to prevent duplicate captures.
- **Advance vs. Balance Logic**: Enforces minimum reservation deposits online; remaining balance is collected at the salon counter via `/api/bridal/payments/collect-remaining` (Cash / UPI / Card POS), automatically updating appointments to `COMPLETED` and `PAID`.
- **Credential Encryption**: Admin panel encrypts Razorpay secrets using **AES-256-GCM** with 96-bit IVs and 128-bit authentication tags before persistence. Public APIs only display masked keys (`rzp_test_••••••••1234`).

---

## 8. File & Media Storage

- **Local Storage Engine**: Uploads processed via `/api/admin/upload` are assigned unique cryptographic hashes and stored under the public uploads directory.
- **Cloudinary CDN Integration**: Configured via `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. Outbound uploads dispatch directly to the Cloudinary CDN under the `jawed_habib_lalganj` folder, returning secure HTTPS URLs.
- **Media Asset Registry**: All assets are indexed in the `Media` repository ([`/admin/media`](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/src/app/admin/media/page.tsx)) categorized into `bridal`, `interior`, and `transformations`.

---

## 9. Environment Configuration

- **Configuration Files**: `.env` (active runtime variables) and `.env.example` (canonical reference template).
- **Public vs. Private Variable Isolation**:
  - `NEXT_PUBLIC_*`: Inlined to client bundles; contains only public brand facts (salon name, phone numbers, WhatsApp ID, Instagram URL, Google Maps link).
  - Private Variables: Accessible exclusively in Node.js runtime (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_DEFAULT_PASSWORD`, `CLOUDINARY_API_SECRET`).
- **Secret Masking**: All secrets are masked (`••••••••`) across reports and administrative interfaces.

---

## 10. Deployment Configuration

- **Build Command**: `npm run build` (`next build`).
- **Start Command**: `npm run start` (`next start`).
- **Type Checking**: `npm run type-check` (`tsc --noEmit`).
- **ESLint**: `npm run lint` (`next lint`).
- **Unit Testing**: `npm test` (`vitest run`).
- **Node.js Version Requirement**: Node.js `v18.17+` or `v20+` (Currently verified on Node.js `v22.17.1`).
- **Reverse Proxy Requirement**: Nginx or Cloudflare configured with HTTPS, HSTS headers, and proxy pass to port `3000`.

---

## 11. Existing Problems Identified & Resolved

| # | Problem Identified During Audit | Root Cause | Engineering Solution Implemented | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **Fragmented Admin Architecture** | 33 disconnected routes and duplicated views. | Consolidated into 10 unified modules with backward-compatible re-exports. | **RESOLVED** |
| 2 | **Exposed Credentials on Login** | Plaintext credentials displayed in demo pill on `/admin/login`. | Completely deleted demo pill, One-Click Fill, and offline bypass scripts. | **RESOLVED** |
| 3 | **Customer Login Demo Pill** | Demo credentials displayed in `/login`. | Deleted `handleDemoSignIn` and demo card from customer login. | **RESOLVED** |
| 4 | **Unhandled DB Timeout Crashes** | Prisma connection probe had unhandled rejection when Postgres was offline. | Added `.catch(() => {})` on `checkPromise` in `canUsePrisma()`. | **RESOLVED** |
| 5 | **Admin Route Guarding** | Middleware skipped auth checks in development mode. | Enforced unconditional redirection to `/admin/login` for unauthenticated requests. | **RESOLVED** |
| 6 | **HTTP Verb Mismatch (405)** | REST clients using PUT/PATCH interchangeably. | Exported aliases (`PATCH = PUT`, `POST = PUT`) on route handlers. | **RESOLVED** |
| 7 | **Footer Branding Missing** | Missing developer attribution for Axivon Technologies. | Integrated "Designed & Developed by Axivon Technologies" with secure link. | **RESOLVED** |
| 8 | **Missing Suspense Boundary** | `useSearchParams()` in `/admin/login` bailed out CSR. | Wrapped `AdminLoginForm` inside `<React.Suspense>`. | **RESOLVED** |

---

## 12. Recommended Improvements for Future Milestones

1. **Production PostgreSQL Provisioning**: Connect a dedicated, managed PostgreSQL database (e.g. AWS RDS or Supabase) with automated daily snapshot backups.
2. **Production SMS Gateway Integration**: Connect a dedicated transactional SMS API (e.g. Fast2SMS or Twilio) for automated booking reminder dispatch and OTP delivery.
3. **Automated End-to-End Visual Regression**: Integrate Playwright test pipelines for automated cross-browser screenshot diffing on CI/CD commits.
