"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import {
  Tag,
  Calendar,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  Crown,
  Scissors,
  Clock,
  Gift,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface DynamicCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minSpend?: number | null;
  maxDiscount?: number | null;
  validUntil?: string | Date;
  description?: string | null;
  isActive: boolean;
}

interface DynamicOffer {
  id: string;
  title: string;
  slug: string;
  description: string;
  discountType: string;
  discountValue: number;
  bannerImageUrl: string | null;
  validFrom: string | Date;
  validUntil: string | Date;
  isActive: boolean;
  isFeatured: boolean;
  termsConditions: string | null;
}

interface DynamicPackage {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number;
  durationMinutes: number;
  servicesList: string[];
  isFeatured: boolean;
}

export default function OffersPage() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const [coupons, setCoupons] = React.useState<DynamicCoupon[]>([]);
  const [offers, setOffers] = React.useState<DynamicOffer[]>([]);
  const [packages, setPackages] = React.useState<DynamicPackage[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadOffersData() {
      setIsLoading(true);
      try {
        const [coupRes, offRes, pkgRes] = await Promise.all([
          fetch("/api/coupons"),
          fetch("/api/offers"),
          fetch("/api/packages"),
        ]);

        const [coupData, offData, pkgData] = await Promise.all([
          coupRes.json(),
          offRes.json(),
          pkgRes.json(),
        ]);

        if (isMounted) {
          if (coupData.success && Array.isArray(coupData.data)) {
            setCoupons(coupData.data);
          }
          if (offData.success && Array.isArray(offData.data)) {
            setOffers(offData.data);
          }
          if (pkgData.success && Array.isArray(pkgData.data)) {
            setPackages(pkgData.data);
          }
        }
      } catch (err) {
        console.error("Failed to load offers data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOffersData();

    return () => {
      isMounted = false;
    };
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      type: "success",
      title: "Coupon Copied!",
      message: `Code ${code} copied to clipboard. Apply it during online booking.`,
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl space-y-14">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Special Offers & Vouchers" }]} />

        {/* 1. Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Privilege Club</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Exclusive Salon Offers & Privileges
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Enjoy bundled value, seasonal specials, and welcome vouchers designed exclusively for our Lalganj salon guests.
          </p>
        </div>

        {/* 2. Promotional Coupon Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-salon-gold" />
              <span>Active Discount Vouchers</span>
            </h3>
            <span className="text-xs text-zinc-400">
              {coupons.length} voucher{coupons.length === 1 ? "" : "s"} available
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 animate-pulse"
                >
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="h-6 bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 luxury-card rounded-2xl border border-zinc-800 p-6">
              <Gift className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No active voucher codes right now</p>
              <p className="text-xs text-zinc-400 mt-1">
                Check back soon or explore our bundled packages below for instant savings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((coupon) => {
                const discountLabel =
                  coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}% OFF`
                    : `Flat ₹${coupon.discountValue} OFF`;

                return (
                  <div
                    key={coupon.id || coupon.code}
                    className="luxury-card rounded-2xl border border-salon-gold/40 bg-zinc-950/80 p-6 flex flex-col justify-between space-y-4 shadow-[0_0_20px_rgba(198,165,107,0.08)]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="gold" className="text-[10px]">
                          Limited Privilege
                        </Badge>
                        <span className="text-xs text-salon-gold font-bold">
                          {discountLabel}
                        </span>
                      </div>

                      <h4 className="font-serif text-lg font-bold text-white">
                        {coupon.description || `Special Salon Privilege Voucher`}
                      </h4>

                      {coupon.minSpend ? (
                        <p className="text-xs text-zinc-400">
                          Applicable on bookings above ₹{coupon.minSpend}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-400">
                          Valid on all online appointment bookings
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
                      <div className="p-2.5 rounded-lg bg-black/60 border border-dashed border-salon-gold/50 flex-1 font-mono text-xs font-bold text-salon-gold tracking-widest text-center">
                        {coupon.code}
                      </div>

                      <Button
                        variant="goldOutline"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                        className="gap-1.5 text-xs flex-shrink-0"
                      >
                        {copiedCode === coupon.code ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </Button>

                      <Link href={`/booking?coupon=${coupon.code}`}>
                        <Button variant="gold" size="sm" className="text-xs font-bold">
                          Apply
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Featured Promotional Campaigns (from /api/offers) */}
        {offers.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-salon-gold" />
              <span>Special Seasonal Offers</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="luxury-card rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-salon-gold border-salon-gold/40 text-[10px]">
                      Special Promotion
                    </Badge>
                    <h4 className="font-serif text-lg font-bold text-white">
                      {offer.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-salon-gold">
                      {offer.discountType === "PERCENTAGE"
                        ? `${offer.discountValue}% OFF`
                        : `Save ₹${offer.discountValue}`}
                    </span>
                    <Link href="/booking">
                      <Button variant="goldOutline" size="sm" className="text-xs">
                        Book Offer
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Packages Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Signature Care Bundles
            </h2>
            <p className="text-xs text-zinc-400">
              Handcrafted combinations designed to provide complete care at discounted bundle pricing.
            </p>
          </div>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg) => {
                const savings = pkg.originalPrice > pkg.price ? pkg.originalPrice - pkg.price : 0;

                return (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                      pkg.isFeatured
                        ? "border-2 border-salon-gold bg-zinc-900/90 shadow-[0_0_40px_rgba(198,165,107,0.25)] md:-translate-y-2"
                        : "border border-zinc-800 bg-zinc-950/70"
                    }`}
                  >
                    {pkg.isFeatured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <Badge variant="gold" className="text-[10px] tracking-widest uppercase py-1 px-3">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-salon-gold/15 flex items-center justify-center text-salon-gold">
                          <Scissors className="h-5 w-5" />
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

                      <div className="flex items-baseline gap-2 pt-2 border-t border-zinc-800">
                        <span className="text-2xl font-bold text-white">
                          ₹{pkg.price}
                        </span>
                        {pkg.originalPrice > pkg.price && (
                          <span className="text-xs text-zinc-500 line-through">
                            ₹{pkg.originalPrice}
                          </span>
                        )}
                        <span className="text-xs text-zinc-400 ml-auto flex items-center gap-1">
                          <Clock className="h-3 w-3 text-salon-gold" />
                          <span>{pkg.durationMinutes} mins</span>
                        </span>
                      </div>

                      {pkg.servicesList && pkg.servicesList.length > 0 && (
                        <ul className="space-y-2 text-xs text-zinc-300 pt-2">
                          {pkg.servicesList.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-salon-gold flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-6 border-t border-zinc-800 mt-6">
                      <Link href={`/booking?package=${pkg.id}`} className="block w-full">
                        <Button
                          variant={pkg.isFeatured ? "gold" : "goldOutline"}
                          className="w-full gap-2 text-xs font-bold"
                        >
                          <Calendar className="h-4 w-4" />
                          <span>Reserve Package</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
