"use client";

import * as React from "react";
import { MessageCircle, Phone, Calendar, X, HelpCircle } from "lucide-react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { cn } from "@/lib/utils/cn";

export function FloatingContact() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-4 sm:left-6 z-40 flex flex-col items-start space-y-3">
      {/* Expanded Menu */}
      {isOpen && (
        <div className="rounded-2xl border border-salon-gold/40 bg-zinc-950/95 p-4 shadow-[0_0_30px_rgba(198,165,107,0.3)] backdrop-blur-xl space-y-3 animate-in slide-in-from-bottom-4 duration-200 min-w-[240px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-salon-gold font-bold">
              Salon Concierge
            </span>
            <span className="text-[10px] text-zinc-400">10 AM – 10 PM</span>
          </div>

          <a
            href={`https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=Hello%20The%20Jawed%20Habib%20Salon%20Lalganj%2C%20I%20would%20like%20to%20inquire%20about%20booking%20an%20appointment.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-600/40 hover:bg-emerald-900/60 transition-colors text-emerald-300 text-xs font-semibold"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <div className="flex flex-col">
              <span>Chat on WhatsApp</span>
              <span className="text-[10px] font-normal text-emerald-400/80">
                +91 {BRAND_CONFIG.contact.primaryPhone}
              </span>
            </div>
          </a>

          <a
            href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}
            className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-salon-gold/50 transition-colors text-white text-xs font-semibold"
          >
            <Phone className="h-4 w-4 text-salon-gold flex-shrink-0" />
            <div className="flex flex-col">
              <span>Call Primary Desk</span>
              <span className="text-[10px] font-normal text-zinc-400">
                +91 {BRAND_CONFIG.contact.primaryPhone}
              </span>
            </div>
          </a>

          <Link
            href="/booking"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 p-2.5 rounded-xl bg-salon-gold/15 border border-salon-gold/40 hover:bg-salon-gold/25 transition-colors text-salon-goldLight text-xs font-semibold"
          >
            <Calendar className="h-4 w-4 text-salon-gold flex-shrink-0" />
            <span>Book Seat Online</span>
          </Link>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border border-salon-gold/60 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-black text-salon-gold shadow-[0_0_20px_rgba(198,165,107,0.35)] hover:scale-105 active:scale-95 transition-all duration-300",
          isOpen && "rotate-90 bg-salon-gold text-black border-white"
        )}
        aria-label="Salon Concierge & WhatsApp Assistance"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}
