import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { Truck, MapPin, Clock, Calendar, CheckCircle2, ShieldCheck, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Service Delivery Policy | The Jawed Habib Salon Lalganj",
  description:
    "Official Shipping and Service Delivery Policy for The Jawed Habib Salon in Lalganj, Bihar. Clarifying in-person service fulfillment and electronic booking delivery.",
  alternates: {
    canonical: "/shipping-delivery-policy",
  },
  openGraph: {
    title: "Shipping & Service Delivery Policy | The Jawed Habib Salon Lalganj",
    description:
      "Understand how in-person salon services are delivered and how digital appointment confirmations are issued at The Jawed Habib Salon in Lalganj.",
    url: "https://www.thejawedhabibsalons.in/shipping-delivery-policy",
  },
};

export default function ShippingDeliveryPolicyPage() {
  return (
    <div className="min-h-screen bg-salon-black text-salon-ivory py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shipping & Delivery Policy", href: "/shipping-delivery-policy" },
          ]}
        />

        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <Badge variant="gold">
            <Truck className="mr-1.5 h-3.5 w-3.5" />
            Service Fulfillment &amp; Electronic Confirmation
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Shipping &amp; Service Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Effective Date: November 2026 • The Jawed Habib Salon, 1st Floor, Tinpulwa Chowk, Lalganj, Vaishali, Bihar – 844121
          </p>
        </div>

        {/* Clear Non-Physical Shipping Notice */}
        <div className="p-6 rounded-2xl border border-salon-gold/30 bg-zinc-950 space-y-3">
          <div className="flex items-center gap-2 text-salon-gold font-serif font-bold text-sm sm:text-base">
            <ShieldCheck className="h-5 w-5" />
            <span>Salon Service Nature of Business</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
            <strong>The Jawed Habib Salon – Lalganj</strong> is an in-person, luxury salon and beauty establishment. We provide professional hair, beauty, skin, restorative spa, bridal makeover, and men&apos;s grooming services.
          </p>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs space-y-1 text-zinc-300">
            <p className="font-semibold text-white">Notice for Razorpay Payment Verification &amp; Website Visitors:</p>
            <p>
              • <strong>NO PHYSICAL GOODS ARE SHIPPED OR DELIVERED VIA COURIER</strong> through this website.
            </p>
            <p>
              • All appointments and services booked through this website are fulfilled <strong>exclusively in-person</strong> at our physical salon premises in Lalganj, Bihar.
            </p>
            <p>
              • Booking confirmations and payment receipts are delivered <strong>electronically</strong> immediately upon transaction completion.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-xs sm:text-sm leading-relaxed text-zinc-300 font-light">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              1. Electronic Delivery of Booking Confirmations
            </h2>
            <p>
              When a client books an appointment or pays an online advance deposit on <strong>https://www.thejawedhabibsalons.in</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Instant On-Screen Confirmation:</strong> Immediately following transaction completion, an on-screen confirmation card is displayed presenting your unique <strong>Booking Reference Number</strong> (e.g., <code>JH-LLG-XXXX</code>), selected date, scheduled time, service details, and payment amount.
              </li>
              <li>
                <strong className="text-zinc-200">Electronic Notification:</strong> If a customer mobile number or email address is provided, our automated notification service dispatches a booking confirmation message and a digital transaction receipt within minutes of capture.
              </li>
              <li>
                <strong className="text-zinc-200">Downloadable PDF Invoice:</strong> An electronic voucher and receipt can be saved or printed directly from the confirmation screen or generated at the salon reception desk.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              2. Physical Service Fulfillment Location
            </h2>
            <p>
              Your booked treatments and styling sessions are fulfilled exclusively at our salon premises:
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-salon-gold flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm sm:text-base">{BRAND_CONFIG.fullName}</p>
                  <p className="text-zinc-300">{BRAND_CONFIG.location.fullAddress}</p>
                  <p className="text-salon-gold text-xs">Landmark: {BRAND_CONFIG.location.landmark}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                <Clock className="h-4 w-4 text-salon-gold flex-shrink-0" />
                <span>Operating Timings: {BRAND_CONFIG.hours.display} (Open all 7 days)</span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              3. Check-In &amp; Arrival Instructions
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                <strong>Arrival Time:</strong> Please arrive at the salon <strong>5 to 10 minutes prior</strong> to your scheduled appointment time.
              </li>
              <li>
                <strong>Verification at Reception:</strong> Simply present your Booking Reference Number or your 10-digit mobile phone number to our front desk concierge upon arrival.
              </li>
              <li>
                <strong>Consultation:</strong> Your allocated master stylist will review your requested services and conduct a brief consultation before styling commences.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              4. Missed Appointments &amp; Delays
            </h2>
            <p>
              We understand travel delays may occur:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                <strong>Grace Period:</strong> We hold reserved styling stations for 15 minutes past the scheduled slot.
              </li>
              <li>
                <strong>Delayed Arrival:</strong> If you anticipate being late, please telephone our desk immediately at <strong>+91 {BRAND_CONFIG.contact.primaryPhone}</strong>. We will make every effort to accommodate you on the same day.
              </li>
              <li>
                <strong>Unnotified Absence:</strong> If a client does not arrive within 15 minutes and has not contacted the desk, the chair may be reassigned to waiting walk-in clients to ensure schedule continuity.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
              5. Contact Salon Desk for Service Inquiries
            </h2>
            <p>
              If you have any questions regarding your electronic appointment confirmation or need driving directions to our salon:
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-1.5 text-xs">
              <p><strong className="text-white">Desk Phone:</strong> +91 {BRAND_CONFIG.contact.primaryPhone} / +91 {BRAND_CONFIG.contact.secondaryPhone}</p>
              <p><strong className="text-white">WhatsApp:</strong> +91 {BRAND_CONFIG.contact.whatsappPhone}</p>
              {BRAND_CONFIG.contact.email && (
                <p><strong className="text-white">Email:</strong> {BRAND_CONFIG.contact.email}</p>
              )}
              <p><strong className="text-white">Google Maps:</strong> <a href={BRAND_CONFIG.location.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-salon-gold hover:underline">Open Location in Google Maps</a></p>
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
            <Link href="/cancellation-refund-policy">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs">
                Cancellation &amp; Refund Policy →
              </Button>
            </Link>
            <Link href="/booking">
              <Button variant="gold" size="sm" className="gap-2 text-xs">
                <Calendar className="h-4 w-4" />
                <span>Book Appointment Online</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
