# Feature Specifications: The Jawed Habib Salon – Lalganj

## 1. Public Salon Website
- **Hero Presentation**: Visual luxury banner featuring the Lalganj branch identity, opening hours (10:00 AM – 10:00 PM), and prime location at Tinpulwa Chowk.
- **Service Menu & Pricing**: Comprehensive categorized listing of haircuts, hair spa, botox, keratin, 24K gold facials, and beard grooming.
- **Before & After Transformations**: Interactive showcase of real hair color, haircut, and skin transformations.
- **Ambience & Salon Tour Gallery**: Visual walkthrough of styling stations, bridal suites, and washing chairs.
- **Digital Consultation**: Client diagnostic form to recommend tailored services based on hair texture and facial shape.
- **Direct Concierge Integration**: One-click dialing for 7707000463, 9831722983, 9580000175, and Google Maps direction links.

---

## 2. Appointment Booking System
- **Service Selection**: Multi-service basket supporting combined services (e.g., Haircut + Hair Spa).
- **Date & Slot Engine**: Real-time slot allocation based on 10:00 AM – 10:00 PM operating hours.
- **Coupon & Promo Engine**: Real-time discount calculation (e.g., `WELCOME100`).
- **Pay at Salon**: Friction-free reservation without mandatory upfront credit card requirement.

---

## 3. Customer Portal & Loyalty Hub
- **Booking Ledger**: History of past visits and upcoming sessions.
- **Habib Reward Points**: Earn points on every rupee spent and redeem on future visits.
- **Membership Status**: Silver, Gold, or Platinum VIP status indicators.

---

## 4. Admin Management Platform (20 Comprehensive Modules)

The administrative system is organized into 5 functional operational domains with high-contrast champagne gold & luxury black aesthetics:

### A. Operations
1. **Main Operations Dashboard (`/admin/dashboard`)**:
   - Dynamic real-time KPI metrics (Total, Today's, Pending, Confirmed, Completed, Revenue).
   - Realized revenue tracking calculated exclusively from confirmed/completed database records.
   - Monthly business volume trend visualization and top-performing service rankings.
   - Quick action shortcuts for walk-in appointment creation and live enquiries queue.
2. **Appointment Management (`/admin/appointments`)**:
   - Interactive dual-view: Table ledger and weekly calendar schedule.
   - Multi-facet filters: Search by customer, status pill filter, stylist assignment, and date range.
   - Full lifecycle status management: Confirm, Complete, Cancel, No-Show, Reject.
   - In-app Walk-In modal for rapid booking registration at the reception desk.
   - Reschedule and stylist reassignment dialogs.
3. **Staff & Stylist Directory (`/admin/staff`)**:
   - Detailed stylist profiles with designations, experience, and service specializations.
   - Real-time on-floor availability toggle (`On Floor / Available` vs `Off Duty`).
   - Working hours enforcement (10:00 AM – 10:00 PM, 7 days/week).
   - Add new stylist and edit schedule modals.
4. **Lead & Inbound Enquiries (`/admin/enquiries`)**:
   - Centralized lead feed capturing bridal packages, consultation requests, and contact inquiries.
   - One-click direct customer telephone calling (`tel:` protocol).
   - Status tracking (`NEW`, `CONTACTED`, `RESOLVED`, `CLOSED`).
5. **Business Intelligence & Reports (`/admin/analytics`)**:
   - Executive performance metrics: Gross revenue, completed visits, average ticket value, and client conversion.
   - Stylist productivity and contribution table (visits handled, revenue generated).
   - Instant CSV export download for salon accounting and ledger records.

### B. Client Relations
6. **Customer CRM Directory (`/admin/customers`)**:
   - Comprehensive customer profile database with search by name, telephone, or email.
   - Visit metrics: Lifetime appointments, total recorded spend, and active loyalty points balance.
   - Interactive slide-over drawer with historical visit timeline.
   - Persistent CRM notes editor for staff observations and styling preferences.
7. **Reviews Moderation Queue (`/admin/reviews`)**:
   - Moderate incoming customer ratings and testimonials.
   - Approve, reject, revoke approval, and feature testimonials on the public homepage.

### C. Catalog & Media Management
8. **Service Catalog & Pricing (`/admin/services`)**:
   - Complete CRUD for salon treatments across Hair, Beauty, Makeup, and Grooming.
   - Configure title, category, description, duration (minutes), starting price, gender, and cover image.
   - Instant active/inactive status toggle without deleting historical records.
9. **Salon Gallery Library (`/admin/gallery`)**:
   - Media asset management filtered by Interior, Hair Styling, Beauty, and Bridal suites.
   - Image upload dialog with title, description, and featured showcase flag.
10. **Before & After Transformations (`/admin/transformations`)**:
    - Interactive before/after split card previews demonstrating makeover results.
    - Service and stylist attribution with category tagging and makeover story descriptions.

### D. Marketing & Customer Retention
11. **Promotional Offers & Campaigns (`/admin/offers`)**:
    - Manage seasonal discount campaigns (percentage off or flat rupee discounts).
    - Campaign date range validity, promo banner image, and active status toggling.
12. **Combo Packages (`/admin/packages`)**:
    - Package bundling engine calculating client savings compared to standalone services.
    - Total bundle duration, description, and active status control.
13. **Coupon Code Management (`/admin/coupons`)**:
    - Generate discount vouchers with minimum spend requirements and max discount caps.
    - Expiration date enforcement and redemption usage counters.
14. **VIP Membership Club (`/admin/memberships`)**:
    - Multi-tier membership management (Silver, Gold, Platinum VIP plans).
    - Define annual fees, tier discount percentages, and custom perk item checklists.
    - Active subscribers roster tracking member renewal dates.
15. **Loyalty Program Ledger (`/admin/loyalty`)**:
    - Reward points configuration rules (1 point per ₹10 spent, 100 welcome bonus).
    - Complete points transaction ledger across bookings, redemptions, and adjustments.
    - Manual loyalty points adjustment dialog with mandatory administrative audit log.
16. **Gift Card Management (`/admin/gift-cards`)**:
    - Issue prepaid digital gift vouchers with custom voucher codes and denominations.
    - Balance tracking, expiration enforcement, and instant in-salon redemption modal.

### E. Administration & Governance
17. **Website CMS Content (`/admin/content`)**:
    - Live homepage headline, subtitle, announcement banner, and SEO metadata manager.
    - Direct phone numbers and branch operational hours synchronization.
18. **Operational Settings (`/admin/settings`)**:
    - Verified salon facts: Exact address, 3 phone numbers, operating hours.
    - Booking rules: Advance booking window (days), cancellation policy window (hours), and GST tax rate.
19. **Privileged Users & RBAC (`/admin/users`)**:
    - Role-Based Access Control hierarchy: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `STAFF`.
    - Admin user directory with role assignment and account provisioning.
20. **Notifications & Topbar Alerts (`/admin/*`)**:
    - Real-time top navigation bar with branch metadata, operating status badge, and alert notifications drawer.
