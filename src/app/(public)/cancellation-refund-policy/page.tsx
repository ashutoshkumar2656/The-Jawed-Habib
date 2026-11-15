import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { RotateCcw, Calendar, Phone, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation and Refund Policy | The Jawed Habib Salon Lalganj",
  description:
    "Official Cancellation and Refund Policy for appointment bookings and advance deposits at The Jawed Habib Salon in Lalganj, Vaishali, Bihar.",
  alternates: {
    canonical: "/cancellation-refund-policy",
  },
  openGraph: {
    title: "Cancellation & Refund Policy | The Jawed Habib Salon Lalganj",
    description:
      "Guidelines on booking cancellations, rescheduling, advance deposit treatment, duplicate payments, and refund processing for salon services in Lalganj.",
    url: "https://www.thejawedhabibsalons.in/cancellation-refund-policy",
  },
};

export default function CancellationRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-salon-black text-salon-ivory py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cancellation & Refund Policy", href: "/cancellation-refund-policy" },
          ]}
        />

        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <Badge variant="gold">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Customer Service &amp; Payment Protection
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Effective Date: November 2026 • The Jawed Habib Salon, 1st Floor, Tinpulwa Chowk, Lalganj, Bihar – 844121
          </p>
        </div>

        {/* Commercial Policy Notice Box */}
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-xs sm:text-sm text-amber-200/90 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Salon Concierge Notice on Advance Deposits &amp; Refunds</span>
          </div>
          <p className="leading-relaxed font-light text-xs">
            We strive to be completely fair and customer-friendly. To ensure full transparency for Razorpay website verification and our valued clientele, all refund requests and deposit adjustments are processed through our salon desk. Specific commercial cutoff windows and custom bridal package terms are confirmed directly with clients during booking consultation.
          </p>
        </div>

        <div className="space-y-10 text-xs sm:text-sm leading-relaxed text-zinc-300 font-light">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              1. Appointment Cancellation Process
            </h2>
            <p>
              If your plans change and you cannot attend your scheduled appointment, please notify our salon reception as soon as possible.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                <strong>How to Cancel:</strong> Call our direct desk lines at <strong>+91 {BRAND_CONFIG.contact.primaryPhone}</strong> or <strong>+91 {BRAND_CONFIG.contact.secondaryPhone}</strong>, or message our official WhatsApp concierge with your Booking Reference number (e.g., <code>JH-LLG-XXXX</code>).
              </li>
              <li>
                <strong>Early Notice:</strong> Providing early notice allows our stylists to open the chair to other clients and helps our team accommodate your reschedule promptly.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              2. Appointment Rescheduling
            </h2>
            <p>
              We gladly accommodate appointment rescheduling without penalty whenever slot availability permits:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Clients may request to move their appointment to any open slot within our normal operating hours (Monday to Sunday, 10:00 AM – 10:00 PM).</li>
              <li>For bridal suite bookings, rescheduling is subject to dressing room and master stylist availability on the requested alternative date.</li>
              <li>Any advance deposit already paid will be credited forward directly toward your rescheduled appointment.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              3. Treatment of Advance Booking Deposits
            </h2>
            <p>
              For standard haircuts and regular salon visits, no advance deposit is collected online; payment is made at the counter after your service is completed. For specialized bridal makeover packages or VIP dressing suite allocations, an advance deposit (typically ₹1,000 to ₹2,500) is collected online via Razorpay to lock the reserved bridal chamber and dedicate senior artists.
            </p>
            <p>
              <strong>Deposit Refund Eligibility:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                <strong>Notice Provided in Advance:</strong> If you cancel with reasonable advance notice, your deposit can either be transferred to a future appointment date or evaluated for a refund upon review by the Salon Manager.
              </li>
              <li>
                <strong>Bespoke Bridal Consultations:</strong> Because bridal slots involve dedicated artist blocking and custom cosmetics procurement, bridal cancellation terms are provided in writing during your pre-booking consultation.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              4. Salon-Initiated Cancellations (100% Guaranteed Protection)
            </h2>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Full Refund Guarantee</span>
              </div>
              <p className="text-zinc-300 text-xs sm:text-sm">
                In the rare event that <strong>The Jawed Habib Salon – Lalganj</strong> must reschedule or cancel your appointment due to unforeseen circumstances (such as emergency power outage, sudden artist medical emergency, or facility maintenance):
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-400">
                <li>You will be offered immediate priority rescheduling to an alternative date or time of your choice.</li>
                <li>If the proposed reschedule does not suit your schedule, you are entitled to a <strong>100% full refund</strong> of any online advance deposit paid, processed without deductions.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              5. Duplicate Transactions &amp; Billing Errors
            </h2>
            <p>
              If a technical glitch causes a duplicate charge or multiple deductions for a single booking:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Our automated system checks for duplicate payment IDs and will flag the excess payment.</li>
              <li>Clients can contact our desk with their bank SMS or Razorpay payment reference (<code>pay_xxxx</code>).</li>
              <li>Once verified, <strong>100% of the duplicate amount will be refunded</strong> directly through the Razorpay payment gateway to your original payment method.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              6. Payment Deducted But Booking Not Confirmed
            </h2>
            <p>
              Occasionally, network interruptions between your bank, UPI app, and the payment gateway can result in funds being debited while the booking screen fails to show confirmation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                <strong>Automated Webhook Reconciliation:</strong> Our server webhook automatically listens for background payment confirmations from Razorpay. Once Razorpay confirms the capture, our system locks the slot and dispatches your confirmation email/SMS.
              </li>
              <li>
                <strong>Slot Expired/Unavailable:</strong> If the slot reservation expired before payment completed and the slot was taken by another client, our system records the captured funds, alerts the salon concierge, and our desk will contact you immediately to either assign an alternative stylist or issue a prompt refund.
              </li>
              <li>
                <strong>Bank Rollback:</strong> If the transaction was not captured by Razorpay, the funds are automatically reversed by your issuing bank within standard banking turnaround (typically 3 to 5 business days).
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              7. Customer Late Arrival &amp; No-Show Policy
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>We hold scheduled appointments for a <strong>15-minute grace period</strong> past the scheduled start time.</li>
              <li>If you arrive after 15 minutes without notifying our team, the chair may be released to waiting walk-in clients to prevent delays for subsequent appointments.</li>
              <li>In case of late arrival, we will do our best to perform an adjusted service or offer the next available opening on the same day.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              8. Refund Request &amp; Turnaround Procedure
            </h2>
            <p>
              To initiate a refund inquiry:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-zinc-400">
              <li>Contact our desk via phone (+91 {BRAND_CONFIG.contact.primaryPhone}) or email ({BRAND_CONFIG.contact.email}) with your <strong>Booking Reference</strong> and <strong>Razorpay Payment ID</strong>.</li>
              <li>Our salon administration verifies the transaction in our Razorpay merchant dashboard.</li>
              <li>Approved refunds are triggered directly via Razorpay REST API back to the original funding source (UPI ID, Debit Card, or Bank Account).</li>
              <li><strong>Banking Turnaround:</strong> Once initiated by the salon, the refund is credited by your issuing bank within <strong>5 to 7 business days</strong> depending on your banking network. Razorpay issues a refund reference (<code>rfnd_xxxx</code>) for tracking.</li>
            </ol>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              9. Contact Salon Concierge for Cancellations
            </h2>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-2 text-xs">
              <p className="font-bold text-white">{BRAND_CONFIG.fullName}</p>
              <p className="text-zinc-300">{BRAND_CONFIG.location.fullAddress}</p>
              <p className="text-zinc-300">
                <strong>Primary Front Desk:</strong> <a href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`} className="text-salon-gold hover:underline font-mono">+91 {BRAND_CONFIG.contact.primaryPhone}</a>
              </p>
              <p className="text-zinc-300">
                <strong>Support Line 2:</strong> <a href={`tel:+91${BRAND_CONFIG.contact.secondaryPhone}`} className="text-salon-gold hover:underline font-mono">+91 {BRAND_CONFIG.contact.secondaryPhone}</a>
              </p>
              <p className="text-zinc-300">
                <strong>Support Line 3:</strong> <a href={`tel:+91${BRAND_CONFIG.contact.tertiaryPhone}`} className="text-salon-gold hover:underline font-mono">+91 {BRAND_CONFIG.contact.tertiaryPhone}</a>
              </p>
              {BRAND_CONFIG.contact.email && (
                <p className="text-zinc-300">
                  <strong>Email:</strong> <a href={`mailto:${BRAND_CONFIG.contact.email}`} className="text-salon-gold hover:underline font-mono">{BRAND_CONFIG.contact.email}</a>
                </p>
              )}
              <p className="text-salon-gold pt-1">Desk Hours: Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days)</p>
            </div>
          </section>
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Return to Homepage
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/terms-and-conditions">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs">
                Terms &amp; Conditions →
              </Button>
            </Link>
            <Link href="/shipping-delivery-policy">
              <Button variant="gold" size="sm" className="text-xs">
                Service Delivery Policy →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
