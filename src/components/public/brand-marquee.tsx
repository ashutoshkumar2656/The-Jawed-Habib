"use client";

import * as React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BrandItem {
  name: string;
  category: string;
  tier: string;
}

const LUXURY_PARTNER_BRANDS: BrandItem[] = [
  { name: "L'Oréal Professionnel Paris", category: "Hair Color & Care", tier: "Certified Salon Partner" },
  { name: "Kérastase Paris", category: "Luxury Scalp & Hair Rituals", tier: "Exclusive Formulation" },
  { name: "Olaplex", category: "Bond Building & Repair", tier: "Certified Treatment" },
  { name: "Dyson Supersonic Pro", category: "Geometric Heat Styling", tier: "Professional Hardware" },
  { name: "MAC Cosmetics", category: "HD Bridal Artistry", tier: "Pro Bridal Range" },
  { name: "Huda Beauty", category: "High-Pigment Glamour", tier: "Official Palette" },
  { name: "Kryolan Professional", category: "Dermacolor Camouflage & HD", tier: "Cinematic Grade" },
  { name: "Schwarzkopf Professional", category: "Blonde & Balayage", tier: "Master Series" },
  { name: "NARS Cosmetics", category: "Radiant Skin Foundations", tier: "Luxury Bridal" },
  { name: "Moroccanoil", category: "Argan Infused Hair Spa", tier: "Pure Elixir" },
  { name: "O3+ Professional", category: "Dermal Radiance & Peels", tier: "Clinical Esthetics" },
];

export function BrandMarquee() {
  return (
    <section id="brands-marquee" className="relative py-16 overflow-hidden border-t border-white/10 bg-gradient-to-b from-zinc-950 via-salon-black to-zinc-950">
      <div className="container mx-auto px-4 mb-8 text-center max-w-3xl">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-salon-gold block mb-2">
          Global Luxury Heritage
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
          Partnered with the world&apos;s finest beauty houses.
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
          Every bridal suite, coloring session, and therapy at Lalganj exclusively uses genuine certified international formulations.
        </p>
      </div>

      {/* Marquee Container with side fade gradients */}
      <div className="relative w-full overflow-hidden">
        {/* Left & Right Shadow Vignettes */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 bg-gradient-to-r from-salon-black via-salon-black/80 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 bg-gradient-to-l from-salon-black via-salon-black/80 to-transparent" />

        {/* Scrolling Track */}
        <div className="flex w-max animate-marquee space-x-6 hover:[animation-play-state:paused] py-4">
          {[...LUXURY_PARTNER_BRANDS, ...LUXURY_PARTNER_BRANDS].map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-6 py-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-salon-gold/50 hover:bg-zinc-900/90 hover:shadow-[0_0_20px_rgba(198,165,107,0.15)] group shrink-0"
            >
              <div className="h-10 w-10 rounded-full bg-salon-gold/10 border border-salon-gold/25 flex items-center justify-center text-salon-gold group-hover:scale-110 transition-transform">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-left">
                <h4 className="font-serif text-sm sm:text-base font-bold text-white group-hover:text-salon-goldLight transition-colors">
                  {brand.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                    {brand.category}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[10px] text-salon-gold font-semibold">
                    {brand.tier}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authenticity Guarantee Chip */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-400 px-4">
        <ShieldCheck className="h-4 w-4 text-salon-gold" />
        <span>100% Genuine, Authenticated & Sealed Products Direct From Official Importers</span>
      </div>
    </section>
  );
}
