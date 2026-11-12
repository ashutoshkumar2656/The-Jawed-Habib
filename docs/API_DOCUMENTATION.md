# API Inventory & Endpoint Documentation: The Jawed Habib Salon – Lalganj

> **Document Status**: Production Verified  
> **API Architecture**: Next.js App Router Route Handlers (Node.js Runtime)  
> **Total Endpoints Documented**: 93 Route Handlers across Public, Customer, and Administrative Services  
> **Developer Attribution**: Designed & Developed by [Axivon Technologies](https://axivontech.in)

---

## 1. Authentication & Identity APIs (`/api/auth/*`)

| Endpoint | Method | Purpose | Authentication | Database Operations | Status |
| :--- | :---: | :--- | :---: | :--- | :---: |
| `/api/auth/register` | `POST` | Registers new customer with loyalty profile | Public | Creates `User` and `CustomerProfile` records. | Verified |
| `/api/auth/login` | `POST` | Authenticates user; issues JWT in HttpOnly cookie | Public (Rate Limited) | Queries `User` by phone/email; checks bcrypt hash. | Verified |
| `/api/auth/logout` | `POST` | Clears `habib_session_token` session cookie | Public | Sets cookie `maxAge: 0`. | Verified |
| `/api/auth/me` | `GET` | Retrieves authenticated user profile & roles | Session Cookie / Bearer | Reads `User`, `CustomerProfile`, or `Staff` records. | Verified |
| `/api/auth/forgot-password`| `POST`| Initiates password reset PIN dispatch | Public | Checks `User` presence; returns generic confirmation. | Verified |
| `/api/auth/reset-password` | `POST`| Updates password hash using verified PIN | Public | Updates `User.passwordHash` with new bcrypt hash. | Verified |

---

## 2. Public Storefront & Marketing APIs

| Endpoint | Method | Purpose | Authentication | Database Operations | Status |
| :--- | :---: | :--- | :---: | :--- | :---: |
| `/api/services` | `GET` | Lists published salon services with categories | Public | Reads `Service` (filtered by `isActive: true`). | Verified |
| `/api/services/[id]` | `GET` | Retrieves detailed service info and pricing | Public | Reads `Service` with `ServiceCategory`. | Verified |
| `/api/packages` | `GET` | Lists curated bridal packages with inclusions | Public | Reads `Package` records. | Verified |
| `/api/categories` | `GET` | Lists service taxonomy categories | Public | Reads `ServiceCategory` ordered by `displayOrder`.| Verified |
| `/api/content` | `GET` | Fetches dynamic CMS content for website sections| Public | Reads `SiteSetting` key-value pairs. | Verified |
| `/api/brands` | `GET` | Lists brand partnership logos (L'Oréal, etc.) | Public | Reads `Brand` records. | Verified |
| `/api/gallery` | `GET` | Returns salon interior and station photos | Public | Reads `GalleryImage` records. | Verified |
| `/api/videos` | `GET` | Lists promotional reels and YouTube video URLs | Public | Reads `Video` records. | Verified |
| `/api/transformations` | `GET` | Returns real bride before/after image pairs | Public | Reads `Transformation` records. | Verified |
| `/api/faqs` | `GET` | Returns frequently asked questions | Public | Reads `Faq` records grouped by category. | Verified |
| `/api/offers` | `GET` | Returns active seasonal bridal discount offers | Public | Reads `Offer` records within valid dates. | Verified |
| `/api/staff` | `GET` | Lists master stylists and Habib certifications | Public | Reads `Staff` with public user display names. | Verified |
| `/api/reviews` | `GET` | Lists approved customer testimonials | Public | Reads `Review` records. | Verified |
| `/api/reviews` | `POST` | Submits new client rating and review | Customer Auth / Guest | Creates `Review` record pending moderation. | Verified |
| `/api/enquiries` | `POST` | Submits bridal consultation request | Public | Validates and creates `Enquiry` record. | Verified |
| `/api/consultation/recommend`| `POST`| AI/rule-based bridal service recommendation | Public | Computes service recommendations from answers. | Verified |
| `/api/estimate-price` | `POST` | Dynamic pricing calculation with add-ons | Public | Aggregates base prices, package savings, taxes. | Verified |
| `/api/coupons` | `GET` | Lists publicly available discount codes | Public | Reads active `Coupon` records. | Verified |
| `/api/coupons/validate`| `POST`| Validates promo code against cart subtotal | Public | Verifies minimum spend, expiry date, discount. | Verified |
| `/api/health` | `GET` | Infrastructure health check endpoint | Public | Returns status 200 `{ status: "ok" }`. | Verified |

---

## 3. Booking & Scheduling APIs

| Endpoint | Method | Purpose | Authentication | Database Operations | Status |
| :--- | :---: | :--- | :---: | :--- | :---: |
| `/api/appointments/availability` | `GET` | Computes available 30-min slots for a given date | Public | Evaluates `CalendarSettingRecord`, `Appointment`, and `BlockedSlot`. | Verified |
| `/api/appointments/hold` | `POST` | Holds slot for 10 minutes during checkout | Public | Inserts record into `TimeSlotHoldRecord`. | Verified |
| `/api/appointments/hold` | `DELETE`| Releases hold if customer aborts checkout | Public | Deletes record from `TimeSlotHoldRecord`. | Verified |
| `/api/appointments` | `POST` | Creates appointment booking in `PENDING_PAYMENT`| Public / Customer | Creates `Appointment` and `AppointmentService`. | Verified |
| `/api/appointments` | `GET` | Lists customer appointments | Customer Auth | Queries `Appointment` by customer phone/user ID. | Verified |
| `/api/appointments/[id]`| `GET` | Retrieves full appointment details | Customer Auth | Reads `Appointment` with services and payment records.| Verified |
| `/api/appointments/[id]`| `PATCH` | Reschedules customer appointment date/time | Customer Auth | Updates `Appointment.appointmentDate` and slot. | Verified |

---

## 4. Payment Processing APIs (`/api/payments/*` & `/api/webhooks/*`)

| Endpoint | Method | Purpose | Authentication | Database Operations | Status |
| :--- | :---: | :--- | :---: | :--- | :---: |
| `/api/payments/create-order` | `POST` | Authorizes Razorpay order for advance deposit | Public / Booking Session | Inserts `RazorpayOrderRecord`; sets order amount. | Verified |
| `/api/payments/verify` | `POST` | Verifies HMAC-SHA256 signature and captures payment | Public / Booking Session | Updates `Appointment.paymentStatus` to `PAID` or `PARTIALLY_PAID`; updates `RazorpayOrderRecord`. | Verified |
| `/api/payments/receipt/[id]`| `GET` | Retrieves verified digital transaction receipt | Public / Client Session | Reads `Appointment`, `PaymentRecord`, and gateway reference. | Verified |
| `/api/webhooks/razorpay` | `POST` | Processes Razorpay webhook notifications (`payment.captured`, `payment.failed`, `refund.processed`)| Webhook Signature Header (`X-Razorpay-Signature`) | Verifies signature, logs `WebhookEventRecord`, updates `Appointment`. | Verified |

---

## 5. Bridal Suite & Counter Payments (`/api/bridal/*`)

| Endpoint | Method | Purpose | Authentication | Database Operations | Status |
| :--- | :---: | :--- | :---: | :--- | :---: |
| `/api/bridal/bookings` | `GET` | Lists bridal appointments with advance/balance split | Admin RBAC | Reads `Appointment` where `isBridal: true`. | Verified |
| `/api/bridal/services` | `GET` | Lists bridal service catalog | Admin RBAC | Reads `Service` where `isBridal: true`. | Verified |
| `/api/bridal/services` | `POST` | Creates new bridal service or package | Admin RBAC | Inserts `Service` record with deposit thresholds. | Verified |
| `/api/bridal/services/[id]`| `PUT/PATCH`| Edits bridal service pricing and descriptions | Admin RBAC | Updates `Service` pricing, deposit limits, isActive. | Verified |
| `/api/bridal/services/[id]`| `DELETE` | Removes service from bridal catalog | Admin RBAC | Deletes or archives `Service` record. | Verified |
| `/api/bridal/payments/collect-remaining` | `POST` | Records counter balance payment at reception (Cash / UPI) | Admin RBAC | Inserts `OfflinePaymentRecord`, marks `Appointment` status `PAID` and `COMPLETED`. | Verified |

---

## 6. Administrative Control Center APIs (`/api/admin/*`)

*All `/api/admin/*` endpoints strictly enforce administrative authorization via `checkAdminAuth(req)`.*

| Endpoint | Method | Purpose | Database Operations |
| :--- | :---: | :--- | :--- |
| `/api/admin/analytics` | `GET` | Aggregated dashboard metrics, visits, revenue | Reads `Appointment` count, revenue sums, stylists. |
| `/api/admin/appointments` | `GET` | Paginated appointments list with search/filter | Reads `Appointment` with customer and service joins. |
| `/api/admin/appointments` | `POST` | Creates walk-in or manual salon appointment | Inserts `Appointment` with `BookingSource: WALK_IN`. |
| `/api/admin/appointments/[id]` | `PATCH` | Reschedules appointment date/time or updates status | Updates `Appointment.status`, `staffId`, notes. |
| `/api/admin/appointments/[id]` | `DELETE` | Cancels appointment booking with reason | Updates `Appointment.status = CANCELLED`, logs audit. |
| `/api/admin/calendar-settings` | `GET,POST,PUT`| Configures weekly hours (10 AM - 10 PM), slot intervals | Reads/Updates `CalendarSettingRecord`. |
| `/api/admin/blocked-slots` | `GET,POST` | Retrieves or creates manual time block-outs | Reads/Inserts `BlockedSlot` records. |
| `/api/admin/blocked-slots/[id]`| `DELETE` | Releases blocked time slot | Deletes `BlockedSlot` record. |
| `/api/admin/customers` | `GET` | Lists customer profiles with visit metrics | Reads `CustomerProfile` with `User` data. |
| `/api/admin/customers/[id]` | `PATCH` | Updates stylist notes and loyalty preferences | Updates `CustomerProfile.notes`. |
| `/api/admin/services` | `GET,POST` | Lists and creates general/bridal salon services | Reads/Inserts `Service` records. |
| `/api/admin/services/[id]` | `PATCH,DELETE`| Modifies or deletes service record | Updates/Deletes `Service` record. |
| `/api/admin/packages` | `GET,POST` | Manages curated bridal package suites | Reads/Inserts `Package` records. |
| `/api/admin/packages/[id]` | `PATCH,DELETE`| Updates package pricing, inclusions, visibility | Updates/Deletes `Package` record. |
| `/api/admin/payment-gateway/razorpay` | `GET,PUT` | Manages Razorpay credentials with AES-256-GCM | Reads masked keys; encrypts and saves secrets. |
| `/api/admin/payment-gateway/razorpay/test-connection` | `POST` | Verifies test credentials against Razorpay API | Performs authenticated REST call to Razorpay sandbox. |
| `/api/admin/payments` | `GET` | Financial transaction ledger with gateway ref | Reads `PaymentRecord` and `OfflinePaymentRecord`. |
| `/api/admin/payments/offline`| `POST` | Records cash/UPI counter payment | Inserts `OfflinePaymentRecord`. |
| `/api/admin/payments/[id]/refund` | `POST` | Initiates gateway refund via Razorpay API | Calls Razorpay refund API; inserts `PaymentRefundRecord`. |
| `/api/admin/content` | `GET,POST,PUT`| Updates dynamic website CMS text | Reads/Updates `SiteSetting` key-value pairs. |
| `/api/admin/media` | `GET,POST` | Media asset catalog; registers uploads | Reads/Inserts `GalleryImage` / `Media` records. |
| `/api/admin/media/[id]` | `PUT,DELETE` | Updates metadata or deletes media asset | Updates/Deletes media asset record. |
| `/api/admin/reports` | `GET` | Generates comprehensive operational report data | Aggregates appointments, revenue, and customer stats. |
| `/api/admin/reviews` | `GET,POST` | Moderates customer reviews (Approve/Reject) | Updates `Review.status = APPROVED` / deletes. |
| `/api/admin/reviews/[id]` | `PUT,PATCH,DELETE`| Updates or removes customer review | Updates/Deletes `Review` record. |
| `/api/admin/users` | `GET,POST` | Manages administrative user accounts & RBAC | Reads/Creates `User` records with role assignments. |
| `/api/admin/staff` | `GET,POST` | Manages salon stylists and certifications | Reads/Inserts `Staff` records. |
| `/api/admin/staff/[id]` | `PATCH,DELETE`| Updates stylist experience, rating, availability | Updates/Deletes `Staff` record. |
| `/api/admin/transformations` | `GET,POST` | Manages Before/After transformation cards | Reads/Inserts `Transformation` records. |
| `/api/admin/transformations/[id]`| `PATCH,DELETE`| Updates or removes transformation pair | Updates/Deletes `Transformation` record. |
| `/api/admin/upload` | `POST` | Multipart file upload handler (Local / Cloudinary) | Saves file to disk or dispatches to Cloudinary CDN. |
| `/api/admin/settings` | `GET,POST,PUT`| Manages verified salon contact and address info | Reads/Updates salon configuration in `SiteSetting`. |
| `/api/admin/notifications` | `GET,PATCH` | Reads and marks system notifications as read | Reads/Updates `Notification` records. |
