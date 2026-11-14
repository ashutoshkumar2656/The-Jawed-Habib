"use client";

import * as React from "react";
import Image from "next/image";
import { MessageCircle, Check, CheckCheck, Phone, Video, MoreVertical, Sparkles } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function BridalConsultationSection() {
  const whatsappUrl = `https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=Hello%20The%20Jawed%20Habib%20Salon%20Lalganj%2C%20I%20would%20like%20to%20consult%20with%20your%20bridal%20specialist%20for%20my%20wedding.`;

  return (
    <section id="consultation" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      {/* Section Header */}
      <div className="max-w-3xl space-y-3 mb-12 text-center mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
          Bridal Consultation
        </p>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          How Your Consultation Works
        </h2>
        <p className="text-sm leading-relaxed text-zinc-300 md:text-base max-w-xl mx-auto">
          Experience a warm, personalized inquiry process. Send your outfit photos, clarify skin concerns, and plan your dream wedding look directly with our master stylists in Lalganj.
        </p>
      </div>

      {/* Realistic Smartphone WhatsApp Device Frame */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[360px] sm:max-w-[390px]">
          {/* Phone Hardware Buttons */}
          <div className="absolute -left-[6px] top-20 h-7 w-[6px] rounded-l-sm bg-zinc-700 shadow-md" />
          <div className="absolute -left-[6px] top-32 h-12 w-[6px] rounded-l-sm bg-zinc-700 shadow-md" />
          <div className="absolute -left-[6px] top-48 h-12 w-[6px] rounded-l-sm bg-zinc-700 shadow-md" />
          <div className="absolute -right-[6px] top-32 h-16 w-[6px] rounded-r-sm bg-zinc-700 shadow-md" />

          {/* Phone Body */}
          <div className="relative w-full overflow-hidden rounded-[44px] border-[10px] border-zinc-900 bg-zinc-950 shadow-[0_25px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-2 left-1/2 z-50 flex h-5 w-24 -translate-x-1/2 items-center justify-between rounded-full bg-black px-2.5 shadow-lg border border-zinc-800">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-zinc-900 ring-1 ring-zinc-700" />
                <div className="h-1.5 w-1.5 rounded-full bg-blue-900" />
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Inner Screen */}
            <div className="relative flex h-[580px] w-full flex-col bg-[#0b141a] font-sans antialiased text-zinc-100 select-none">
              {/* Status Bar */}
              <div className="flex h-10 w-full items-center justify-between px-6 pt-1 text-[11px] font-semibold text-zinc-300">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5G</span>
                  <div className="h-2.5 w-4 rounded-xs border border-zinc-400 p-[1px]">
                    <div className="h-full w-full bg-white" />
                  </div>
                </div>
              </div>

              {/* WhatsApp App Header */}
              <div className="flex items-center justify-between bg-[#1f2c34] px-4 py-2.5 text-white shadow-md z-30">
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-salon-gold/40 bg-black flex items-center justify-center p-1">
                    <Image
                      src="/brand/jawed-habib/logo-icon.svg"
                      alt="Jawed Habib Lalganj"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col justify-center leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                        The Jawed Habib · Lalganj
                      </span>
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-black font-bold">
                        ✓
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">Online · Official Bridal Desk</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-400">
                  <Phone className="h-4 w-4 hover:text-white" />
                  <Video className="h-4 w-4 hover:text-white" />
                  <MoreVertical className="h-4 w-4 hover:text-white" />
                </div>
              </div>

              {/* Chat Canvas / Messages Area */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                {/* Date Chip */}
                <div className="flex justify-center">
                  <span className="rounded-lg bg-[#182229] px-3 py-1 text-[10px] text-zinc-400 font-medium shadow-sm">
                    Today
                  </span>
                </div>

                {/* Message 1 (Customer) */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#005c4b] p-3 text-xs text-white shadow-md space-y-1">
                    <p className="leading-relaxed">
                      Hello! I&apos;m getting married in Lalganj this wedding season. Can I consult with your bridal specialist regarding my look?
                    </p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-zinc-300">
                      <span>10:14 AM</span>
                      <CheckCheck className="h-3 w-3 text-sky-400" />
                    </div>
                  </div>
                </div>

                {/* Message 2 (Salon) */}
                <div className="flex justify-start">
                  <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-[#202c33] p-3 text-xs text-white shadow-md space-y-1">
                    <p className="leading-relaxed">
                      Congratulations! 💍✨ We would love to make you shine. Do you have your lehenga and jewellery pictures ready?
                    </p>
                    <div className="flex items-center justify-end text-[9px] text-zinc-400">
                      <span>10:15 AM</span>
                    </div>
                  </div>
                </div>

                {/* Message 3 (Customer) */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#005c4b] p-3 text-xs text-white shadow-md space-y-1">
                    <p className="leading-relaxed">
                      Yes! It&apos;s a deep crimson raw silk lehenga with antique gold zardozi and kundan jewellery.
                    </p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-zinc-300">
                      <span>10:16 AM</span>
                      <CheckCheck className="h-3 w-3 text-sky-400" />
                    </div>
                  </div>
                </div>

                {/* Message 4 (Salon) */}
                <div className="flex justify-start">
                  <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-[#202c33] p-3 text-xs text-white shadow-md space-y-1">
                    <p className="leading-relaxed">
                      Stunning choice! For crimson raw silk, our <span className="text-salon-gold font-semibold">Signature HD Bridal Suite</span> with Charlotte Tilbury base, soft champagne eyes, and a fresh floral bun will be breathtaking.
                    </p>
                    <div className="flex items-center justify-end text-[9px] text-zinc-400">
                      <span>10:17 AM</span>
                    </div>
                  </div>
                </div>

                {/* Message 5 (Salon) */}
                <div className="flex justify-start">
                  <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-[#202c33] p-3 text-xs text-white shadow-md space-y-1">
                    <p className="leading-relaxed">
                      You can lock in your wedding date with an online advance of ₹2,000, and our master artist will reserve our private bridal dressing room for you! 🌟
                    </p>
                    <div className="flex items-center justify-end text-[9px] text-zinc-400">
                      <span>10:18 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fake WhatsApp Input Footer */}
              <div className="flex items-center gap-2 bg-[#1f2c34] px-3 py-2 text-zinc-400">
                <div className="flex-1 rounded-full bg-[#2a3942] px-4 py-1.5 text-xs text-zinc-400">
                  Type a message...
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00a884] text-black">
                  <MessageCircle className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Below Phone */}
        <div className="mt-8 text-center space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "gold", size: "lg" }),
              "gap-2.5 font-bold shadow-[0_0_25px_rgba(198,165,107,0.3)] px-8 inline-flex"
            )}
          >
            <MessageCircle className="h-5 w-5 text-emerald-950" />
            <span>Start WhatsApp Chat</span>
          </a>
          <p className="text-[11px] text-zinc-500">
            *Illustrative consultation preview. Click above to message our Lalganj bridal team directly.
          </p>
        </div>
      </div>
    </section>
  );
}
