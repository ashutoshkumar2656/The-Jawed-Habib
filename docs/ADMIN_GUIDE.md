# Salon Manager & Administrator Guide: The Jawed Habib Salon – Lalganj

**Target Audience**: Salon Owners, Branch Managers, Head Receptionists, and Master Stylists  
**Access URL**: `http://localhost:3000/admin/dashboard` (or `https://thejawedhabib-lalganj.com/admin/dashboard`)  
**Default Super Admin Phone**: `7707000463`  
**Default Password**: `Admin@Habib2026!` (Change immediately upon initial login)  

---

## 1. Navigating the Admin Console

The admin platform features a responsive dark-luxury dashboard with champagne gold accents. The left sidebar is partitioned into 5 operational domains:

1. **Operations**: Dashboard, Appointments, Staff Roster, Inbound Leads, BI Analytics.
2. **Client Relations**: Customer CRM, Review Moderation.
3. **Catalog & Media**: Services & Pricing, Ambience Gallery, Before & After Transformations.
4. **Marketing & Retention**: Offers & Campaigns, Combo Packages, Coupons, VIP Memberships, Loyalty Engine, Gift Cards.
5. **Administration**: Website CMS, Salon Settings, Privileged Users.

---

## 2. Day-to-Day Operations Workflow

### Handling New Bookings (`/admin/appointments`)
When a client books online, their appointment arrives with the status `PENDING`.
1. Navigate to **Appointments**.
2. Review the client's requested date, slot time, and requested services.
3. Click the **Confirm Booking** button (turns green / `CONFIRMED`).
4. If a specific stylist is requested, verify their floor availability in **Staff Directory**.
5. Once the client arrives and completes their haircut or spa treatment:
   - Click **Mark Completed**.
   - The system automatically marks payment as `PAID`, credits loyalty reward points to the client's profile (1 point per ₹10 spent), and updates their visit counter.

### Registering Walk-In Clients at Reception
For clients walking into the salon without prior online booking:
1. On either `/admin/dashboard` or `/admin/appointments`, click the gold **+ Walk-In Booking** button.
2. Enter the client's name and 10-digit mobile number.
3. Select the services requested (e.g., *Standard Precision Haircut* + *Beard Styling*).
4. Assign an on-duty stylist (or select "No Preference").
5. The appointment is created with instant `CONFIRMED` status, ensuring chair reservation and avoiding double bookings.

### Rescheduling & Cancellations
- **Reschedule**: Select the appointment, click **Reschedule**, select the new date and time slot. The system automatically verifies that the new slot is within 10:00 AM – 10:00 PM and that the stylist has no conflicting appointments.
- **Cancel**: Enforces a 2-hour advance cancellation window for online clients. Administrators can cancel at any time with a mandatory reason recorded for records.
- **No-Show**: If a client fails to arrive after 30 minutes, mark as **No-Show** to free up the stylist's chair for walk-in clients.

---

## 3. Dynamic Calendar & Availability Settings (`/admin/calendar-settings`)

Managers and administrators can fully control online booking rules and capacity across 7 dedicated tabs without any code modifications:

1. **Basic Settings**: Toggle entire online booking on/off (`ENABLED`/`DISABLED`), configure minimum booking notice (e.g. 2 hours in advance), maximum advance booking window (e.g. 30 days or 365 days), and same-day booking permissions.
2. **Weekly Working Hours**: Set custom opening and closing times for each day of the week (default 10:00 AM – 10:00 PM, open all 7 days). Supports **Split Shifts / Multiple Sessions** (e.g., Morning 10:00–14:00 and Evening 15:00–22:00).
3. **Appointment Time Slots**: Define slot intervals (15, 30, 45, 60 minutes), buffer times before/after treatments for sanitation, and max clients per slot.
4. **Break Time Management**: Add recurring salon-wide or staff lunch/tea breaks (e.g., Afternoon Staff Lunch 14:00–14:45) applied to specific days of the week.
5. **Holidays & Blocked Dates**: Block specific dates for major festivals (Chhath Puja, Diwali, Holi) or maintenance. Supports both full-day closures and partial special opening hours.
6. **Booking Capacity**: Enforce maximum appointments per day, maximum simultaneous appointments across all chairs, and temporary checkout slot hold timeouts (default 10 minutes).
7. **Live Calendar Preview**: Test live slot generation in real time directly inside the admin panel before publishing changes.

---

## 4. Service Catalog & Online Booking Controls (`/admin/services`)

Every service in the salon catalogue can be fine-tuned with dynamic commercial rules:
- **Pricing Display Type**: Choose between `Fixed Price` (e.g. ₹499), `Starting From` (e.g. ₹999+), or `Contact for Price / Custom Quote` (ideal for bridal and chemical treatments).
- **Online Booking Toggle**: Enable or disable online booking per service. Services marked offline cannot be booked via the customer booking engine and display a consultation badge.
- **Advance Deposit Requirements**: Configure required booking advance: `No Advance Required`, `Fixed Deposit` (e.g. ₹200), `Percentage` (e.g. 20%), or `Full Prepayment (100%)`.
- **Buffer & Duration**: Configure exact chair duration and clean-up buffer time in minutes to prevent appointment overrun.

