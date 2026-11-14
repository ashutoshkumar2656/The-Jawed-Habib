# The Jawed Habib Salon – Lalganj
# Comprehensive Initial SEO Audit Report (Pre-Optimization Baseline)

> **Date of Audit:** November 14, 2026  
> **Auditor:** Senior Technical SEO & Local Search Specialist  
> **Preferred Production Canonical Domain:** `https://www.thejawedhabibsalons.in`  
> **Physical Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Vaishali, Bihar – 844121, India  
> **Operating Hours:** Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days)  
> **Official Phones:** +91 7707000463 | +91 9831722983 | +91 9580000175  
> **Google Maps:** `https://maps.app.goo.gl/TVx48xoWEu8dMvXT9`  
> **Official Instagram:** `https://www.instagram.com/the_jawedhabib_lalganj/`

---

## Executive Summary & Initial Diagnostic

A comprehensive baseline technical and local SEO inspection of the entire codebase and live architecture was conducted.

### Critical Initial Findings:
1. **Severe Canonical & Metadata Collapse:**
   In `src/app/layout.tsx`, `alternates: { canonical: "/" }` is declared globally. Because almost all public pages (`/services`, `/packages`, `/transformations`, `/gallery`, `/offers`, `/contact`, `/booking`, `/pricing`, `/consultation`, `/faq`, `/team`) are client components (`"use client"`), they do not export page-level metadata. Consequently, **every single subpage on the website inherits the root canonical URL (`/`) and default root title & description**. Google and search engine crawlers view every page as an identical duplicate of the homepage, causing massive indexation dilution and preventing individual service pages from ranking!
2. **Obsolete Domain & Localhost Fallbacks:**
   - In `src/app/layout.tsx`, `metadataBase` defaults to `http://localhost:3000` if `NEXT_PUBLIC_APP_URL` is undefined.
   - In `src/app/robots.ts` and `src/app/sitemap.ts`, `baseUrl` defaults to `https://thejawedhabib-lalganj.com` instead of the canonical `https://www.thejawedhabibsalons.in`.
   - The global `localBusinessJsonLd` schema in `layout.tsx` hardcodes `@id: "https://thejawedhabib-lalganj.com/#salon"`, `url`, and `logo` pointing to the wrong domain!
3. **Missing High-Value Local Landing Pages:**
   - There is no dedicated `/bridal` landing page, despite "Bridal makeup in Lalganj" and "Pre-bridal makeup in Lalganj" being the highest commercial value search queries. Bridal content is currently split between the homepage and `/booking`.
   - There is no standalone `/reviews` page, forcing reviews into an anchor hash `/#reviews`.
4. **Missing Key Structured Data (Schema.org):**
   - No `WebSite` schema with site search or canonical context.
   - No `FAQPage` schema on the FAQ page or homepage FAQ section.
   - No `BreadcrumbList` JSON-LD schema despite visual breadcrumbs being displayed.
   - No `Service` or `OfferCatalog` schema on `/services` or `/packages`.
5. **Heading Structure Irregularities:**
   - Homepage H1 inside `HeroVideoSection` is generic: `"Discover Your Perfect Look."` (completely missing business name, service, and Lalganj location).
   - `/services` and `/packages` skip H2 headings entirely, jumping from H1 directly to H3.
   - `/contact` has inverted headings (H1 -> H3 -> H2).
6. **Render-Blocking Web Fonts:**
   `src/app/layout.tsx` loads Google Fonts via render-blocking `<link rel="stylesheet">` tags in `<head>`, incurring extra DNS, TLS, and font loading round trips rather than utilizing `next/font/google`.

---

## Detailed Page-by-Page Baseline SEO Audit

### 1. Homepage (`/`)
- **Page URL:** `https://www.thejawedhabibsalons.in/`
- **Existing Title:** `The Jawed Habib Salon – Lalganj | Luxury Hair, Beauty & Grooming` (from RootLayout fallback)
- **Existing Meta Description:** `Experience world-class hair styling, restorative hair spa, royal beard grooming, and luminous bridal/skin care at The Jawed Habib Salon in Lalganj, Vaishali, Bihar.`
- **H1:** `Discover Your Perfect Look.` (inside `HeroVideoSection`)
- **Canonical URL:** `https://www.thejawedhabibsalons.in/` (derived via metadataBase fallback)
- **Indexability:** Indexable (Status: 200)
- **Structured Data:** `localBusinessJsonLd` present in `layout.tsx`, but contains invalid domain references (`thejawedhabib-lalganj.com`), relative image URL, and lacks `areaServed`, `paymentAccepted`, `currenciesAccepted`, and `hasMap`.
- **Main SEO Problems:**
  - H1 lacks business name, service types, and city location.
  - Several H2 headings are purely editorial/poetic ("Before the vows, the transformation", "Find the studio") rather than containing semantic service/geo keywords.
  - Homepage FAQ section does not emit `FAQPage` JSON-LD structured data.
  - `metadataBase` defaults to `http://localhost:3000` when environment variable is not populated.
