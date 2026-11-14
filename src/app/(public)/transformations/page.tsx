"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { BeforeAfterSlider, TransformationItem } from "@/components/shared/before-after-slider";
import { Sparkles, Calendar, Scissors, ArrowRight, Loader2 } from "lucide-react";

export default function TransformationsPage() {
  const [transformations, setTransformations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  React.useEffect(() => {
    let isMounted = true;
    async function fetchTransformations() {
      try {
        setLoading(true);
        const res = await fetch("/api/transformations");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setTransformations(json.data);
        }
      } catch (err) {
        console.error("Failed to load transformations:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTransformations();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    transformations.forEach((item) => {
      const cat = item.category || item.service?.name || (item.clientGender ? `${item.clientGender} Makeover` : "Hair Care");
      if (cat) set.add(cat);
    });
    return ["All", ...Array.from(set)];
  }, [transformations]);

  const filteredTransformations = React.useMemo(() => {
    if (selectedCategory === "All") return transformations;
    return transformations.filter((item) => {
      const cat = item.category || item.service?.name || (item.clientGender ? `${item.clientGender} Makeover` : "Hair Care");
      return cat === selectedCategory;
    });
  }, [selectedCategory, transformations]);

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Before & After Transformations" }]} />

        {/* 1. Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Visual Proof of Artistry</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Before &amp; After Transformation Gallery
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Slide each image interactively to inspect the precision haircuts, restorative hair spa results, and hair coloring artistry crafted at The Jawed Habib Salon Lalganj.
          </p>
        </div>

        {/* 2. Category Filter Tabs */}
        {categories.length > 2 && (
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
        )}

        {/* 3. Interactive Transformation Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {[1, 2].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-zinc-900/40 border border-zinc-800 animate-pulse flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-salon-gold/40 animate-spin" />
              </div>
            ))}
          </div>
        ) : filteredTransformations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs space-y-3 max-w-lg mx-auto">
            <Sparkles className="h-10 w-10 text-salon-gold/40 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-white">No Transformations Found</h3>
            <p className="text-zinc-400">
              {selectedCategory === "All"
                ? "Our senior stylists are currently curating real before & after showcases. Check back soon!"
                : `No transformations published in category "${selectedCategory}".`}
            </p>
            {selectedCategory !== "All" && (
              <Button variant="outline" size="sm" onClick={() => setSelectedCategory("All")} className="mt-2 text-xs">
                View All Transformations
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {filteredTransformations.map((item) => (
              <div key={item.id} className="space-y-3">
                <BeforeAfterSlider item={item} />
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs text-zinc-400">
                    Inspired by this look?
                  </span>
                  <Link href={`/booking?service=${item.serviceId || ""}`}>
                    <Button variant="gold" size="sm" className="gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Book Makeover Appointment</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

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
          </div>
        </div>
      </div>
    </div>
  );
}
