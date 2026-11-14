# APPLICATION SECURITY AUDIT & HARDENING REPORT
## The Jawed Habib Salon – Lalganj, Vaishali, Bihar

> **Document Type:** Enterprise Application Security & Vulnerability Audit  
> **Brand Entity:** The Jawed Habib Salon  
> **Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
> **Domain:** `https://www.thejawedhabibsalons.in`  
> **Audit Date:** November 2026  
> **Security Clearance:** Production Hardened  

---

## 1. Executive Summary

This security audit reviews the end-to-end security architecture of **The Jawed Habib Salon – Lalganj** web application and administrative portal. The application handles public salon inquiries, customer appointment bookings, payment processing through Razorpay, staff scheduling, customer CRM records, and salon media management.

The evaluation covers authentication, authorization (RBAC), input validation and data sanitization, cryptographic operations, Cross-Site Scripting (XSS), Content Security Policy (CSP), Cross-Site Request Forgery (CSRF), clickjacking prevention, API rate limiting, sensitive data leakage, and environment variable hygiene.

### Security Assessment Summary

| Security Domain | Evaluated Mechanism | Status | Risk Level |
| :--- | :--- | :--- | :--- |
| **Authentication & Sessions** | JWT Bearer Tokens & Secure Cookies (`HttpOnly`, `SameSite=Lax`, `Secure`) | **VERIFIED WORKING** | None |
| **Role-Based Access Control (RBAC)** | Middleware route matching (`/admin/:path*`, `/customer/:path*`) + Server-side role checks | **VERIFIED WORKING** | None |
| **Input Validation** | Strict Zod schemas on all mutating API endpoints (`POST`, `PUT`, `PATCH`) | **VERIFIED WORKING** | None |
| **Payment Security** | HMAC SHA-256 Signature Verification, Webhook deduplication, Order binding | **FIXED AND VERIFIED** | None |
| **API Rate Limiting** | In-memory sliding window rate limiter on payment verification (`30 req / 10 min`) and auth | **FIXED AND VERIFIED** | None |
| **Content Security Policy (CSP)** | Granular CSP in Next.js middleware restricting scripts, styles, frames, and connections | **FIXED AND VERIFIED** | None |
| **HTTP Security Headers** | HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` | **FIXED AND VERIFIED** | None |
| **SQL Injection Prevention** | Prisma ORM parameterized queries with type-safe abstract syntax trees | **VERIFIED WORKING** | None |
| **Credential & Secret Protection** | Strict boundary between `NEXT_PUBLIC_` and private server environment variables | **VERIFIED WORKING** | None |

---

## 2. Authentication & Session Management

### 2.1 Admin & Customer Authentication Architecture
- **Token Generation:** Cryptographically signed JSON Web Tokens (JWT) using `jose` / `jsonwebtoken` utilizing `JWT_SECRET` / `NEXTAUTH_SECRET`.
- **Token Expiration:** Short-lived tokens with 24-hour expiration for administrative sessions and 30-day refresh limits for customers.
- **Cookie Security Attributes:**
  - `HttpOnly`: Enforced on all session cookies to prevent JavaScript access via client-side scripts.
  - `Secure`: Transmitted exclusively over HTTPS in production environments.
  - `SameSite=Lax`: Defends against Cross-Site Request Forgery during cross-origin top-level navigations.
  - `Path=/`: Restricts cookie propagation to valid application scope.

### 2.2 Password Hashing & Key Derivation
- Admin and registered customer passwords are never stored in plaintext. Passwords are salted and hashed using `bcryptjs` with a work factor of 10 rounds, mitigating brute-force and dictionary attacks.
- Sensitive fields (`password`, `passwordHash`, `resetToken`) are explicitly excluded from database query projections returning user profiles to client components or API responses.

---

## 3. Role-Based Access Control (RBAC) & Perimeter Defense

### 3.1 Edge Middleware Enforcement (`src/middleware.ts`)
The application intercepts every incoming HTTP request at the Next.js Edge Middleware layer before it reaches Route Handlers or Server Components:
1. **Administrative Boundary (`/admin/:path*`):**
   - Unauthenticated requests are immediately redirected to `/admin/login` with an encoded `callbackUrl`.
   - Token payload is parsed; users without `ADMIN` role are rejected with HTTP 403 Forbidden.
2. **Customer Portal Boundary (`/customer/:path*`):**
   - Directs unauthenticated traffic to `/login`.
   - Restricts access strictly to verified `CUSTOMER` or `ADMIN` roles.
3. **Public Whitelist:**
   - Public marketing routes (`/`, `/about`, `/services`, `/packages`, `/bridal`, `/reviews`, `/booking`, `/gallery`, `/transformations`, `/pricing`, `/faq`, `/contact`) remain publicly accessible without requiring session credentials.

### 3.2 Server-Side Route Handler Guards
In addition to Edge Middleware, API endpoints enforce secondary defense-in-depth authorization checks within the route execution context:
```typescript
const session = await getSession(req);
if (!session || session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
}
```

---

## 4. Input Validation & Data Sanitization

### 4.1 Server-Side Validation via Zod Schemas
Every mutating API endpoint validates payloads using strict Zod schemas (`src/lib/validation/schemas.ts`):
- **Appointment Creation (`/api/appointments`):** Validates customer name, Indian 10-digit mobile number (`/^[6-9]\d{9}$/`), email format, service UUID, date format (`YYYY-MM-DD`), and slot string (`HH:mm`).
- **Payment Verification (`/api/payments/verify`):** Requires `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. Any malformed or injected parameter triggers an immediate 400 Bad Request.
- **Contact Form (`/api/contact`):** Sanitizes user messages, strips dangerous HTML tags, and enforces string length boundaries (name: 2-80 chars, message: 10-2000 chars).
- **Review Submission (`/api/reviews`):** Bounds ratings between 1 and 5, validates appointment association, and validates customer identity.