- **Recommended Corrections:**
  - Strengthen H1 to: `The Jawed Habib Salon in Lalganj, Vaishali | Hair, Beauty & Bridal Studio`.
  - Update editorial H2s to include semantic context (e.g. `Visit Our Salon at 1st Floor Tinpulwa Chowk, Lalganj`).
  - Add `FAQPage` and `WebSite` JSON-LD schemas.
  - Correct schema domain to `https://www.thejawedhabibsalons.in`.

---

### 2. Bridal Services (`/bridal` & `/booking`)
- **Page URL:** `/booking` (and currently anchor `/#packages`, with no dedicated `/bridal` route)
- **Existing Title:** Inherited root default (`The Jawed Habib Salon – Lalganj | Luxury Hair, Beauty & Grooming`)
- **Existing Meta Description:** Inherited root default
- **H1:** `Reserve Your Bridal Experience`
- **Canonical URL:** Collapses to `/` (Homepage)
- **Indexability:** Severely compromised; search engines ignore subpage indexing when canonical points to root.
- **Structured Data:** None.
- **Main SEO Problems:**
  - No dedicated `/bridal` URL for primary commercial keywords ("Bridal makeup in Lalganj", "Bridal makeover salon in Lalganj, Vaishali").
  - `/booking` page inherits homepage title and canonicalizes to `/`.
  - No `Service` or `Event` schema for bridal suites.
- **Recommended Corrections:**
  - Author a dedicated, crawlable `/bridal` page showcasing bridal suites, pre-bridal packages, HD & Airbrush transformations, transparent rates, and direct booking CTAs.
  - Set unique title: `Bridal Makeup & Wedding Makeover in Lalganj, Vaishali | The Jawed Habib Salon`.
  - Set meta description detailing HD bridal makeup, airbrush suite, pre-bridal glow, and booking info.
  - Provide self-referencing canonical `https://www.thejawedhabibsalons.in/bridal`.
  - Add `Service` and `BreadcrumbList` JSON-LD schemas.

---

### 3. Services Page (`/services`)
- **Page URL:** `https://www.thejawedhabibsalons.in/services`
- **Existing Title:** Inherited root default
- **Existing Meta Description:** Inherited root default
- **H1:** `Hair, Beauty & Royal Grooming Services` (Missing location: Lalganj, Vaishali)
- **Canonical URL:** Collapses to `/` (Homepage)
- **Indexability:** Severely compromised due to root canonical tag.
- **Structured Data:** None.
- **Main SEO Problems:**
  - Marked `"use client"`, leaving metadata unexported.
  - Heading hierarchy broken: jumps from H1 directly to H3 (skipping H2).
  - Lacks structured `ItemList` or `OfferCatalog` schema for salon services.
  - Lacks location context in H1.
- **Recommended Corrections:**
  - Provide Server Component metadata with title: `Haircuts, Hair Spa, Keratin & Beauty Services in Lalganj | The Jawed Habib Salon`.
  - Set descriptive meta description highlighting certified Jawed Habib stylists, keratin treatments, hair color, and grooming at Tinpulwa Chowk, Lalganj.
  - Fix heading hierarchy to introduce proper H2 category headings.
  - Correct canonical to `https://www.thejawedhabibsalons.in/services`.
  - Add `ItemList` / `Service` structured data.

---

### 4. Curated Packages (`/packages`)
- **Page URL:** `https://www.thejawedhabibsalons.in/packages`
- **Existing Title:** Inherited root default
- **Existing Meta Description:** Inherited root default
- **H1:** `Curated Packages & Bundles`
- **Canonical URL:** Collapses to `/`
- **Indexability:** Compromised by root canonical.
- **Structured Data:** None.
- **Main SEO Problems:**
  - Missing page metadata.
  - Generic H1 without brand or location keywords.
  - Skips H2 headings.
