# The Jawed Habib Salon – Lalganj
# Complete URL and Webhook Inventory

> **Document Type:** Canonical URL, Webhook Endpoint & Routing Inventory  
> **Canonical Production Origin:** `https://www.thejawedhabibsalons.in`  
> **Physical Branch:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
> **Helpline:** +91 7707000463 | +91 9831722983 | +91 9580000175  
> **Date:** November 15, 2026  

---

## 1. Domain & Environment Base URLs

| Environment | Primary Canonical URL | Alternate / Redirect Origin | HTTPS Enforcement | Config Variable | Code Reference |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Production** | `https://www.thejawedhabibsalons.in` | `https://thejawedhabibsalons.in` (308 redirect) | STRICT (HSTS) | `NEXT_PUBLIC_APP_URL`, `APP_URL` | `src/config/site.ts`, `src/app/layout.tsx` |
| **Preview** | `https://*.vercel.app` (Branch Deployment) | Unique Vercel deployment URL | STRICT | Auto-provided by Vercel | `src/lib/env.ts` |
| **Development** | `http://localhost:3000` | `http://127.0.0.1:3000` | Local HTTP | Fallback in `src/lib/env.ts` | `src/lib/env.ts` |

---

## 2. Webhooks, Scheduled Jobs & External Callbacks

| Endpoint Type | Complete Production URL | Method | Auth & Security | Purpose | Target / Provider |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Razorpay Webhook** | `https://www.thejawedhabibsalons.in/api/webhooks/razorpay` | POST | HMAC SHA-256 (`RAZORPAY_WEBHOOK_SECRET`) | Captures asynchronous payment success, payment failed, refund processed | Razorpay Dashboard Webhook |
| **Daily Cron Reminders** | `https://www.thejawedhabibsalons.in/api/cron/reminders` | GET / POST | Bearer Token (`CRON_SECRET`) | Dispatches 24-hr appointment reminder emails (08:00 AM IST daily) | Vercel Cron (`30 2 * * *`) |
| **Razorpay Preflight** | `https://www.thejawedhabibsalons.in/api/admin/payment-gateway/razorpay/preflight` | GET | Admin JWT Cookie | Diagnostics check of Razorpay credentials & mode | Internal Admin Portal |
| **Payment Verification**| `https://www.thejawedhabibsalons.in/api/payments/verify` | POST | Customer HMAC SHA-256 signature verification | Verifies client Razorpay checkout signature | Razorpay Checkout SDK |
| **Contact Sync Webhook** | `https://www.thejawedhabibsalons.in/api/contact` | POST | Rate limiting + Honeypot + Zod | Submits contact enquiry, triggers email & Google Sheets | Public Website Contact Form |

---

## 3. SEO, Meta & Machine-Readable Endpoints

| Resource | Complete Production URL | Content Type | Purpose | Cache Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **XML Sitemap** | `https://www.thejawedhabibsalons.in/sitemap.xml` | `application/xml` | Indexing guide for Google Search Console & Bing Webmaster | Generated dynamically, 24-hr revalidate |
| **Robots Rules** | `https://www.thejawedhabibsalons.in/robots.txt` | `text/plain` | Crawler directives (allows all public routes, disallows `/admin/*` and `/api/*`) | Static route |
| **Web App Manifest** | `https://www.thejawedhabibsalons.in/manifest.webmanifest` | `application/manifest+json` | PWA installation manifest with brand icons | Static route |
| **OpenGraph Preview** | `https://www.thejawedhabibsalons.in/brand/jawed-habib/brand-preview.webp` | `image/webp` | Social preview image for WhatsApp, iMessage, Facebook, Twitter | Static asset |

---

## 4. Public Website Routes (Canonical URLs)

| Route Path | Canonical Production URL | Purpose |
| :--- | :--- | :--- |
| `/` | `https://www.thejawedhabibsalons.in/` | Luxury Homepage & Service Overview |
| `/services` | `https://www.thejawedhabibsalons.in/services` | Service Menu (Hair, Skin, Spa, Bridal) |
| `/packages` | `https://www.thejawedhabibsalons.in/packages` | Curated Packages & Grooming Bundles |
| `/bridal` | `https://www.thejawedhabibsalons.in/bridal` | Lalganj Bridal Suite & Wedding Grooming |
| `/booking` | `https://www.thejawedhabibsalons.in/booking` | Online Appointment Booking Funnel |
| `/pricing` | `https://www.thejawedhabibsalons.in/pricing` | Transparent Price List in INR (₹) |
| `/gallery` | `https://www.thejawedhabibsalons.in/gallery` | Salon Ambience, Stations & Work Photos |
| `/transformations`| `https://www.thejawedhabibsalons.in/transformations` | Interactive Before & After Comparison Slider |
| `/reviews` | `https://www.thejawedhabibsalons.in/reviews` | Verified Customer Reviews & Testimonials |
| `/offers` | `https://www.thejawedhabibsalons.in/offers` | Active Deals, Promo Codes & Discounts |
| `/contact` | `https://www.thejawedhabibsalons.in/contact` | Salon Address, Contact Form, Google Map |
| `/about` | `https://www.thejawedhabibsalons.in/about` | Heritage, Master Stylists & Lalganj Story |
| `/consultation` | `https://www.thejawedhabibsalons.in/consultation` | Hair & Skin Assessment Questionnaire |
| `/faq` | `https://www.thejawedhabibsalons.in/faq` | Frequently Asked Questions |
| `/team` & `/stylists`| `https://www.thejawedhabibsalons.in/team` | Master Stylists & Salon Team |
| `/terms-and-conditions` | `https://www.thejawedhabibsalons.in/terms-and-conditions` | Official Customer Service Terms |
| `/privacy-policy` | `https://www.thejawedhabibsalons.in/privacy-policy` | Customer Privacy & Data Protection Policy |
| `/cancellation-refund-policy` | `https://www.thejawedhabibsalons.in/cancellation-refund-policy` | Cancellation, Rescheduling & Refund Rules |
| `/shipping-delivery-policy` | `https://www.thejawedhabibsalons.in/shipping-delivery-policy` | Service Delivery & Confirmation Policy |
| `/login` | `https://www.thejawedhabibsalons.in/login` | Customer Portal Sign In |
| `/register` | `https://www.thejawedhabibsalons.in/register` | Customer Account Creation & Loyalty |
| `/forgot-password` | `https://www.thejawedhabibsalons.in/forgot-password` | Password Recovery Request |