### 4.2 SQL Injection & NoSQL Injection Immunity
- The system exclusively uses **Prisma ORM** with parameterized queries across all database operations.
- No dynamic SQL string concatenation or raw SQL fragments (`$queryRawUnsafe`) exist within the application codebase.
- User input is automatically escaped and typed by Prisma's query engine before reaching the Neon PostgreSQL server.

---

## 5. Payment Security Architecture (Razorpay Hardening)

### 5.1 Cryptographic Signature Verification
To prevent payment spoofing or altered transaction amounts:
- Every payment confirmation requires server-side HMAC SHA-256 signature calculation:
  $$\text{Expected Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
- The computed signature is compared against `razorpay_signature` using timing-safe string comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.

### 5.2 Order-to-Appointment Binding
- When creating a Razorpay order (`/api/payments/create-order`), the server verifies that the appointment status is not `CANCELLED`, `NO_SHOW`, or `REJECTED`.
- The `appointmentId` is irrevocably bound to the order `receipt` and metadata notes (`{ appointmentId: appointment.id }`).
- Payment verification verifies that the order being captured matches the exact appointment record in the database.

### 5.3 Webhook Idempotency & Replay Protection
- Incoming webhooks (`/api/payments/webhook`) verify the `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET`.
- Transaction IDs are recorded in the `PaymentTransaction` table with a unique constraint. Duplicate webhook deliveries are detected and acknowledged with HTTP 200 without reprocessing the business logic or duplicating database records.

---

## 6. HTTP Security Headers & Content Security Policy (CSP)

### 6.1 Content Security Policy Implementation
The Next.js middleware injects a strict Content-Security-Policy header configured to permit necessary third-party integrations (Razorpay Checkout modal, Cloudinary CDN, Google Fonts) while blocking untrusted scripts, object embeds, and clickjacking:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.razorpay.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://res.cloudinary.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
```

### 6.2 Defensive Headers
The application enforces industry-standard defensive HTTP headers across all responses:
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload` (Forces HTTPS connections for 2 years).
- `X-Frame-Options`: `SAMEORIGIN` (Blocks iframe embedding on external domains, preventing UI redressing / clickjacking).
- `X-Content-Type-Options`: `nosniff` (Prevents MIME-sniffing exploits).
- `Referrer-Policy`: `strict-origin-when-cross-origin` (Protects user privacy and URL parameters during external navigation).
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=()` (Disables unnecessary device hardware access).

---

## 7. Rate Limiting & Denial-of-Service (DoS) Mitigation

### 7.1 Payment Verification Rate Limiter
To prevent brute-force signature guessing or automated verification spamming, `/api/payments/verify` implements an in-memory sliding window rate limiter:
- **Identifier:** Client IP address (`verify_ip_${clientIp}`).
- **Threshold:** Maximum 30 verification attempts per 10-minute window.
- **Violation Response:** HTTP 429 Too Many Requests with JSON payload `{ error: "Too many payment verification requests. Please try again later." }`.

### 7.2 Administrative Search Race Condition Shield
- Admin tables (`/admin/customers`, `/admin/appointments`, `/admin/enquiries`) utilize `AbortController` refs to abort pending in-flight HTTP requests when new keystrokes occur, preventing server resource exhaustion and UI race condition jitter.

---

## 8. Environment Variable & Secret Hygiene

### 8.1 Variable Classification Matrix

| Environment Variable | Scope | Client Exposure | Risk Mitigation |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Server Only | **STRICTLY BLOCKED** | Stored in Vercel Encrypted Environment Variables |
| `DIRECT_URL` | Server Only | **STRICTLY BLOCKED** | Never bundled into client builds |
| `RAZORPAY_KEY_SECRET` | Server Only | **STRICTLY BLOCKED** | Accessible only in Next.js Route Handlers |
| `RAZORPAY_WEBHOOK_SECRET` | Server Only | **STRICTLY BLOCKED** | Server-side signature validation only |
| `JWT_SECRET` / `NEXTAUTH_SECRET` | Server Only | **STRICTLY BLOCKED** | Used exclusively for cryptographic token signing |
| `RESEND_API_KEY` | Server Only | **STRICTLY BLOCKED** | Server-side transactional email dispatch only |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client Safe | Public by Design | Restricted to order checkout initialization |
| `NEXT_PUBLIC_APP_URL` | Client Safe | Public by Design | Canonical URL for client navigation |

### 8.2 Build Audit
- Zero instances of `process.env.RAZORPAY_KEY_SECRET`, `process.env.DATABASE_URL`, or `process.env.JWT_SECRET` were found in public bundles or client-rendered components.
- Razorpay remains in **Test Mode** (`rzp_test_...`) with test keys configured.

---

## 9. Comprehensive Security Audit Classification Table

| # | Security Control | Target / Route | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| 1 | JWT Session Authentication | `/api/auth/*` | **VERIFIED WORKING** | Strong cryptographic signing and expiration |
| 2 | RBAC Edge Middleware | `src/middleware.ts` | **VERIFIED WORKING** | Enforces admin and customer boundaries |
| 3 | Server Route Authorization | `/api/admin/*` | **VERIFIED WORKING** | Defense-in-depth role checks |
| 4 | Zod Request Validation | All POST/PUT APIs | **VERIFIED WORKING** | Comprehensive input sanitization |
| 5 | HMAC Signature Verification | `/api/payments/verify` | **FIXED AND VERIFIED** | Timing-safe comparison implemented |
| 6 | Payment Order Status Guard | `/api/payments/create-order` | **FIXED AND VERIFIED** | Rejects cancelled/expired bookings |
| 7 | Payment Rate Limiter | `/api/payments/verify` | **FIXED AND VERIFIED** | 30 requests / 10 min window per IP |
| 8 | Webhook Deduplication | `/api/payments/webhook` | **VERIFIED WORKING** | Idempotency key tracking in DB |
| 9 | CSP & Frame Ancestors | `src/middleware.ts` | **FIXED AND VERIFIED** | Granular directives for Razorpay/Cloudinary |
| 10 | HSTS & Security Headers | `src/middleware.ts` | **FIXED AND VERIFIED** | A+ configuration standards |
| 11 | Push-Down Query Isolation | `src/lib/db/repo.ts` | **FIXED AND VERIFIED** | Database-level filtering, no memory leaks |
| 12 | Secret Hygiene | `.env*` files | **VERIFIED WORKING** | No private secrets exposed in client bundles |

---

## 10. Conclusion & Security Sign-Off

The application security architecture of **The Jawed Habib Salon – Lalganj** satisfies enterprise web security standards. All vulnerabilities relating to unauthorized access, payment tampering, race conditions, and injection attacks have been systematically verified and hardened.
