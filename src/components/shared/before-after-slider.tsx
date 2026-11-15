"use client";

import * as React from "react";
import Image from "next/image";
import { Maximize2, Minimize2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export interface TransformationItem {
  id: string;
  title: string;
  category?: string;
  beforeImage?: string;
  beforeImageUrl?: string;
  afterImage?: string;
  afterImageUrl?: string;
  stylistRole?: string;
  description?: string | null;
  treatmentName?: string;
  service?: { name?: string };
  staff?: { name?: string; designation?: string };
  isFeatured?: boolean;
}

interface BeforeAfterSliderProps {
  item: TransformationItem;
  className?: string;
  onPrev?: () => void;
  onNext?: () => void;
  showControls?: boolean;
}

export function BeforeAfterSlider({
  item,
  className,
  onPrev,
  onNext,
  showControls = true,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = React.useState<number>(50);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const beforeSrc = item.beforeImage || item.beforeImageUrl || "/images/services/service-haircut.jpg";
  const afterSrc = item.afterImage || item.afterImageUrl || "/images/services/service-haircut.jpg";
  const categoryLabel = item.category || item.service?.name || "Hair & Beauty";
  const treatmentLabel = item.treatmentName || item.service?.name || "Signature Styling";
  const stylistLabel = item.stylistRole || (item.staff ? `${item.staff.name} (${item.staff.designation || "Stylist"})` : "Master Stylist");
  const badgeLabel = item.isFeatured ? "Master Showcase" : "Salon Transformation";

  const handleMove = React.useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleInteractionEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleInteractionEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleInteractionEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleInteractionEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleInteractionEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleInteractionEnd]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div
      className={cn(
        "luxury-card rounded-2xl border border-zinc-800 bg-zinc-950/90 overflow-hidden flex flex-col transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 rounded-none border-none",
        className
      )}
    >
      {/* Top Bar with Badges & Fullscreen Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <Badge variant="gold" className="text-[10px] tracking-wider uppercase">
            {categoryLabel}
          </Badge>
          <span className="text-[10px] font-medium tracking-wider uppercase text-salon-gold bg-salon-gold/10 border border-salon-gold/30 px-2 py-0.5 rounded-full">
            {badgeLabel}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {showControls && (
            <>
              {onPrev && (
                <button
                  type="button"
                  onClick={onPrev}
                  className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-salon-gold hover:border-salon-gold transition-colors"
                  aria-label="Previous transformation"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-salon-gold hover:border-salon-gold transition-colors"
                  aria-label="Next transformation"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300 hover:text-salon-gold hover:border-salon-gold transition-colors"
            aria-label={isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Comparison Viewport */}
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Before and After transformation comparison slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ touchAction: "none" }}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden select-none cursor-ew-resize bg-black touch-none focus:outline-none focus:ring-2 focus:ring-salon-gold/50"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          if (e.touches[0]) handleMove(e.touches[0].clientX);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setSliderPosition((prev) => Math.max(0, prev - 5));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setSliderPosition((prev) => Math.min(100, prev + 5));
          } else if (e.key === "Home") {
            e.preventDefault();
            setSliderPosition(0);
          } else if (e.key === "End") {
            e.preventDefault();
            setSliderPosition(100);
          }
        }}
      >
        {/* Under layer: After Image (revealed from right) */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={afterSrc}
            alt={`${item.title} - After`}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover object-center pointer-events-none"
            priority
          />
          {/* AFTER Label */}
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase bg-black/80 text-salon-gold border border-salon-gold/50 px-3 py-1 rounded-md shadow-lg backdrop-blur-md">
              AFTER
            </span>
          </div>
        </div>

        {/* Top layer: Before Image (clipped from right according to sliderPosition) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <Image
            src={beforeSrc}
            alt={`${item.title} - Before`}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover object-center pointer-events-none"
            priority
          />
          {/* BEFORE Label */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase bg-black/80 text-zinc-300 border border-zinc-700 px-3 py-1 rounded-md shadow-lg backdrop-blur-md">
              BEFORE
            </span>
          </div>
        </div>

        {/* Divider Bar & Drag Handle */}
        <div
          className="absolute top-0 bottom-0 z-30 w-1 bg-gradient-to-b from-salon-goldLight via-salon-gold to-salon-goldDark pointer-events-none shadow-[0_0_15px_rgba(198,165,107,0.7)]"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-salon-gold bg-black/90 shadow-[0_0_20px_rgba(198,165,107,0.8)] backdrop-blur-md">
            <div className="flex items-center space-x-1 text-salon-gold">
              <ChevronLeft className="h-3.5 w-3.5 -mr-1" />
              <ChevronRight className="h-3.5 w-3.5 -ml-1" />
            </div>
          </div>
        </div>

        {/* Bottom Hint on Hover */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] text-zinc-300 tracking-wider">
          Drag slider or touch to compare
        </div>
      </div>

      {/* Card Metadata Details */}
      <div className="p-6 space-y-2 bg-zinc-950/60">
        <div className="flex items-baseline justify-between">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
            {item.title}
          </h3>
          <span className="text-xs text-salon-gold font-medium">
            {treatmentLabel}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          {item.description}
        </p>
        <div className="pt-2 text-[11px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/60">
          <span>Stylist Craft: {stylistLabel}</span>
          <span>The Jawed Habib Salon • Lalganj</span>
        </div>
      </div>
    </div>
  );
}
