"use client";

import * as React from "react";
import Image from "next/image";
import { Scissors, Sparkles, Clock, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface EverydayService {
  index: string;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  price: string;
  duration: string;
  imageUrl: string;
}

const EVERYDAY_SERVICES: EverydayService[] = [
  {
    index: "01",
    name: "Keratin Protein Treatment & Smoothening",
    tagline: "Frizz-free, liquid glass hair that lasts 4+ months",
    description: "Bio-engineered keratin infusion sealing porous cuticles, preventing humidity swell, and cutting daily blowdry time in half.",
    benefits: ["Zero frizz in Bihar monsoon & humidity", "Heat-activated glossy shine", "Formaldehyde-free safe formula"],
    price: "₹3,499",
    duration: "150 mins",
    imageUrl: "/images/salon/services/jh-lalganj-keratin-hair-products.jpg",
  },
  {
    index: "02",
    name: "L'Oréal Deep Nourishing Hair Spa",
    tagline: "Cellular rejuvenation with relaxing scalp massage",
    description: "Deep fiber nutrition with French lipid masques and 25-minute therapeutic acupressure stimulation for root strengthening.",
    benefits: ["Reverses heat & color damage", "Stimulates blood flow & growth", "Aromatherapy relaxation ritual"],
    price: "₹999",
    duration: "60 mins",
    imageUrl: "/images/services/service-hair-spa.jpg",
  },
  {
    index: "03",
    name: "Creative Balayage & Ammonia-Free Colour",
    tagline: "Multi-dimensional ribbons customized to skin tone",
    description: "Bespoke hand-painted balayage and global tints using Schwarzkopf and L'Oréal Professional ammonia-free pigments.",
    benefits: ["Zero ammonia, 100% scalp gentle", "Seamless sun-kissed gradient", "High-gloss color seal"],
    price: "₹1,999",
    duration: "120 mins",
    imageUrl: "/images/services/service-hair-color.jpg",
  },
  {
    index: "04",
    name: "HydraFacial Radiance & Deep Pore Cleansing",
    tagline: "Medical-grade suction extraction and oxygen glow",
    description: "Multi-step dermal infusion extracting blackheads, dead skin cells, and infusing concentrated hyaluronic acid and peptides.",
    benefits: ["Instant luminous glass skin", "Unclogs congested pores", "Non-invasive with zero downtime"],
    price: "₹1,999",
    duration: "60 mins",
    imageUrl: "/images/salon/services/jh-lalganj-hydrafacial-machine.jpg",
  },
  {
    index: "05",
    name: "Precision Haircut & Blowdry Architecture",
    tagline: "Crafted to facial geometry by certified master stylists",
    description: "Jawed Habib certified sectioning and texturizing technique providing effortless daily structure, volume, and natural flow.",
    benefits: ["Personalized face-shape profiling", "Deep conditioning wash included", "Editorial styling finish"],
    price: "₹399",
    duration: "45 mins",
    imageUrl: "/images/services/service-haircut.jpg",
  },
  {
    index: "06",
    name: "Royal Hot Towel Beard Sculpting & Steam Shave",
    tagline: "Executive straight-razor detailing for gentlemen",
    description: "Pre-shave essential oils, warm steam infusion, razor-sharp beard contouring, and cold towel post-shave balm.",
    benefits: ["Razor-sharp cheek and neck lines", "Prevents razor burns & ingrowns", "Nourishing argan oil massage"],
    price: "₹199",
    duration: "25 mins",
    imageUrl: "/images/services/service-beard-grooming.jpg",
  },
];

export function BeyondBridalSection() {
  return (
    <section id="hair" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 scroll-mt-20">
      <div id="services" className="scroll-mt-24" />
      {/* Section Header */}
      <div className="max-w-3xl space-y-3 mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
          Hair Studio & Everyday Wellness
        </p>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Beyond bridal. Perfected for every day.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
          Our Lalganj salon offers complete high-end haircutting, intensive spa treatments, global colors, and aesthetics for your daily grooming perfection.
        </p>
      </div>

      {/* Grid of Everyday Services */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {EVERYDAY_SERVICES.map((srv) => (
          <div
            key={srv.index}
            className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-salon-cardBlack p-6 transition-all duration-300 hover:border-salon-gold/50 hover:bg-zinc-950 shadow-xl"
          >
            <div className="space-y-4">
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-zinc-900">
                <Image
                  src={srv.imageUrl}
                  alt={srv.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 rounded-md bg-black/70 px-2 py-1 font-mono text-[10px] font-bold text-salon-gold border border-salon-gold/30">
                  {srv.index} ✦
                </span>
                <span className="absolute bottom-3 left-3 text-xs text-white/90 font-medium">
                  {srv.duration}
                </span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="font-serif text-xl font-bold text-white group-hover:text-salon-gold transition-colors">
                  {srv.name}
                </h3>
                <p className="text-xs text-salon-goldLight font-medium mt-1">
                  {srv.tagline}
                </p>
              </div>

              <p className="text-xs leading-relaxed text-zinc-400">
                {srv.description}
              </p>

              {/* Benefits List */}
              <ul className="space-y-1.5 border-t border-white/10 pt-3 text-xs text-zinc-300">
                {srv.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-salon-gold shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price & Action */}
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <div>
                <span className="text-[11px] text-zinc-500">Starting from</span>
                <p className="font-serif text-xl font-bold text-salon-gold">
                  {srv.price}
                </p>
              </div>

              <a href="#availability">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-salon-gold/40 text-xs font-semibold text-salon-gold hover:bg-salon-gold hover:text-black transition-all"
                >
                  <span>Book Slot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
