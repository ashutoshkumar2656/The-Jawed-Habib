"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import {
  Scissors,
  Sparkles,
  Calendar,
  Star,
  CheckCircle2,
  Phone,
  UserCheck,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

interface DynamicStaffMember {
  id: string;
  name: string;
  designation: string;
  bio?: string | null;
  experienceYears?: number | null;
  specialties?: string[];
  rating?: number | null;
  avatarUrl?: string | null;
  user?: {
    name: string;
    avatarUrl?: string | null;
  };
}

export default function TeamPage() {
  const [staffList, setStaffList] = React.useState<DynamicStaffMember[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchStaff() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/staff");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setStaffList(json.data);
        }
      } catch (err) {
        console.error("Failed to load staff members:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchStaff();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Our Stylists" }]} />

        {/* 1. Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Artisans of Beauty</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Meet Our Master Team
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Every professional at The Jawed Habib Salon Lalganj undergoes rigorous training in hygienic protocols, client consultation, and modern styling techniques.
          </p>
        </div>

        {/* 2. Stylists Profile Grid or Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-zinc-950 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : staffList.length === 0 ? (
          <div className="text-center py-16 luxury-card rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 space-y-4 max-w-lg mx-auto">
            <div className="h-16 w-16 mx-auto rounded-full bg-salon-gold/10 border border-salon-gold/30 flex items-center justify-center">
              <Scissors className="h-8 w-8 text-salon-gold" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">Stylist Roster Synchronizing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our master styling team roster is currently being synchronized with daily floor schedules.
              Appointments and walk-ins are fully open and serviced by our certified Jawed Habib master artists.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="gold" size="sm" asChild>
                <Link href="/booking">Book Your Visit</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="border-zinc-700 text-zinc-300 hover:text-white">
                <a href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}>Call Reception ({BRAND_CONFIG.contact.primaryPhone})</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {staffList.map((stylist) => {
              const displayName = stylist.user?.name || stylist.name || "Master Stylist";
              const photoUrl = stylist.avatarUrl || stylist.user?.avatarUrl || "/images/staff/stylist-2.jpg";
              const specList = stylist.specialties || ["Precision Cuts", "Hair Styling", "Personal Consultation"];

              return (
                <div
                  key={stylist.id}
                  className="luxury-card rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-salon-gold/50 transition-all duration-300"
                >
                  <div className="space-y-6">
                    {/* Header: Photo + Info */}
                    <div className="flex items-start space-x-5">
                      <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-salon-gold/40 flex-shrink-0 shadow-lg">
                        <Image
                          src={photoUrl}
                          alt={displayName}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 fill-salon-gold text-salon-gold" />
                          <span className="text-xs font-semibold text-salon-gold">
                            {stylist.rating ? `${stylist.rating} / 5.0` : "Master Certified"}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                          {displayName}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-zinc-400">
                          {stylist.designation || "Senior Hair Stylist"}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {stylist.bio && (
                      <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                        {stylist.bio}
                      </p>
                    )}

                    {/* Specialties */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-salon-gold/90 block">
                        Core Expertise
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {specList.map((spec, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-zinc-900 flex items-center justify-between gap-4">
                    <Button variant="gold" size="sm" asChild className="w-full text-xs">
                      <Link href={`/booking?stylist=${stylist.id}`}>
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        Book With {displayName.split(" ")[0]}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Salon Excellence Guarantee */}
        <div className="rounded-2xl border border-salon-gold/30 bg-gradient-to-r from-zinc-950 via-salon-black to-zinc-950 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="font-serif text-lg sm:text-xl font-bold text-white">
              Looking for a tailored hair or bridal consultation?
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-light">
              Visit our 1st Floor salon at Tinpulwa Chowk, Lalganj. Our team conducts 1-on-1 face-shape analyses and scalp evaluations before every service.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="gold" size="sm" asChild className="text-xs">
              <Link href="/booking">Reserve Appointment</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="text-xs border-zinc-800 text-zinc-300">
              <a href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}>
                <Phone className="h-3.5 w-3.5 mr-1.5 text-salon-gold" />
                Contact Desk
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