- **Recommended Corrections:**
  - Unique title: `Salon Packages, Pre-Bridal & Grooming Bundles in Lalganj | Jawed Habib`.
  - Clear H1: `Curated Salon Packages & Bridal Bundles in Lalganj, Vaishali`.
  - Set self-referencing canonical `/packages`.

---

### 5. Before & After Transformations (`/transformations`)
- **Page URL:** `https://www.thejawedhabibsalons.in/transformations`
- **Existing Title:** Inherited root default
- **Existing Meta Description:** Inherited root default
- **H1:** `Before & After Transformation Gallery`
- **Canonical URL:** Collapses to `/`
- **Indexability:** Compromised by root canonical.
- **Structured Data:** None.
- **Main SEO Problems:**
  - Missing page metadata.
  - Lacks location context in H1.
  - Transformation images lack Schema.org `ImageGallery` / `ImageObject` markup.
- **Recommended Corrections:**
  - Unique title: `Before & After Hair Styling & Bridal Makeover Transformations | Jawed Habib Lalganj`.
  - Self-referencing canonical `/transformations`.
  - Add `ImageGallery` structured data and descriptive alt text with Lalganj service context.

---

### 6. Photo Gallery (`/gallery`)
- **Page URL:** `https://www.thejawedhabibsalons.in/gallery`
- **Existing Title:** Inherited root default
- **Existing Meta Description:** Inherited root default
- **H1:** `The Lalganj Salon Experience`
- **Canonical URL:** Collapses to `/`
- **Indexability:** Compromised by root canonical.
- **Structured Data:** None.
- **Main SEO Problems:**
  - Missing metadata.
  - Lacks `ImageGallery` schema.
- **Recommended Corrections:**
  - Unique title: `Salon Interior, Styling Lounge & Work Gallery | The Jawed Habib Salon Lalganj`.
  - Set self-referencing canonical `/gallery`.

---

### 7. Customer Reviews & Testimonials (`/reviews`)
- **Page URL:** Currently non-existent as a dedicated route (homepage hash `/#reviews`)
- **Existing Title:** N/A
- **Existing Meta Description:** N/A
- **H1:** N/A
- **Canonical URL:** N/A
- **Indexability:** Not independently indexable in search engines.
- **Structured Data:** None.
- **Main SEO Problems:**
  - Customers searching for "Jawed Habib Lalganj reviews" or "best salon in Lalganj customer ratings" cannot land on a dedicated, trustworthy reviews page.
- **Recommended Corrections:**
  - Create a dedicated `/reviews` page displaying verified customer feedback, salon ratings, review submission CTA, and visiting tips.
  - Unique title: `Customer Reviews & Client Testimonials | The Jawed Habib Salon Lalganj`.
  - Strict compliance: Do not fabricate ratings or aggregate schema; reflect authentic feedback.

---

### 8. Exclusive Offers & Privileges (`/offers`)
- **Page URL:** `https://www.thejawedhabibsalons.in/offers`
- **Existing Title:** Inherited root default
- **Existing Meta Description:** Inherited root default
- **H1:** `Exclusive Salon Offers & Privileges`
- **Canonical URL:** Collapses to `/`
- **Indexability:** Compromised by root canonical.
- **Structured Data:** None.
- **Main SEO Problems:**
  - Missing metadata.
  - Missing location in H1.
- **Recommended Corrections:**
  - Unique title: `Salon Offers, Discount Vouchers & Bridal Deals in Lalganj | Jawed Habib`.
  - Self-referencing canonical `/offers`.

---

### 9. Contact & Front Desk (`/contact`)
- **Page URL:** `https://www.thejawedhabibsalons.in/contact`
- **Existing Title:** Inherited root default
- **Existing Meta Description:** Inherited root default
- **H1:** `Connect With The Lalganj Salon`
- **Canonical URL:** Collapses to `/`
- **Indexability:** Compromised by root canonical.
- **Structured Data:** None on page.
- **Main SEO Problems:**
  - Inverted heading structure (H1 -> H3 -> H2).
  - Missing metadata.
  - Lacks dedicated `ContactPage` and `LocalBusiness` branch markup with verified Google Maps link.
- **Recommended Corrections:**
  - Unique title: `Contact The Jawed Habib Salon Lalganj | Address, Phone & Map Location`.
  - Fix heading hierarchy: H1 -> H2 -> H3.
  - Add `ContactPage` JSON-LD schema with address, operating hours, phone numbers, and coordinates.

---

