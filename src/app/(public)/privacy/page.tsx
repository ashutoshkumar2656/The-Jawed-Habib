import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { ShieldCheck, Calendar, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | The Jawed Habib Salon Lalganj",
  description:
    "Privacy Policy for The Jawed Habib Salon in Lalganj, Bihar. Learn how we safeguard your personal contact details, booking information, and loyalty data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-salon-black text-salon-ivory py-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Privacy Policy", href: "/privacy" },
          ]}
        />

        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <Badge variant="gold">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Client Privacy & Data Security
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-400">
            Last Updated: November 2026 • The Jawed Habib Salon, Lalganj, Bihar
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-300 font-light">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">1. Introduction</h2>
            <p>
              At <strong>{BRAND_CONFIG.fullName}</strong> ({BRAND_CONFIG.branch}), we value the trust you place in us when reserving appointments and sharing your contact information. This Privacy Policy outlines our transparent practices regarding data collection, usage, and security at our salon located at 1st Floor, Tinpulwa Chowk, Lalganj, Bihar – 844121.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">2. Information We Collect</h2>
            <p>
              When booking an appointment or creating a client profile, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong>Contact Information</strong>: Full name, 10-digit mobile number, and optional email address for booking references.</li>
              <li><strong>Appointment Details</strong>: Requested hair, beauty, or grooming services, preferred appointment date/time, and preferred master stylist.</li>
              <li><strong>Client Notes</strong>: Special styling requests, scalp sensitivities, or hair color preferences you share with our stylists.</li>
              <li><strong>Loyalty & Transaction History</strong>: Accumulated Habib reward points and visit frequencies.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">3. How We Use Your Information</h2>
            <p>
              Your personal information is used solely for salon operational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Confirming and managing your appointment reservations.</li>
              <li>Dispatching reminder phone calls or WhatsApp messages to prevent scheduling conflicts.</li>
              <li>Crediting loyalty reward points to your customer profile upon service completion.</li>
              <li>Communicating branch announcements or seasonal offers with your explicit consent.</li>
            </ul>
            <p className="text-salon-goldLight font-medium">
              We never sell, rent, or trade your personal telephone numbers or booking details to any third-party marketing companies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">4. Data Security</h2>
            <p>
              Our web platform employs encrypted HTTPS transport, secure session cookies, and strict database access controls. Only authorized salon receptionists and management staff have access to the client CRM ledger.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-white">5. Contact Us Regarding Your Data</h2>
            <p>
              If you wish to update your contact details or request deletion of your client profile, you may reach out to our salon reception directly:
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-2 text-xs">
              <p><strong className="text-white">The Jawed Habib Salon – Lalganj</strong></p>
              <p className="text-zinc-400">{BRAND_CONFIG.location.fullAddress}</p>
              <p className="text-zinc-400">Phone: +91 {BRAND_CONFIG.contact.primaryPhone} / +91 {BRAND_CONFIG.contact.phones[1]}</p>
              <p className="text-zinc-400">Hours: Monday to Sunday, 10:00 AM – 10:00 PM</p>
            </div>
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