---

## 5. Third-Party External Endpoints

| Provider | External Target URL | Protocol | Purpose |
| :--- | :--- | :--- | :--- |
| **Google Maps** | `https://maps.app.goo.gl/TVx48xoWEu8dMvXT9` | HTTPS | Salon physical navigation pin |
| **Instagram** | `https://www.instagram.com/the_jawedhabib_lalganj/` | HTTPS | Official social media presence |
| **WhatsApp** | `https://wa.me/917707000463?text=...` | HTTPS | Instant front-desk chat concierge |
| **Razorpay SDK** | `https://checkout.razorpay.com/v1/checkout.js` | HTTPS | Client-side checkout modal loader |
| **Cloudinary CDN** | `https://res.cloudinary.com/${cloud_name}/image/upload/...` | HTTPS | High-speed responsive media CDN |
| **Resend API** | `https://api.resend.com/emails` | HTTPS | Transactional email REST dispatch |
| **Neon Tech** | `ep-holy-sunset-azrlr93h-pooler.c-3.ap-southeast-1.aws.neon.tech:5432` | TLS | PostgreSQL serverless pooled database connection |

---

## 6. Complete Internal API Route Inventory (98 Routes)

| API Path | Methods | Authentication | Description |
| :--- | :---: | :---: | :--- |
| `/api/admin/analytics` | GET | Admin JWT | Aggregated revenue, customer, and booking analytics |
| `/api/admin/appointments` | GET, POST | Admin JWT | List all appointments, create manual booking |
| `/api/admin/appointments/[id]` | PATCH, DELETE | Admin JWT | Update appointment status, cancel booking |
| `/api/admin/blocked-slots` | GET, POST | Admin JWT | Block dates/hours for maintenance or holidays |
| `/api/admin/blocked-slots/[id]` | DELETE | Admin JWT | Unblock calendar slot |
| `/api/admin/brands` | GET, POST | Admin JWT | Manage partner brands (L'Oréal, Schwarzkopf, etc.) |
| `/api/admin/calendar-settings` | GET, POST, PUT | Admin JWT | Operating hours, slot duration, capacity rules |
| `/api/admin/categories` | GET, POST | Admin JWT | Service category hierarchy management |
| `/api/admin/categories/[id]` | PATCH, DELETE | Admin JWT | Edit/delete category |
| `/api/admin/content` | GET, PUT | Admin JWT | CMS dynamic content key-value store |
| `/api/admin/coupons` | GET, POST | Admin JWT | Create and manage promotional discount coupons |
| `/api/admin/coupons/[id]` | PATCH, DELETE | Admin JWT | Edit coupon code, discount percentage, validity |
| `/api/admin/customers` | GET | Admin JWT | CRM customer list with loyalty tiers |
| `/api/admin/customers/[id]` | GET, PATCH | Admin JWT | Customer profile details, notes, loyalty updates |
| `/api/admin/emails` | GET, POST | Admin JWT | Transactional email outbox inspection and manual trigger |
| `/api/admin/enquiries` | GET | Admin JWT | List contact form submissions and status |
| `/api/admin/enquiries/[id]` | GET, PATCH | Admin JWT | Mark enquiry as contacted, resolved, closed |
| `/api/admin/enquiries/[id]/retry` | POST | Admin JWT | Retry failed email or Google Sheets synchronization |
| `/api/admin/faqs` | GET, POST | Admin JWT | FAQ entry creation and ordering |
| `/api/admin/gallery` | GET, POST | Admin JWT | Media gallery asset management |
| `/api/admin/gallery/bulk` | POST | Admin JWT | Batch gallery upload association |
| `/api/admin/media` | GET, POST | Admin JWT | Admin media library records |
| `/api/admin/media/[id]` | PUT, DELETE | Admin JWT | Edit media metadata or delete asset |
| `/api/admin/offers` | GET, POST | Admin JWT | Special promotional banner management |
| `/api/admin/packages` | GET, POST | Admin JWT | Multi-service package bundle management |
| `/api/admin/payment-gateway/razorpay` | GET, PUT | Admin JWT | View/update gateway mode and encrypted secrets |
| `/api/admin/payment-gateway/razorpay/preflight` | GET | Admin JWT | Preflight readiness check for Razorpay Live mode |
| `/api/admin/payment-gateway/razorpay/test-connection` | POST | Admin JWT | Safe non-mutating test connection probe |
| `/api/admin/payments` | GET | Admin JWT | List all customer transactions and gateway IDs |
| `/api/admin/payments/offline` | POST | Admin JWT | Record in-salon cash, card, or UPI balance collection |
| `/api/admin/payments/[id]` | GET | Admin JWT | Inspect detailed payment transaction record |
| `/api/admin/payments/[id]/refund` | POST | Superadmin JWT | Initiate transaction refund request |
| `/api/admin/reports` | GET | Admin JWT | Financial and booking export reports |
| `/api/admin/reviews` | GET, POST | Admin JWT | Moderate customer reviews (approve/reject) |
| `/api/admin/services` | GET, POST | Admin JWT | Service catalog pricing, duration, and details |
| `/api/admin/settings` | GET, PUT | Admin JWT | Core salon configuration parameters |
| `/api/admin/staff` | GET, POST | Admin JWT | Stylist profiles, shifts, and specialty tags |
| `/api/admin/transformations` | GET, POST | Admin JWT | Before & After paired transformation management |
| `/api/admin/upload` | POST | Admin JWT | Server-side Cloudinary media asset upload |
| `/api/admin/users` | GET, POST | Superadmin JWT | Manage staff administrator login credentials |
| `/api/appointments` | GET, POST | Public / Customer | Query availability, create pending reservation |
| `/api/appointments/[id]` | GET, PATCH | Customer JWT | View customer appointment, request reschedule |
| `/api/appointments/availability` | GET | Public | Dynamic time-slot availability calculation |
| `/api/appointments/hold` | POST, DELETE | Public | 15-minute temporary slot hold during checkout |
| `/api/auth/login` | POST | Public | Authenticate customer or admin via email/password |
| `/api/auth/logout` | POST | Public | Clear JWT authentication cookie |
| `/api/auth/me` | GET | Session Cookie | Return authenticated user identity & role |
| `/api/auth/register` | POST | Public | Register new customer account |
| `/api/auth/forgot-password` | POST | Public | Send password reset token email |
| `/api/auth/reset-password` | POST | Public | Update password using verified token |
| `/api/bridal/bookings` | GET | Admin JWT | Dedicated bridal reservation list |
| `/api/bridal/payments/collect-remaining` | POST | Admin JWT | Collect and record balance due on bridal package |
| `/api/bridal/services` | GET, POST | Public / Admin | Query or manage bridal suite packages |
| `/api/categories` | GET | Public | Public service categories with active counts |
| `/api/consultation/recommend` | POST | Public | AI/rule-based hair & skin package recommendation |
| `/api/contact` | POST | Public | Submit contact form, save DB, dispatch email & Sheets |
| `/api/content` | GET | Public | Fetch dynamic CMS text, hours, address, phone |
| `/api/coupons` | GET | Public | Fetch publicly visible promo codes |
| `/api/coupons/validate` | POST | Public | Validate coupon code against order value |
| `/api/cron/reminders` | GET, POST | Bearer CRON_SECRET | Daily automated reminder email dispatcher |
| `/api/enquiries` | POST | Public | Submit general customer enquiry |
| `/api/estimate-price` | POST | Public | Calculate live cart price with taxes and discounts |
| `/api/faqs` | GET | Public | Fetch active FAQs by category |
| `/api/gallery` | GET | Public | Fetch categorized salon work photos |
| `/api/health` | GET | Public | Serverless container health & version check |
| `/api/health/database` | GET | Public | Neon PostgreSQL connection latency probe |
| `/api/notifications` | GET, PATCH | Admin JWT | Front-desk real-time alert notifications |
| `/api/offers` | GET | Public | Active promotional banners and discounts |
| `/api/packages` | GET | Public | Multi-service package bundles |
| `/api/payments/create-order` | POST | Public / Customer | Server-side Razorpay order creation |
| `/api/payments/receipt/[id]` | GET | Public / Signed | View digital payment receipt PDF/HTML |
| `/api/payments/verify` | POST | Public / Customer | Timing-safe HMAC-SHA256 signature verification |
| `/api/reviews` | GET, POST | Public | View approved reviews, submit customer review |
| `/api/services` | GET | Public | Complete active services list with prices in INR |
| `/api/staff` | GET | Public | Stylist roster with specialties |
| `/api/transformations` | GET | Public | Paired Before & After image transformations |
| `/api/webhooks/razorpay` | POST | HMAC Signature | Authoritative payment gateway event receiver |
