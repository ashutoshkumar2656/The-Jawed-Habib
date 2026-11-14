"use client";

import * as React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Star, MessageSquare, ShieldCheck, ExternalLink, Calendar, Heart, Award, ArrowRight } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  serviceName?: string | null;
  createdAt: string | Date;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = React.useState<ReviewItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setReviews(data.data);
        }
      })
      .catch((err) => console.error("Error fetching reviews:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-salon-black text-salon-ivory">
      {/* 1. HERO HEADER */}
      <section className="border-b border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-900 to-salon-black py-12 md:py-16 px-4 md:px-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Customer Reviews & Testimonials" },
            ]}
          />

          <div className="max-w-3xl space-y-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-salon-gold/50 bg-salon-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-salon-gold">
              <Star className="h-3.5 w-3.5 fill-salon-gold text-salon-gold" />
              <span>Verified Salon Experiences</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Customer Reviews &amp; Client Testimonials | The Jawed Habib Salon Lalganj
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Read authentic feedback from valued guests across Lalganj, Vaishali, and neighboring districts.
              From master precision haircuts to radiant bridal transformations, explore why local clients trust our 1st Floor Tinpulwa Chowk studio.
            </p>
          </div>

          {/* External Google Review Link */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <a
              href={BRAND_CONFIG.location.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "gap-2 border-salon-gold/60 text-salon-gold hover:bg-salon-gold/10 text-xs font-semibold"
              )}
            >
              <span>View On Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "secondary", size: "default" }),
                "gap-2 border border-zinc-700 text-xs text-zinc-300 hover:text-white"
              )}
            >
              <span>Share Your Feedback</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. REVIEWS LISTING */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Verified Client Feedback at Tinpulwa Chowk, Lalganj
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            All reviews reflect genuine customer visits and are verified by our salon management team.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 animate-pulse" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => {
              const reviewDate = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recent Visit";

              return (
                <div
                  key={rev.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between hover:border-salon-gold/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={cn(
                              "h-4 w-4",
                              idx < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-700"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-zinc-500">{reviewDate}</span>
                    </div>

                    {rev.serviceName && (
                      <span className="inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold text-salon-goldLight uppercase tracking-wider">
                        {rev.serviceName}
                      </span>
                    )}

                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      {rev.customerName}
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Guest
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center max-w-xl mx-auto space-y-4">
            <MessageSquare className="h-8 w-8 text-salon-gold mx-auto" />
            <h3 className="font-serif text-xl font-bold text-white">Be The First To Share Your Review</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Have you recently visited our salon at 1st Floor, Tinpulwa Chowk, Lalganj? We value your thoughts and invite you to share your feedback.
            </p>
            <div className="pt-2">
              <a
                href={BRAND_CONFIG.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "gold", size: "default" }), "gap-2 text-xs font-semibold")}
              >
                <span>Write a Review on Google</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* 3. BOTTOM CTA */}
      <section className="border-t border-zinc-800 bg-zinc-950 py-16 px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-5">
          <Award className="h-7 w-7 text-salon-gold mx-auto" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Experience Award-Winning Hair &amp; Beauty Artistry
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Book an appointment today with our certified master hair stylists and bridal beauty specialists in Lalganj.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/booking"
              className={cn(buttonVariants({ variant: "gold", size: "default" }), "gap-2 text-xs font-semibold")}
            >
              <span>Book Appointment Online</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "border-zinc-700 text-xs text-zinc-300")}
            >
              <span>Explore Services</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
