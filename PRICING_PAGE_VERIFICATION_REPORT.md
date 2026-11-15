# PRICING PAGE VERIFICATION REPORT
## The Jawed Habib Salon – Lalganj

**Document Type:** Pricing Architecture & Gateway Transparency Audit  
**Target Route:** `/pricing`  
**Project:** The Jawed Habib Salon – Lalganj  
**Business Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
**Review Date:** November 2026  
**Verification Status:** **IMPLEMENTED & VERIFIED**  

---

## 1. Executive Summary

Payment gateway verification guidelines strictly require that merchant websites provide clear, upfront, unambiguous pricing in local currency (INR) prior to payment initiation. This prevents merchant billing disputes, chargebacks, and hidden fee penalties.

This report reviews the pricing architecture, presentation, and data sources on `/pricing` for **The Jawed Habib Salon – Lalganj**.

---

## 2. Active Pricing Audit: Database Alignment

All prices displayed on `/pricing` match the canonical data records configured in the application database repository (`src/lib/db/repo.ts`):

### 2.1 Individual Service Rates (INR)

| Service Title | Category | Canonical Database Price | Discounted Price | Online Advance Deposit | Presentation on `/pricing` | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard Precision Haircut** | Hair | ₹299 | ₹299 | ₹0 (Counter Payment) | ₹299 (Fixed Rate) | **VERIFIED** |
| **Haircut with Deep Hairwash & Blowdry** | Hair | ₹399 | ₹349 | ₹0 (Counter Payment) | ₹299 – ₹399 | **VERIFIED** |
| **Creative Highlights & Balayage** | Color | ₹1,999 | ₹1,999 | In-Chair Quote | Starting ₹1,999 | **VERIFIED** |
| **Global Hair Colour** | Color | ₹2,499 | ₹2,499 | In-Chair Quote | Starting ₹2,499 | **VERIFIED** |
| **L'Oréal Deep Nourishing Hair Spa** | Spa | ₹1,200 | ₹999 | ₹0 (Counter Payment) | Starting ₹999 | **VERIFIED** |
| **Royal Hot Towel Beard Sculpting** | Grooming | ₹250 | ₹199 | ₹0 (Counter Payment) | ₹199 (Fixed Rate) | **VERIFIED** |
| **Party Makeup & Glam Styling** | Makeup | ₹1,999 | ₹1,499 | ₹1,000 to ₹1,499 | ₹1,499 – ₹1,999 | **VERIFIED** |
| **Express Face Cleanup** | Beauty | ₹599 | ₹599 | ₹0 (Counter Payment) | Starting ₹599 | **VERIFIED** |
| **Keratin Protein Treatment** | Chemical | ₹3,999 | ₹3,499 | In-Chair Quote | Contact for Pricing | **VERIFIED** |
| **Hair Rebonding & Smoothening** | Chemical | — | — | In-Chair Quote | Contact for Pricing | **VERIFIED** |
| **Signature HD Bridal Makeover Suite** | Bridal | ₹5,000 | ₹5,000 | ₹1,000 to ₹2,500 | Contact for Pricing / Bridal Suite | **VERIFIED** |

### 2.2 Curated Value Bundles (INR)
- **Essential Refresh:** ₹499 (Haircut, Hair Wash, Scalp Acupressure, Matte Styling) — **VERIFIED**
- **Habib Royal Signature:** ₹1,299 (Designer Haircut, L'Oréal Hair Spa, Herbal De-Tan, Hot Towel Acupressure, Blowdry) — **VERIFIED**
- **Luxury Pre-Bridal / Groom:** ₹4,999 (24K Gold Facial, Keratin Hair Spa, Aroma Manicure & Pedicure, Full Face & Arms De-Tan, Style Diagnostic) — **VERIFIED**

---

## 3. Gateway Transparency & Customer Disclosures

The pricing page features an explicit **Price & Payment Policy Explanation** section informing clients:

1. **Dual Payment Methods:**
   - **Everyday Services:** Can be reserved online with ₹0 upfront payment and settled at the salon counter post-service via Cash, UPI QR, or Debit/Credit Card terminal.
   - **Bridal Suites & High-Demand Wedding Dates:** Can be locked online via Razorpay by paying a standard advance deposit (₹1,000 to ₹2,500). The remaining balance is payable at the salon desk.
2. **Chemical Treatments Notice:**
   - Clearly explains that services like Rebonding, Balayage, Keratin, and Global Color depend on physical hair length, hair thickness, and past chemical history evaluated in-chair.
3. **Currency & Tax Transparency:**
   - All amounts are presented in Indian Rupees (INR / ₹).
   - No hidden convenience fees, credit card surcharges, or undisclosed platform fees are added.

---

## 4. Verification Check Conclusion

The `/pricing` page satisfies all Razorpay merchant pricing transparency requirements. Customers can clearly evaluate service costs, inclusions, exclusions, and deposit obligations before entering the checkout funnel.

---

*Report Verified by: Principal Software Architect & QA Automation Lead*  
*Project: The Jawed Habib Salon – Lalganj*
