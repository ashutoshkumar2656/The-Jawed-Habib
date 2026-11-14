"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { LightboxModal, type GalleryPhoto } from "@/components/shared/lightbox-modal";

export interface BridalPlate {
  plateNumber: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  category: string;
  artist: string;
}

const BRIDAL_PLATES: BridalPlate[] = [
  {
    plateNumber: "Plate 01 / 06",
    title: "Royal Crimson HD Bridal Glow",
    subtitle: "Traditional Bihari Wedding Artistry",
    description: "Multi-dimensional HD contouring using MAC Studio Fix and Charlotte Tilbury Hollywood Flawless Filter. Finished with gold shimmer lids, smudge-proof kohl, and deep crimson velvet lips.",
    imageUrl: "/images/makeup/makeup-bridal-1.jpg",
    category: "Bridal Suite",
    artist: "Master Bridal Team",
  },
  {
    plateNumber: "Plate 02 / 06",
    title: "Airbrush Radiance & Floral Architecture",
    subtitle: "High-Definition Reception Look",
    description: "Water-resistant, featherweight airbrush base with glass-skin luminescence. Paired with a sculpted rose-textured bridal bun accented with fresh baby's breath and heirloom jewellery setting.",
    imageUrl: "/images/makeup/makeup-bridal-2.jpg",
    category: "Airbrush Suite",
    artist: "Senior Creative Director",
  },
  {
    plateNumber: "Plate 03 / 06",
    title: "Sun-Drenched Haldi & Floral Braiding",
    subtitle: "Daytime Ceremony Glam",
    description: "Dewy, sweat-resistant turmeric-safe skin preparation, golden hour liquid highlighter, warm peach tones, and delicate floral French braiding designed for joyous daytime movement.",
    imageUrl: "/images/makeup/makeup-party-1.jpg",
    category: "Pre-Bridal",
    artist: "Bridal Hair Specialist",
  },
  {
    plateNumber: "Plate 04 / 06",
    title: "Contemporary Evening Sangeet Radiance",
    subtitle: "Modern Editorial Transformation",
    description: "Sculpted cheekbones, smokey bronze eyes with holographic sparkle, nude ombre lips, and glamorous Hollywood textured waves with lasting anti-humidity hold.",
    imageUrl: "/images/services/service-party-makeup.jpg",
    category: "Reception",
    artist: "Editorial Stylist",
  },
  {
    plateNumber: "Plate 05 / 06",
    title: "Lalganj Studio Luxury Dressing Suite",
    subtitle: "Private Bridal Room Experience",
    description: "Behind-the-scenes inside our air-conditioned private bridal sanctuary on 1st Floor Tinpulwa Chowk. Relax with dedicated dressing lounges, full-length mirror stations, and royal hospitality.",
    imageUrl: "/images/salon/interior/jh-lalganj-bridal-makeup-room.jpg",
    category: "Studio Experience",
    artist: "Salon Hospitality Team",
  },
  {
    plateNumber: "Plate 06 / 06",
    title: "Signature Jawed Habib Master Cut & Styling",
    subtitle: "Pre-Wedding Hair Rejuvenation",
    description: "Frizz-eliminating L'Oréal fiber treatment and dimensional face-framing layers ensuring the bride's hair has vibrant bounce, shine, and health throughout all wedding functions.",
    imageUrl: "/images/salon/services/jh-lalganj-jawed-habib-mastercut.jpg",
    category: "Hair Artistry",
    artist: "Jawed Habib Certified Master",
  },
];

