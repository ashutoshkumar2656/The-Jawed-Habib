# AGENTS.md: Development Conventions & Architectural Directives

> **CRITICAL DIRECTIVE FOR ALL FUTURE AGENTS & DEVELOPERS:**
> This repository contains the digital platform and salon management system for **The Jawed Habib Salon – Lalganj**.
> Every change, addition, or phase must adhere to the rules, brand facts, design tokens, and engineering constraints defined below.

---

## 1. Permanent Business Facts & Information

| Key | Ground Truth Value |
| :--- | :--- |
| **Official Business Name** | **The Jawed Habib Salon** |
| **Branch Location** | **Lalganj, Vaishali, Bihar, India** |
| **Exact Physical Address** | **1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121** |
| **Opening Hours** | **Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days)** |
| **Primary Phone** | **7707000463** |
| **Secondary Phone** | **9831722983** |
| **Tertiary Phone** | **9580000175** |
| **Official Instagram** | **https://www.instagram.com/the_jawedhabib_lalganj/** |
| **Google Maps Location** | **https://maps.app.goo.gl/TVx48xoWEu8dMvXT9** |

*Never invent fake addresses, placeholder phone numbers, or alternate business hours. Always import or refer to `@/lib/constants/brand`.*

---

## 2. Design System & Luxury Aesthetics

### Core Palette
- **Luxury Black**: `#111111` / Rich Black `#0B0B0B` (Primary background and high-end depth)
- **Champagne Gold**: `#C6A56B` (Accent elements, gold gradient, active states, key icons, badges)
- **Light Gold**: `#DFCA9E` (Subtle glow, hover transitions, text highlights)
- **Ivory**: `#F7F4EE` (Primary text against dark background, warm contrast)
- **Muted Grey**: `#777777` / `#8E8E93` (Secondary metadata, borders, muted hints)
- **White**: `#FFFFFF` (High emphasis headings)

### Visual Direction
- **International Luxury**: Clean lines, generous padding, high-contrast gold accents, and subtle borders (`border-salon-borderBlack` or `border-salon-gold/30`).
- **Typography**: High-editorial serif accents for headings (`font-serif`) and clean, legible sans-serif for body copy and numbers (`font-sans`).
- **Interactive States**: Smooth scale-downs on button clicks, subtle gold shadow glow (`hover:shadow-[0_0_20px_rgba(198,165,107,0.3)]`).

---

## 3. Technology Stack & Directory Conventions

- **Framework**: Next.js App Router (Next.js 14+), React 18/19, TypeScript with strict mode.
- **Styling**: Tailwind CSS with custom tokens in `tailwind.config.ts`, Lucide React icons, Framer Motion for transitions.
- **Backend & APIs**: Next.js Route Handlers (`src/app/api/*`) using Node.js runtime.
- **Validation**: Server-side validation with **Zod** on every POST/PUT/PATCH route.
- **ORM & Database**: Prisma ORM with PostgreSQL. All models must be updated in `prisma/schema.prisma`.
- **State Management & Forms**: React Hook Form with `@hookform/resolvers/zod`.
- **Date Handling**: `date-fns`.
- **Unit Testing**: Vitest (`npm test`).

### Routing Structure
- Public Pages: `src/app/(public)/*`
- Auth Pages: `src/app/(auth)/*`
- Customer Portal: `src/app/(customer)/*`
- Admin Management: `src/app/admin/*`
- APIs: `src/app/api/*`

---

## 4. Engineering & Quality Rules

1. **Strict TypeScript**: Never use `any` unless strictly interfacing with untyped legacy code. Always type API responses, props, and database payloads.
2. **Server-Side Validation**: Never trust client payloads. Validate every request with Zod schemas from `@/lib/validation/schemas`.
3. **Reusable Primitives**: Build with `@/components/ui/*`. Do not recreate custom buttons or inputs when existing primitives exist.
4. **No Non-Functional Buttons**: Never leave dead `href="#"` or unhandled `onClick` handlers. If an action is pending implementation, connect it to a clear notification, modal, or functional stub.
5. **No Secret Leaks**: Never expose database connection strings, JWT secrets, or third-party API private keys to the client (`NEXT_PUBLIC_` prefix should only be used for public safe values).
6. **Preserve Documentation Integrity**: Update `docs/*` whenever adding new features, schemas, or API endpoints.
7. **Verification Requirement**: After completing any implementation phase, always run:
   ```bash
   npm run type-check
   npm run lint
   npm test
   npm run build
   ```
   Do not conclude your work with broken builds or failing tests.
