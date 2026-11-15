# BUSINESS INFORMATION VERIFICATION REPORT
## The Jawed Habib Salon – Lalganj

**Document Type:** Business Information Audit & Ground Truth Verification  
**Project:** The Jawed Habib Salon – Lalganj  
**Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Vaishali, Bihar – 844121  
**Official Domain:** `https://www.thejawedhabibsalons.in`  
**Date:** November 2026  
**Status:** **AUDITED & VERIFIED**  

---

## 1. Permanent Ground Truth Business Identity

| Information Field | Configured Ground Truth Value | Source in Codebase | Verification Status |
| :--- | :--- | :--- | :--- |
| **Official Business Name** | **The Jawed Habib Salon** | `BRAND_CONFIG.name` | **VERIFIED** |
| **Branch Identification** | **Lalganj** | `BRAND_CONFIG.branch` | **VERIFIED** |
| **Full Business Title** | **The Jawed Habib Salon – Lalganj** | `BRAND_CONFIG.fullName` | **VERIFIED** |
| **Physical Street Address** | **1st Floor, Tinpulwa Chowk** | `BRAND_CONFIG.location.addressLine1` | **VERIFIED** |
| **Landmark** | **Above Killer Showroom, Opposite Manglam Mart** | `BRAND_CONFIG.location.landmark` | **VERIFIED** |
| **City, District, State** | **Lalganj, Vaishali, Bihar** | `BRAND_CONFIG.location.city, state` | **VERIFIED** |
| **Postal PIN Code** | **844121** | `BRAND_CONFIG.location.pinCode` | **VERIFIED** |
| **Full Physical Address** | **1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121** | `BRAND_CONFIG.location.fullAddress` | **VERIFIED** |
| **Primary Desk Phone** | **7707000463** | `BRAND_CONFIG.contact.primaryPhone` | **VERIFIED** |
| **Secondary Support Phone** | **9831722983** | `BRAND_CONFIG.contact.secondaryPhone` | **VERIFIED** |
| **Tertiary Support Phone** | **9580000175** | `BRAND_CONFIG.contact.tertiaryPhone` | **VERIFIED** |
| **WhatsApp Support Line** | **+91 77070 00463** | `BRAND_CONFIG.contact.whatsappFormatted` | **VERIFIED** |
| **Operational Business Email** | **contact@jawedhabib-lalganj.in** | `BRAND_CONFIG.contact.email` | **VERIFIED** *(Owner custom inbox setup pending)* |
| **Operating Days** | **Monday to Sunday (Open all 7 days)** | `BRAND_CONFIG.hours.days` | **VERIFIED** |
| **Daily Operating Hours** | **10:00 AM – 10:00 PM** | `BRAND_CONFIG.hours.open, close` | **VERIFIED** |
| **Official Website Domain** | **https://www.thejawedhabibsalons.in** | `NEXT_PUBLIC_APP_URL` | **VERIFIED** |
| **Official Instagram Profile** | **https://www.instagram.com/the_jawedhabib_lalganj/** | `BRAND_CONFIG.contact.instagramUrl` | **VERIFIED** |
| **Google Maps Coordinates** | **Lat: 25.8675, Lng: 85.1764** | `BRAND_CONFIG.location.coordinates` | **VERIFIED** |
| **Google Maps Short URL** | **https://maps.app.goo.gl/TVx48xoWEu8dMvXT9** | `BRAND_CONFIG.location.googleMapsUrl` | **VERIFIED** |

---

## 2. Service Catalog & Active Pricing Ground Truth

All services and prices are derived directly from the application database repository (`src/lib/db/repo.ts`):

