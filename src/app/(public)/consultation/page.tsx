"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import {
  Sparkles,
  Scissors,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
  Heart,
  HelpCircle,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

interface Recommendation {
  service: string;
  category: string;
  price: string;
  reason: string;
  link: string;
}

export default function ConsultationPage() {
  const [desiredService, setDesiredService] = React.useState<string>("hair");
  const [hairConcern, setHairConcern] = React.useState<string>("frizz");
  const [hairLength, setHairLength] = React.useState<string>("medium");
  const [preferredStyle, setPreferredStyle] = React.useState<string>("classic");
  const [budget, setBudget] = React.useState<string>("mid");
  const [preferredDate, setPreferredDate] = React.useState<string>("");
  const [calculated, setCalculated] = React.useState<boolean>(false);

  // Dynamic recommendation logic
  const recommendations: Recommendation[] = React.useMemo(() => {
    const list: Recommendation[] = [];

    if (desiredService === "hair" || desiredService === "all") {
      if (hairConcern === "frizz" || hairConcern === "damage") {
        list.push({
          service: "L'Oréal Deep Nourishing Hair Spa",
          category: "Hair Restoration",
          price: "Starting ₹999",
          reason: "Intense fiber lipid conditioning penetrates porous cuticles to calm environmental frizz.",
          link: "/booking?service=hair-spa",
        });
        if (budget === "high" || budget === "luxury") {
          list.push({
            service: "Keratin Protein Smoothing",
            category: "Intense Therapy",
            price: "Contact for Pricing",
            reason: "Long-term cuticle sealant providing up to 3 months of humidity resistance.",
            link: "/booking?service=keratin-treatment",
          });
        }
      } else if (hairConcern === "dandruff") {
        list.push({
          service: "Scalp Clarifying Cleansing Spa",
          category: "Scalp Health",
          price: "Starting ₹999",
          reason: "Exfoliates scalp buildup and balances natural microbiome without stripping hair oils.",
          link: "/booking?service=hair-spa",
        });
      }

      list.push({
        service: "Face-Shape Precision Haircut",
        category: "Styling",
        price: "₹299 – ₹399",
        reason: `Sculpted for ${preferredStyle} aesthetics and ${hairLength} hair length to flatter facial geometry.`,
        link: "/booking?service=haircut",
      });
    }

    if (desiredService === "beauty" || desiredService === "all") {
      list.push({
        service: "Jawed Habib 24K Gold Radiance Facial",
        category: "Skin Radiance",
        price: "Starting ₹1,699",
        reason: "Stimulates micro-circulation and delivers instant dewy luminosity.",
        link: "/booking?service=facial",
      });
    }

    if (desiredService === "grooming") {
      list.push({
        service: "Executive Grooming Combo",
        category: "Men's Luxury Grooming",
        price: "₹799",
        reason: "Precision haircut, royal steamed beard sculpt, and purifying face wash.",
        link: "/booking?package=complete-grooming",
      });
    }

    if (desiredService === "makeup") {
      list.push({
        service: "Party Ready Glamour Makeover",
        category: "Makeup Artistry",
        price: "₹1,499 – ₹1,999",
        reason: "Long-lasting, photo-ready HD makeup paired with customized blowout.",
        link: "/booking?service=party-makeup",
      });
    }

    return list.slice(0, 3);
  }, [desiredService, hairConcern, hairLength, preferredStyle, budget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCalculated(true);
  };

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Beauty Consultation" }]} />

        {/* 1. Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Personalized Diagnostic</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Interactive Hair & Skin Consultation
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Share your style goals and texture concerns. Our diagnostic algorithm will tailor a curated salon recommendation matching your budget.
          </p>
        </div>

        {/* Medical Non-Diagnosis Disclaimer Notice */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 flex items-start gap-3.5 text-xs text-zinc-400">
          <AlertCircle className="h-5 w-5 text-salon-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Salon Cosmetic Consultation Disclaimer:</span>
            <p className="leading-relaxed">
              This interactive tool provides cosmetic hair styling, salon spa, and aesthetic grooming suggestions based on common client preferences. It does not provide medical, trichological, or dermatological diagnoses. For medical conditions affecting skin or scalp, consult a licensed healthcare practitioner.
            </p>
          </div>
        </div>

        {/* 2. Interactive Consultation Questionnaire */}
        <form onSubmit={handleSubmit} className="luxury-card rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 sm:p-10 space-y-8">
          {/* Step 1: Desired Primary Service */}
          <div className="space-y-3">
            <label className="text-xs uppercase font-bold tracking-wider text-salon-gold block">
              1. What primary service are you looking for?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { id: "hair", label: "Hair Care / Cut" },
                { id: "beauty", label: "Facial / Skin" },
                { id: "makeup", label: "Bridal / Party" },
                { id: "grooming", label: "Men's Grooming" },
                { id: "all", label: "Full Makeover" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    setDesiredService(opt.id);
                    setCalculated(false);
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    desiredService === opt.id
                      ? "border-salon-gold bg-salon-gold/15 text-salon-goldLight shadow-sm"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Hair Concern */}
          <div className="space-y-3">
            <label className="text-xs uppercase font-bold tracking-wider text-salon-gold block">
              2. What is your primary hair or skin concern?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "frizz", label: "Frizz, Dryness & Roughness" },
                { id: "damage", label: "Chemical / Heat Damage" },
                { id: "dandruff", label: "Dandruff / Flaky Scalp" },
                { id: "hairfall", label: "Thinning / Weak Roots" },
                { id: "overgrown", label: "Unshaped / Split Ends" },
                { id: "none", label: "Healthy (Style Upgrade Only)" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    setHairConcern(opt.id);
                    setCalculated(false);
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    hairConcern === opt.id
                      ? "border-salon-gold bg-salon-gold/15 text-salon-goldLight shadow-sm"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Hair Length & Preferred Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-300 block">
                3. Current Hair Length
              </label>
              <select
                value={hairLength}
                onChange={(e) => {
                  setHairLength(e.target.value);
                  setCalculated(false);
                }}
                className="flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:border-salon-gold"
              >
                <option value="short">Short / Crop / Pixie / Taper</option>
                <option value="medium">Medium / Shoulder Length</option>
                <option value="long">Long / Mid-Back</option>
                <option value="extra-long">Extra Long (Below waist)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-300 block">
                4. Preferred Style Direction
              </label>
              <select
                value={preferredStyle}
                onChange={(e) => {
                  setPreferredStyle(e.target.value);
                  setCalculated(false);
                }}
                className="flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:border-salon-gold"
              >
                <option value="classic">Classic & Low-Maintenance</option>
                <option value="modern">Modern, Layered & Textured</option>
                <option value="bold">Bold Color / Transformation</option>
                <option value="regal">Regal, Event & Bridal</option>
              </select>
            </div>
          </div>

          {/* Step 4: Budget & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-300 block">
                5. Estimated Service Budget
              </label>
              <select
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  setCalculated(false);
                }}
                className="flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:border-salon-gold"
              >
                <option value="low">Under ₹500 (Essential Cut / Grooming)</option>
                <option value="mid">₹500 – ₹1,500 (Spa, Cut + Wash, Cleanup)</option>
                <option value="high">₹1,500 – ₹3,500 (Color, Gold Facial, Package)</option>
                <option value="luxury">₹3,500+ (Keratin, Rebonding, Bridal)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-300 block">
                6. Desired Visit Date
              </label>
              <Input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <Button type="submit" variant="gold" size="lg" className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Generate Tailored Recommendations</span>
            </Button>
          </div>
        </form>

        {/* 3. Output Recommendation Cards */}
        {calculated && (
          <div className="luxury-card rounded-2xl border border-salon-gold/50 bg-zinc-950/90 p-8 sm:p-10 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-salon-gold">
                  Curated Diagnostic Results
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Recommended Treatments for Your Profile
                </h3>
              </div>
              <Badge variant="gold">Tailored Match</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec, i) => (
                <div
                  key={rec.service}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-salon-gold">
                      {rec.category}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-white">
                      {rec.service}
                    </h4>
                    <span className="inline-block text-sm font-bold text-salon-gold">
                      {rec.price}
                    </span>
                    <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                      {rec.reason}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800">
                    <Link href={rec.link}>
                      <Button variant="goldOutline" size="sm" className="w-full gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Book This Treatment</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
              <span>
                Want to discuss this with our master stylist directly?
              </span>
              <a
                href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}
                className="font-bold text-salon-gold hover:underline"
              >
                Call Desk: +91 {BRAND_CONFIG.contact.primaryPhone}
              </a>
            </div>
          </div>
        )}

        {/* 5. In-Chair Consultation & Direct Booking CTA */}
        <div className="rounded-2xl border border-salon-gold/40 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-8 sm:p-12 text-center space-y-6">
          <Badge variant="gold">Complimentary Consultation</Badge>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
            Prefer a Personal In-Chair Diagnostic?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Walk into our Lalganj salon at 1st Floor, Tinpulwa Chowk or reserve a 15-minute chair consultation with our senior stylists. We examine scalp health, texture, and facial geometry before starting any service.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link href="/booking">
              <Button variant="gold" size="lg" className="gap-2 text-xs font-semibold">
                <Calendar className="h-4 w-4" />
                <span>Book Salon Appointment</span>
              </Button>
            </Link>
            <a href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}>
              <Button variant="secondary" size="lg" className="text-xs">
                Call Concierge: +91 {BRAND_CONFIG.contact.primaryPhone}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
