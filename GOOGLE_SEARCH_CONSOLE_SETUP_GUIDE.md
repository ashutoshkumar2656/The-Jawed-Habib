# GOOGLE SEARCH CONSOLE SETUP & INDEXING ACCELERATION GUIDE
## The Jawed Habib Salon – Lalganj, Vaishali, Bihar (PIN: 844121)

> **Document Type:** Operational Webmaster & Technical SEO Deployment Guide  
> **Target Domain:** `https://www.thejawedhabibsalons.in`  
> **Brand Entity:** The Jawed Habib Salon  
> **Branch Address:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
> **Verified Date:** November 2026

---

## 1. Domain Property Verification (Recommended Method)

Google Search Console (GSC) supports two property types:
1. **Domain Property (`thejawedhabibsalons.in`)** – Captures all protocols (`http`, `https`), subdomains (`www`, root, mobile), and subpaths.
2. **URL-Prefix Property (`https://www.thejawedhabibsalons.in`)** – Captures exact protocol and hostname match.

### Recommended: Setup Domain Property via DNS TXT Record

#### Step 1: Access Google Search Console
1. Navigate to [Google Search Console](https://search.google.com/search-console).
2. Sign in using the official administrative Google account (`thejawedhabiblalganj@gmail.com` or business admin email).
3. Click **"Add Property"** from the left-hand property dropdown selector.
4. In the property type modal, select the left box labeled **"Domain"**.
5. Enter the root domain:
   ```text
   thejawedhabibsalons.in
   ```
6. Click **"Continue"**. Google will generate a unique TXT verification record string (format: `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`).

---

## 2. Step-by-Step DNS Configuration (GoDaddy / Cloudflare / Vercel DNS)

Depending on where the domain's authoritative nameservers reside, follow the matching procedure:

### Option A: If DNS is Managed in GoDaddy
1. Log into your [GoDaddy Domain Portfolio](https://dcc.godaddy.com/).
2. Locate `thejawedhabibsalons.in` and click **DNS** (or **Manage DNS**).
3. In the **DNS Records** table, click **Add New Record**.
4. Configure the record fields:
   - **Type:** `TXT`
   - **Name:** `@` (represents root domain)
   - **Value:** Paste the exact string from GSC (e.g., `google-site-verification=...`)
   - **TTL:** `1/2 Hour` (or default 3600 seconds)
5. Click **Save**.
6. Allow 2–15 minutes for worldwide DNS propagation.

### Option B: If DNS is Managed in Cloudflare
1. Log into Cloudflare Dashboard and select `thejawedhabibsalons.in`.
2. Navigate to **DNS** > **Records**.
3. Click **Add Record**:
   - **Type:** `TXT`
   - **Name:** `@`
   - **Content:** `google-site-verification=...`
   - **TTL:** `Auto`
4. Click **Save**. Propagation is typically instantaneous (under 60 seconds).

### Option C: If DNS is Managed via Vercel Nameservers
1. Go to the [Vercel Dashboard](https://vercel.com/) > Select the project `the-jawed-habib-salon-lalganj`.
2. Navigate to **Settings** > **Domains**.
3. Under the domain DNS management panel, click **Add DNS Record**:
   - **Type:** `TXT`
   - **Name:** `@`
   - **Value:** `google-site-verification=...`
4. Click **Add**.

### Completing GSC Verification
Once the DNS record is published, return to Google Search Console and click **"Verify"**. A green success badge will display: **"Ownership verified"**.

---

## 3. Alternative Verification: HTML Meta Tag (URL-Prefix)

If DNS access is temporarily delayed, verify the URL-Prefix property (`https://www.thejawedhabibsalons.in`) using the HTML meta tag:

1. In GSC, select **URL-prefix** and enter `https://www.thejawedhabibsalons.in`.
2. Choose **HTML tag** method. Copy the verification code:
   `<meta name="google-site-verification" content="XYZ..." />`.
3. Provide the content value `XYZ...` in the `.env` configuration or `src/app/layout.tsx`:
   ```tsx
   // In src/app/layout.tsx
   export const metadata: Metadata = {
     verification: {
       google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "YOUR_GSC_CODE",
     },
     // ...
   };
   ```
4. Deploy and click **Verify** in GSC.

---

## 4. Submitting Canonical XML Sitemap

The website dynamically generates a standards-compliant XML sitemap powered by Next.js App Router metadata API:
- **Canonical Sitemap URL:** `https://www.thejawedhabibsalons.in/sitemap.xml`

### Step-by-Step Submission in GSC:
1. In the left sidebar of Google Search Console, under **"Indexing"**, click **"Sitemaps"**.
2. Under **"Add a new sitemap"**, your canonical base URL is pre-filled: `https://www.thejawedhabibsalons.in/`.
3. In the input box, enter:
   ```text
   sitemap.xml
   ```
4. Click **"Submit"**.
5. GSC will display status **"Success"** and show the count of discovered URLs (17 public indexable URLs):
   - `/` (Priority: 1.0, Daily)
   - `/bridal` (Priority: 0.95, Daily)
   - `/services` (Priority: 0.9, Weekly)
   - `/packages` (Priority: 0.9, Weekly)
   - `/transformations` (Priority: 0.85, Weekly)
   - `/gallery` (Priority: 0.85, Weekly)
   - `/reviews` (Priority: 0.85, Weekly)
   - `/contact` (Priority: 0.85, Monthly)
   - `/pricing` (Priority: 0.8, Weekly)
   - `/booking` (Priority: 0.8, Monthly)
   - `/consultation` (Priority: 0.8, Monthly)
   - `/offers` (Priority: 0.8, Weekly)
   - `/team` (Priority: 0.75, Monthly)
   - `/stylists` (Priority: 0.7, Monthly)
   - `/faq` (Priority: 0.75, Monthly)
   - `/terms` (Priority: 0.3, Yearly)
   - `/privacy` (Priority: 0.3, Yearly)

---

## 5. URL Inspection & Fast-Track Indexing Workflow

For rapid indexing of the highest-priority local conversion pages, submit priority URLs for immediate manual indexing inspection:

### Priority Queue:
1. `https://www.thejawedhabibsalons.in/` (Homepage)
2. `https://www.thejawedhabibsalons.in/bridal` (Bridal Makeup & Wedding Suites)
3. `https://www.thejawedhabibsalons.in/services` (Salon Hair & Beauty Treatments)
4. `https://www.thejawedhabibsalons.in/packages` (Luxury Grooming Bundles)
5. `https://www.thejawedhabibsalons.in/contact` (Lalganj Location, Address & Hours)
6. `https://www.thejawedhabibsalons.in/reviews` (Verified Customer Testimonials)

### Fast-Track Procedure:
1. Paste the target URL into the top search bar in GSC: **"Inspect any URL in thejawedhabibsalons.in"**.
2. Press **Enter**.
3. GSC will fetch index status from Google's database. Click **"Test Live URL"** in the top right.
4. Verify that:
   - **URL is available to Google** (Green check).
   - **Mobile Usability:** Page is usable on mobile.
   - **Rich Results Detected:** `HairSalon` / `LocalBusiness`, `WebSite`, `Breadcrumbs`, and `FAQPage` are identified with zero errors.
5. Click **"Request Indexing"**.
6. Repeat for the top 6 priority URLs. Google crawlers will prioritize visiting and parsing these pages within 24–48 hours.

---

## 6. Verifying Crawl Directives & robots.txt

Verify that private and sensitive paths are blocked while public search pages are fully accessible:
1. In GSC, use the **robots.txt Tester** tool (under **Settings** > **Crawl stats** or directly via Google's robots tester).
2. Input target test URLs:
   - `https://www.thejawedhabibsalons.in/` -> **Allowed**
   - `https://www.thejawedhabibsalons.in/services` -> **Allowed**
   - `https://www.thejawedhabibsalons.in/bridal` -> **Allowed**
   - `https://www.thejawedhabibsalons.in/admin` -> **Blocked (Disallow: /admin)**
   - `https://www.thejawedhabibsalons.in/admin/dashboard` -> **Blocked (Disallow: /admin/*)**
   - `https://www.thejawedhabibsalons.in/api/auth/login` -> **Blocked (Disallow: /api/*)**
   - `https://www.thejawedhabibsalons.in/login` -> **Blocked (Disallow: /login)**

---

## 7. Monitoring Core Web Vitals & Search Performance

### Core Web Vitals (CWV) Targets
Under **Experience** > **Core Web Vitals** in GSC:
- **LCP (Largest Contentful Paint):** `< 2.5s` (Optimized via Next.js responsive WebP images and font preconnect).
- **INP (Interaction to Next Paint):** `< 200ms` (Optimized via client-side debounced state and lean bundle execution).
- **CLS (Cumulative Layout Shift):** `< 0.1` (Zero layout shifts; all image containers and video frames reserve exact aspect ratio dimensions).

### Recommended Weekly Webmaster Routine
1. **Performance Tab:** Filter by Queries containing `"lalganj"`, `"jawed habib"`, `"salon"`, `"bridal"`. Track impressions, clicks, and Average Position.
2. **Pages Tab:** Verify that all 17 public routes are marked **"Indexed"**. Confirm that 0 valid pages are marked "Excluded by noindex tag".
3. **Enhancements Tab:** Check for rich snippet validation:
   - `LocalBusiness` / `HairSalon`
   - `Breadcrumbs`
   - `FAQ`
   - `Sitelinks Search Box`