---

## 5. Managing Staff & Stylists (`/admin/staff`)

1. **Floor Availability**: If a stylist takes a break or leaves early, click the toggle switch next to their name (`On Floor` to `Off Duty`). They will immediately stop appearing in the online booking slot selector.
2. **Onboarding New Stylists**: Click **+ Add Stylist**, fill in their name, phone, designation (e.g., *Master Colorist*), years of experience, and specialties.

---

## 4. Customer CRM & Client Notes (`/admin/customers`)

1. Search any client by mobile number or name.
2. Click **View Details** to open the client history drawer.
3. Review total visits, lifetime revenue spend, and reward point balance.
4. **Internal Stylist Notes**: Use the notes box to record specific formulas (e.g., *"L'Oréal Majirel shade 5.3 with 20 vol"*), scalp sensitivities, or preferred refreshments. Click **Save Notes**.

---

## 5. Marketing, Coupons & Gift Cards

1. **Issue Promo Coupons (`/admin/coupons`)**: Create promo codes like `LALGANJ100` with 10% off, ₹1,000 minimum spend, and an expiration date.
2. **Prepaid Gift Cards (`/admin/gift-cards`)**: Issue gift vouchers with unique alphanumeric codes (e.g., `JH-GIFT-500`). When the client brings the voucher to pay at the desk, enter the code, select the amount to redeem, and click **Redeem Balance**.
3. **Manual Loyalty Adjustments (`/admin/loyalty`)**: If compensating a client or awarding a birthday bonus, click **Manual Adjust Points**, enter the points amount (e.g., `+100`), and enter the reason for audit compliance.

---

## 6. Financial & Business Intelligence Reports (`/admin/analytics`)

- View Realized Gross Revenue (calculated strictly from confirmed and completed transactions).
- Review Average Ticket Value per visit and client retention conversion.
- Review **Stylist Productivity Table** to view revenue generated and visits completed per stylist.
- Click **Export CSV Report** to download raw operational accounting sheets for your accountant or tax records.

---

## 7. Razorpay Payment Gateway Management (`/admin/settings/razorpay`)

Managers and administrators can securely configure online payments across 4 distinct sections:

1. **General Payment Settings (Section A)**:
   - Toggle Razorpay gateway on/off (`isEnabled`).
   - Switch between **Test Sandbox** and **Live Production** environments (system strictly prohibits enabling Live mode until live credentials have been tested and verified).
   - Configure Checkout Display Name (e.g. `The Jawed Habib Salon - Lalganj`).
   - Enable/disable Online Checkout, Advance Deposits, Full 100% Prepayments, and Remaining Balance Collection.
   - Permit or disallow Salon Counter Offline payment recording.
2. **API Credentials (Section B)**:
   - Dual-environment separation for Test Mode and Live Mode.
   - Test Key ID, Test Key Secret, and Test Webhook Secret.
   - Live Key ID, Live Key Secret, and Live Webhook Secret.
   - **Bank-Grade Encryption**: Secrets are encrypted at rest with AES-256-GCM. Saved secrets are permanently masked (`••••••••••••`) and never returned over APIs.
3. **Live Connection Testing (Section C)**:
   - Click **Test Razorpay Connection** to probe active credentials against the Razorpay REST API in real time.
   - Immediate feedback with timestamp and human-readable diagnostic messages without credential leakage.
4. **Webhook Configuration (Section D)**:
   - Displays actual public deployment endpoint (`/api/webhooks/razorpay`) with 1-click URL copying.
   - Configured events: `order.paid`, `payment.captured`, `payment.failed`, `refund.processed`.
   - Real-time delivery logs, deduplication tracking, and health status badges.

---

## 8. Payment Ledger & Refund Management (`/admin/payments`)

The financial settlement dashboard provides complete operational authority over all monetary transactions:

1. **Financial Metrics Summary**:
   - Total Collected Revenue across all salon services.
   - Online Razorpay Volume (UPI, Cards, Netbanking).
   - Salon Counter Offline Volume (Cash, POS Terminal, Counter QR).
   - Total Refunds Processed & Pending Checkout Holds.
2. **Transaction Filtering & Inspection**:
   - Search by customer name, phone, booking number (`JH-LLG-...`), or Razorpay IDs (`order_...` / `pay_...`).
   - Granular filters by Date Range, Payment Status (`CAPTURED`, `PENDING`, `FAILED`, `REFUNDED`), Environment (`TEST`, `LIVE`, `OFFLINE`), and Method.
3. **Receipt Generation**:
   - 1-click **Official Payment Receipt** generator with GST compliance, salon address, client breakdown, and print action.
4. **Controlled Refunds**:
   - Click **Refund** on any captured transaction.
   - Choose between **Full Refund** or **Partial Refund** with custom amount and mandatory audit reason.
   - Calls official Razorpay Refunds API and updates database records and customer balances automatically.
5. **Record Salon Counter Payments**:
   - Click **+ Record Salon Payment** to register cash, counter UPI, or POS card terminal payments against open client balances with staff attribution and audit tracking.
