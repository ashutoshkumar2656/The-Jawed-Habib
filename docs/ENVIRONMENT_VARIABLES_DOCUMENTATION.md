# Environment Variables & Configuration Documentation
# The Jawed Habib Salon – Lalganj

> **Document Version**: 2.0.0 (Production Verified & Schema Validated)  
> **Security Notice**: All sensitive passwords, private keys, and API secrets are strictly masked (`••••`).  
> **Canonical Template**: `.env.example`  
> **Validation Engine**: Centralized Zod Schema Validation (`src/lib/env.ts`)  
> **Developer Attribution**: Designed & Engineered by [Axivon Technologies](https://axivontech.in)

---

## 1. Overview & Security Architecture

The application implements a strict two-tier environment variable architecture separating private server secrets from public client-exposed constants:

- **Server-Only Variables**: Variables without the `NEXT_PUBLIC_` prefix are accessible **only** within Node.js environments (Route Handlers, Server Components, Background Jobs, and Server Utilities). They are **never** bundled into client JavaScript.
- **Client-Exposed Variables**: Variables prefixed with `NEXT_PUBLIC_` are inlined into the client bundle at build time. They contain strictly non-sensitive public business facts (salon address, official phone numbers, WhatsApp, maps link).

```mermaid
flowchart TD
    Env[".env / Environment Variables"] --> Validator["Centralized Zod Validator (src/lib/env.ts)"]
    Validator --> Filter{"Starts with NEXT_PUBLIC_?"}
    
    Filter -- "Yes (Public Safe)" --> ClientBundle["Client-Side JS Bundle\n(Browser Accessible / Inlined)"]
    Filter -- "No (Private Secret)" --> ServerRuntime["Node.js Server Runtime\n(Secure Backend Only)"]
    
    ServerRuntime --> DB["Prisma PostgreSQL Driver (Port 5432)"]
    ServerRuntime --> JWT["JWT Cryptographic Signer & Verifier"]
    ServerRuntime --> Encryption["AES-256-GCM Gateway Secret Encryptor"]
    ServerRuntime --> Rzp["Razorpay REST API Client"]
    ServerRuntime --> Cloudinary["Cloudinary Admin SDK"]
    
    ClientBundle --> UI["Public Website & Admin UI Chrome"]
```

---

## 2. Complete Environment Variable Inventory (8 Categories)

### A. Application & Hosting
| Variable | Scope | Type | Purpose | Production Standard |
| :--- | :---: | :---: | :--- | :--- |
| `NODE_ENV` | Server | Enum | Runtime mode: `development`, `production`, `test`. | `production` |
| `APP_URL` | Server | URL | Base canonical URL of the application. | `https://jawedhabib-lalganj.in` |
| `NEXT_PUBLIC_APP_URL` | Client/Server | URL | Public base URL used for client-side API requests and OG tags. | `https://jawedhabib-lalganj.in` |

### B. Database Configuration (PostgreSQL & Prisma ORM)
| Variable | Scope | Type | Purpose | Production Standard |
| :--- | :---: | :---: | :--- | :--- |
| `DATABASE_URL` | Server | Connection String | PostgreSQL connection string including user, password, host, port, DB, and SSL schema. | `postgresql://salon_admin:••••••••@localhost:5432/jawed_habib_lalganj?schema=public` |

### C. Authentication & Session Security
| Variable | Scope | Type | Purpose | Security Requirement |
| :--- | :---: | :---: | :--- | :--- |
| `JWT_SECRET` | Server | Secret String | Private cryptographic key used for signing and verifying JWT session tokens. | Minimum 32 characters (e.g. `openssl rand -base64 32`). Current: `••••••••••••••••` |
| `JWT_EXPIRES_IN` | Server | Duration | Standard token lifetime. | `7d` |
| `ADMIN_DEFAULT_EMAIL` | Server | Email | Initial seed administrator email address. | `admin@jawedhabib-lalganj.in` |
| `ADMIN_DEFAULT_PASSWORD`| Server | Secret String | Initial administrator password hashed via bcrypt before insertion. | `••••••••••••••••` |

### D. Payment Encryption & Data Protection
| Variable | Scope | Type | Purpose | Security Standard |
| :--- | :---: | :---: | :--- | :--- |
| `PAYMENT_ENCRYPTION_KEY`| Server | Secret String | Master key for AES-256-GCM authenticated encryption of database-stored gateway secrets. | 32+ character random secret (`••••••••••••••••`). Falls back safely to `JWT_SECRET`. |

### E. Razorpay Payment Gateway (Test & Live)
| Variable | Scope | Type | Purpose | Value Format |
| :--- | :---: | :---: | :--- | :--- |
| `RAZORPAY_KEY_ID` | Server | String | Razorpay public Key ID used for order initialization. | Starts with `rzp_test_` or `rzp_live_`. |
| `RAZORPAY_KEY_SECRET` | Server | Secret String | Razorpay private Key Secret used for server-side HMAC-SHA256 signature verification. | `••••••••••••••••` |
| `RAZORPAY_WEBHOOK_SECRET`| Server | Secret String | Shared webhook secret used to verify raw body HMAC signatures. | `••••••••••••••••` |

### F. File Storage (Cloudinary CDN)
| Variable | Scope | Type | Purpose | Value Format |
| :--- | :---: | :---: | :--- | :--- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client | String | Cloudinary cloud identifier for media optimization and delivery. | `demo` / `jawed-habib-lalganj` |
| `CLOUDINARY_API_KEY` | Server | Secret String | Cloudinary API Key for administrative upload signing. | `••••••••••••` |
| `CLOUDINARY_API_SECRET` | Server | Secret String | Cloudinary API Secret. | `••••••••••••` |
| `CLOUDINARY_UPLOAD_PRESET` | Server | String | Upload preset configuration. | `jawed_habib_lalganj` |

### G. Email & Notification Relay (SMTP Optional)
| Variable | Scope | Type | Purpose | Value Format |
| :--- | :---: | :---: | :--- | :--- |
| `SMTP_HOST` | Server | String | Outbound mail server hostname. | `smtp.gmail.com` |
| `SMTP_PORT` | Server | Integer | SMTP port (SSL/TLS). | `587` / `465` |
| `SMTP_USER` | Server | String | SMTP account username or service email. | `notifications@jawedhabib-lalganj.in` |
| `SMTP_PASSWORD` | Server | Secret String | SMTP app-specific password. | `••••••••••••••••` |

### H. Salon Ground Truth Constants (`NEXT_PUBLIC_*`)
*Immutable ground truth business facts imported directly into client and server components.*
| Variable | Scope | Ground Truth Value | Business Purpose |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SALON_NAME` | Client | `The Jawed Habib Salon – Lalganj` | Official registered brand name. |
| `NEXT_PUBLIC_SALON_PHONE_PRIMARY` | Client | `7707000463` | Primary customer booking phone. |
| `NEXT_PUBLIC_SALON_PHONE_SECONDARY` | Client | `9831722983` | Secondary inquiry line. |
| `NEXT_PUBLIC_SALON_PHONE_TERTIARY` | Client | `9580000175` | Tertiary bridal reservation line. |
| `NEXT_PUBLIC_SALON_WHATSAPP` | Client | `917707000463` | Direct WhatsApp customer chat link. |
| `NEXT_PUBLIC_SALON_INSTAGRAM` | Client | `https://www.instagram.com/the_jawedhabib_lalganj/` | Official verified Instagram handle. |
| `NEXT_PUBLIC_SALON_MAPS_URL` | Client | `https://maps.app.goo.gl/TVx48xoWEu8dMvXT9` | Verified Google Maps link for 1st Floor, Tinpulwa Chowk. |

---

## 3. Centralized Validation Engine (`src/lib/env.ts`)

The project uses a centralized schema validator powered by Zod:

```typescript
import { validateEnv, getSanitizedEnvReport } from "@/lib/env";

// Validates server and client environment variables at runtime
const result = validateEnv();

if (!result.valid) {
  console.error("Environment validation failed:", result.errors);
  // In production, throws descriptive error without leaking secret values
}
```

### Key Security Safeguards
1. **Zero Secret Leakage**: The validator returns structured field errors (e.g. `JWT_SECRET must be at least 32 characters long`) and **never** echoes the secret string.
2. **Production Enforcement**: If `NODE_ENV === "production"`, the validator enforces that `DATABASE_URL` is set and that `JWT_SECRET` is not set to any known development default.
3. **Safe Diagnostics API**: `getSanitizedEnvReport()` exposes boolean configuration flags (`hasDatabaseUrl`, `hasRazorpayCredentials`) without exposing raw credentials.

---

## 4. Setup & Deployment Runbook

### Step 1: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Fill in the developer credentials or sandbox keys.

### Step 2: Validate Environment Schema
Run the automated test suite to ensure all variables conform to the schema:
```powershell
npm test
```

### Step 3: Deployment to Production (Vercel / AWS / VPS)
In your production hosting dashboard (e.g. Vercel Settings > Environment Variables):
1. Set `NODE_ENV=production`.
2. Generate and set a fresh `JWT_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
3. Set `DATABASE_URL` to your production managed PostgreSQL database with SSL.
4. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with production Live keys.
5. Set `RAZORPAY_WEBHOOK_SECRET` matching the secret entered in your Razorpay Webhook settings.
6. Verify via `/api/health`.
