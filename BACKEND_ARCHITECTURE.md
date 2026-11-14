# Backend Architecture: The Jawed Habib Salon – Lalganj

> **Document Location**: Full documentation available at [docs/BACKEND_ARCHITECTURE.md](file:///c:/Users/vk010/Downloads/startup/demo/The%20Jawed%20Habib%20Salon%20-%20Lalganj/docs/BACKEND_ARCHITECTURE.md)

---

## 1. High-Level Architecture

- **Runtime**: Next.js 14.2+ App Router Route Handlers (`src/app/api/*`) executing in Node.js runtime.
- **Data Access Layer**: `src/lib/db/repo.ts` (`dbRepo` singleton) with connection pooling and resilient in-memory fallback.
- **ORM & Database**: Prisma ORM 5.22.0 with Neon Serverless PostgreSQL.
- **Validation**: Strict server-side Zod validation on 100% of mutation endpoints.
- **Session Tracking**: Database-persisted sessions (`AdminSession`) with explicit server revocation on logout.
- **Payment Processing**: Razorpay Standard Checkout with authenticated AES-256-GCM encryption, HMAC SHA-256 signature verification, and deduplicated webhooks.
