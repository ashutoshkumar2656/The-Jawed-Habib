import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { ShieldAlert, Calendar, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions | The Jawed Habib Salon Lalganj",
  description:
    "Terms and Conditions of service, booking policies, and cancellation guidelines for The Jawed Habib Salon in Lalganj, Vaishali, Bihar.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-salon-black text-salon-ivory py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Terms & Conditions", href: "/terms" },
          ]}
        />

        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <Badge variant="gold">
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
            Salon Policies & Booking Guidelines
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm text-zinc-400">
            Effective Date: November 2026 • The Jawed Habib Salon, Lalganj, Bihar
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-300 font-light">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">1. Salon Service Scope</h2>
            <p>
              These Terms and Conditions govern the reservation and execution of professional hair styling, restorative spa, bridal, and grooming services provided at <strong>{BRAND_CONFIG.fullName}</strong>, 1st Floor, Tinpulwa Chowk, Lalganj, Bihar – 844121. By reserving an appointment through our website or by phone, you agree to these operational terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">2. Appointment Booking & Arrival</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Appointments may be reserved up to 30 days in advance through our online platform or by calling our desk at +91 {BRAND_CONFIG.contact.primaryPhone}.</li>
              <li>Please arrive <strong>5 to 10 minutes prior</strong> to your scheduled appointment time to ensure an unhurried consultation and service experience.</li>
              <li>If you arrive more than 15 minutes late without prior notice, we will make every effort to accommodate you; however, your appointment may need to be modified or rescheduled to respect subsequent clients.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">3. Cancellation & Rescheduling Policy</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Clients can reschedule or cancel appointments free of charge up to <strong>2 hours before</strong> the scheduled slot through the customer portal or by calling reception.</li>
              <li>For cancellations within 2 hours, please inform our reception team immediately by phone.</li>
              <li>Unannounced no-shows impact our stylists&apos; availability and may require advance confirmation for future bookings.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">4. Transparent Pricing & Confirmation</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Prices displayed on the website for chemical hair treatments (Global Color, Balayage, Keratin, Smoothening) and bridal packages are <strong>indicative starting rates</strong>.</li>
              <li>Final service prices depend on your individual hair length, thickness, and specialized bridal styling requirements, which will be clearly confirmed with you during the preliminary chair consultation prior to service initiation.</li>
              <li>All payments are settled at the salon reception following service completion via Cash, UPI, or Debit/Credit Cards.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">5. Hygiene, Health & Patch Testing</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>We maintain strict hygiene protocols: disposable neck strips, sanitized scissors, autoclaved implements, and single-use razor blades for every client.</li>
              <li>Please inform your stylist prior to service of any known allergies, scalp conditions, or recent chemical treatments.</li>
              <li>For clients undergoing permanent hair coloring or intensive chemical straightening for the first time, a complimentary 24-hour patch test is recommended.</li>
            </ul>
          </section>
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-wrap gap-4 items-center justify-between">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Return to Homepage
            </Button>
          </Link>
          <Link href="/booking">
            <Button variant="gold" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Book Appointment</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
