# Technical Architecture: The Jawed Habib Salon – Lalganj

## 1. System Overview
The platform is built as a unified, full-stack Next.js 14 App Router application engineered for high performance, accessibility, SEO superiority, and robust business management.

```
+-------------------------------------------------------------------+
|                        Client Layer                               |
| Next.js App Router (React 18 + TypeScript Strict + Tailwind CSS)  |
| Lucide React • Framer Motion • Swiper.js • shadcn/ui Architecture |
+---------------------------------+---------------------------------+
                                  |
               HTTPS REST / Server Action Invocations
                                  |
+---------------------------------v---------------------------------+
|                       API & Business Logic                        |
| Next.js Route Handlers (Edge / Node.js Runtime)                   |
| Zod Schema Validation • JWT Auth Guard • Role-Based Access Control|
+---------------------------------+---------------------------------+
                                  |
                               Prisma ORM
                                  |
+---------------------------------v---------------------------------+
|                          Database Layer                           |
| PostgreSQL Relational Database (Appointments, CRM, Catalog, etc.) |
+-------------------------------------------------------------------+
```

---

## 2. Directory Architecture & Layer Responsibilities

```
src/
  ├── app/
  │   ├── (public)/              # Public website: Hero, Services, Pricing, Gallery, Booking
  │   ├── (auth)/                # Customer & Staff Authentication (Login, Register)
  │   ├── (customer)/            # Customer self-service dashboard, points, past bookings
  │   ├── admin/                 # Management Platform: Appointments, CRM, Services, Staff, Analytics
  │   ├── api/                   # REST Route Handlers with Zod validation
  │   ├── layout.tsx             # Root layout with theme, metadata, and fonts
  │   ├── error.tsx              # Error boundary
  │   └── not-found.tsx          # 404 luxury page
  │
  ├── components/
  │   ├── ui/                    # Reusable primitive tokens (Button, Input, Card, Badge)
  │   ├── layout/                # Global layout (Header, Footer, AdminSidebar)
  │   ├── home/                  # Landing page sections & pillars
  │   ├── services/              # Service cards, category filters
  │   ├── booking/               # Multi-step booking engine
  │   └── admin/                 # Admin data tables, metrics, schedule views
  │
  ├── lib/
  │   ├── auth/                  # JWT generation/verification & bcrypt hashing
  │   ├── constants/             # Brand constants (Address, Phones, Timings, Colors)
  │   ├── db/                    # Prisma client singleton
  │   ├── utils/                 # cn helper, formatPrice, phone formatting
  │   └── validation/            # Zod schemas for all client & server inputs
  │
  ├── types/                     # Shared TypeScript interfaces & enums
  └── config/                    # Site navigation and dynamic metadata configurations
```

---

## 3. Security & Engineering Standards
1. **Server-Side Validation**: Every mutation route validates incoming payloads with Zod before database execution.
2. **Strict TypeScript**: `noImplicitAny: true`, strict null checks, and comprehensive typed interfaces.
3. **Environment Isolation**: Database credentials, JWT secrets, and SMS gateway keys are protected and never leaked to the client bundle.
4. **Resilient Data Access**: Singleton pattern for Prisma Client to prevent connection leaks during Next.js hot-reloading.
