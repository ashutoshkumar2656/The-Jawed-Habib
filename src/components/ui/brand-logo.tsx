"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";

export type BrandLogoVariant =
  | "primary"       // Red JH Monogram + White text (for dark backgrounds)
  | "white"         // Pure White logo (high-contrast dark backgrounds)
  | "primary-dark"  // Red JH Monogram + Dark text (for light backgrounds)
  | "stacked"       // Stacked white logo (Monogram above, Wordmark below)
  | "stacked-color" // Stacked colored logo (Red Monogram above, White Wordmark)
  | "icon"          // Red JH Monogram icon only
  | "icon-white";   // Pure white JH Monogram icon only

export interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: "sm" | "md" | "lg" | "xl" | "custom";
  width?: number;
  height?: number;
  href?: string | false;
  className?: string;
  showBranch?: boolean;
  branchClassName?: string;
  priority?: boolean;
  alt?: string;
}

const VARIANT_ASSETS: Record<BrandLogoVariant, { src: string; aspect: number; defaultW: number; defaultH: number }> = {
  primary: {
    src: "/brand/jawed-habib/logo-primary.svg",
    aspect: 1415 / 299,
    defaultW: 200,
    defaultH: 42,
  },
  white: {
    src: "/brand/jawed-habib/logo-white.svg",
    aspect: 1415 / 299,
    defaultW: 200,
    defaultH: 42,
  },
  "primary-dark": {
    src: "/brand/jawed-habib/logo-primary-dark.png",
    aspect: 1415 / 299,
    defaultW: 200,
    defaultH: 42,
  },
  stacked: {
    src: "/brand/jawed-habib/logo-stacked.png",
    aspect: 1117 / 521,
    defaultW: 160,
    defaultH: 75,
  },
  "stacked-color": {
    src: "/brand/jawed-habib/logo-stacked-color.png",
    aspect: 1117 / 521,
    defaultW: 160,
    defaultH: 75,
  },
  icon: {
    src: "/brand/jawed-habib/logo-icon.svg",
    aspect: 1,
    defaultW: 44,
    defaultH: 44,
  },
  "icon-white": {
    src: "/brand/jawed-habib/logo-icon-white.png",
    aspect: 1,
    defaultW: 44,
    defaultH: 44,
  },
};

const SIZE_PRESETS: Record<"sm" | "md" | "lg" | "xl", { w: number; h: number }> = {
  sm: { w: 140, h: 30 },
  md: { w: 180, h: 38 },
  lg: { w: 230, h: 49 },
  xl: { w: 290, h: 61 },
};

const ICON_SIZE_PRESETS: Record<"sm" | "md" | "lg" | "xl", { w: number; h: number }> = {
  sm: { w: 32, h: 32 },
  md: { w: 42, h: 42 },
  lg: { w: 54, h: 54 },
  xl: { w: 72, h: 72 },
};

const STACKED_SIZE_PRESETS: Record<"sm" | "md" | "lg" | "xl", { w: number; h: number }> = {
  sm: { w: 120, h: 56 },
  md: { w: 160, h: 75 },
  lg: { w: 210, h: 98 },
  xl: { w: 260, h: 121 },
};

export function BrandLogo({
  variant = "primary",
  size = "md",
  width,
  height,
  href = "/",
  className,
  showBranch = false,
  branchClassName,
  priority = false,
  alt = "The Jawed Habib Salon – Lalganj Official Logo",
}: BrandLogoProps) {
  const assetInfo = VARIANT_ASSETS[variant];

  // Resolve dimensions
  let resolvedW = width;
  let resolvedH = height;

  if (!resolvedW || !resolvedH) {
    if (size === "custom") {
      resolvedW = assetInfo.defaultW;
      resolvedH = assetInfo.defaultH;
    } else if (variant === "icon" || variant === "icon-white") {
      const preset = ICON_SIZE_PRESETS[size];
      resolvedW = preset.w;
      resolvedH = preset.h;
    } else if (variant === "stacked" || variant === "stacked-color") {
      const preset = STACKED_SIZE_PRESETS[size];
      resolvedW = preset.w;
      resolvedH = preset.h;
    } else {
      const preset = SIZE_PRESETS[size];
      resolvedW = preset.w;
      resolvedH = preset.h;
    }
  }

  const imageElement = (
    <div className={cn("inline-flex flex-col items-start select-none", className)}>
      <div className="relative flex items-center justify-center">
        <Image
          src={assetInfo.src}
          alt={alt}
          width={resolvedW}
          height={resolvedH}
          priority={priority}
          className="object-contain h-auto max-w-full transition-transform duration-300"
          style={{ width: `${resolvedW}px` }}
        />
      </div>
      {showBranch && (
        <span
          className={cn(
            "text-[9px] uppercase font-bold tracking-[0.25em] text-salon-gold mt-1",
            branchClassName
          )}
        >
          Lalganj • Salon & Spa
        </span>
      )}
    </div>
  );

  if (href === false) {
    return imageElement;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-salon-gold/50 rounded-sm"
      aria-label="The Jawed Habib Salon Lalganj Homepage"
    >
      {imageElement}
    </Link>
  );
}
