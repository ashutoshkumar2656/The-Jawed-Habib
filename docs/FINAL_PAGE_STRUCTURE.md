# FINAL_PAGE_STRUCTURE.md
## Platform Sitemap, Page Hierarchy & Architectural Component Specification
### The Jawed Habib Salon – Lalganj (Vaishali, Bihar – 844121)

---

## 1. Complete Route Architecture & Sitemap

```
├── (public)
│   ├── /                           # 16-Section Luxury Homepage
│   ├── /about                      # 7-Section Brand Legacy & Salon Experience
│   ├── /services                   # 10-Section Categorized Services with FAQ & Indicative Pricing
│   ├── /pricing                    # 7-Section Detailed Indicative Rate Card & Bundle Comparison
│   ├── /transformations            # 6-Section Before/After Interactive Sliders & Demonstrations
│   ├── /gallery                    # 5-Section Salon Photography & Lightbox Viewer
│   ├── /team                       # 5-Section Stylist Profiles & Chair Consultation Guide
│   ├── /stylists                   # Canonical alias pointing to /team
│   ├── /offers                     # 6-Section Curated Packages, Discount Coupons & T&C
│   ├── /packages                   # Canonical alias / alternate bundle presentation
│   ├── /consultation               # 5-Section Interactive Beauty Diagnostic & Service Recommender
│   ├── /contact                    # 7-Section Location, 3 Phones, Map Embed & Inquiry Form
│   ├── /booking                    # 4-Stage Multi-Step Appointment Reservation Wizard
│   ├── /faq                        # Dedicated Frequently Asked Questions & Salon Policies
│   ├── /privacy                    # Complete Client Privacy Policy & Data Protections
│   └── /terms                      # Client Service Terms, Cancellation & Pricing Disclaimers
│
├── (auth)
│   ├── /login                      # Secure Client & Staff Sign-In with JWT Cookie Session
│   ├── /register                   # Client Registration with Phone & Name Validation
│   └── /forgot-password            # Self-Service Account Recovery
│
├── (customer)
│   ├── /account                    # Customer Dashboard Overview (Silver Tier, 100 Reward Pts)
│   ├── /bookings                   # Live Booking History, Status Tracking & Cancellation Modal
│   └── /profile                    # Editable Profile Details & Hair/Skin Style Preferences
│
├── admin
│   ├── /admin/login                # Protected Admin Staff Portal Login
│   ├── /admin/dashboard            # Executive KPI Dashboard (Appointments, Revenue, Stylists)
│   ├── /admin/appointments         # Appointment Management (Calendar/Table, Status Mutations)
│   ├── /admin/customers            # Client CRM Ledger (Visit Counts, Loyalty Balances, Contacts)
│   ├── /admin/services             # Service Catalog & Indicative Price Management
│   ├── /admin/staff                # Stylist & Staff Availability Management
│   ├── /admin/packages             # Curated Bundle Packages Editor
│   ├── /admin/offers               # Seasonal Promotional Offers Management
│   ├── /admin/coupons              # Discount Coupon Validation & Rule Configuration
│   ├── /admin/reviews              # Customer Review Moderation Ledger
│   ├── /admin/enquiries            # Front Desk Contact Inquiries & Callback Queue
│   ├── /admin/transformations      # Before/After Transformation Image Pairs Management
│   ├── /admin/gallery              # Salon Image Gallery Management
│   ├── /admin/loyalty              # Customer Loyalty Points & Tier Rules
│   ├── /admin/memberships          # Membership Plan Subscription Tracking
│   ├── /admin/gift-cards           # Digital Gift Card Issuance & Balance Tracking
│   ├── /admin/content              # Dynamic Site Content & Announcement Banners
│   ├── /admin/analytics            # Business Intelligence & Performance Trends
│   ├── /admin/reports              # Exportable Financial & Booking Audit Reports
│   ├── /admin/users                # System User Roles & Access Control (RBAC)
│   └── /admin/settings             # Salon Operating Hours & Contact Coordinates
│
└── api (12 Public/Customer APIs + 19 Protected Admin APIs)
```

---

## 2. Section-by-Section Hierarchy for Public Pages

