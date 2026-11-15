"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCcw, ArrowLeft } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function AdminLoginErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[ADMIN_LOGIN_OPERATIONAL_EXCEPTION]", error);
  }, [error]);

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-salon-black px-4 py-12 overflow-hidden selection:bg-salon-gold selection:text-black">
      {/* Ambient Luxury Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-salon-gold/15 via-salon-gold/5 to-transparent pointer-events-none blur-3xl opacity-70" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-salon-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-7 rounded-2xl border border-salon-gold/30 bg-zinc-950/85 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_60px_rgba(198,165,107,0.18)] text-center">
        {/* Brand Header */}
        <div className="flex justify-center mb-1">
          <BrandLogo variant="stacked-color" size="md" href="/" priority />
        </div>

        <div className="h-14 w-14 mx-auto rounded-full bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400">
          <ShieldAlert className="h-7 w-7 text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-white tracking-wide">
            Login Interface Recovery
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The administrative authentication interface encountered a temporary initialization error. Your salon data and system security remain completely protected.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-zinc-500 pt-1">
              Ref ID: <span className="text-zinc-400">{error.digest}</span>
            </p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="gold"
            size="lg"
            className="w-full gap-2 text-xs font-bold tracking-wider uppercase text-salon-richBlack shadow-[0_0_20px_rgba(198,165,107,0.3)] hover:shadow-[0_0_30px_rgba(198,165,107,0.5)]"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Reload Login Form</span>
          </Button>

          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors pt-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>

        <div className="border-t border-zinc-800/80 pt-4 text-[10px] text-zinc-500">
          {BRAND_CONFIG.fullName} &bull; {BRAND_CONFIG.location.addressLine1}, {BRAND_CONFIG.location.city}
        </div>
      </div>
    </div>
  );
}
