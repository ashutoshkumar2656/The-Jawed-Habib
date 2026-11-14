"use client";

import * as React from "react";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[GLOBAL_SYSTEM_ERROR]", {
      message: error?.message,
      digest: error?.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#111111] text-[#F7F4EE] flex flex-col items-center justify-center p-6 antialiased selection:bg-[#C6A56B] selection:text-black">
        <div className="w-full max-w-md rounded-2xl border border-[#C6A56B]/30 bg-black/85 backdrop-blur-xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(198,165,107,0.15)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C6A56B]/10 border border-[#C6A56B]/40 text-[#C6A56B]">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
              The Jawed Habib Salon
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#C6A56B]">
              Lalganj • System Recovery
            </p>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed">
            An unexpected application error occurred while loading this experience. Our salon concierge has been notified.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C6A56B] to-[#DFCA9E] px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 active:scale-95 shadow-md"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Restore Application</span>
            </button>
            <a
              href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold text-zinc-200 transition-all hover:bg-white/10 active:scale-95"
            >
              <span>Salon Desk: {BRAND_CONFIG.contact.primaryPhone}</span>
            </a>
          </div>

          <p className="text-[10px] text-zinc-500 pt-2 border-t border-white/10">
            1st Floor, Tinpulwa Chowk, Above Killer Showroom, Lalganj, Bihar – 844121
          </p>
        </div>
      </body>
    </html>
  );
}