### 10. Appointment Booking Experience (`/booking`)
- **Page URL:** `https://www.thejawedhabibsalons.in/booking`
- **Existing Title:** Inherited root default
- **Existing Meta Description:** Inherited root default
- **H1:** `Reserve Your Bridal Experience`
- **Canonical URL:** Collapses to `/`
- **Indexability:** Compromised by root canonical.
- **Structured Data:** None.
- **Main SEO Problems:**
  - Missing metadata.
  - Canonical points to `/`.
- **Recommended Corrections:**
  - Unique title: `Book Salon Appointment & Bridal Suite Online | The Jawed Habib Salon Lalganj`.
  - Self-referencing canonical `/booking`.

---

### 11. Additional Public Pages (`/about`, `/pricing`, `/consultation`, `/faq`, `/team`, `/stylists`, `/privacy`, `/terms`)
- **/about:** Has title `About Us | The Jawed Habib Salon Lalganj`, but needs enrichment with brand facts, master stylist heritage, and local community service.
- **/pricing:** Lacks metadata, canonical collapses to `/`, H1 lacks location keywords. Needs title: `Haircut, Spa & Bridal Makeup Price List in Lalganj | The Jawed Habib Salon`.
- **/consultation:** Lacks metadata, canonical collapses to `/`. Needs title: `Hair & Skin Beauty Consultation in Lalganj | The Jawed Habib Salon`.
- **/faq:** Lacks metadata, canonical collapses to `/`, **critically lacks `FAQPage` Schema.org JSON-LD structured data**. Needs title: `Salon FAQs & Appointment Guide | The Jawed Habib Salon Lalganj`.
- **/team & /stylists:** Both exist, causing keyword cannibalization and thin content. Needs clear consolidation or distinct canonicalization with team profile metadata.
- **/privacy & /terms:** Contain basic metadata; need explicit `noindex, follow` or canonical protection to prevent search clutter.

---

## Technical Infrastructure Audit

| Component | Current State | Defect / Vulnerability | Required Remedy |
| :--- | :--- | :--- | :--- |
| **`robots.ts`** | Exists in `src/app/robots.ts` | Uses placeholder domain `thejawedhabib-lalganj.com`; does not explicitly disallow `/login`, `/register`, `/forgot-password`, `/admin/*`. | Point sitemap to `https://www.thejawedhabibsalons.in/sitemap.xml`; disallow admin, auth, and private routes. |
| **`sitemap.ts`** | Exists in `src/app/sitemap.ts` | Uses placeholder domain; lacks `/bridal`, `/reviews`, `/privacy`, `/terms`; uses static date for lastModified. | Update base URL to canonical production domain; add all public routes with accurate priorities and frequencies. |
| **`metadataBase`** | In `src/app/layout.tsx` | Falls back to `http://localhost:3000`. | Hardcode fallback to canonical domain: `https://www.thejawedhabibsalons.in`. |
| **Global JSON-LD** | In `src/app/layout.tsx` | Obsolete domain `@id`, relative image path, missing `areaServed`, `paymentAccepted`, `hasMap`. | Update with complete `HairSalon` / `LocalBusiness` schema according to Schema.org standards. |
| **Google Fonts** | In `src/app/layout.tsx` | `<link>` tags in `<head>` cause render-blocking latency and layout shifts (CLS). | Replace with Next.js built-in `next/font/google` (`Inter` and `Playfair_Display`) with zero layout shift. |
| **Open Graph / Twitter** | In `src/app/layout.tsx` | Image points to `/brand/jawed-habib/brand-preview.webp` without absolute domain prefix. | Prepend canonical domain to image URLs for reliable WhatsApp, Facebook, and Twitter link unfurling. |

---

## Action Plan & Immediate Priorities

1. **Phase 2:** Execute thorough local keyword research for Lalganj, Vaishali, and Bihar, creating `LOCAL_KEYWORD_RESEARCH.md`.
2. **Phase 3 & 4:** Remediate `layout.tsx`, `robots.ts`, `sitemap.ts`, `metadataBase`, and global LocalBusiness structured data.
3. **Phase 5 & 8:** Implement page-specific Server Component metadata and on-page SEO across all public pages, resolve heading hierarchy bugs, and create dedicated `/bridal` and `/reviews` indexable landing pages.
4. **Phase 6 & 7:** Optimize image delivery, alt text, and rich structured data (`FAQPage`, `BreadcrumbList`, `Service`).
5. **Phase 10 & 14:** Validate performance with Core Web Vitals, run full automated test suite, type-check, lint, and build.

*Baseline SEO Audit completed without modifying site source code.*
