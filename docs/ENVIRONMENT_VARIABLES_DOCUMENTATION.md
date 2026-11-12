# Environment Variables & Configuration Documentation

> **Document Status**: Production Verified  
> **Security Notice**: All sensitive passwords, private keys, and tokens in this document are strictly masked (`••••`).  
> **Template Reference**: `.env.example`  
> **Developer Attribution**: Designed & Developed by [Axivon Technologies](https://axivontech.in)

---

## 1. Overview & Security Rules

The application utilizes server and client environment variables parsed through Next.js:
- **Server-Only Variables**: Variables without the `NEXT_PUBLIC_` prefix are accessible **only** within Node.js environments (Route Handlers, Server Components, and Server Utilities). They are never bundled into client JavaScript.
- **Client-Exposed Variables**: Variables prefixed with `NEXT_PUBLIC_` are inlined into the client bundle at build time. They must strictly contain non-sensitive public business facts.

```mermaid
flowchart TD
    Env[".env / Environment Variables"] --> Filter{"Starts with NEXT_PUBLIC_?"}
    Filter -- "Yes (Public Safe)" --> ClientBundle["Client-Side JS Bundle (Browser Accessible)"]
    Filter -- "No (Private Secret)" --> ServerRuntime["Node.js Server Runtime (Secure Only)"]
    ServerRuntime --> DB["Prisma Database Driver"]
    ServerRuntime --> JWT["JWT Sign & Verify Engine"]
    ServerRuntime --> Rzp["Razorpay REST Client"]
    ClientBundle --> UI["Public Website & Admin UI Chrome"]
```

---

## 2. Complete Environment Variable Inventory

### A. System & Runtime Environment
| Variable | Scope | Type | Purpose | Production Example / Default |
| :--- | :---: | :---: | :--- | :--- |
| `NODE_ENV` | Server | String | Node environment mode (`development`, `production`, `test`). | `production` |
| `NEXT_PUBLIC_APP_URL` | Client/Server | URL | Authoritative base URL of the web application. | `https://jawedhabib-lalganj.in` |

### B. Database Configuration (Prisma ORM)
| Variable | Scope | Type | Purpose | Configuration Standard |
| :--- | :---: | :---: | :--- | :--- |
| `DATABASE_URL` | Server | Connection String | PostgreSQL connection string with username, password, host, port, and database name. | `postgresql://salon_admin:••••••••@localhost:5432/jawed_habib_lalganj?schema=public` |

### C. Authentication & Cryptography
| Variable | Scope | Type | Purpose | Security Requirement |
| :--- | :---: | :---: | :--- | :--- |
| `JWT_SECRET` | Server | Secret String | Private cryptographic key used for signing and verifying JWT session tokens and deriving the AES-256-GCM encryption key. | Must be a cryptographically random string (min 32 characters, e.g. `openssl rand -base64 32`). Current: `••••••••••••••••` |
| `JWT_EXPIRES_IN` | Server | Duration | Default expiration period for non-persistent JWT sessions. | `7d` |
| `PAYMENT_ENCRYPTION_KEY`| Server | Secret String | Optional independent key for AES-256-GCM Razorpay secret encryption (falls back securely to `JWT_SECRET`). | 32+ character random secret (`••••••••••••••••`). |

### D. Initial Seed Administrator Credentials
*Used exclusively during database initialization (`prisma/seed.ts` or `dbRepo.seed`).*
| Variable | Scope | Type | Purpose | Current Configuration |
| :--- | :---: | :---: | :--- | :--- |
| `ADMIN_DEFAULT_EMAIL` | Server | Email | Seed administrator email address. | `admin@jawedhabib-lalganj.in` |
| `ADMIN_DEFAULT_PASSWORD`| Server | Secret String | Initial administrator password hashed via bcrypt before insertion. | `••••••••••••••••` |

### E. Cloud Media Storage (Cloudinary)
| Variable | Scope | Type | Purpose | Current Value / Format |
| :--- | :---: | :---: | :--- | :--- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client | String | Cloudinary cloud identifier for image delivery. | `demo` / `jawed-habib-lalganj` |
| `CLOUDINARY_API_KEY` | Server | Secret String | Cloudinary management API key. | `••••••••••••` |
| `CLOUDINARY_API_SECRET` | Server | Secret String | Cloudinary private API secret. | `••••••••••••` |
| `CLOUDINARY_UPLOAD_PRESET` | Server | String | Upload preset configuration name. | `jawed_habib_lalganj` |

### F. Public Business & Brand Constants (`NEXT_PUBLIC_*`)
*Immutable ground truth business facts imported directly into client and server components.*
| Variable | Scope | Value | Business Ground Truth |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SALON_NAME` | Client | `The Jawed Habib Salon – Lalganj` | Official salon trade name. |
| `NEXT_PUBLIC_SALON_PHONE_PRIMARY` | Client | `7707000463` | Primary customer contact line. |
| `NEXT_PUBLIC_SALON_PHONE_SECONDARY` | Client | `9831722983` | Secondary salon booking line. |
| `NEXT_PUBLIC_SALON_PHONE_TERTIARY` | Client | `9580000175` | Tertiary bridal reservation line. |
| `NEXT_PUBLIC_SALON_WHATSAPP` | Client | `917707000463` | WhatsApp Business chat link identifier. |
| `NEXT_PUBLIC_SALON_INSTAGRAM` | Client | `https://www.instagram.com/the_jawedhabib_lalganj/`| Verified Instagram handle. |
| `NEXT_PUBLIC_SALON_MAPS_URL` | Client | `https://maps.app.goo.gl/TVx48xoWEu8dMvXT9` | Verified Google Maps link for Tinpulwa Chowk. |

---

## 3. Production Deployment Guidelines

1. **Never Commit `.env`**: Ensure `.env` remains in `.gitignore`. Provide `.env.example` as the canonical reference template.
2. **Secret Rotation**:
   - Prior to public production launch, rotate `JWT_SECRET` and `ADMIN_DEFAULT_PASSWORD` to high-entropy random keys.
   - Configure actual production Razorpay Live keys (`rzp_live_...`) in the Admin Settings panel (`/admin/settings`).
3. **Database URL**: In containerized or PaaS hosting (Docker, AWS ECS, Railway, Supabase), configure `DATABASE_URL` pointing to the managed PostgreSQL host with SSL mode enabled (`?sslmode=require`).
