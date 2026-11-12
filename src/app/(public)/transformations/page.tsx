"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { BeforeAfterSlider, TransformationItem } from "@/components/shared/before-after-slider";
import { Sparkles, Calendar, AlertCircle, Scissors, ArrowRight } from "lucide-react";

const transformationsList: TransformationItem[] = [
  {
    id: "trans-men-fade",
    title: "Executive Low Taper Fade & Beard Sculpting",
    category: "Men's Haircuts",
    beforeImage: "/images/transformations/trans-1-before.jpg",
    afterImage: "/images/transformations/trans-1-after.jpg",
    stylistRole: "Beard Architect & Master Barber",
    treatmentName: "Fade Cut + Steam Razor Beard Trim",
    description: "Cleaned up overgrown neckline and uneven cheek growth into a sharp, graduated taper fade with razor-crisp facial hair alignment.",
  },
  {
    id: "trans-women-color",
    title: "Warm Caramel Balayage & Face-Framing Tendrils",
    category: "Hair Colour",
    beforeImage: "/images/transformations/trans-2-before.jpg",
    afterImage: "/images/transformations/trans-2-after.jpg",
    stylistRole: "Master Colorist",
    treatmentName: "L'Oréal Inoa Ammonia-Free Balayage",
    description: "Transitioned flat monochrome brown into multidimensional honey caramel ribbons that highlight cheekbones and facial contours.",
  },
  {
    id: "trans-keratin-frizz",
    title: "Intense Keratin Smoothing & Fiber Realignment",
    category: "Hair Makeovers",
    beforeImage: "/images/transformations/trans-3-before.jpg",
    afterImage: "/images/transformations/trans-3-after.jpg",
    stylistRole: "Senior Hair Restorative Specialist",
    treatmentName: "Pro-Keratin Silk Infusion",
    description: "Infused structural keratin into weather-frizzed, coarse cuticles, turning brittle strands into reflective, ultra-smooth glass hair.",
  },
  {
    id: "trans-bridal-radiance",
    title: "Regal HD Bridal Makeup & 24K Gold Prep",
    category: "Hair Makeovers",
    beforeImage: "/images/transformations/trans-4-before.jpg",
    afterImage: "/images/transformations/trans-4-after.jpg",
    stylistRole: "Senior Bridal Artist",
    treatmentName: "HD Airbrush Bridal Glamour",
    description: "Hydrated dermal base with gold serum therapy followed by waterproof HD airbrush base, traditional smokey eye, and bridal hair setting.",
  },
  {
    id: "trans-women-layers",
    title: "Voluminous Feathered Layers & Butterfly Blowout",
    category: "Women's Haircuts",
    beforeImage: "/images/transformations/trans-5-before.jpg",
    afterImage: "/images/transformations/trans-5-after.jpg",
    stylistRole: "Creative Hair Director",
    treatmentName: "Precision Layering + Ionic Thermal Blowdry",
    description: "Removed heavy split ends while preserving length. Sculpted cascading face-framing layers that bounce with effortless movement.",
  },
  {
    id: "trans-styling-curls",
    title: "Editorial Hollywood Waves & Gloss Glaze",
    category: "Hair Styling",
    beforeImage: "/images/haircuts/haircut-women-1.jpg",
    afterImage: "/images/gallery/gallery-3.jpg",
    stylistRole: "Event Stylist",
    treatmentName: "Thermal Sculpting & Humidity Shield",
    description: "Sculpted polished, structured red-carpet waves utilizing ceramic thermal wands and non-sticky gloss shine mist.",
  },
];

const categories = [
  "All",
  "Men's Haircuts",
  "Women's Haircuts",
  "Hair Colour",
  "Hair Styling",
  "Hair Makeovers",
];

export default function TransformationsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  const filteredTransformations = React.useMemo(() => {
    if (selectedCategory === "All") return transformationsList;
    return transformationsList.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Before & After Transformations" }]} />

        {/* 1. Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Visual Proof of Artistry</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Before & After Transformation Gallery
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Slide each image interactively to inspect the precision haircuts, restorative hair spa results, and hair coloring artistry crafted at The Jawed Habib Salon Lalganj.
          </p>
        </div>

        {/* Demo Content Disclaimer Banner */}
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 flex items-start gap-3.5 text-xs text-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Demonstration Content Notice:</span>
            <p className="text-zinc-300 leading-relaxed">
              These comparison pairs demonstrate the styling techniques, haircuts, and color finishes performed by our certified stylists. Real Lalganj branch client photography will progressively replace these demonstration examples once client consent forms are archived.
            </p>
          </div>
        </div>

        {/* 2. Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-zinc-800 pb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-salon-gold text-black shadow-[0_0_20px_rgba(198,165,107,0.3)]"
                  : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white hover:border-salon-gold/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. Interactive Transformation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {filteredTransformations.map((item) => (
            <div key={item.id} className="space-y-3">
              <BeforeAfterSlider item={item} />
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-zinc-400">
                  Like this look?
                </span>
                <Link href={`/booking?style=${item.id}`}>
                  <Button variant="gold" size="sm" className="gap-1.5 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book This Transformation</span>
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Consultation CTA */}
        <div className="rounded-3xl border border-salon-gold/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-center space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Ready For Your Own Transformation?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Our master stylists at 1st Floor, Tinpulwa Chowk, Lalganj will analyze your face shape and hair texture to craft a look uniquely yours.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link href="/booking">
              <Button variant="gold" size="lg" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span>Book Transformation Session</span>
              </Button>
            </Link>
            <Link href="/consultation">
              <Button variant="secondary" size="lg">
                Start Style Consultation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
