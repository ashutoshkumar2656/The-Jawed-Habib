"use client";

import * as React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { BridalBookingExperience } from "@/components/public/bridal-booking-experience";
import { Crown, Sparkles, Phone, MessageCircle } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-salon-black text-salon-ivory">
      {/* Top Breadcrumb & Hero Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-zinc-950 to-salon-black py-10 px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Bridal Appointments & Reservations" },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-salon-gold/40 bg-salon-gold/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-salon-gold">
                <Crown className="h-3.5 w-3.5" />
                <span>The Jawed Habib • Lalganj Bridal Suite</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Reserve Your Bridal Experience
              </h1>
              <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
                Choose your wedding date, select your tailored bridal suite, and lock in your appointment with a secure online advance deposit through Razorpay.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=Hello%20The%20Jawed%20Habib%20Salon%20Lalganj%2C%20I%20have%20a%20question%20regarding%20bridal%20booking.`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "gap-2 border-emerald-600/60 text-emerald-400 hover:bg-emerald-950/40 text-xs font-semibold"
                )}
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Bridal Desk</span>
              </a>
              <a
                href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "default" }),
                  "gap-2 border border-zinc-700 text-xs text-zinc-300 hover:text-white"
                )}
              >
                <Phone className="h-3.5 w-3.5 text-salon-gold" />
                <span>Call +91 {BRAND_CONFIG.contact.primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Un-crowded Sequential Booking Experience */}
      <div className="py-6">
        <React.Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-zinc-900/40" />}>
          <BridalBookingExperience />
        </React.Suspense>
      </div>
    </div>
  );
}
