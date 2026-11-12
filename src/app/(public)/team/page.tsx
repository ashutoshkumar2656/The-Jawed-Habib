import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import {
  Scissors,
  Sparkles,
  Calendar,
  AlertCircle,
  Star,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

export const metadata = {
  title: "Our Master Stylists & Team | The Jawed Habib Salon Lalganj",
  description:
    "Meet the certified hair artists, colorists, and beauty therapists at The Jawed Habib Salon in Lalganj, Bihar.",
};

interface StylistProfile {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  specialties: string[];
  servicesOffered: string[];
}

const stylists: StylistProfile[] = [
  {
    id: "ravi-kumar",
    name: "Ravi Kumar",
    role: "Master Haircut & Texture Specialist",
    image: "/images/staff/stylist-2.jpg",
    bio: "Certified in iconic Jawed Habib hair cutting geometry. Passionate about designing precision silhouettes that flatter facial contours and maintain volume.",
    specialties: ["Precision Men's & Women's Cuts", "Face-Shape Geometry", "Texture Feathering"],
    servicesOffered: ["Signature Haircut", "Hair Wash & Blowdry", "Texture Styling"],
  },
  {
    id: "sunita-devi",
    name: "Sunita Devi",
    role: "Senior Skin & Spa Specialist",
    image: "/images/staff/stylist-3.jpg",
    bio: "Dedicated aesthetician focusing on restorative hair spa therapy and dermatological facial treatments. Specializes in luminous gold skin rituals.",
    specialties: ["24K Gold Facials", "L'Oréal Hair Spa Therapy", "Skin Brightening D-Tan"],
    servicesOffered: ["Gold Radiance Facial", "L'Oréal Hair Spa", "Express Cleanup"],
  },
  {
    id: "neha-sharma",
    name: "Neha Sharma",
    role: "Master Colorist & Bridal Makeup Artist",
    image: "/images/staff/stylist-1.jpg",
    bio: "Specializes in ammonia-free multidimensional color blends, balayage, and traditional Indian bridal airbrush artistry.",
    specialties: ["Balayage & Highlights", "Global Hair Colour", "HD Bridal & Party Makeup"],
    servicesOffered: ["Global Hair Colour", "Bridal Makeup", "Party Makeup"],
  },
  {
    id: "mohit-jha",
    name: "Mohit Jha",
    role: "Beard Architect & Men's Grooming Specialist",
    image: "/images/staff/stylist-4.jpg",
    bio: "Expert in luxury barbershop traditions, royal hot towel therapy, and razor-sharp beard alignment tailored to modern executive styles.",
    specialties: ["Hot Towel Shave", "Beard Sculpting & Contouring", "Executive Grooming"],
    servicesOffered: ["Royal Beard Sculpting", "Executive Grooming Combo", "Head Massage"],
  },
];

export default function TeamPage() {
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

        {/* Sample Profile Disclaimer Notice */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-start gap-3.5 text-xs text-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Representative Team Roster:</span>
            <p className="text-zinc-300 leading-relaxed">
              These profiles showcase the roles and technical specialties available at our Lalganj salon. Specific on-duty stylist rosters are managed dynamically at the front desk based on daily shift schedules.
            </p>
          </div>
        </div>

        {/* 2. Stylists Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stylists.map((stylist) => (
            <div
              key={stylist.id}
              className="luxury-card rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-salon-gold/50 transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Header: Photo + Info */}
                <div className="flex items-start space-x-5">
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 border-salon-gold/40 flex-shrink-0 shadow-lg">
                    <Image
                      src={stylist.image}
                      alt={stylist.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      {stylist.name}
                    </h3>
                    <p className="text-xs font-semibold text-salon-gold">
                      {stylist.role}
                    </p>
                    <span className="inline-block text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full">
                      Jawed Habib Certified
                    </span>
                  </div>
                </div>

                {/* Biography */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                  {stylist.bio}
                </p>

                {/* Specialties */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-salon-gold">
                    Specialized Expertise:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {stylist.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Services list */}
                <div className="space-y-1.5 text-xs text-zinc-400">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                    Key Treatments:
                  </span>
                  <p className="text-zinc-300 font-medium">
                    {stylist.servicesOffered.join(" • ")}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-zinc-800">
                <Link href={`/booking?stylist=${stylist.id}`}>
                  <Button variant="gold" className="w-full gap-2 text-xs">
                    <Calendar className="h-4 w-4" />
                    <span>Book with {stylist.name}</span>
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Direct Contact Bar */}
        <div className="rounded-3xl border border-salon-gold/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-center space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Have a Specific Stylist Preference?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
            Call our desk directly at <span className="text-salon-gold font-bold">+91 {BRAND_CONFIG.contact.primaryPhone}</span> to confirm the on-duty schedule of your preferred artist.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href="/booking">
              <Button variant="gold" size="lg">
                Schedule Appointment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