| Service Code | Service Title | Category | Canonical Price (INR) | Advance Deposit Required | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `srv_1` | Standard Precision Haircut | Hair | ₹299 | Optional / Pay at Salon Counter | **VERIFIED** |
| `srv_2` | Haircut with Deep Hairwash & Blowdry | Hair | ₹349 | Optional / Pay at Salon Counter | **VERIFIED** |
| `srv_3` | Global Hair Colour | Color | ₹2,499 (Starting) | In-Chair Hair Consultation Quote | **VERIFIED** |
| `srv_4` | Creative Highlights & Balayage | Color | ₹1,999 (Starting) | In-Chair Hair Consultation Quote | **VERIFIED** |
| `srv_5` | L'Oréal Deep Nourishing Hair Spa | Spa | ₹999 (Regular ₹1,200) | Optional / Pay at Salon Counter | **VERIFIED** |
| `srv_6` | Keratin Protein Treatment | Chemical | ₹3,499 (Starting) | In-Chair Hair Consultation Quote | **VERIFIED** |
| `srv_7` | Jawed Habib Gold Radiance Facial | Beauty | ₹1,699 (Regular ₹2,000) | Optional / Pay at Salon Counter | **VERIFIED** |
| `srv_8` | Royal Hot Towel Beard Sculpting | Grooming | ₹199 (Regular ₹250) | Optional / Pay at Salon Counter | **VERIFIED** |
| `srv_9` | Party Makeup & Glam Styling | Makeup | ₹1,499 (Regular ₹1,999) | ₹1,000 to ₹1,499 Online Deposit | **VERIFIED** |
| `srv_bridal_1` | Jawed Habib Signature HD Bridal Makeup | Bridal | ₹5,000 | ₹1,000 to ₹2,500 Online Deposit | **VERIFIED** |

### Curated Package Rates
- **Essential Refresh:** ₹499 (Haircut, Hair Wash, Scalp Acupressure, Matte Styling) — **VERIFIED**
- **Habib Royal Signature:** ₹1,299 (Designer Cut, L'Oréal Hair Spa, Herbal De-Tan, Hot Towel Acupressure, Blowdry) — **VERIFIED**
- **Luxury Pre-Bridal / Groom:** ₹4,999 (24K Gold Facial, Keratin Spa, Aroma Manicure/Pedicure, Full Face/Arms De-Tan, Style Diagnostic) — **VERIFIED**

---

## 3. Operational Booking & Payment Rules

| Rule Domain | Application Implementation | Verification Status |
| :--- | :--- | :--- |
| **Booking Horizon** | Clients can book appointments up to 30 days in advance via website or phone. | **VERIFIED** |
| **Advance Deposit Scope** | Online advance deposits are enabled for bridal packages and VIP suites to lock chambers; regular services can be reserved without an upfront card deposit. | **VERIFIED** |
| **Payment Gateways** | Online transactions: **Razorpay** (UPI, Cards, NetBanking). Salon counter transactions: **Cash, UPI QR, Debit/Credit Card terminal**. | **VERIFIED** |
| **Currency** | Strictly Indian National Rupees (INR / ₹) with paise precision (integer storage). | **VERIFIED** |
| **Taxes & Surcharges** | No undisclosed service surcharges. Final pricing confirmed during in-chair consultation before chemical work begins. | **VERIFIED** |
| **Grace Period** | 15 minutes past scheduled appointment time before station may be released to waiting walk-in clients. | **VERIFIED** |

---

## 4. Pending Owner-Confirmation Requirements

The following administrative details could not be resolved from code or public documentation and require explicit business owner confirmation:

1. **GST Registration Status (`SALON_LEGAL_GSTIN`):**
   - *Status:* **REQUIRES OWNER APPROVAL**
   - *Detail:* Need to confirm whether the business operates under Composition Scheme, Regular GSTIN (15-digit code), or is currently unregistered under the ₹20L service turnover threshold.
2. **Dedicated Business Email Hosting:**
   - *Status:* **REQUIRES OWNER APPROVAL**
   - *Detail:* Code references `contact@jawedhabib-lalganj.in`. Owner must confirm whether this Google Workspace / Zoho Mail inbox is live or if incoming messages should route to a specific owner Gmail.
3. **Formal Legal Entity Name:**
   - *Status:* **REQUIRES LEGAL REVIEW**
   - *Detail:* Confirm whether the commercial bank account registered with Razorpay is under a Sole Proprietorship (e.g. *The Jawed Habib Salon*) or an individual proprietor name.

---

*Report Verified by: Principal Software Architect & QA Automation Lead*  
*Organization: The Jawed Habib Salon – Lalganj*
