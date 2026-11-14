"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { cn } from "@/lib/utils/cn";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Scissors,
  ShieldCheck,
  Phone,
  PackageCheck,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

interface DynamicPackage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number;
  durationMinutes: number;
  servicesList: string[];
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
}

export default function PackagesPage() {
  const [packages, setPackages] = React.useState<DynamicPackage[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadPackages() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setPackages(data.data);
        }
      } catch (err) {
        console.error("Failed to load packages:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Packages & Combos" }]} />

        {/* 1. Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Curated Bundles</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Curated Salon Packages &amp; Bridal Bundles in Lalganj, Vaishali
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Enjoy comprehensive head-to-toe beauty rituals, restorative hair therapies, and executive grooming bundles crafted for maximum relaxation and savings.
          </p>
        </div>

        {/* 2. Packages Grid Header & Cards */}
        <div className="border-b border-zinc-800 pb-3">
          <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
            Exclusive Beauty, Hair Spa &amp; Grooming Bundles
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 space-y-6 animate-pulse"
              >
                <div className="h-6 bg-zinc-800 rounded w-1/2" />
                <div className="h-8 bg-zinc-800 rounded w-1/3" />
                <div className="space-y-3">
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-800 rounded w-5/6" />
                  <div className="h-3 bg-zinc-800 rounded w-4/6" />
                </div>
                <div className="h-10 bg-zinc-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 luxury-card rounded-2xl border border-zinc-800 p-8 space-y-3">
            <PackageCheck className="h-12 w-12 text-zinc-600 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-white">No active packages</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Our salon packages are currently being updated. Please check back shortly or explore our individual services.
            </p>
            <Link href="/services">
              <Button variant="gold" size="sm" className="mt-2 text-xs">
                Explore Services Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => {
              const savings = pkg.originalPrice > pkg.price ? pkg.originalPrice - pkg.price : 0;

              return (
                <div
                  key={pkg.id}
                  className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                    pkg.isFeatured
                      ? "border-2 border-salon-gold bg-zinc-900/90 shadow-[0_0_40px_rgba(198,165,107,0.25)] md:-translate-y-2"
                      : "border border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                  }`}
                >
                  {pkg.isFeatured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge variant="gold" className="text-[10px] tracking-widest uppercase py-1 px-3">
                        Featured Bundle
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-salon-gold/15 flex items-center justify-center text-salon-gold">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      {savings > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                          Save ₹{savings}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-bold text-white">
                        {pkg.name}
                      </h3>
                      {pkg.description && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {pkg.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 pt-2 border-t border-zinc-800/80">
                      <span className="text-3xl font-bold text-white">
                        ₹{pkg.price}
                      </span>
                      {pkg.originalPrice > pkg.price && (
                        <span className="text-sm text-zinc-500 line-through">
                          ₹{pkg.originalPrice}
                        </span>
                      )}
                      <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3 text-salon-gold" />
                        <span>{pkg.durationMinutes} mins</span>
                      </span>
                    </div>

                    {pkg.servicesList && pkg.servicesList.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-salon-gold">
                          Package Inclusions:
                        </span>
                        <ul className="space-y-2 text-xs text-zinc-300">
                          {pkg.servicesList.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-salon-gold flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-zinc-800/80 mt-6">
                    <Link
                      href={`/booking?package=${pkg.id}`}
                      className={cn(
                        buttonVariants({ variant: pkg.isFeatured ? "gold" : "goldOutline" }),
                        "w-full gap-2 text-xs font-bold"
                      )}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Book This Package Online</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Pre-Bridal & Custom Consultation Strip */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <Badge variant="outline" className="text-salon-gold border-salon-gold/30 text-[10px]">
              Custom Packages
            </Badge>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Planning a Wedding or Family Celebration?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-light">
              We design custom bridal, groom, and family packages tailored to your schedule, attire, and guest size. Speak directly with our master stylists for a personalized plan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${BRAND_CONFIG.contact.primaryPhone}`}
              className={cn(buttonVariants({ variant: "outline" }), "gap-2 text-xs")}
            >
              <Phone className="h-4 w-4 text-salon-gold" />
              <span>Call {BRAND_CONFIG.contact.primaryPhone}</span>
            </a>
            <Link
              href="/consultation"
              className={cn(buttonVariants({ variant: "gold" }), "gap-2 text-xs")}
            >
              <span>Free Consultation</span>
            </Link>
          </div>
        </div>

        {/* 4. Hygiene & Brand Standards Pledge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="luxury-card rounded-xl border border-zinc-800 p-5 space-y-2">
            <ShieldCheck className="h-6 w-6 text-salon-gold" />
            <h4 className="font-serif text-sm font-bold text-white">Hospital-Grade Sterilization</h4>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Every scissor, comb, and brush is UV sterilized before every client. Single-use disposable capes and neck wraps.
            </p>
          </div>
          <div className="luxury-card rounded-xl border border-zinc-800 p-5 space-y-2">
            <Crown className="h-6 w-6 text-salon-gold" />
            <h4 className="font-serif text-sm font-bold text-white">Certified Master Stylists</h4>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              All treatments executed by professionals trained in the Jawed Habib geometry cutting and international styling curriculum.
            </p>
          </div>
          <div className="luxury-card rounded-xl border border-zinc-800 p-5 space-y-2">
            <Sparkles className="h-6 w-6 text-salon-gold" />
            <h4 className="font-serif text-sm font-bold text-white">Authentic Formulations</h4>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Genuine L&apos;Oréal Professionnel, Inoa ammonia-free colors, and certified international skincare formulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
