"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { LightboxModal, GalleryPhoto } from "@/components/shared/lightbox-modal";
import { Maximize2, Instagram, Image as ImageIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";

interface DynamicGalleryItem {
  id: string;
  title: string;
  caption: string | null;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  isPublished?: boolean;
  sortOrder: number;
}

export default function GalleryPage() {
  const [photos, setPhotos] = React.useState<GalleryPhoto[]>([]);
  const [categories, setCategories] = React.useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = React.useState<string>("All");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  // Fetch dynamic gallery from database API
  React.useEffect(() => {
    let isMounted = true;

    async function loadGallery() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();

        if (isMounted && data.success && Array.isArray(data.data)) {
          const mapped: GalleryPhoto[] = data.data.map((item: DynamicGalleryItem) => ({
            id: item.id,
            src: item.imageUrl,
            title: item.title,
            category: item.category || "Salon Ambience",
            caption: item.caption || "",
          }));

          setPhotos(mapped);

          // Extract unique categories
          const uniqueCats = Array.from(new Set(mapped.map((p) => p.category))).filter(Boolean);
          setCategories(["All", ...uniqueCats]);
        }
      } catch (err) {
        console.error("Failed to load gallery photos:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter photos based on selected category tab
  const filteredPhotos = React.useMemo(() => {
    if (activeCategory === "All") return photos;
    return photos.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
  }, [photos, activeCategory]);

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Salon Gallery" }]} />

        {/* 1. Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Visual Sanctuary</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            The Lalganj Salon Experience
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Take a visual tour through our luxury stations, hair spa loungers, and artistry moments at 1st Floor, Tinpulwa Chowk.
          </p>
        </div>

        {/* 2. Dynamic Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-zinc-800 pb-6">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-salon-gold text-black shadow-[0_0_20px_rgba(198,165,107,0.3)]"
                  : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white hover:border-salon-gold/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. Masonry / Responsive Image Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-zinc-950 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20 luxury-card rounded-2xl border border-zinc-800 p-8 space-y-3">
            <ImageIcon className="h-12 w-12 text-zinc-600 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-white">No photographs found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              There are currently no photos published in this category.
            </p>
            <Button
              variant="goldOutline"
              size="sm"
              onClick={() => setActiveCategory("All")}
              className="mt-2 text-xs"
            >
              View All Photos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => {
                  const realIndex = photos.findIndex((p) => p.id === photo.id);
                  setLightboxIndex(realIndex !== -1 ? realIndex : 0);
                }}
                className="luxury-card group relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer hover:border-salon-gold/50 transition-all duration-300"
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                {/* Expand icon hover cue */}
                <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                  <Maximize2 className="h-4 w-4 text-salon-gold" />
                </div>

                {/* Metadata caption */}
                <div className="absolute bottom-0 inset-x-0 p-5 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-salon-gold">
                    {photo.category}
                  </span>
                  <h3 className="font-serif text-base font-bold text-white group-hover:text-salon-goldLight transition-colors">
                    {photo.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Instagram Feed Integration Strip */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 sm:p-12 text-center space-y-4">
          <Instagram className="h-8 w-8 text-salon-gold mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-white">
            Follow Our Everyday Artistry in Lalganj
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Stay updated with our latest style trends, client stories, and seasonal festive specials on Instagram.
          </p>
          <div className="pt-2">
            <a
              href={BRAND_CONFIG.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "gold" }), "gap-2")}
            >
              <Instagram className="h-4 w-4" />
              <span>Follow @the_jawedhabib_lalganj</span>
            </a>
          </div>
        </div>

        {/* Lightbox Viewer */}
        <LightboxModal
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      </div>
    </div>
  );
}
