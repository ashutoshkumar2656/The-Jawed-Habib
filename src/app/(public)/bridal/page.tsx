"use client";

import * as React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { BridalPortfolioSection } from "@/components/public/bridal-portfolio-section";
import { BridalBookingExperience } from "@/components/public/bridal-booking-experience";
import { BridalConsultationSection } from "@/components/public/bridal-consultation-section";
import { Crown, Sparkles, Phone, MessageCircle, Calendar, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export default function BridalPage() {
  const [activeTab, setActiveTab] = React.useState<"portfolio" | "packages" | "consultation">("packages");

  return (
    <div className="min-h-screen bg-salon-black text-salon-ivory">
      {/* 1. HERO & BREADCRUMB HEADER */}
      <section className="relative border-b border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-salon-black py-12 md:py-16 px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Bridal Makeup & Wedding Services" },
            ]}
          />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-2">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-salon-gold/50 bg-salon-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-salon-gold">
                <Crown className="h-3.5 w-3.5" />
                <span>The Jawed Habib • Dedicated Lalganj Bridal Suite</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Luxury Bridal Makeup &amp; Makeovers in Lalganj, Vaishali
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Step into our private, temperature-controlled luxury bridal suite at 1st Floor, Tinpulwa Chowk.
                Engineered for 18-hour crease-free longevity under Bihar wedding lighting, our master artists combine
                international formulations (MAC, Charlotte Tilbury, Kryolan, NARS) with royal jewelry placement and intricate hair architecture.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href={`https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=Hello%20The%20Jawed%20Habib%20Salon%20Lalganj%2C%20I%20would%20like%20to%20inquire%20about%20Bridal%20Booking.`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2.5 border-emerald-600/70 text-emerald-400 hover:bg-emerald-950/40 font-semibold"
                )}
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Bridal Desk</span>
              </a>
              <a
                href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "gap-2.5 border border-zinc-700 text-zinc-200 hover:text-white"
                )}
              >
                <Phone className="h-4 w-4 text-salon-gold" />
                <span>Call +91 {BRAND_CONFIG.contact.primaryPhone}</span>
              </a>
            </div>
          </div>

          {/* Quick Pillar Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-zinc-800/80">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-salon-gold shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">Private Bridal Room</p>
                <p className="text-zinc-400">Total comfort &amp; privacy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-salon-gold shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">100% Authentic Luxury</p>
                <p className="text-zinc-400">MAC, NARS, Charlotte Tilbury</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-salon-gold shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">Advance Date Lock</p>
                <p className="text-zinc-400">Instant slot confirmation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-salon-gold shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">Complete Drape &amp; Jewels</p>
                <p className="text-zinc-400">Saree, lehenga &amp; dupatta</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TABBED EXPERIENCE NAVIGATION */}
      <nav aria-label="Bridal sections" className="sticky top-16 z-30 bg-salon-black/95 border-b border-zinc-800 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 flex gap-4 overflow-x-auto py-3">
          <button
            onClick={() => setActiveTab("packages")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
              activeTab === "packages"
                ? "bg-salon-gold text-salon-black shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            Bridal Suites &amp; Online Booking
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
              activeTab === "portfolio"
                ? "bg-salon-gold text-salon-black shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            Real Bride Transformations Portfolio
          </button>
          <button
            onClick={() => setActiveTab("consultation")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
              activeTab === "consultation"
                ? "bg-salon-gold text-salon-black shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}
          >
            Bespoke Bridal Consultation
          </button>
        </div>
      </nav>

      {/* 3. DYNAMIC CONTENT SECTIONS */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        {activeTab === "packages" && (
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Signature Bridal Suites &amp; Reservation Desk
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl">
                Select your wedding ceremony date, choose between Signature HD and Luxury Airbrush artistry, customize with family party makeovers, and confirm your booking instantly.
              </p>
            </div>
            <React.Suspense
              fallback={
                <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center space-y-3">
                  <div className="h-6 w-6 border-2 border-salon-gold border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs uppercase tracking-wider text-salon-gold">Loading Bridal Suite Reservation Desk...</p>
                </div>
              }
            >
              <BridalBookingExperience />
            </React.Suspense>
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Authentic Lalganj Bridal Transformations
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl">
                Every look is custom-designed to match wedding attire, skin undertone, and ceremony lighting across traditional Bihari nuptials, Sangeet, and reception galas.
              </p>
            </div>
            <BridalPortfolioSection />
          </div>
        )}

        {activeTab === "consultation" && (
          <div className="space-y-12">
            <div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Schedule a Personal Bridal Consultation
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl">
                Have specific skin concerns, unique jewelry weights, or need a trial appointment? Speak directly with our senior bridal beauty team.
              </p>
            </div>
            <BridalConsultationSection />
          </div>
        )}
      </main>

      {/* 4. FOOTER CTA */}
      <section className="border-t border-zinc-800 bg-zinc-950 py-16 px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <Crown className="h-8 w-8 text-salon-gold mx-auto" />
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
            Celebrate Your Big Day with The Jawed Habib Lalganj
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Conveniently located at 1st Floor, Tinpulwa Chowk, Lalganj (Above Killer Showroom, Opposite Manglam Mart).
            Welcoming brides, grooms, and wedding families from Lalganj, Vaishali, Hajipur, and surrounding towns.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "gold", size: "lg" }), "gap-2")}
            >
              <span>Visit Our Lalganj Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-zinc-700 text-zinc-300")}
            >
              Explore All Salon Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
