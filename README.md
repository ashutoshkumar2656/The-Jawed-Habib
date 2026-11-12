# The Jawed Habib Salon – Lalganj

A luxury salon website and enterprise salon management platform engineered for **The Jawed Habib Salon** in **Lalganj, Vaishali, Bihar, India**.

![Design System](https://img.shields.io/badge/Design-Luxury%20Gold%20%26%20Black-C6A56B)
![Framework](https://img.shields.io/badge/Framework-Next.js%2014%20App%20Router-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript%20Strict-blue)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-336791)

---

## 🏛️ Business Overview

- **Business Name**: The Jawed Habib Salon
- **Branch**: Lalganj, Vaishali, Bihar, India
- **Address**: 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121
- **Opening Hours**: Monday to Sunday, 10:00 AM – 10:00 PM (Open all 7 days)
- **Direct Contact Numbers**:
  - `+91 77070 00463`
  - `+91 98317 22983`
  - `+91 95800 00175`
- **Instagram**: [https://www.instagram.com/the_jawedhabib_lalganj/](https://www.instagram.com/the_jawedhabib_lalganj/)
- **Google Maps**: [https://maps.app.goo.gl/TVx48xoWEu8dMvXT9](https://maps.app.goo.gl/TVx48xoWEu8dMvXT9)

---

## 💎 Project Features

1. **Public Luxury Salon Portal**:
   - Hero presentation highlighting Lalganj branch identity and location.
   - Categorized service menu (Haircuts, Hair Spa, Keratin, Botox, 24K Gold Facials, Beard Sculpting, Bridal Packages).
   - Before & After transformation gallery.
   - Ambience tour and styling station walkthrough.
   - Hair & skin consultation request desk.
2. **Online Appointment Reservation Engine**:
   - Multi-service basket selection.
   - Date and time slot picker (10:00 AM – 10:00 PM).
   - Promo coupon validation (`WELCOME100`).
   - Frictionless "Pay at Salon" reservation.
3. **Customer Portal**:
   - Appointment ledger and visit history.
   - Habib Loyalty Points and tier tracker (Silver/Gold/Platinum).
4. **Admin Management Command Center**:
   - Real-time appointment scheduling and chair management.
   - Dynamic service catalog and pricing editor.
   - Staff/Stylist directory, ratings, and roster.
   - Client CRM and contact logs.
   - Promotional coupon and campaign generator.
   - Monthly revenue analytics and chair utilization reports.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 App Router, React 18, TypeScript (Strict), Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Next.js Route Handlers (Node.js runtime), Zod server-side validation.
- **Database**: PostgreSQL with Prisma ORM.
- **Testing**: Vitest.
- **Security**: JWT authentication, bcryptjs password hashing.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18.17+ or v20+)
- PostgreSQL database instance (local or hosted)

### 2. Environment Setup
Copy the template configuration:
```bash
cp .env.example .env
```
Ensure you update `DATABASE_URL` with your PostgreSQL connection string.

### 3. Installation
```bash
npm install
```

### 4. Database Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema migrations
npm run prisma:migrate

# Seed initial salon catalog, categories, admin user, and settings
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public website or [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the management portal.

---

## 🧪 Quality & Verification Commands

```bash
# Type check TypeScript code
npm run type-check

# Run linter
npm run lint

# Run unit tests
npm test

# Build for production
npm run build
```

---

## 📖 Architecture & Standards

Refer to the detailed guides in the `docs/` folder:
- [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- [docs/FEATURES.md](docs/FEATURES.md)
- [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
- [AGENTS.md](AGENTS.md)
