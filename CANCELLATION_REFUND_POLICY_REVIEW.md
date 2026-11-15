# CANCELLATION AND REFUND POLICY REVIEW
## The Jawed Habib Salon – Lalganj

**Document Type:** Commercial & Financial Policy Review  
**Target Route:** `/cancellation-refund-policy`  
**Project:** The Jawed Habib Salon – Lalganj  
**Business Location:** 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj, Bihar – 844121  
**Review Date:** November 2026  
**Compliance Status:** **IMPLEMENTED & VERIFIED (Commercial Thresholds Require Owner Approval)**  

---

## 1. Executive Summary

Payment gateway aggregators, including Razorpay, require an unambiguous, fair, and accessible **Cancellation & Refund Policy**. This document reviews the policy published at `/cancellation-refund-policy` for **The Jawed Habib Salon – Lalganj**.

The published policy establishes complete transparency for technical failures, duplicate deductions, and salon-initiated cancellations while carefully refraining from fabricating unapproved commercial penalties or arbitrary deposit forfeiture terms. All unresolved commercial cutoff points are compiled into an explicit **Owner Policy Approval Checklist**.

---

## 2. Policy Provisions & System Workflow Audit

| Policy Section | Policy Terms | System Handling Mechanism | Status |
| :--- | :--- | :--- | :--- |
| **1. Cancellation Process** | Client notifies desk via phone (`7707000463`) or WhatsApp with Booking Reference. | Desk updates status in `/admin/appointments` to `CANCELLED`; frees slot in calendar. | **VERIFIED** |
| **2. Rescheduling Policy** | Clients can reschedule to any open slot without penalty; deposits carry forward. | Rescheduling updates appointment date/time; maintains existing `PaymentRecord`. | **VERIFIED** |
| **3. Advance Payment Scope** | Advance deposits collected primarily for bridal suites (₹1,000–₹2,500) to dedicate private dressing rooms. | Controlled via `allowAdvancePayment: true` in service and package schemas. | **VERIFIED** |
| **4. Salon-Initiated Cancellation** | 100% full refund guaranteed if salon cancels due to power failure, emergency, or stylist unavailability. | Admin triggers instant refund in `/admin/payments` via Razorpay REST API. | **VERIFIED** |
| **5. Duplicate Payments** | 100% of duplicate transactions verified and refunded back to customer funding source. | Webhook idempotency and duplicate detection in `src/lib/db/repo.ts:verifyRazorpayPayment`. | **VERIFIED** |
| **6. Deducted But Unconfirmed** | Server webhook auto-reconciles within 15–30 minutes or alerts concierge if slot expired and occupied. | Implemented in `src/app/api/webhooks/razorpay/route.ts` with admin alerts. | **VERIFIED** |
| **7. Customer No-Show** | 15-minute grace period before station is released to waiting walk-in clients. | Admin marks appointment status as `NO_SHOW` in portal. | **VERIFIED** |
| **8. Refund Turnaround** | Processed through Razorpay back to source (UPI, Card, Bank) within 5 to 7 business days. | Standard Razorpay REST refund workflow issuing `rfnd_xxx` tracking ID. | **VERIFIED** |
| **9. Contact Channels** | Direct desk lines, WhatsApp, email, and in-person salon reception desk. | Displays all 3 confirmed phone numbers and physical address. | **VERIFIED** |

---

## 3. Strict Compliance Guardrail: No Fabricated Penalties

In accordance with master project directives, the policy **does not invent**:
- Arbitrary cancellation deadlines (e.g., "Must cancel 48 hours in advance").
- Arbitrary non-refundable deposit percentages (e.g., "50% non-refundable fee").
- Arbitrary rescheduling limits (e.g., "Only 1 reschedule allowed").
- Punitive no-show monetary fines.

Instead, the policy explicitly states that client cancellation requests on customized bridal packages are reviewed directly by the Salon Concierge, providing maximum customer goodwill while protecting business scheduling.

---

## 4. Owner Policy Approval Checklist for Commercial Thresholds

Before final public marketing campaigns, the salon owner must confirm the following commercial decisions:

| Commercial Question | Current Application Baseline | Owner Decision Options | Owner Approval Status |
| :--- | :--- | :--- | :--- |
| **Standard Cancellation Cutoff** | Concierge review upon notice | Option A: Free cancellation up to 4 hours before slot.<br>Option B: Free cancellation up to 24 hours before slot.<br>Option C: Discretionary concierge review on all cancellations. | **REQUIRES OWNER APPROVAL** |
| **Bridal Advance Forfeiture Rule** | Deposit carried forward to new date | Option A: 100% refundable if cancelled > 7 days prior.<br>Option B: Non-refundable within 48 hours of wedding date.<br>Option C: Advance credited strictly as salon voucher for future services. | **REQUIRES OWNER APPROVAL** |
| **Refund Processing Method** | Razorpay source reversal (5–7 days) | Standard banking turnaround confirmed. | **VERIFIED** |

---

*Report Verified by: Principal Software Architect & QA Automation Lead*  
*Project: The Jawed Habib Salon – Lalganj*
