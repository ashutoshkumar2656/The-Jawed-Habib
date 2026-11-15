import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { ShieldAlert, Calendar, Phone, ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions | The Jawed Habib Salon Lalganj",
  description:
    "Official customer terms and conditions for salon services, appointment booking, payments, and salon policies at The Jawed Habib Salon in Lalganj, Vaishali, Bihar.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | The Jawed Habib Salon Lalganj",
    description:
      "Review the customer booking terms, service policies, payment rules, and salon guidelines for The Jawed Habib Salon in Lalganj, Bihar.",
    url: "https://www.thejawedhabibsalons.in/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-salon-black text-salon-ivory py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Terms & Conditions", href: "/terms-and-conditions" },
          ]}
        />

        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <Badge variant="gold">
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
            Official Salon Service Agreement
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Effective Date: November 2026 • The Jawed Habib Salon, 1st Floor, Tinpulwa Chowk, Lalganj, Vaishali, Bihar – 844121
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm leading-relaxed text-zinc-300 font-light">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              1. Website Use &amp; Acceptance of Terms
            </h2>
            <p>
              Welcome to the official website of <strong>{BRAND_CONFIG.fullName}</strong> (&quot;the Salon&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), accessible via <strong>https://www.thejawedhabibsalons.in</strong>. By accessing this website, browsing services, submitting inquiries, or booking appointments, you agree to comply with and be bound by these Terms and Conditions (&quot;Terms&quot;), together with our Privacy Policy, Cancellation &amp; Refund Policy, and Shipping &amp; Service Delivery Policy. If you do not agree with these Terms, please refrain from using our online platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              2. Salon Service Information &amp; Descriptions
            </h2>
            <p>
              We provide professional hair styling, haircut geometry, hair coloring, restorative hair spa, dermatologically tested facials, bridal makeup, pre-bridal grooming, and men&apos;s luxury grooming services. While we endeavor to ensure service descriptions, photographs, and duration estimates are precise, outcomes may vary depending on natural hair texture, hair history, skin type, and individual consultation requirements.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              3. Appointment Booking Process
            </h2>
            <p>
              Clients may reserve appointment slots through our website booking interface, by contacting the front desk via phone (+91 {BRAND_CONFIG.contact.primaryPhone}), or by visiting our premises in person. Bookings are accepted up to 30 days in advance subject to stylist and station availability.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              4. Accuracy of Customer Information
            </h2>
            <p>
              When booking an appointment or submitting an inquiry, you agree to provide true, accurate, current, and complete details, including your full name and an active 10-digit mobile number capable of receiving calls and SMS/WhatsApp notifications. Inaccurate contact details may lead to automatic cancellation of unconfirmed appointments.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              5. Appointment Confirmation &amp; Verification
            </h2>
            <p>
              Online appointments receive a unique, computer-generated Booking Reference (e.g., <code>JH-LLG-XXXX</code>). For appointments requiring advance deposits (such as VIP bridal suites), reservations are finalized once the payment confirmation is received from Razorpay. For standard walk-in and counter bookings, the salon desk may reach out via telephone to re-confirm your attendance.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              6. Booking Modifications &amp; Rescheduling
            </h2>
            <p>
              Clients may request a change of appointment date or time by contacting our salon concierge at +91 {BRAND_CONFIG.contact.primaryPhone}. Rescheduling is subject to slot availability and should be requested promptly to allow re-allocation of stylist schedules.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              7. Cancellation Guidelines
            </h2>
            <p>
              If you need to cancel a reserved appointment, please notify the salon reception as early as possible. Full details regarding advance deposit eligibility and refund timelines are set forth in our dedicated <Link href="/cancellation-refund-policy" className="text-salon-gold hover:underline font-medium">Cancellation and Refund Policy</Link>.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              8. Late Arrival &amp; No-Show Policy
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong>Arrival:</strong> Please arrive 5 to 10 minutes prior to your scheduled slot for consultation and preparation.</li>
              <li><strong>Grace Period:</strong> We provide a 15-minute grace period. If you arrive more than 15 minutes late without prior notice, we will endeavor to accommodate you; however, service duration may need to be adjusted or rescheduled to respect subsequent clients.</li>
              <li><strong>No-Shows:</strong> Clients who fail to appear without notice impact stylist time and station readiness. Repeated unnotified no-shows may require mandatory advance booking confirmation for future reservations.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              9. Online Advance Payments via Razorpay
            </h2>
            <p>
              For select bridal packages, premium suites, or festive slots, clients may pay an advance booking deposit online. Online payments are processed through Razorpay Payment Gateway, an authorized, PCI-DSS Level 1 compliant gateway. We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Debit Cards, Credit Cards, and Net Banking supported by Razorpay.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              10. Counter &amp; In-Person Payments
            </h2>
            <p>
              For standard appointments and any remaining balances following an online deposit, payment is settled in person at the salon reception desk upon service completion. Our front desk accepts Cash, UPI QR code scanning, and major Debit/Credit Cards.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              11. Pricing, Currency &amp; Quotations
            </h2>
            <p>
              All prices and deposit amounts on this website are listed in Indian Rupees (INR). Prices for chemical hair transformations (Smoothening, Keratin, Balayage, Global Color) and bridal makeovers are indicative starting rates. The exact final price is based on hair length, density, product volume, and complexity, and will be agreed upon with you in person prior to service commencement.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              12. Payment Verification &amp; Transaction Invoices
            </h2>
            <p>
              Upon successful payment, an automated digital receipt and confirmation are issued. Detailed electronic invoices are available from the reception desk or sent to your registered email upon request. The salon employs timing-safe HMAC-SHA256 signature verification to ensure authentic, non-tampered payment processing.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              13. Service Fulfilment &amp; Location
            </h2>
            <p>
              All salon services booked through this website are fulfilled exclusively in-person at our physical salon branch located at:
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1 text-xs">
              <p className="font-bold text-white">{BRAND_CONFIG.fullName}</p>
              <p className="text-zinc-300">{BRAND_CONFIG.location.fullAddress}</p>
              <p className="text-salon-gold">Operating Hours: {BRAND_CONFIG.hours.display} (Open all 7 days)</p>
            </div>
            <p className="text-xs text-zinc-400">
              No physical products or goods are shipped via courier.
            </p>
          </section>

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              14. Customer Health, Safety &amp; Allergy Disclosures
            </h2>
            <p>
              Clients must inform their stylist prior to treatment of any pre-existing scalp irritations, skin sensitivities, medical conditions, or previous allergic reactions to cosmetic or chemical products. For clients undergoing permanent hair color or chemical treatments for the first time, a complimentary 24-hour patch test is recommended. The Salon is not liable for adverse reactions resulting from undisclosed sensitivities.
            </p>
          </section>

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              15. Service Feedback &amp; Grievance Redressal
            </h2>
            <p>
              Your satisfaction is central to our reputation. If you have any concerns regarding your haircut, makeup, or styling result, please bring it to the immediate attention of our Salon Manager before leaving the premises, or contact our customer desk within 24 hours of service so we may evaluate appropriate adjustments.
            </p>
          </section>

          {/* Section 16 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              16. Website Availability &amp; Technical Limitations
            </h2>
            <p>
              While we strive for continuous website availability, we do not guarantee uninterrupted access. Scheduled maintenance, server upgrades, or telecommunications disruptions may occasionally occur. The Salon is not liable for temporary service interruptions.
            </p>
          </section>

          {/* Section 17 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              17. Amendments to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time to reflect operational, commercial, or regulatory updates. Any changes will become effective immediately upon posting to this page with an updated &quot;Effective Date&quot;.
            </p>
          </section>

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              18. Salon Contact Information
            </h2>
            <p>
              For questions regarding these Terms and Conditions or your booking, please reach out directly:
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1.5 text-xs">
              <p><strong className="text-white">Desk Phone:</strong> +91 {BRAND_CONFIG.contact.primaryPhone} / +91 {BRAND_CONFIG.contact.secondaryPhone}</p>
              <p><strong className="text-white">WhatsApp:</strong> +91 {BRAND_CONFIG.contact.whatsappPhone}</p>
              {BRAND_CONFIG.contact.email && (
                <p><strong className="text-white">Email:</strong> {BRAND_CONFIG.contact.email}</p>
              )}
              <p><strong className="text-white">Address:</strong> {BRAND_CONFIG.location.fullAddress}</p>
            </div>
          </section>

          {/* Section 19 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              19. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms or services rendered shall be subject to the exclusive jurisdiction of the competent courts in Vaishali District / Patna, Bihar, subject to appropriate formal legal review.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Return to Homepage
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/privacy-policy">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs">
                Privacy Policy →
              </Button>
            </Link>
            <Link href="/booking">
              <Button variant="gold" size="sm" className="gap-2 text-xs">
                <Calendar className="h-4 w-4" />
                <span>Book Appointment</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