export function BridalPortfolioSection() {
  const [currentPlateIndex, setCurrentPlateIndex] = React.useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = React.useState<boolean>(false);

  const activePlate = BRIDAL_PLATES[currentPlateIndex];

  const handleNext = () => {
    setCurrentPlateIndex((prev) => (prev + 1) % BRIDAL_PLATES.length);
  };

  const handlePrev = () => {
    setCurrentPlateIndex((prev) => (prev - 1 + BRIDAL_PLATES.length) % BRIDAL_PLATES.length);
  };

  // Convert plates to gallery photos for lightbox
  const galleryPhotos: GalleryPhoto[] = BRIDAL_PLATES.map((plate) => ({
    id: plate.plateNumber,
    src: plate.imageUrl,
    title: plate.title,
    category: plate.category,
    caption: plate.description,
  }));

  const handleBookLook = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("availability");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/booking";
    }
  };

  return (
    <section id="gallery" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 scroll-mt-28">
      {/* Section Header */}
      <div className="max-w-3xl space-y-3 mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
          The Portfolio
        </p>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Brides, composed like editorials.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
          A curated private lookbook of recent brides and transformations — every plate hand-picked, every finish crafted with precision at our Lalganj studio.
        </p>
      </div>

      {/* Main Editorial Presentation Box */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-salon-cardBlack p-6 md:p-10 shadow-2xl backdrop-blur-md">
        {/* Navigation Bar Above Plate */}
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-salon-gold">
            {activePlate.plateNumber}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-salon-gold transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev Plate</span>
            </button>
            <span className="text-zinc-600">|</span>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-salon-gold transition-colors"
            >
              <span className="hidden sm:inline">Next Plate</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Featured Image + Plate Narrative Layout */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Large Editorial Photograph (7 Columns) */}
          <div className="relative h-[380px] sm:h-[460px] md:h-[520px] w-full overflow-hidden rounded-2xl bg-zinc-900 lg:col-span-7 group">
            <Image
              src={activePlate.imageUrl}
              alt={activePlate.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

            {/* Click to Zoom Overlay */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/70 px-3.5 py-1.5 text-xs text-white backdrop-blur-md border border-white/20 hover:border-salon-gold transition-all"
            >
              <Maximize2 className="h-3.5 w-3.5 text-salon-gold" />
              <span>View Fullscreen</span>
            </button>
          </div>

          {/* Narrative Details (5 Columns) */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-5 lg:pl-6">
            <div className="space-y-4">
              <span className="inline-block rounded-full border border-salon-gold/30 bg-salon-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-salon-gold">
                {activePlate.category}
              </span>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
                {activePlate.title}
              </h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {activePlate.subtitle}
              </p>
              <p className="text-sm leading-relaxed text-zinc-300">
                {activePlate.description}
              </p>
              <div className="pt-2 text-xs text-zinc-500">
                Styled by: <span className="text-salon-gold font-medium">{activePlate.artist}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-white/10">
              <Button
                variant="gold"
                size="default"
                onClick={handleBookLook}
                className="gap-2 font-bold shadow-md"
              >
                <span>Book This Look</span>
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => setLightboxOpen(true)}
                className="gap-2 border-white/20 text-zinc-300 hover:text-white"
              >
                <Maximize2 className="h-4 w-4" />
                <span>Open Lookbook</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Thumbnail Filmstrip Navigation Below */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {BRIDAL_PLATES.map((plate, index) => {
              const isActive = index === currentPlateIndex;
              return (
                <button
                  key={plate.plateNumber}
                  type="button"
                  onClick={() => setCurrentPlateIndex(index)}
                  className={cn(
                    "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 select-none",
                    isActive
                      ? "border-salon-gold ring-2 ring-salon-gold scale-105 shadow-md"
                      : "border-white/10 opacity-50 hover:opacity-100 hover:border-white/30"
                  )}
                >
                  <Image
                    src={plate.imageUrl}
                    alt={plate.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <span className="absolute bottom-1 right-1 font-mono text-[9px] font-bold text-white bg-black/60 px-1 rounded">
                    0{index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <LightboxModal
          photos={galleryPhotos}
          currentIndex={currentPlateIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(newIdx) => setCurrentPlateIndex(newIdx)}
        />
      )}
    </section>
  );
}
