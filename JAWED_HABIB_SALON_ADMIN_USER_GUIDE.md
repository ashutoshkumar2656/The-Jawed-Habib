# THE JAWED HABIB SALON – LALGANJ
## Official Salon Owner & Manager Administration Manual

> **Document Type:** Salon Owner & Front Desk Operations Guide  
> **Brand Entity:** The Jawed Habib Salon  
> **Branch Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
> **Official Operating Hours:** Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days)  
> **Front Desk Direct Contact:** `7707000463` | `9831722983` | `9580000175`  
> **Public Website:** `https://www.thejawedhabibsalons.in`  
> **Admin Portal Access:** `https://www.thejawedhabibsalons.in/admin/login`  

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Admin Portal Access](#2-admin-portal-access)
3. [Login and Logout Procedures](#3-login-and-logout-procedures)
4. [Dashboard Overview](#4-dashboard-overview)
5. [Booking Management](#5-booking-management)
6. [Calendar & Availability Management](#6-calendar--availability-management)
7. [Customer CRM Management](#7-customer-crm-management)
8. [The Appointment Lifecycle State Machine](#8-the-appointment-lifecycle-state-machine)
9. [Online and Counter Payments](#9-online-and-counter-payments)
10. [Services Management](#10-services-management)
11. [Service Categories](#11-service-categories)
12. [Packages Management](#12-packages-management)
13. [Service Add-ons](#13-service-add-ons)
14. [Staff & Stylists Management](#14-staff--stylists-management)
15. [Media Library & Cloudinary Assets](#15-media-library--cloudinary-assets)
16. [Before & After Hair Transformations](#16-before--after-hair-transformations)
17. [Reviews & Customer Testimonials Moderation](#17-reviews--customer-testimonials-moderation)
18. [Customer Enquiries & Bridal Leads](#18-customer-enquiries--bridal-leads)
19. [Website Content Management (CMS)](#19-website-content-management-cms)
20. [Real-Time Notifications & Operational Alerts](#20-real-time-notifications--operational-alerts)
21. [Salon Coordinates & Business Settings](#21-salon-coordinates--business-settings)
22. [Users, Roles & Security Permissions](#22-users-roles--security-permissions)
23. [Reports, Ledger & Financial Exports](#23-reports-ledger--financial-exports)
24. [Common Problems & Instant Solutions](#24-common-problems--instant-solutions)
25. [Daily Salon Opening Checklist (10:00 AM)](#25-daily-salon-opening-checklist-1000-am)
26. [Daily Salon Closing Checklist (10:00 PM)](#26-daily-salon-closing-checklist-1000-pm)
27. [Security & Customer Privacy Directives](#27-security--customer-privacy-directives)
28. [Support Escalation & Concierge Directory](#28-support-escalation--concierge-directory)

---

## 1. Introduction

Welcome to **The Jawed Habib Salon – Lalganj** Digital Management System. 

This portal enables salon owners, managers, and front-desk receptionists to manage daily salon operations at our luxury studio at Tinpulwa Chowk, Lalganj. The system automates online VIP appointments, customer check-ins, chair scheduling, Razorpay online advance payments, counter cash collections, Before & After transformation showcases, customer CRM profiles, and marketing content.

---

## 2. Admin Portal Access

The Admin Portal is a secure, private section of the website accessible on computers, tablets, and mobile phones.

- **URL:** Navigate to `https://www.thejawedhabibsalons.in/admin/login` (or click "Salon Manager" in the footer).
- **Supported Browsers:** Google Chrome, Safari, Microsoft Edge, and Firefox.
- **Recommended Devices:** Front-desk desktop PC, salon iPad/tablet, or manager's smartphone.

---

## 3. Login and Logout Procedures

### Logging In
1. Open `https://www.thejawedhabibsalons.in/admin/login`.
2. Enter your authorized administrator **Phone Number** (or Email) and **Password**.
3. (Optional) Check **"Remember this device"** on trusted salon hardware.
4. Click the gold **"Sign In to Management Portal"** button.
5. Upon successful verification, you will be automatically directed to the **Operations Dashboard**.

### Logging Out
To protect salon and customer data, always log out when leaving the front-desk terminal unattended:
- **On Desktop:** Click the **"Logout"** icon button at the bottom of the left sidebar or in the top-right header bar.
- **On Mobile:** Open the menu drawer and tap **"Logout"**.
- Your session cookie is revoked immediately and you will return to the secure login screen.

---

## 4. Dashboard Overview

The **Dashboard** (`/admin/dashboard`) provides a real-time overview of the salon's daily pulse.

### Key Performance Cards:
- **Total Bookings:** All-time reservations logged across online and in-salon channels.
- **Today's Bookings:** Number of clients scheduled to visit the salon today.
- **Upcoming Bookings:** Verified appointments scheduled for future dates.
- **Confirmed Bookings:** Active appointments ready for stylist assignment.
- **Pending Confirmation:** Inquiries or reservations requiring front-desk attention.
- **Advance Collected:** Total online advance deposits collected via Razorpay.
- **Outstanding Balances:** Remaining service amounts to collect at the counter upon service completion.

### Quick Actions:
- **"New Booking" Button:** Instantly opens the booking modal to log a walk-in or telephone client.
- **"Full Calendar" Button:** Jumps directly to the interactive 30-minute chair schedule.

---

## 5. Booking Management

Located at `/admin/bookings`, this hub controls every customer appointment in the salon.

### Filtering and Search:
- **Search Bar:** Type a customer name, mobile number, or booking reference (e.g., `JH-LLG...`). In-flight search requests are debounced to prevent interface lag.
- **Status Tabs:** Filter bookings by `ALL`, `TODAY`, `UPCOMING`, `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED`, or `CANCELLED`.

### Step-by-Step Operations:
1. **Locate Customer Booking:** Search the client by mobile number upon arrival.
2. **Review Service Details:** Inspect selected haircut, bridal package, or chemical treatment and advance payment status.
3. **Change Operational Status:** Use the action buttons (`Check-In`, `Start Service`, `Complete Service`).

---

## 6. Calendar & Availability Management

Located at `/admin/calendar`, this module visualizes all styling chairs and bridal suites across time.

### Available Views:
- **Day View:** Hour-by-hour breakdown of chair occupancy.
- **Week View:** 7-day layout tracking daily capacity.
- **Month View:** High-level monthly schedule.

### Blocking Dates & Holidays:
1. Click the **"Holidays & Blocked Dates"** tab.
2. Select a date and enter the reason (e.g., *"Festival Renovation"* or *"Deep Sanitation"*).
3. Click **"Save Blocked Date"**. The date will immediately become unavailable on the public website.

### Operating Hours Rules:
- The salon operates **Monday to Sunday, 10:00 AM – 10:00 PM (All 7 Days)**.
- Slot intervals are fixed at **30-minute intervals** (`10:00`, `10:30`, `11:00`, ..., `21:30`).

---

## 7. Customer CRM Management

Located at `/admin/customers`, this directory tracks your client relationships.

### Customer Records Include:
- Full Name and 10-digit Indian Mobile Number.
- Email Address and VIP Tier status.
- Lifetime Visit Count and Total Revenue Generated.
- Complete Appointment History and Stylist Notes (e.g., *"Prefers ammonia-free hair color"*).

### Adding a Walk-In Customer:
1. Click **"Add Walk-In Client"**.
2. Enter Name, Phone (`98...`), and Gender.
3. Click **"Save Customer Profile"**.

---

## 8. The Appointment Lifecycle State Machine

Appointments progress through a strict, deterministic sequence:

| Status | What It Means | Required Action by Salon Staff |
| :--- | :--- | :--- |
| **`PENDING`** | Online booking initiated; awaiting advance payment. | Held for 60 minutes. If unpaid, released automatically. |
| **`CONFIRMED`** | Advance paid or walk-in authorized. | Stylist assigned; prepare station before client arrival. |
| **`CHECKED_IN`**| Customer has physically entered Tinpulwa Chowk studio. | Greet client, offer beverage, notify assigned stylist. |
| **`IN_PROGRESS`**| Client is in styling chair or bridal suite receiving service. | Chair locked; no online double booking possible. |
| **`COMPLETED`** | Service finished; client ready for billing. | Direct client to counter to settle remaining balance. |
| **`CANCELLED`** | Client cancelled or 60-min holding window expired. | Slot released back to public availability pool. |
| **`NO_SHOW`** | Customer did not arrive within 30 minutes of slot time. | Mark as no-show to free up chair for walk-in clients. |

---

## 9. Online and Counter Payments

### Online Advance Payments (Razorpay)
- Customers pay an advance deposit online (default ₹1,000) when booking through the website.
- The system automatically captures the payment and updates the booking status to `CONFIRMED`.
- Money is deposited directly into the salon's bank account linked to Razorpay.

### Counter Payments (Cash / UPI / Card)
When a service is completed, the remaining balance must be collected at the counter:
1. Open the appointment in `/admin/bookings`.
2. Inspect the **"Remaining Balance"** field.
3. Click **"Record Counter Payment"**.
4. Select the payment method (`CASH`, `UPI_QR`, or `CARD_POS`).
5. Enter the amount collected and click **"Confirm Payment"**.
6. Balance updates to ₹0, and a digital receipt is recorded.

---

## 10. Services Management

Located at `/admin/services`, this module controls your service menu and rates.

### Adding or Editing a Service:
1. Click **"Add New Service"** (or click the edit icon on an existing service).
2. Enter the **Service Name** (e.g., *"Keratin Protein Treatment"*).
3. Select the **Category** and **Target Gender** (Unisex, Female, Male, Kids).
4. Enter the **Price (₹)** and **Duration (Minutes)**.
5. Toggle **"Allow Online Booking"** (enable for standard services, disable for consultation-only treatments).
6. Click **"Save Service"**.

---

## 11. Service Categories

Categories organize your menu on the public website:
- **Hair Styling & Cuts:** Classic haircuts, blowouts, beard grooming.
- **Hair Care & Keratin:** Spa treatments, Olaplex, Botox, smoothening.
- **Hair Coloring:** Global color, highlights, balayage.
- **Skin & Facial:** Radiance facials, cleanups, detan therapies.
- **Bridal Artistry:** VIP bridal and groom makeover suites.

---

## 12. Packages Management

Located at `/admin/packages`, this section manages multi-service combos.
- Combine popular services at a bundle discount (e.g., *Pre-Bridal Glow Combo: Facial + Hair Spa + Manicure*).
- Specify bundle savings to encourage higher average customer spend.

---

## 13. Service Add-ons

Add-ons appear during online booking to increase ticket size:
- Examples: *"Deep Conditioning Mask (+₹500)"*, *"Beard Serum Infusion (+₹200)"*.
- Can be added to individual services with one click.

---

## 14. Staff & Stylists Management

Located at `/admin/staff`, this section tracks your salon team:
- Manage stylists, senior colorists, and beauty therapists.
- Assign specific skills to staff members so the booking engine only assigns qualified personnel.
- Track daily stylist workload and client feedback ratings.

---

## 15. Media Library & Cloudinary Assets

Located at `/admin/media`, this repository organizes all imagery displayed across the website.

### Media Folders:
- **Bridal Artistry:** Photos of brides, lehenga styling, HD makeup.
- **Salon Interior:** High-resolution photos of Tinpulwa Chowk studio and styling stations.
- **Hero & Experience:** Video clips and banner photography.
- **Services:** Hair treatment and haircut process photos.

### Uploading New Photos:
1. Click **"Upload New Media"**.
2. Select destination folder and upload image file (or paste Cloudinary URL).
3. Enter title and descriptive alt text.
4. Click **"Confirm & Save Asset"**.

---

## 16. Before & After Hair Transformations

Located at `/admin/media` (under the **Before & After** tab) and `/admin/transformations`.

### Adding a New Transformation:
1. Open `/admin/media` and select the **"Before & After"** folder.
2. Click **"Create Transformation"**.
3. Enter a descriptive title (e.g., *"Balayage Color Correction & Gloss"*).
4. Enter the **Before Image URL** (photo of client upon arrival).
5. Enter the **After Image URL** (photo of final completed styling).
6. Select Gender and Category.
7. Click **"Save Transformation"**.
8. The transformation immediately appears on the public website with the interactive drag slider!

---

## 17. Reviews & Customer Testimonials Moderation

Located at `/admin/reviews`, this hub manages customer testimonials.
- **Approve Feedback:** Review new customer submissions and click **"Approve"** to publish them to the website.
- **Feature Reviews:** Click the star icon to pin top 5-star testimonials directly onto the homepage.
- **Source Badges:** Reviews display source tags (*Google Maps*, *Salon Guestbook*, or *Verified Website*).

---

## 18. Customer Enquiries & Bridal Leads

Located at `/admin/enquiries`, this module captures website contact submissions and bridal consultations.

### Managing Leads:
- **Status Workflow:** Transition leads from `NEW` → `CONTACTED` → `SCHEDULED` → `RESOLVED`.
- **Admin Notes:** Write notes regarding client conversation (e.g., *"Client requested wedding trial on Saturday"*).
- **Google Sheets Sync:** Synchronizes incoming leads with your configured front-desk spreadsheet.

---

## 19. Website Content Management (CMS)

Located at `/admin/content`, this editor allows you to update website announcements without editing code.

### Editable Sections:
- **Top Announcement Bar:** Update seasonal announcements (e.g., *"✨ Wedding Season Booking Open"*).
- **Hero Section Headlines:** Update main tagline, subtext, and banner buttons.
- **Promo Banners:** Configure seasonal festive offers (Diwali, Eid, Chhath Puja).
- **Contact & Desk Phone:** Update front desk numbers and opening hours.

---

## 20. Real-Time Notifications & Operational Alerts

The **Notification Bell** in the top-right header alerts front-desk staff in real time:
- **New Online Bookings:** Alerts when a client books an appointment online.
- **Advance Payment Verified:** Confirms successful Razorpay deposits.
- **Late Payment Alerts:** Alerts staff if an expired booking received payment, allowing the team to contact the client immediately.
- Click **"Mark all read"** once items are attended to.

---

## 21. Salon Coordinates & Business Settings

Located at `/admin/settings`.
- **Permanent Address:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121.
- **Hotline Numbers:** `7707000463`, `9831722983`, `9580000175`.
- **Instagram:** `@the_jawedhabib_lalganj`.
- **Google Maps:** [https://maps.app.goo.gl/TVx48xoWEu8dMvXT9](https://maps.app.goo.gl/TVx48xoWEu8dMvXT9).

---

## 22. Users, Roles & Security Permissions

Located at `/admin/settings` under the **"Users & Roles"** tab.
- **SUPER_ADMIN (Owner):** Full access to financials, Razorpay settings, and user management.
- **MANAGER:** Can manage bookings, calendar, staff, and content, but cannot alter gateway credentials.
- **RECEPTIONIST:** Restricted to checking in clients, booking appointments, and logging counter payments.

---

## 23. Reports, Ledger & Financial Exports

Located at `/admin/reports`.
- **Financial Analytics:** Gross booked revenue, net collected revenue, advance deposits, and outstanding balances.
- **Operational Metrics:** Total appointments, completion rate, and cancellation rate.
- **One-Click CSV Export:**
  - `Export Bookings CSV`: Complete list of client visits and services.
  - `Export Payments CSV`: Detailed financial ledger of online and cash transactions.
  - `Export Customers CSV`: Client contact directory for promotional SMS/WhatsApp campaigns.

---

## 24. Common Problems & Instant Solutions

| Problem | Root Cause | Safe Recovery Step |
| :--- | :--- | :--- |
| **Client paid advance online but booking shows Pending** | Delayed bank callback or network interruption. | Check `/admin/payments` for the transaction ID. If verified, manually change status to `CONFIRMED`. |
| **Customer cannot find an available slot** | All chairs booked or time is outside operating hours. | Check `/admin/calendar` to see if an existing booking can be rescheduled or chair capacity expanded. |
| **Search results not updating in CRM** | Search query string too short. | Type at least 3 digits of the phone number or 3 letters of the client's name. |
| **Transformation image not displaying** | Invalid image URL format. | Ensure the URL begins with `https://res.cloudinary.com/...` or is a valid image link. |
| **Need to close salon early for an event** | Holiday / event emergency. | Open `/admin/calendar`, navigate to "Holidays", and block the remaining slots for today. |

---

## 25. Daily Salon Opening Checklist (10:00 AM)

- [ ] Turn on salon front-desk terminal / iPad and connect to stable high-speed Wi-Fi.
- [ ] Log in to `https://www.thejawedhabibsalons.in/admin/dashboard`.
- [ ] Check **Today's Bookings** count and review the morning schedule.
- [ ] Inspect the **Notification Bell** for any bookings made overnight.
- [ ] Confirm stylist assignments for morning appointments.
- [ ] Check sanitized styling stations and bridal suites.

---

## 26. Daily Salon Closing Checklist (10:00 PM)

- [ ] Open `/admin/bookings` and ensure all finished appointments are transitioned to `COMPLETED`.
- [ ] Verify that counter cash and UPI collections match the **Outstanding Balance Collected** in reports.
- [ ] Mark any unattended appointments as `NO_SHOW` or `CANCELLED`.
- [ ] Review upcoming appointments for tomorrow (10:00 AM onwards).
- [ ] Click the **Logout** button on all shared salon tablets and terminals.

---

## 27. Security & Customer Privacy Directives

1. **Protect Admin Passwords:** Never share your manager password on sticky notes or WhatsApp.
2. **Customer Data Privacy:** Client phone numbers must never be shared with third parties or unauthorized personnel.
3. **Lock Shared Devices:** Always log out or lock the screen when stepping away from the front desk.
4. **Never Alter Razorpay Keys:** Only authorized owners should access `/admin/settings/payment-gateway`.

---

## 28. Support Escalation & Concierge Directory

For immediate assistance or technical escalation:

| Channel | Contact Coordinates |
| :--- | :--- |
| **Primary Desk Phone** | **+91 7707000463** |
| **Secondary Helpline** | **+91 9831722983** |
| **Executive Management** | **+91 9580000175** |
| **Official WhatsApp** | **+91 7707000463** |
| **Physical Salon** | **1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121** |

---
*Manual compiled and verified for The Jawed Habib Salon – Lalganj Executive Operations.*
