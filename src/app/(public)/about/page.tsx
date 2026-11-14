import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils/cn";
import {
  Scissors,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Clock,
  MapPin,
  Check,
  ArrowRight,
  Crown,
  Calendar,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "About Us | The Jawed Habib Salon Lalganj",
  description:
    "Discover the heritage, precision hair geometry, and uncompromising hygiene of The Jawed Habib Salon in Lalganj, Vaishali, Bihar.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  const whyChooseUs = [
    {
      title: "Scientific Haircut Geometry",
      description: "Haircuts designed to complement your unique face shape, head contour, and everyday lifestyle.",
      icon: Scissors,
    },
    {
      title: "Sterile Hygiene Protocols",
      description: "Disposable capes, fresh towels, sanitized scissors, and new razor blades for every single customer.",
      icon: ShieldCheck,
    },
    {
      title: "Authentic Salon Chemistry",
      description: "We use professional hair care formulations from L'Oréal Professionnel and dermatologically tested skin therapies.",
      icon: Sparkles,
    },
    {
      title: "Attentive Consultation",
      description: "Every appointment starts with an unhurried consultation to address your hair concerns and style goals.",
      icon: HeartHandshake,
    },
    {
      title: "Open All 7 Days",
      description: "Full service operations Monday to Sunday from 10:00 AM to 10:00 PM for maximum schedule flexibility.",
      icon: Clock,
    },
    {
      title: "Prime Lalganj Location",
      description: "Conveniently situated at 1st Floor, Tinpulwa Chowk above Killer Showroom with ample parking and accessibility.",
      icon: MapPin,
    },
  ];

  const servicesOverview = [
    {
      title: "Hair Artistry",
      desc: "Precision haircuts, textured blowouts, global color, balayage, keratin smoothing, and hair botox.",
      icon: Scissors,
      href: "/services#hair",
    },
    {
      title: "Restorative Spa & Facials",
      desc: "L'Oréal deep hair spa, 24K gold radiance facials, purifying cleanup, and anti-tan herbal wraps.",
      icon: Sparkles,
      href: "/services#beauty",
    },
    {
      title: "Bridal & Occasion Makeup",
      desc: "HD airbrush bridal packages, pre-bridal glow rituals, engagement glam, and saree draping.",
      icon: Crown,
      href: "/services#makeup",
    },
    {
      title: "Men's Luxury Grooming",
      desc: "Executive fade haircuts, steam razor beard sculpting, charcoal de-tan, and mint head massage.",
      icon: ShieldCheck,
      href: "/services#grooming",
    },
  ];

  return (
    <div className="py-12 bg-salon-black text-salon-ivory">
      <div className="container mx-auto px-4 max-w-6xl space-y-24">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us", href: "/about" }]} />

        {/* 1. PAGE HERO */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold" className="tracking-widest uppercase text-[10px]">
            Salon Heritage & Philosophy
          </Badge>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            The Pinnacle of Hair & Beauty in Lalganj
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Bringing iconic Indian hair styling mastery, restorative hair spa rituals, and royal grooming standards to Tinpulwa Chowk, Lalganj.
          </p>
        </section>

        {/* 2. ABOUT THE SALON */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <SectionHeader
              badge="Our Story"
              title="The Jawed Habib Legacy"
              align="left"
              className="mb-4"
            />
            <p className="text-sm leading-relaxed text-zinc-300 font-light">
              The Jawed Habib name represents decades of revolutionary hair education, styling innovation, and accessible luxury across India. Originating from generational hair artisans who served heads of state, Jawed Habib transformed hairdressing from a routine chore into a respected science and art form.
            </p>
            <p className="text-sm leading-relaxed text-zinc-300 font-light">
              At our Lalganj salon, we uphold these foundational standards. Our mission is straightforward: to provide residents of Lalganj and Vaishali with genuine salon excellence, world-class products, and transparent pricing in an elegant, relaxing environment.
            </p>
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-salon-gold">
                Our Guarantee to Every Lalganj Client:
              </span>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-salon-gold flex-shrink-0" />
                  <span>No rushed cuts — dedicated chair time and consultation for every client</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-salon-gold flex-shrink-0" />
                  <span>Honest advice on hair care, damage repair, and maintenance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-salon-gold flex-shrink-0" />
                  <span>Complete hygiene with individual single-use disposable consumables</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-salon-gold/30 shadow-[0_0_35px_rgba(198,165,107,0.15)]">
            <Image
              src="/images/hero/hero-hair-styling.jpg"
              alt="Hair styling session in action at The Jawed Habib Salon Lalganj"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </section>

        {/* 3. CUSTOMER EXPERIENCE (Ambience & Comfort) */}
        <section className="space-y-12">
          <SectionHeader
            badge="Customer Experience"
            title="Designed For Your Total Relaxation"
            subtitle="Every detail of our Lalganj salon at 1st Floor, Tinpulwa Chowk is built to elevate your beauty experience."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 mb-3">
                <Image
                  src="/images/salon/salon-chairs.jpg"
                  alt="Styling Station"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <h3 className="font-serif text-base font-bold text-white">Ergonomic Styling Stations</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Comfortable hydraulic chairs, vanity-grade daylight illumination, and personalized mirror stations.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 mb-3">
                <Image
                  src="/images/salon/salon-wash-basin.jpg"
                  alt="Hair Spa Wash Beds"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <h3 className="font-serif text-base font-bold text-white">Reclining Hair Spa Loungers</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Neck-supporting wash basins for a truly soothing hair cleansing and deep-conditioning scalp massage.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-3">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-900 mb-3">
                <Image
                  src="/images/salon/salon-reception.jpg"
                  alt="Concierge Desk"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <h3 className="font-serif text-base font-bold text-white">Welcoming Concierge</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Dedicated reception staff to assist with appointments, inquiries, and custom package requests.
              </p>
            </div>
          </div>
        </section>

        {/* 4. OUR SERVICES OVERVIEW */}
        <section className="space-y-12">
          <SectionHeader
            badge="Full Spectrum Care"
            title="Our Services Overview"
            subtitle="From everyday haircut precision to luxury bridal aesthetics, explore our comprehensive salon offerings."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicesOverview.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 flex flex-col justify-between space-y-4 hover:border-salon-gold/40 transition-all"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-salon-gold/15 flex items-center justify-center text-salon-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">{item.desc}</p>
                  </div>
                  <Link href={item.href} className="text-xs font-semibold text-salon-gold hover:underline inline-flex items-center gap-1 pt-2">
                    <span>View Menu Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. WHY CHOOSE US */}
        <section className="space-y-12">
          <SectionHeader
            badge="Core Commitments"
            title="Why Choose The Jawed Habib Salon – Lalganj"
            subtitle="The foundation of trust we build with every client who walks through our doors."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 space-y-3 hover:border-salon-gold/40 transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-salon-gold/15 flex items-center justify-center text-salon-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. GALLERY PREVIEW */}
        <section className="space-y-8 text-center">
          <SectionHeader
            badge="Salon Tour"
            title="Inside Our Lalganj Branch"
            subtitle="Take a look inside our hygienic styling bays, relaxing wash beds, and facial rooms."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["/images/gallery/gallery-1.jpg", "/images/gallery/gallery-2.jpg", "/images/gallery/gallery-3.jpg", "/images/gallery/gallery-4.jpg"].map((src, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <Image
                  src={src}
                  alt={`Salon gallery photo ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/gallery"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
            >
              <span>View Full Salon Gallery</span>
              <ArrowRight className="h-4 w-4 text-salon-gold" />
            </Link>
          </div>
        </section>

        {/* 7. APPOINTMENT CTA */}
        <section className="rounded-2xl border border-salon-gold/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-center space-y-4 shadow-[0_0_40px_rgba(198,165,107,0.1)]">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Experience Our Salon in Lalganj Today
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed font-light">
            Located at 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart. Open Monday to Sunday, 10:00 AM – 10:00 PM.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/booking"
              className={cn(buttonVariants({ variant: "gold", size: "lg" }), "gap-2")}
            >
              <Calendar className="h-4 w-4" />
              <span>Book Your Appointment Online</span>
            </Link>
            <Link
              href="/services"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <span>Explore Full Services Menu</span>
              <ArrowRight className="h-4 w-4 text-salon-gold" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
