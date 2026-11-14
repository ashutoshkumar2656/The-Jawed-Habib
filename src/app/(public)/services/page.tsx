"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { cn } from "@/lib/utils/cn";
import {
  Scissors,
  Sparkles,
  Search,
  Clock,
  CheckCircle2,
  Calendar,
  X,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

interface DynamicCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
}

interface DynamicService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detailedDescription?: string | null;
  price: number;
  discountedPrice: number | null;
  isStartingPrice?: boolean;
  durationMinutes: number;
  gender: string;
  categoryId: string;
  imageUrl: string | null;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  category?: DynamicCategory | null;
}

export default function ServicesPage() {
  const [services, setServices] = React.useState<DynamicService[]>([]);
  const [categories, setCategories] = React.useState<DynamicCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedService, setSelectedService] = React.useState<DynamicService | null>(null);

  // Fetch dynamic categories and services from the backend APIs
  React.useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [catsRes, servsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/services"),
        ]);

        const [catsData, servsData] = await Promise.all([
          catsRes.json(),
          servsRes.json(),
        ]);

        if (isMounted) {
          if (catsData.success && Array.isArray(catsData.data)) {
            setCategories(catsData.data);
          }
          if (servsData.success && Array.isArray(servsData.data)) {
            setServices(servsData.data);
          }
        }
      } catch (err) {
        console.error("Failed to load salon services:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync active category with URL hash or query param on client mount
  React.useEffect(() => {
    if (typeof window !== "undefined" && categories.length > 0) {
      const hash = window.location.hash.replace("#", "").toLowerCase().trim();
      const params = new URLSearchParams(window.location.search);
      const catParam = (params.get("category") || hash || "").toLowerCase().trim();
      if (catParam && catParam !== "all") {
        const match = categories.find(
          (c) =>
            c.id.toLowerCase() === catParam ||
            c.slug.toLowerCase() === catParam ||
            c.name.toLowerCase() === catParam
        );
        if (match) {
          setActiveCategory(match.id);
        }
      }
    }
  }, [categories]);

  // Filter services by active category and search query
  const filteredServices = React.useMemo(() => {
    return services.filter((s) => {
      const matchesCategory =
        activeCategory === "all" ||
        s.categoryId === activeCategory ||
        s.category?.slug === activeCategory ||
        (s.category?.name && s.category.name.toLowerCase() === activeCategory.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query)) ||
        (s.category?.name && s.category.name.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [services, activeCategory, searchQuery]);

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Services Menu" }]} />

        {/* 1. Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Comprehensive Menu</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Hair, Beauty & Royal Grooming Services
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Every service at The Jawed Habib Salon Lalganj is executed with single-use sterile consumables and authentic salon formulations.
          </p>

          <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-4 py-1.5 rounded-full text-xs text-zinc-400">
            <Info className="h-3.5 w-3.5 text-salon-gold" />
            <span>Prices marked are indicative starting rates until confirmed during pre-service consultation.</span>
          </div>
        </div>

        {/* 2. Search & Category Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          {/* Dynamic Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                activeCategory === "all"
                  ? "bg-salon-gold text-black shadow-[0_0_15px_rgba(198,165,107,0.3)]"
                  : "bg-zinc-950/80 text-zinc-300 border border-zinc-800 hover:border-salon-gold/40"
              }`}
            >
              All Services ({services.length})
            </button>

            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeCategory === cat.id || activeCategory === cat.slug
                    ? "bg-salon-gold text-black shadow-[0_0_15px_rgba(198,165,107,0.3)]"
                    : "bg-zinc-950/80 text-zinc-300 border border-zinc-800 hover:border-salon-gold/40"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search haircut, spa, facial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="luxury-card rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 space-y-4 animate-pulse"
              >
                <div className="aspect-[16/10] bg-zinc-900 rounded-xl" />
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800/60 rounded w-full" />
                <div className="h-3 bg-zinc-800/60 rounded w-2/3" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-zinc-800 rounded w-20" />
                  <div className="h-8 bg-zinc-800 rounded w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 luxury-card rounded-2xl border border-zinc-800 p-8 space-y-3">
            <Scissors className="h-12 w-12 text-zinc-600 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-white">No services found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {searchQuery
                ? `No services match "${searchQuery}". Try a different keyword or reset filters.`
                : "No services are currently active in this category."}
            </p>
            <Button
              variant="goldOutline"
              size="sm"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-2 text-xs"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const displayImage =
                service.imageUrl || "/images/salon/services/jh-lalganj-jawed-habib-mastercut.webp";
              const priceDisplay = service.discountedPrice
                ? `₹${service.discountedPrice}`
                : service.isStartingPrice
                ? `Starting ₹${service.price}`
                : `₹${service.price}`;

              return (
                <div
                  key={service.id}
                  className="luxury-card group rounded-2xl border border-zinc-800/80 bg-zinc-950/80 overflow-hidden flex flex-col justify-between hover:border-salon-gold/40 hover:shadow-[0_0_25px_rgba(198,165,107,0.12)] transition-all duration-300"
                >
                  <div>
                    {/* Service Image Banner */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                      <Image
                        src={displayImage}
                        alt={service.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-salon-gold tracking-wider uppercase">
                          {service.category?.name || "Salon Care"}
                        </span>
                      </div>

                      {/* Popular / Featured Badge */}
                      {service.isPopular && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 rounded-full bg-salon-gold text-black text-[9px] font-bold tracking-widest uppercase shadow">
                            Popular
                          </span>
                        </div>
                      )}

                      {/* Duration Tag */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] text-zinc-300">
                        <Clock className="h-3 w-3 text-salon-gold" />
                        <span>{service.durationMinutes} mins</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-serif text-lg font-bold text-white group-hover:text-salon-gold transition-colors">
                        {service.name}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {service.description || "Signature service crafted by certified Jawed Habib master stylists."}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer with Price and Actions */}
                  <div className="p-5 pt-0 border-t border-zinc-800/60 mt-4 space-y-3">
                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                          Salon Rate
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base sm:text-lg font-bold text-salon-goldLight">
                            {priceDisplay}
                          </span>
                          {service.discountedPrice && (
                            <span className="text-xs text-zinc-500 line-through">
                              ₹{service.price}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className="text-xs font-semibold text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
                      >
                        Quick Details
                      </button>
                    </div>

                    <div className="pt-1">
                      <Link
                        href={`/booking?service=${service.id}`}
                        className={cn(buttonVariants({ variant: "gold", size: "sm" }), "w-full gap-2 text-xs font-bold")}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Book This Service Online</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Service Detail Modal */}
        <Modal
          isOpen={selectedService !== null}
          onClose={() => setSelectedService(null)}
          title={selectedService?.name || "Service Details"}
          maxWidth="lg"
        >
          {selectedService && (
            <div className="space-y-6">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <Image
                  src={selectedService.imageUrl || "/images/salon/services/jh-lalganj-jawed-habib-mastercut.webp"}
                  alt={selectedService.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-salon-gold tracking-widest">
                      {selectedService.category?.name || "Salon Care"}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      {selectedService.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">Duration: {selectedService.durationMinutes} mins</span>
                    <span className="text-lg font-bold text-salon-goldLight">
                      {selectedService.discountedPrice
                        ? `₹${selectedService.discountedPrice}`
                        : selectedService.isStartingPrice
                        ? `Starting ₹${selectedService.price}`
                        : `₹${selectedService.price}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                  Treatment Overview
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {selectedService.detailedDescription || selectedService.description || "Executed by Jawed Habib certified specialists with single-use sterile consumables."}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/60 border border-zinc-800 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Target Audience: </span>
                {selectedService.gender === "UNISEX" ? "Men, Women, and Teens" : `${selectedService.gender.charAt(0) + selectedService.gender.slice(1).toLowerCase()} specific`}
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedService(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Link
                  href={`/booking?service=${selectedService.id}`}
                  className={cn(buttonVariants({ variant: "gold" }), "text-xs gap-2")}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book This Service Online</span>
                </Link>
              </div>
            </div>
          )}
        </Modal>

        {/* 5. Pricing Information Strip */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="outline" className="text-salon-gold border-salon-gold/30 text-[10px]">
              Pricing Transparency
            </Badge>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Transparent Rates & Pre-Service Consultations
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-xl">
              All prices shown are indicative starting rates. Final rates for chemical color, balayage, keratin, and bridal styling are confirmed during your unhurried consultation based on hair length, density, and chosen products.
            </p>
          </div>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 flex-shrink-0")}
          >
            <span>View Transparent Price List</span>
            <Info className="h-4 w-4 text-salon-gold" />
          </Link>
        </div>

        {/* 6. BOOKING CTA BANNER */}
        <div className="rounded-3xl border border-salon-gold/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-center space-y-4 shadow-[0_0_40px_rgba(198,165,107,0.1)]">
          <Badge variant="gold">Ready to Book?</Badge>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Reserve Your Styling Session in Lalganj
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed font-light">
            Located at 1st Floor, Tinpulwa Chowk. Open all 7 days from 10:00 AM to 10:00 PM. Book online or call our concierge desk.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/booking"
              className={cn(buttonVariants({ variant: "gold", size: "lg" }), "gap-2")}
            >
              <Calendar className="h-4 w-4" />
              <span>Book Appointment Online</span>
            </Link>
            <Link
              href="/consultation"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <span>Start Free Consultation</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
