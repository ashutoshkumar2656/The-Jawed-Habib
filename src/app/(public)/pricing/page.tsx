"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils/cn";
import {
  Check,
  Calendar,
  AlertCircle,
  Scissors,
  Sparkles,
  Crown,
  Phone,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

export default function PricingPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  const verifiedServices = [
    {
      service: "Standard Precision Haircut",
      category: "Hair",
      indicativePrice: "₹299",
      notes: "Custom face-shape profiling & texturizing",
      status: "Verified Indicative",
    },
    {
      service: "Haircut with Hair Wash",
      category: "Hair",
      indicativePrice: "₹299 – ₹399",
      notes: "Includes scalp cleanse, conditioning wash & blowdry",
      status: "Verified Indicative",
    },
    {
      service: "Hair Colour (Touch-up / Highlights)",
      category: "Color",
      indicativePrice: "Starting ₹1,999",
      notes: "Ammonia-free formulations & gloss finish",
      status: "Verified Indicative",
    },
    {
      service: "Global Hair Colour",
      category: "Color",
      indicativePrice: "Starting ₹2,499",
      notes: "Full head root-to-tip uniform coverage",
      status: "Verified Indicative",
    },
    {
      service: "Party Makeup & Styling",
      category: "Makeup",
      indicativePrice: "₹1,499 – ₹1,999",
      notes: "12-hour smudge-proof finish + hair setting",
      status: "Verified Indicative",
    },
    {
      service: "L'Oréal Nourishing Hair Spa",
      category: "Spa",
      indicativePrice: "Starting ₹999",
      notes: "Deep conditioning & hot towel acupressure",
      status: "Verified Indicative",
    },
    {
      service: "Royal Hot Towel Beard Sculpting",
      category: "Grooming",
      indicativePrice: "₹199",
      notes: "Warm steam wrap, razor line & argan massage",
      status: "Verified Indicative",
    },
    {
      service: "Express Face Cleanup",
      category: "Beauty",
      indicativePrice: "Starting ₹599",
      notes: "Blackhead removal, scrub & fruit mask",
      status: "Verified Indicative",
    },
    {
      service: "Keratin Anti-Frizz Treatment",
      category: "Chemical",
      indicativePrice: "Contact for Pricing",
      notes: "Quoted upon in-person hair texture diagnosis",
      status: "Consultation Required",
    },
    {
      service: "Hair Rebonding & Smoothening",
      category: "Chemical",
      indicativePrice: "Contact for Pricing",
      notes: "Depends on length, density & past chemical history",
      status: "Consultation Required",
    },
    {
      service: "Royal Bridal Makeover Suite",
      category: "Makeup",
      indicativePrice: "Contact for Pricing",
      notes: "Includes HD airbrush, jewelry setup & dupatta draping",
      status: "Consultation Required",
    },
  ];

  const packageComparison = [
    {
      name: "Essential Refresh",
      price: "₹499",
      tagline: "Regular maintenance grooming",
      highlight: false,
      features: [
        "Signature Precision Haircut",
        "Deep Cleansing Hair Wash",
        "10-Minute Scalp Acupressure",
        "Matte Styling Product Application",
      ],
      notIncluded: ["L'Oréal Hair Spa Mask", "Face D-Tan Pack"],
    },
    {
      name: "Habib Royal Signature",
      price: "₹1,299",
      tagline: "Our most requested full makeover",
      highlight: true,
      features: [
        "Designer Haircut & Facial Profiling",
        "L'Oréal Deep Nourishing Hair Spa",
        "Herbal De-Tan Face Pack & Scrub",
        "Hot Towel Scalp Acupressure Massage",
        "Complimentary Blowdry Finish",
      ],
      notIncluded: ["Bridal Makeup"],
    },
    {
      name: "Luxury Pre-Bridal / Groom",
      price: "₹4,999",
      tagline: "Total head-to-toe wedding indulgence",
      highlight: false,
      features: [
        "24K Gold Luxury Radiance Facial",
        "Deep Restorative Keratin Hair Spa",
        "Aroma Manicure & Pedicure",
        "Full Face & Arms Herbal De-Tan",
        "Personalized Style Diagnostic",
      ],
      notIncluded: [],
    },
  ];

  const categories = ["ALL", "Hair", "Color", "Spa", "Beauty", "Makeup", "Grooming", "Chemical"];

  const filteredServices =
    selectedCategory === "ALL"
      ? verifiedServices
      : verifiedServices.filter((s) => s.category === selectedCategory);

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Pricing & Packages", href: "/pricing" }]} />

        {/* 1. PAGE HERO */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Upfront Transparency</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Transparent Pricing & Packages
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Quality craftsmanship at honest rates. Explore our confirmed starting rates and curated value bundles in Lalganj.
          </p>
        </div>

        {/* 2. PRICING INTRODUCTION & OWNER NOTICE */}
        <div className="p-5 sm:p-6 rounded-2xl border border-salon-gold/30 bg-zinc-950 flex items-start gap-4 text-xs sm:text-sm shadow-md">
          <Info className="h-5 w-5 text-salon-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-white">Owner Notice on Salon Pricing</h4>
            <p className="leading-relaxed text-zinc-400 font-light text-xs">
              All prices shown on this website are indicative starting estimates. Final service pricing may vary based on individual hair length, texture density, product quantity, and specialized technical requirements as evaluated during your in-chair consultation at our Lalganj salon.
            </p>
          </div>
        </div>

        {/* 3. SERVICE CATEGORY FILTERS */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-4 py-2 rounded-full border transition-all ${
                  selectedCategory === cat
                    ? "border-salon-gold bg-salon-gold/15 text-salon-gold font-semibold shadow-[0_0_15px_rgba(198,165,107,0.2)]"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                {cat === "ALL" ? "All Services" : cat}
              </button>
            ))}
          </div>

          {/* 4. SERVICE PRICING CARDS / LIST */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 overflow-hidden divide-y divide-zinc-800/70">
            {filteredServices.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-white">{item.service}</span>
                    <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 font-light">{item.notes}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="font-serif text-base sm:text-lg font-bold text-salon-gold">
                      {item.indicativePrice}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      {item.status}
                    </span>
                  </div>
                  <Link
                    href={`/booking?service=${encodeURIComponent(item.service)}`}
                    className={cn(buttonVariants({ variant: "gold", size: "sm" }), "text-xs")}
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. PACKAGE PRICING COMPARISON */}
        <div className="space-y-8 pt-8">
          <SectionHeader
            badge="Curated Bundles"
            title="Curated Value Packages"
            subtitle="Bundle services together for maximum pampering and savings at our Lalganj branch."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packageComparison.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  pkg.highlight
                    ? "border-2 border-salon-gold bg-zinc-900/90 shadow-[0_0_40px_rgba(198,165,107,0.25)] md:-translate-y-2"
                    : "border border-zinc-800 bg-zinc-950/70"
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="gold" className="text-[10px] tracking-widest uppercase py-1 px-3">
                      Best Value Choice
                    </Badge>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{pkg.tagline}</p>
                  </div>

                  <div className="border-y border-zinc-800 py-4 flex items-baseline">
                    <span className="font-serif text-4xl font-bold text-salon-gold">
                      {pkg.price}
                    </span>
                    <span className="text-xs text-zinc-500 ml-2">indicative total</span>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-salon-gold">
                      What&apos;s Included:
                    </span>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-salon-gold flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pkg.notIncluded.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        Not Included:
                      </span>
                      <ul className="space-y-1 text-xs text-zinc-500">
                        {pkg.notIncluded.map((nf) => (
                          <li key={nf} className="flex items-center gap-2">
                            <span className="text-zinc-600">—</span>
                            <span>{nf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800">
                  <Link
                    href={`/booking?package=${encodeURIComponent(pkg.name)}`}
                    className={cn(
                      buttonVariants({ variant: pkg.highlight ? "gold" : "outline" }),
                      "w-full gap-2 text-xs"
                    )}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Reserve This Package</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. PRICE DISCLAIMER */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs text-zinc-400 space-y-2 max-w-4xl mx-auto">
          <p className="font-semibold text-zinc-300">Price Confirmation Policy:</p>
          <p className="leading-relaxed">
            All prices are subject to physical hair inspection by our master stylists. Taxes and product add-ons are specified clearly before service begins. Payment is settled at the reception desk via Cash, Card, or UPI upon completion.
          </p>
        </div>

        {/* 7. BOOKING CTA */}
        <div className="rounded-3xl border border-salon-gold/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-center space-y-4 shadow-[0_0_40px_rgba(198,165,107,0.1)]">
          <Badge variant="gold">Online Convenience</Badge>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Ready to Book Your Salon Service?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed font-light">
            Reserve your chair online without any upfront card deposit. Pay directly at our Lalganj salon desk.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/booking"
              className={cn(buttonVariants({ variant: "gold", size: "lg" }), "gap-2")}
            >
              <Calendar className="h-4 w-4" />
              <span>Book Appointment Online</span>
            </Link>
            <a
              href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <Phone className="h-4 w-4 text-salon-gold" />
              <span>Call Desk (+91 {BRAND_CONFIG.contact.primaryPhone})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