### 1. Homepage (`/`) — 16 Structured Sections
1. **Header Navigation**: Fixed luxury bar with brand wordmark, 7 essential links, and gold "Book Appointment" CTA.
2. **Hero Section**: Full-width high-editorial salon image, headline *"Discover Your Perfect Look."*, subtitle highlighting personalized care, location badge, and dual CTAs.
3. **Trust & Business Info Strip**: 4 highlight metrics (Professional Stylists, Tinpulwa Chowk Location, 10 AM – 10 PM Open 7 Days, Instant Online Booking).
4. **About The Salon Preview**: 2-column introduction with salon interior visual, Habib philosophy, sterilization standards, and link to `/about`.
5. **Featured Services**: 4 showcase cards (Haircut & Styling, L'Oréal Hair Spa, Global Colour & Balayage, Executive Beard Detailing) with verified prices.
6. **Before & After Transformations**: Interactive slider (`BeforeAfterSlider`) with category filter pills (`ALL`, `Hair Colour`, `Men's Haircuts`, `Hair Makeovers`), full-screen zoom, and stylist credits.
7. **Why Choose Us**: 5 key value cards (Personalised Consultations, Comprehensive Services, Strict Hygiene, Prime Landmark Location, Open 7 Days).
8. **Popular Services & Indicative Pricing**: Filterable rate card enforcing verified indicative prices (Haircut ₹299, Haircut+Wash ₹299–₹399, Hair Colour Starting ₹1,999, Global Colour Starting ₹2,499, Party Makeup ₹1,499–₹1,999, Spa Starting ₹999, Beard Grooming ₹199, Chemical "Contact for Pricing").
9. **Special Offers & Curated Packages**: Showcase bundles (Hair Refresh ₹499, Hair Transformation ₹1,299, Complete Grooming ₹799, Bridal Glow ₹4,999).
10. **Our Work / Salon Gallery**: Curated photo grid with interactive `LightboxModal` integration, category filter, and high-resolution inspection.
11. **Meet Our Stylists**: Clean stylist team cards with transparent demonstration disclaimers indicating current roster awaiting final salon photography.
12. **Customer Testimonials**: Authentic feedback focusing on hygiene, punctual booking, and consultation quality.
13. **Instagram Section**: Direct integration preview linking to `@the_jawedhabib_lalganj` with follow CTA.
14. **Location & Contact Section**: Complete Lalganj address, 3 phone numbers (`7707000463`, `9831722983`, `9580000175`), operating hours, interactive callback request form, and direct directions link.
15. **Final High-Conversion CTA**: Editorial banner inviting guests to reserve their styling chair.
16. **Structured Luxury Footer**: 4-column footer with brand overview, quick links, verified contact details, opening hours, copyright, and legal links (`/privacy`, `/terms`).

---

### 2. About Page (`/about`) — 7 Structured Sections
1. **Breadcrumb & Page Hero**: High-impact banner *"The Art of Salon Care in Lalganj"*.
2. **The Brand Legacy**: Authentic narrative of the Jawed Habib styling lineage and professional salon experience.
3. **The Lalganj Salon Experience**: Details on our state-of-the-art facility on the 1st Floor, Tinpulwa Chowk.
4. **Comprehensive Service Capabilities**: Highlighting precision haircuts, L'Oréal hair therapies, skin facials, and wedding preparation.
5. **Why Choose Us Grid**: Core pillars of hygiene, certified styling, transparent pricing, and 7-day accessibility.
6. **Salon Photography Preview**: Interior visual preview of styling stations and wash lounges.
7. **Appointment Reservation CTA**: Direct booking trigger.

---

### 3. Services Page (`/services`) — 10 Structured Sections
1. **Breadcrumbs & Services Hero**: Introduction to full treatment menu.
2. **Category Navigation Pills**: Interactive filter (`ALL`, `Hair`, `Color`, `Spa`, `Beauty`, `Makeup`, `Grooming`).
3. **Hair Cuts & Precision Styling Grid**: Cards for Men's and Women's designer haircuts.
4. **Hair Colour & Balayage Grid**: Cards with starting prices for touch-up, full highlights, and global coloration.
5. **Hair Spa & Restoration Grid**: L'Oréal nourishing spas and fiber treatments.
6. **Skin Radiance & Facials Grid**: 24K Gold facials and herbal de-tan therapies.
7. **Bridal & Occasion Makeup Grid**: High-definition party and bridal makeovers.
8. **Pricing Transparency Notice**: Clear guidelines on starting prices and customized in-chair consultation quotes.
9. **Services Frequently Asked Questions (FAQ)**: Answers regarding service duration, patch testing, and combining packages.
10. **Direct Booking Call-to-Action**: Booking shortcut.

---

### 4. Pricing Page (`/pricing`) — 7 Structured Sections
1. **Breadcrumbs & Pricing Hero**: Highlighting transparent pricing and verified indicative rates.
2. **Category Filter Tabs**: Interactive switching across salon departments.
3. **Indicative Rate Cards**: Clear display of service names, duration, indicative pricing, and inclusion highlights.
4. **Popular Bundles & Package Comparison**: Value breakdown across curated combo packages.
5. **Consultation & Pricing Guidelines**: Explaining hair length adjustments and bridal quote policies.
6. **Payment Modes & Salon Assurance**: Confirmation of UPI, Card, and Cash acceptance without forced prepayments.
7. **Final Booking CTA**: Direct chair reservation.

---

### 5. Transformations Page (`/transformations`) — 6 Structured Sections
1. **Hero Header**: *"Visible Elegance, Verified Results"*.
2. **Demonstration Disclaimer Banner**: Clear notice that sample transformations illustrate techniques while active branch photographs are being cataloged.
3. **Category Filter Pills**: Men's Haircuts, Women's Haircuts, Hair Colour, Hair Makeovers.
4. **Interactive Before/After Comparison Sliders**: Draggable split-view slider with full-screen toggle.
5. **Transformation Details & Stylist Notes**: Description of technique applied (glaze, balayage, taper fade).
6. **Appointment Reservation CTA**: Direct trigger to book similar transformations.

---

### 6. Gallery Page (`/gallery`) — 5 Structured Sections
1. **Breadcrumbs & Gallery Hero**: Showcase of styling stations, wash lounges, and hair artistry.
2. **Interactive Category Selector**: Filtering salon interiors, haircuts, hair color, and bridal styling.
3. **Curated Photography Grid**: High-resolution image cards with hover zoom effects.
4. **Interactive Fullscreen Lightbox Modal**: Image enlargement with caption and keyboard navigation.
5. **Instagram Community Callout**: Invitation to follow `@the_jawedhabib_lalganj`.

---

### 7. Stylists & Team Page (`/team` & `/stylists`) — 5 Structured Sections
1. **Breadcrumbs & Team Hero**: *"The Certified Artists Behind Your Style"*.
2. **Demonstration Roster Disclaimer**: Clarifying that profiles illustrate stylist specialties awaiting final owner photography.
3. **Stylist Profile Cards**: Master haircutters, senior colorists, skin specialists, and beard architects.
4. **In-Chair Consultation Philosophy**: Explaining how our stylists assess face shape, scalp health, and hair texture.
5. **Stylist Appointment CTA**: Shortcut to book a chair with a preferred stylist.

---

### 8. Offers & Packages Page (`/offers` & `/packages`) — 6 Structured Sections
1. **Breadcrumbs & Offers Hero**: Curated bundles and promotional vouchers.
2. **Active Discount Vouchers Grid**: `WELCOME100` (Flat ₹100 Off) and `GOLDGLOW20` (20% Off) with 1-click clipboard copy.
3. **Curated Signature Packages Grid**: Hair Refresh (₹499), Hair Transformation (₹1,299), Bridal Glow (₹4,999), Party Ready (₹1,799), Complete Grooming (₹799).
4. **Package Details & Inclusions Checklist**: Transparent list of treatments included in each bundle.
5. **Terms & Conditions for Privileges**: Guidelines on coupon stacking, advance reservations, and patch tests.
6. **Direct Booking Call-to-Action**: Booking shortcut.

---

### 9. Beauty Consultation Page (`/consultation`) — 5 Structured Sections
1. **Breadcrumbs & Consultation Hero**: Interactive hair and skin diagnostic tool.
2. **Medical Non-Diagnosis Legal Disclaimer**: Clear boundary that suggestions are aesthetic rather than medical.
3. **Interactive Diagnostic Questionnaire**: 6-step form covering primary concern, hair length, style goals, budget, and desired visit date.
4. **Curated Diagnostic Recommendations**: Dynamic treatment suggestions tailored to answers with instant booking links.
5. **In-Chair Professional Consultation & Concierge CTA**: Invitation for free walk-in chair consultation with direct call button.

---

### 10. Contact Page (`/contact`) — 7 Structured Sections
1. **Breadcrumbs & Contact Hero**: Direct concierge connection.
2. **Branch Details Card**: Full address on 1st Floor, Tinpulwa Chowk above Killer Showroom, 3 phone numbers (`7707000463`, `9831722983`, `9580000175`), operating hours (10 AM – 10 PM), and Instagram handle.
3. **Interactive Online Inquiry Form**: With client name, phone number, service dropdown, and message fields.
4. **Interactive Google Maps Embed**: Dark-mode styled embed with one-click link to open in Google Maps app.
5. **Operating Schedule & Visiting Guidelines**: Details on walk-in availability and parking access.
6. **Social & Quick Contact Links**: Instagram and WhatsApp access links.
7. **Direct Appointment Booking CTA**: Fast chair reservation banner.

---

### 11. Appointment Booking Wizard (`/booking`) — 4 Interactive Stages
1. **Stage 1 (Services & Stylist)**: Interactive service selection with category badges, pricing, and preferred stylist picker (including *"Any Available Master Stylist"*).
2. **Stage 2 (Date & Operating Time Slot)**: Dynamic date picker (preventing past dates) and 23 operational time slots from 10:00 AM to 09:00 PM.
3. **Stage 3 (Contact Information & Summary Review)**: Name, 10-digit mobile number, optional email, styling notes, coupon code input (`WELCOME100`), and live sticky price ledger.
4. **Stage 4 (Instant Confirmation Screen)**: Unique appointment reference number (`JH-XXXXXX`), summary receipt, Lalganj address reminder, and one-click WhatsApp appointment notification.
