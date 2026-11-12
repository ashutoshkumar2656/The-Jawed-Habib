# Remaining Requirements & Pre-Launch Action Items: The Jawed Habib Salon – Lalganj

While the software platform, frontend website, appointment booking engine, customer portal, and 20-module admin dashboard are completely developed, tested, and production-ready, this document outlines the **external third-party credentials**, **salon-owner assets**, and **post-launch enhancements** required prior to commercial live operations.

---

## 1. Missing External API Credentials & Services

To connect the application to live cloud services, the salon owner or technical administrator must provide:

| Service / Provider | Purpose | Status | Action Required |
| :--- | :--- | :--- | :--- |
| **Neon PostgreSQL Database** | Production database hosting | Ready for connection string | Create database instance on [neon.tech](https://neon.tech) and supply `DATABASE_URL`. |
| **Cloudinary Media Cloud** | Image uploads for transformations & gallery | Configured via environment variables | Provide `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` from Cloudinary dashboard. |
| **WhatsApp Business API** | Automated booking confirmation alerts via WhatsApp | Optional / Prepared | Register WhatsApp Business Cloud API account to enable direct message dispatch to customers. |
| **SMS Gateway (e.g. Fast2SMS / MSG91)** | SMS notifications to Indian mobile numbers | Optional / Prepared | Provide SMS API key if SMS confirmation is desired alongside WhatsApp. |
| **Payment Gateway (e.g. Razorpay)** | Online deposit payments | Pay-At-Salon active | If the salon wishes to mandate advance booking deposits, integrate Razorpay key and secret. |

---

## 2. Information Required from Salon Owner (Lalganj Branch)

The following operational assets and business documentation should be collected from the branch owner:

1. **Custom Domain Registrar DNS Access**:
   - Access to GoDaddy, Namecheap, or Cloudflare to point DNS records (`A` and `CNAME`) to Vercel.
2. **Official Salon Staff Photographs**:
   - High-resolution photographs of the actual master stylists on floor in Lalganj to replace demonstration stock photography.
3. **Official Salon Interior Photography**:
   - High-definition photography of the 1st Floor Tinpulwa Chowk salon floor, bridal suite, and washing stations to expand the visual gallery.
4. **GSTIN & Business Registration Number**:
   - The salon's official GSTIN number for display on the bottom of client printable receipts and invoice vouchers.
5. **Initial Staff Roster & Shifts**:
   - The names and contact phone numbers of all active staff members in Lalganj for onboarding into the Staff Management module.

---

## 3. Post-Launch Enhancement Roadmap

1. **Automated WhatsApp Reminders**:
   - Dispatch an automated WhatsApp reminder to clients 2 hours prior to their scheduled chair time to minimize no-shows.
2. **Thermal Receipt Printer Integration**:
   - Connect web browser print styles to 80mm thermal receipt printers at the reception counter for instantaneous walk-in payment receipts.
3. **QR Code Check-In Standee**:
   - Print a desk QR code standee linking directly to `https://thejawedhabib-lalganj.com/booking` or `/register` to allow walk-in guests to enroll in the Habib Loyalty Club while waiting in the lounge.
