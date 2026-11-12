# Implementation Plan: The Jawed Habib Salon – Lalganj

## Phase 1: Architectural Foundation & Environment Setup (Completed in Current Sprint)
- [x] Workspace inspection and technology stack configuration.
- [x] Next.js App Router initialization with TypeScript strict mode.
- [x] Tailwind CSS luxury design tokens, CSS variables, and typography setup.
- [x] Complete directory structure spanning public website, auth, customer portal, admin platform, and APIs.
- [x] Relational database schema (`prisma/schema.prisma`) and seed blueprint (`prisma/seed.ts`).
- [x] Core utility libraries, brand constants, Zod validation schemas, and JWT auth utilities.
- [x] Reusable luxury UI primitives (`Button`, `Card`, `Badge`, `Input`) and layout shells (`Header`, `Footer`, `AdminSidebar`).
- [x] Public home page, service menu, pricing, gallery, transformation, contact, and booking flow foundations.
- [x] Comprehensive technical documentation (`PROJECT_BRIEF`, `ARCHITECTURE`, `DATABASE_SCHEMA`, `FEATURES`, `API_DOCUMENTATION`, `IMPLEMENTATION_PLAN`, `AGENTS.md`, `.env.example`, `README.md`).

---

## Phase 2: Database Connection & Dynamic API Integration
- [ ] Connect production/local PostgreSQL database instance.
- [ ] Execute `prisma migrate dev` and run `prisma/seed.ts`.
- [ ] Implement live CRUD Route Handlers for:
  - Categories & Services.
  - Appointment bookings & calendar slot availability.
  - Staff rosters and working hours.
  - Public enquiry and consultation forms.

---

## Phase 3: Client & Staff Authentication (RBAC)
- [ ] Implement JWT session cookies or NextAuth/Lucia-style session tokens.
- [ ] Role-Based Access Control middleware guarding `/admin/*` and `/(customer)/*`.
- [ ] Admin login authentication with secure password hashing (`bcryptjs`).
- [ ] Customer OTP or phone-based verification for booking history.

---

## Phase 4: Dynamic Admin Management Workflows
- [ ] Live Appointment Kanban & Calendar View (Drag-and-drop chair assignment).
- [ ] Service & Pricing CMS with real-time price editing.
- [ ] Stylist management: commission tracking, chair availability toggling.
- [ ] Coupon code creation engine (percentage or flat discounts, date expirations).
- [ ] Digital enquiries desk with one-click WhatsApp/Call response triggers.

---

## Phase 5: Cloudinary Image Storage & Transformations Gallery
- [ ] Cloudinary direct upload integration for Before/After transformations.
- [ ] Ambience gallery upload and image optimization.
- [ ] Interactive Before/After image slider component.

---

## Phase 6: Automated Notifications & Communication
- [ ] WhatsApp Business Cloud API integration for instant booking confirmations.
- [ ] SMS reminder 2 hours prior to scheduled appointment.
- [ ] Automated review request message sent post-completion.

---

## Phase 7: Automated Testing, Audits & Production Deployment
- [ ] End-to-end booking flow tests using Playwright.
- [ ] Unit & integration tests with Vitest.
- [ ] Lighthouse performance, accessibility, and SEO audit (aiming for 95+ score).
- [ ] Production build and Vercel / Docker container deployment.
