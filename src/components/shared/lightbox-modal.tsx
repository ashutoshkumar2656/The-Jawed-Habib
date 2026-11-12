"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface GalleryPhoto {
  id: string;
  src: string;
  title: string;
  category: string;
  caption?: string;
}

interface LightboxModalProps {
  photos: GalleryPhoto[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function LightboxModal({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  React.useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onNavigate((currentIndex - 1 + photos.length) % photos.length);
      }
      if (e.key === "ArrowRight") {
        onNavigate((currentIndex + 1) % photos.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, photos.length, onClose, onNavigate]);

  if (currentIndex === null || !photos[currentIndex]) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Bar Controls */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="space-y-0.5">
          <span className="text-[10px] tracking-widest uppercase text-salon-gold font-semibold">
            {currentPhoto.category}
          </span>
          <h4 className="font-serif text-sm sm:text-base font-bold text-white">
            {currentPhoto.title}
          </h4>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-zinc-400">
            {currentIndex + 1} / {photos.length}
          </span>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close Lightbox"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Prev Button */}
      <button
        onClick={() => onNavigate((currentIndex - 1 + photos.length) % photos.length)}
        className="absolute left-4 z-40 rounded-full border border-zinc-700 bg-black/60 p-3 text-zinc-200 hover:text-salon-gold hover:border-salon-gold transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      {/* Main Image Stage */}
      <div className="relative w-full max-w-5xl h-[70vh] sm:h-[80vh] px-4 flex items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src={currentPhoto.src}
            alt={currentPhoto.title}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={() => onNavigate((currentIndex + 1) % photos.length)}
        className="absolute right-4 z-40 rounded-full border border-zinc-700 bg-black/60 p-3 text-zinc-200 hover:text-salon-gold hover:border-salon-gold transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Bottom Caption */}
      {currentPhoto.caption && (
        <div className="absolute bottom-6 inset-x-0 z-40 text-center px-6">
          <p className="inline-block bg-black/70 border border-zinc-800/80 px-4 py-2 rounded-full text-xs text-zinc-300 backdrop-blur-md">
            {currentPhoto.caption}
          </p>
        </div>
      )}
    </div>
  );
}
