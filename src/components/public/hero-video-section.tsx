"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sparkles,
  Calendar,
  ArrowRight,
  Scissors,
  Clock,
  Star,
  MapPin,
  Play,
  Pause,
  ShieldCheck,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";

interface HeroVideoSectionProps {
  onBookClick?: () => void;
  onExploreClick?: () => void;
  headline?: string;
  subtitle?: string;
  badgeText?: string;
  videoUrl?: string;
  posterUrl?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

export function HeroVideoSection({
  onBookClick,
  onExploreClick,
  headline,
  subtitle,
  badgeText,
  videoUrl,
  posterUrl,
  primaryCtaText,
  secondaryCtaText,
}: HeroVideoSectionProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(true);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState<boolean>(false);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = React.useState<boolean>(false);

  const activePoster = posterUrl || "/images/salon-hero-poster.webp";
  const activeVideo = videoUrl || "/brand/jawed-habib/hero-video.mp4";

  // Check for user's reduced-motion preference
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsReducedMotion(true);
      setIsPlaying(false);
    }

    const handler = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Safe play/pause toggle
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  return (
    <section className="relative min-h-[88vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-salon-borderBlack/80 bg-salon-black">
      {/* ======================================================== */}
      {/* 1. BACKGROUND CINEMATIC VIDEO & POSTER FALLBACK */}
      {/* ======================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Poster Image (Always present underneath as instant LCP placeholder) */}
        <Image
          src={activePoster}
          alt="The Jawed Habib Salon Lalganj Luxury Interior Lounge"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.38] contrast-105"
          unoptimized
        />

        {/* Cinematic Video Background - Non-blocking metadata preload with smooth cross-fade */}
        {!isReducedMotion && !hasError && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={activePoster}
            onLoadedData={() => setIsVideoLoaded(true)}
            onError={() => setHasError(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className={`h-full w-full object-cover object-center brightness-[0.42] contrast-105 transition-opacity duration-1000 ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src={activeVideo} type="video/mp4" />
          </video>
        )}

        {/* Multi-Layered Luxury Gradient Overlays for High-Contrast Readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-salon-black via-salon-black/45 to-salon-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(11,11,11,0.85)_100%)]" />
      </div>

      {/* ======================================================== */}
      {/* 2. HERO CONTENT & EDITORIAL CALLS TO ACTION */}
      {/* ======================================================== */}
      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 lg:py-24 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Business Badge with Official Monogram */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-salon-gold/50 bg-black/70 px-4 py-1.5 shadow-[0_0_15px_rgba(198,165,107,0.2)] backdrop-blur-md">
            <BrandLogo variant="icon" width={18} height={18} href={false} className="shrink-0" />
            <span className="font-sans text-xs font-semibold tracking-widest uppercase text-salon-goldLight">
              {badgeText || "THE JAWED HABIB SALON • LALGANJ, VAISHALI"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.12]">
            {headline ? (
              <span>{headline}</span>
            ) : (
              <>
                Discover Your <br />
                <span className="bg-gradient-to-r from-salon-goldLight via-salon-gold to-amber-500 bg-clip-text text-transparent">
                  Perfect Look.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-300 leading-relaxed font-light">
            {subtitle || "Experience the pinnacle of hair artistry, transformative beauty rituals, and royal grooming in Lalganj, Bihar. Certified master stylists trained in Jawed Habib geometric precision."}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="gold"
              size="lg"
              onClick={onBookClick}
              className="w-full sm:w-auto gap-2.5 px-8 py-6 text-sm font-bold shadow-[0_0_25px_rgba(198,165,107,0.35)] hover:scale-[1.02] transition-transform"
            >
              <Calendar className="h-4 w-4" />
              <span>{primaryCtaText || "Book Appointment"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onExploreClick}
              className="w-full sm:w-auto gap-2 px-8 py-6 text-sm border-zinc-700 bg-black/60 backdrop-blur-md hover:border-salon-gold hover:text-salon-gold hover:scale-[1.02] transition-transform text-zinc-200"
            >
              <Scissors className="h-4 w-4 text-salon-gold" />
              <span>{secondaryCtaText || "Explore Services & Menu"}</span>
            </Button>
          </div>

          {/* Business Hours & Verified Ratings Strip */}
          <div className="pt-8 border-t border-zinc-800/80 mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-center space-x-3 rounded-xl border border-zinc-800/80 bg-black/60 p-3.5 backdrop-blur-md shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-salon-gold/40 bg-salon-gold/10 text-salon-gold flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Operating Hours
                </span>
                <span className="text-xs font-semibold text-white">
                  10:00 AM – 10:00 PM
                </span>
                <span className="text-[11px] text-emerald-400 block font-medium">
                  Open All 7 Days
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-xl border border-zinc-800/80 bg-black/60 p-3.5 backdrop-blur-md shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-salon-gold/40 bg-salon-gold/10 text-salon-gold flex-shrink-0">
                <Star className="h-5 w-5 fill-salon-gold text-salon-gold" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Verified Customer Rating
                </span>
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  4.9 / 5.0 Stars
                  <span className="text-[11px] text-salon-gold">★★★★★</span>
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  Based on local Lalganj reviews
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-xl border border-zinc-800/80 bg-black/60 p-3.5 backdrop-blur-md shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-salon-gold/40 bg-salon-gold/10 text-salon-gold flex-shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Branch Location
                </span>
                <span className="text-xs font-semibold text-white line-clamp-1">
                  1st Floor, Tinpulwa Chowk
                </span>
                <span className="text-[11px] text-salon-goldLight block">
                  Above Killer, Opp. Manglam Mart
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CINEMATIC BACKGROUND VIDEO PLAY/PAUSE CONTROLLER */}
      {/* ======================================================== */}
      {!isReducedMotion && !hasError && isVideoLoaded && (
        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause cinematic background video" : "Play cinematic background video"}
          className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-salon-gold/40 bg-black/75 text-salon-gold shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all hover:border-salon-gold hover:bg-black hover:scale-105"
          title={isPlaying ? "Pause background video" : "Play background video"}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
          )}
        </button>
      )}
    </section>
  );
}
