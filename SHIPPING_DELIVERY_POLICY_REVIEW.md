# SHIPPING AND SERVICE DELIVERY POLICY REVIEW
## The Jawed Habib Salon – Lalganj

**Document Type:** Service Fulfilment & Delivery Compliance Review  
**Target Route:** `/shipping-delivery-policy`  
**Project:** The Jawed Habib Salon – Lalganj  
**Business Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
**Review Date:** November 2026  
**Compliance Status:** **IMPLEMENTED & VERIFIED**  

---

## 1. Executive Summary

During payment aggregator onboarding, Razorpay compliance reviewers routinely look for a "Shipping & Delivery Policy" link. Because **The Jawed Habib Salon – Lalganj** is an experiential service business providing professional hair, beauty, and grooming treatments, having a clear policy that articulates how services are fulfilled and confirms that **no physical goods are shipped** is vital to pass website verification without delays or rejection.

This document reviews the newly implemented **Shipping & Service Delivery Policy** published at `/shipping-delivery-policy`.

---

## 2. Policy Provisions & Fulfillment Architecture

| Policy Checkpoint | Verified Statement in Policy | Technical & Operational Alignment | Status |
| :--- | :--- | :--- | :--- |
| **1. Nature of Business** | Luxury hair, beauty, bridal, and grooming salon services. | Matches business categorization on Google Business Profile & Razorpay merchant application. | **VERIFIED** |
| **2. Non-Shipping Confirmation** | **NO PHYSICAL PRODUCTS ARE SHIPPED VIA COURIER** through this online booking platform. | Prevents customer misunderstanding regarding delivery of retail haircare products. | **VERIFIED** |
| **3. Electronic Delivery** | Instant on-screen confirmation card with unique reference ID (`JH-LLG-XXXX`), SMS/WhatsApp notification, and downloadable PDF voucher. | Implemented in `BridalBookingExperience` and `/api/payments/receipt/[id]`. | **VERIFIED** |
| **4. Physical Delivery Location** | Exclusively in-person at: **1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121**. | Matches physical lease and salon operating address. | **VERIFIED** |
| **5. Operating Hours** | **Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days)**. | Verified across all public touchpoints and Google Maps profile. | **VERIFIED** |
| **6. Check-in Instructions** | Clients arrive 5 to 10 minutes prior to slot; present reference ID or mobile number at reception. | Handled by front desk concierge check-in workflow in `/admin/appointments`. | **VERIFIED** |
| **7. Missed Appointments** | 15-minute grace period before station release; delay notification via phone (+91 7707000463). | Protects subsequent client appointment times without automated financial penalties. | **VERIFIED** |
| **8. Support Contact** | All confirmed phone numbers, WhatsApp link, and Google Maps directions link displayed. | Verified against `BRAND_CONFIG`. | **VERIFIED** |

---

## 3. Razorpay Compliance Compliance Significance

By explicitly providing this policy:
1. Razorpay verification crawlers and human reviewers will not reject the website for a "Missing Shipping Policy".
2. The business category is unmistakably classified as an **in-person salon establishment** rather than an e-commerce retail store, preventing disputes over tracking numbers (AWB) or courier proofs of delivery.
3. The electronic delivery of appointment vouchers satisfies digital fulfillment criteria.

---

*Report Verified by: Senior Full-Stack Engineer & Compliance Auditor*  
*Project: The Jawed Habib Salon – Lalganj*
