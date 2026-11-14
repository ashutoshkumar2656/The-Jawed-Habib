"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Crown,
  Calendar,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Heart,
  ChevronRight,
  UserCheck,
  ExternalLink,
  MessageSquare,
  Maximize2,
  Tag,
  Star,
  Play,
  MessageCircle,
  Award,
  Layers,
  Sparkle,
  Send,
  HelpCircle,
  Building,
  Check,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { SectionHeader } from "@/components/shared/section-header";
import type { TransformationItem } from "@/components/shared/before-after-slider";
import type { GalleryPhoto } from "@/components/shared/lightbox-modal";
import type { VideoItem } from "@/components/shared/video-modal";
import { HeroVideoSection } from "@/components/public/hero-video-section";
import { BridalBookingExperience } from "@/components/public/bridal-booking-experience";
import { BridalConsultationSection } from "@/components/public/bridal-consultation-section";
import { BridalPortfolioSection } from "@/components/public/bridal-portfolio-section";
import { BeyondBridalSection } from "@/components/public/beyond-bridal-section";
import { BrandMarquee } from "@/components/public/brand-marquee";
import { AccordionItem } from "@/components/ui/accordion";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

// Dynamic imports for heavy below-the-fold & modal components to reduce initial bundle
const BeforeAfterSlider = dynamic(
  () => import("@/components/shared/before-after-slider").then((m) => m.BeforeAfterSlider),
  {
    loading: () => <div className="h-96 w-full animate-pulse rounded-2xl bg-zinc-900/40" />,
    ssr: true,
  }
);

const LightboxModal = dynamic(
  () => import("@/components/shared/lightbox-modal").then((m) => m.LightboxModal),
  { ssr: false }
);

const VideoModal = dynamic(
  () => import("@/components/shared/video-modal").then((m) => m.VideoModal),
  { ssr: false }
);

export default function HomePage() {
  const { toast } = useToast();
  const [cms, setCms] = React.useState<Record<string, string>>({});
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = React.useState<boolean>(true);
  const [transformations, setTransformations] = React.useState<any[]>([]);
  const [loadingTransformations, setLoadingTransformations] = React.useState<boolean>(true);

  React.useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) setCms(j.data);
      })
      .catch(() => {});

    fetch("/api/reviews")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setReviews(j.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));

    fetch("/api/transformations")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setTransformations(j.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTransformations(false));
  }, []);

  // Gallery Lightbox state
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  // Video modal state
  const [activeVideo, setActiveVideo] = React.useState<VideoItem | null>(null);

  // Transformation slide state
  const [selectedTransCategory, setSelectedTransCategory] = React.useState<string>("ALL");
  const [currentTransIndex, setCurrentTransIndex] = React.useState<number>(0);

  // FAQ accordion open index
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  // Quick enquiry form state
  const [enquiryName, setEnquiryName] = React.useState<string>("");
  const [enquiryPhone, setEnquiryPhone] = React.useState<string>("");
  const [enquiryService, setEnquiryService] = React.useState<string>("Bridal & Engagement Makeup");
  const [enquiryMessage, setEnquiryMessage] = React.useState<string>("");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = React.useState<boolean>(false);
  const [enquirySuccess, setEnquirySuccess] = React.useState<boolean>(false);

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle Quick Contact Enquiry
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = enquiryPhone.replace(/\D/g, "");

    if (!enquiryName || enquiryName.length < 2) {
      toast({
        type: "error",
        title: "Name Required",
        message: "Please enter your full name (minimum 2 characters).",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast({
        type: "error",
        title: "Valid Phone Required",
        message: "Please enter a valid 10-digit Indian phone number.",
      });
      return;
    }

    if (!enquiryMessage || enquiryMessage.length < 10) {
      toast({
        type: "error",
        title: "Message Too Short",
        message: "Please provide a brief inquiry message (minimum 10 characters).",
      });
      return;
    }

    setIsSubmittingEnquiry(true);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: enquiryName.trim(),
          phone: cleanPhone,
          service: enquiryService,
          message: enquiryMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEnquirySuccess(true);
        toast({
          type: "success",
          title: "Inquiry Sent Successfully",
          message: "Our Lalganj salon desk will contact you shortly.",
        });
      } else {
        throw new Error(data.error || "Failed to submit enquiry.");
      }
    } catch (err: any) {
      toast({
        type: "error",
        title: "Submission Failed",
        message: err.message || "Could not connect to salon server. Please try calling or WhatsApp.",
      });
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // Section 11: Transformation Videos
  const salonVideos: VideoItem[] = [
    {
      id: "vid_1",
      title: "Royal HD Bridal Glow & Reception Transformation",
      description: "Watch our senior bridal artist craft an immaculate long-wear bridal look with Charlotte Tilbury base & traditional drape.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "/images/makeup/makeup-bridal-1.jpg",
      category: "Bridal Transformation",
    },
    {
      id: "vid_2",
      title: "Precision Scissor Fade & Beard Architecture",
      description: "Master barbering in action: zero-gap scissor taper, hot-towel steam therapy, and razor-sharp jawline contouring.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "/images/haircuts/haircut-men-1.jpg",
      category: "Men's Styling",
    },
    {
      id: "vid_3",
      title: "Caramel Honey Balayage & Glaze Workflow",
      description: "From dull single-tone to multi-dimensional sun-kissed blonde ribbons using L'Oréal ammonia-free lightening.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "/images/haircuts/haircut-women-1.jpg",
      category: "Hair Colour",
    },
    {
      id: "vid_4",
      title: "Studio Walkthrough: The Jawed Habib Salon Lalganj",
      description: "Take a tour of our modern styling stations, wash lounges, private bridal suite, and hygiene facilities at Tinpulwa Chowk.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnailUrl: "/images/salon/salon-interior.jpg",
      category: "Salon Ambience",
    },
  ];

  // Section 12: Premium Products & Verified Brands
  const verifiedBrands = [
    {
      name: "Charlotte Tilbury",
      category: "Luxury Cosmetics & Airbrush",
      description: "Airbrush Flawless Finish and Hollywood Glow formulations for radiant, camera-ready bridal skin.",
      badge: "Red Carpet Luxury",
      icon: "Crown",
    },
    {
      name: "MAC Cosmetics",
      category: "Bridal & HD Studio Fix",
      description: "Studio Fix foundations, high-pigment eyeshadows, and 16-hour sweat-tested bridal lip colors.",
      badge: "HD Bridal Grade",
      icon: "Award",
    },
    {
      name: "L'Oréal Professionnel",
      category: "Parisian Hair Care & Spas",
      description: "Parisian salon rituals, fiber repair masques, and ammonia-free global colors for lustrous shine.",
      badge: "Official Salon Partner",
      icon: "Sparkles",
    },
    {
      name: "Kryolan Professional",
      category: "Occasion Base Artistry",
      description: "Dermatologically proven high-coverage pigments for heat-resistant, smudge-proof wedding wear.",
      badge: "Pro Artistry",
      icon: "ShieldCheck",
    },
    {
      name: "Kérastase Paris",
      category: "Scalp Nutrition & Serums",
      description: "Ultra-luxury concentrated serums, thermal hair shields, and intensive anti-frizz defense.",
      badge: "Luxury Hair Therapy",
      icon: "Sparkle",
    },
    {
      name: "Schwarzkopf Professional",
      category: "Keratin & Permanent Straightening",
      description: "German high-performance keratin smoothening and vibrancy color-lock formulas.",
      badge: "German Precision",
      icon: "Layers",
    },
  ];

  // Section 16: Salon Interior & Environment Photographs
  const studioPhotos: GalleryPhoto[] = [
    {
      id: "sp1",
      src: "/images/salon/interior/jh-lalganj-salon-interior-main.jpg",
      title: "Main Styling Floor & Styling Stations",
      category: "Studio Interior",
      caption: "Generous 1st floor layout with polished marble flooring, designer chandeliers, and hydraulic styling chairs.",
    },
    {
      id: "sp2",
      src: "/images/salon/interior/jh-lalganj-triple-styling-stations.jpg",
      title: "Triple Circular Halo Styling Stations",
      category: "Styling Stations",
      caption: "Signature trio of circular backlit LED vanity mirrors with gold halo glow and teal hydraulic chairs.",
    },
    {
      id: "sp3",
      src: "/images/salon/interior/jh-lalganj-bridal-makeup-room.jpg",
      title: "VIP Private Bridal Dressing Suite",
      category: "Bridal Suite",
      caption: "Private air-conditioned suite with Hollywood bulb vanity mirrors, reclining styling chairs, and bridal wardrobe space.",
    },
    {
      id: "sp4",
      src: "/images/salon/interior/jh-lalganj-reception-desk.jpg",
      title: "Curved Reception Desk & Glowing JH Logo",
      category: "Reception Desk",
      caption: "Modern curved reception counter with warm LED underlighting and glowing 3D red Jawed Habib monogram arch.",
    },
    {
      id: "sp5",
      src: "/images/salon/interior/jh-lalganj-pedicure-spa-throne.jpg",
      title: "Luxury Pedicure & Foot Spa Massage Throne",
      category: "Spa Thrones",
      caption: "Plush leather massage chair with integrated whirlpool foot tub and arched vanity mirror.",
    },
    {
      id: "sp6",
      src: "/images/salon/services/jh-lalganj-hydrafacial-machine.jpg",
      title: "Advanced HydraFacial Clinical System",
      category: "Aesthetics",
      caption: "Clinical hydro-dermabrasion and deep skin rejuvenation instrument with 4 active serum infusions.",
    },
  ];

  // Section 18: Frequently Asked Questions
  const salonFaqs = [
    {
      q: "How far in advance should I book my bridal appointment?",
      a: "We recommend reserving your wedding date at least 2 to 6 weeks in advance. We strictly accept a limited number of brides per day to ensure complete privacy in our bridal suite and dedicated master artist attention.",
    },
    {
      q: "Is the online advance booking deposit refundable?",
      a: "Advance deposits lock in your wedding date exclusively. If your wedding schedule changes, you can reschedule your date with zero penalty up to 48 hours prior to your booked slot.",
    },
    {
      q: "Do you provide trial bridal makeup sessions?",
      a: "Yes! We offer pre-bridal consultation and customized trial sessions where we test foundation shades against your skin undertone, trial eye looks, and discuss outfit draping.",
    },
    {
      q: "How do I pay the remaining balance of my package?",
      a: "After paying the advance deposit online through Razorpay, the remaining balance is paid directly at our salon reception on the day of your appointment via UPI, Card, or Cash.",
    },
    {
      q: "Do you have a private bridal room with dressing facilities?",
      a: "Yes! Our Lalganj studio on 1st Floor Tinpulwa Chowk features a private, air-conditioned VIP bridal suite with twin Hollywood-lit vanity mirrors, comfortable seating, and dedicated lehenga/saree draping space.",
    },
    {
      q: "What brands of cosmetics and hair products do you use?",
      a: "We exclusively use 100% genuine, sealed products from Charlotte Tilbury, MAC Cosmetics, Kryolan Professional, L'Oréal Professionnel, Kérastase Paris, and Schwarzkopf. We never use duplicate or unbranded salon chemicals.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-salon-black text-salon-ivory selection:bg-salon-gold selection:text-black">
      {/* ============================================================== */}
      {/* SECTION 02: CINEMATIC HERO SECTION                             */}
      {/* ============================================================== */}
      <HeroVideoSection
        onBookClick={() => scrollToSection("availability")}
        onExploreClick={() => scrollToSection("packages")}
        headline={cms.hero_headline || "Be the bride everyone can't stop looking at."}
        badgeText={cms.hero_eyebrow || "HIGH DEMAND • 2026/2027 WEDDING SEASON RESERVATIONS OPEN"}
        subtitle={cms.hero_subtitle || "Flawless HD bridal artistry, floral hair architecture, and couture styling exclusively at The Jawed Habib Salon – Lalganj."}
        videoUrl={cms.hero_video_url}
        posterUrl={cms.hero_poster_image}
        primaryCtaText={cms.hero_primary_cta}
        secondaryCtaText={cms.hero_secondary_cta}
      />

      {/* ============================================================== */}
      {/* SECTIONS 03 TO 08: COMPLETE BRIDAL BOOKING EXPERIENCE           */}
      {/* 03: Wedding Season Highlight Banner                            */}
      {/* 04: Wedding Date Calendar & Appointment Availability           */}
      {/* 05: Customer Booking Details Form                              */}
      {/* 06: Curated Bridal Services & Package Catalogue                */}
      {/* 07: Advance Deposit Selection (₹1,000 - ₹2,500)                */}
      {/* 08: Final Booking Summary & Razorpay Standard Checkout        */}
      {/* ============================================================== */}
      <div id="bridal-experience" className="scroll-mt-28">
        <React.Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-zinc-900/40" />}>
          <BridalBookingExperience />
        </React.Suspense>
      </div>

      {/* ============================================================== */}
      {/* SECTION 09: BRIDAL CONSULTATION (WhatsApp Mockup)              */}
      {/* ============================================================== */}
      <BridalConsultationSection />

      {/* ============================================================== */}
      {/* SECTION 10: BRIDAL PHOTO PORTFOLIO (Editorial Plates)          */}
      {/* ============================================================== */}
      <BridalPortfolioSection />

      {/* ============================================================== */}
      {/* SECTION 11: BRIDAL TRANSFORMATION VIDEOS                       */}
      {/* ============================================================== */}
      <section id="bridal-videos" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 border-t border-white/10">
        <div className="max-w-3xl space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            Cinema & Motion
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Before the vows, the transformation.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
            Watch the high-definition craftsmanship behind our signature bridal transformations and styling artistry at Lalganj.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {salonVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setActiveVideo(vid)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition-all duration-300 hover:border-salon-gold hover:shadow-[0_0_30px_rgba(198,165,107,0.2)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                {vid.thumbnailUrl && (
                  <Image
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover brightness-75 transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-salon-gold/80 bg-black/70 text-salon-gold shadow-[0_0_20px_rgba(198,165,107,0.4)] transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-2.5 left-2.5">
                  <Badge variant="gold" className="text-[9px] uppercase tracking-wider">
                    {vid.category}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-serif text-sm font-semibold text-white line-clamp-1 group-hover:text-salon-goldLight transition-colors">
                  {vid.title}
                </h4>
                <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2">
                  {vid.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 12: PREMIUM PRODUCTS AND BRANDS                        */}
      {/* ============================================================== */}
      <section id="products" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 border-t border-white/10">
        <div className="max-w-3xl space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            Excellence in Products
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Brands we trust for your big day.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
            We exclusively partner with certified luxury global brands for uncompromised client safety, high-definition radiance, and hair health.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedBrands.map((brand, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/80 to-black p-6 transition-all duration-300 hover:border-salon-gold/60 hover:shadow-[0_0_25px_rgba(198,165,107,0.15)]"
            >
              <div className="flex items-center justify-between">
                <Badge variant="gold" className="text-[9px] uppercase tracking-wider font-semibold">
                  {brand.badge}
                </Badge>
                <Sparkles className="h-4 w-4 text-salon-gold/60 group-hover:text-salon-gold transition-colors" />
              </div>

              <h3 className="mt-4 font-serif text-xl font-bold text-white group-hover:text-salon-goldLight transition-colors">
                {brand.name}
              </h3>
              <span className="text-xs uppercase tracking-wider text-salon-gold block mt-0.5">
                {brand.category}
              </span>

              <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                {brand.description}
              </p>
            </div>
          ))}
        </div>

        {/* Sealed Genuine Guarantee */}
        <div className="mt-12 rounded-2xl border border-salon-gold/30 bg-salon-gold/5 p-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-zinc-300">
            <span className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-salon-gold" />
              100% Genuine Sealed Products
            </span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span>Zero Duplicate Chemicals</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span>Hypoallergenic Formulations for Sensitive Skin</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span>Direct Manufacturer Supply</span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 13: BEFORE & AFTER TRANSFORMATION                      */}
      {/* ============================================================== */}
      <section id="transformations" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 border-t border-white/10">
        <div className="max-w-3xl space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            Real Results
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Before, and after.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
            Drag the interactive slider to see genuine transformations created by our senior stylists in Lalganj.
          </p>
        </div>

        {/* Interactive Slider */}
        {loadingTransformations ? (
          <div className="mx-auto max-w-4xl h-96 animate-pulse rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-center">
            <span className="text-xs text-zinc-500">Loading makeover showcases...</span>
          </div>
        ) : transformations.length > 0 ? (
          <div className="mx-auto max-w-4xl">
            <BeforeAfterSlider
              item={transformations[currentTransIndex % transformations.length]}
              onPrev={() => setCurrentTransIndex((prev) => (prev - 1 + transformations.length) % transformations.length)}
              onNext={() => setCurrentTransIndex((prev) => (prev + 1) % transformations.length)}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 p-8 text-center text-zinc-500 text-xs">
            <Sparkles className="h-8 w-8 text-salon-gold/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-white mb-1">Makeover Showcases Coming Soon</p>
            <p className="text-zinc-500">Our senior stylists are documenting real client before & after results at our Lalganj salon.</p>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* SECTION 14: CUSTOMER REVIEWS                                   */}
      {/* ============================================================== */}
      <section id="reviews" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 border-t border-white/10">
        <div className="max-w-3xl space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            Verified Feedback
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Trusted by brides everywhere.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
            Genuine ratings and reviews from brides and clients in Lalganj, Vaishali, and Bihar.
          </p>
        </div>

        {/* Rating Score Card */}
        <div className="mb-10 rounded-3xl border border-white/10 bg-salon-cardBlack p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-5 text-center md:text-left space-y-2">
              <span className="text-xs uppercase tracking-wider text-zinc-400">Overall Google Rating</span>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="font-serif text-5xl font-bold text-salon-gold">4.9</span>
                <span className="text-zinc-500 text-sm">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-salon-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-zinc-400 pt-1">
                Based on 350+ authentic client experiences at 1st Floor Tinpulwa Chowk.
              </p>
            </div>

            <div className="md:col-span-7 space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-12 text-zinc-400">5 star</span>
                <div className="h-2 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-salon-gold rounded-full w-[92%]" />
                </div>
                <span className="w-8 text-right text-zinc-400">92%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-zinc-400">4 star</span>
                <div className="h-2 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-salon-gold rounded-full w-[7%]" />
                </div>
                <span className="w-8 text-right text-zinc-400">7%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-zinc-400">3 star</span>
                <div className="h-2 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-salon-gold rounded-full w-[1%]" />
                </div>
                <span className="w-8 text-right text-zinc-400">1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {loadingReviews ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 rounded-2xl border border-white/5 bg-zinc-950/40 animate-pulse p-6">
                <div className="h-4 w-24 bg-zinc-800 rounded mb-4" />
                <div className="h-3 w-full bg-zinc-800/60 rounded mb-2" />
                <div className="h-3 w-3/4 bg-zinc-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((rev, idx) => {
              const reviewerName = rev.customerName || rev.customerProfile?.user?.name || "Verified Client";
              const reviewDate = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                : "Verified Visit";
              const reviewLocation = rev.source === "GOOGLE_MAPS" ? "Google Maps Verified" : "Lalganj, Vaishali";
              const reviewService = rev.category || rev.title || "Salon Service";

              return (
                <div
                  key={rev.id || idx}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-950 p-6 transition-all duration-300 hover:border-salon-gold/40"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex text-salon-gold">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[11px] text-zinc-500">{reviewDate}</span>
                    </div>

                    <p className="text-xs leading-relaxed text-zinc-300 italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="font-serif text-sm font-bold text-white">{reviewerName}</p>
                    <span className="text-[10px] text-zinc-500 block">{reviewLocation}</span>
                    <span className="text-[11px] text-salon-gold font-medium block mt-0.5">
                      {reviewService}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-950/60 p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-salon-gold/10 text-salon-gold mx-auto">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white">Be The First To Share Your Experience</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Have you visited our Lalganj salon at 1st Floor Tinpulwa Chowk? We invite you to share your feedback. Genuine verified reviews appear here once verified by our team.
            </p>
            <div className="pt-2">
              <a
                href={BRAND_CONFIG.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-salon-gold/40 bg-salon-gold/10 px-5 py-2.5 text-xs font-semibold text-salon-gold hover:bg-salon-gold hover:text-black transition-colors"
              >
                <span>Review on Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* SECTION 15: HAIR & BEAUTY SHOWCASE (Beyond Bridal)             */}
      {/* ============================================================== */}
      <div id="services" className="scroll-mt-28">
        <BeyondBridalSection />
      </div>

      {/* ============================================================== */}
      {/* SECTION 16: SALON EXPERIENCE / INTERIOR GALLERY                */}
      {/* ============================================================== */}
      <section id="location" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 border-t border-white/10 scroll-mt-28">
        <div className="max-w-3xl space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            The Studio
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            A beautiful and calming space designed for your ultimate comfort.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
            Step into 1st Floor Tinpulwa Chowk — luxury styling stations, private VIP bridal room, and relaxing wash lounges.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studioPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(idx)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition-all duration-300 hover:border-salon-gold"
            >
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-zinc-900">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-salon-gold backdrop-blur-sm border border-salon-gold/30">
                  {photo.category}
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-serif text-sm font-semibold text-white group-hover:text-salon-goldLight transition-colors">
                  {photo.title}
                </h4>
                <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                  {photo.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 17: PREMIUM BRAND MARQUEE                              */}
      {/* ============================================================== */}
      <BrandMarquee />

      {/* ============================================================== */}
      {/* SECTION 18: HOW IT WORKS                                       */}
      {/* ============================================================== */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 border-t border-white/10">
        <div className="max-w-3xl space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            Our Process
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            A calm, considered process.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
            Your effortless journey from reservation to your dream wedding radiance at The Jawed Habib Salon, Lalganj.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Consultation",
              desc: "Connect directly on WhatsApp or visit our studio. Share your wedding dates, lehenga palette, and vision.",
            },
            {
              step: "02",
              title: "Choose Package",
              desc: "Select from our curated HD Bridal, Ultra HD Airbrush, or Pre-Bridal Radiance suites tailored to your skin tone.",
            },
            {
              step: "03",
              title: "Booking Deposit",
              desc: "Lock in your wedding date with an advance deposit through Razorpay. Receive your unique Booking ID instantly.",
            },
            {
              step: "04",
              title: "The Big Day",
              desc: "Arrive at our private VIP bridal suite on 1st Floor Tinpulwa Chowk and experience royal, stress-free pampering.",
            },
          ].map((st) => (
            <div
              key={st.step}
              className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between"
            >
              <div>
                <span className="font-serif text-4xl font-bold text-salon-gold">
                  {st.step}
                </span>
                <h3 className="mt-4 font-serif text-xl font-bold text-white">
                  {st.title}
                </h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 19: FREQUENTLY ASKED QUESTIONS                         */}
      {/* ============================================================== */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 border-t border-white/10">
        <div className="max-w-3xl space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            FAQ
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Frequently Asked Questions.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
            Everything you need to know before securing your bridal date and package deposit.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {salonFaqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              title={faq.q}
              isOpen={openFaqIndex === idx}
              onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
            >
              <p className="leading-relaxed text-zinc-300">
                {faq.a}
              </p>
            </AccordionItem>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 20: VISIT THE STUDIO & LOCATION                        */}
      {/* ============================================================== */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 border-t border-white/10">
        <div className="max-w-3xl space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            Visit Lalganj Studio
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Find the studio.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
            Conveniently situated on 1st Floor, Tinpulwa Chowk, Lalganj, Bihar with dedicated support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Business Details Card */}
          <div className="lg:col-span-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-salon-gold block">
                Official Business Details
              </span>
              <h3 className="font-serif text-2xl font-bold text-white mt-1">
                The Jawed Habib Salon – Lalganj
              </h3>
              <p className="text-xs text-zinc-400">Premier Hair, Beauty & Bridal Studio • Vaishali District</p>
            </div>

            {/* Reception Photo */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <Image
                src="/images/salon/interior/jh-lalganj-reception-desk.jpg"
                alt="The Jawed Habib Salon Lalganj Reception Desk"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 text-[10px] uppercase font-bold tracking-wider text-salon-gold bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-salon-gold/30">
                1st Floor, Tinpulwa Chowk • Lalganj
              </span>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="h-5 w-5 text-salon-gold flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold uppercase text-zinc-400 block">Exact Address</span>
                <address className="not-italic leading-relaxed text-zinc-200 text-xs">
                  {BRAND_CONFIG.location.fullAddress}
                </address>
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="flex items-start space-x-3 text-sm">
              <Phone className="h-5 w-5 text-salon-gold flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold uppercase text-zinc-400 block">Phone Numbers</span>
                <div className="flex flex-col space-y-1 text-xs font-semibold text-white">
                  <a href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`} className="hover:text-salon-gold transition-colors">
                    +91 {BRAND_CONFIG.contact.primaryPhone} (Primary Desk)
                  </a>
                  <a href={`tel:+91${BRAND_CONFIG.contact.secondaryPhone}`} className="hover:text-salon-gold transition-colors">
                    +91 {BRAND_CONFIG.contact.secondaryPhone}
                  </a>
                  <a href={`tel:+91${BRAND_CONFIG.contact.tertiaryPhone}`} className="hover:text-salon-gold transition-colors">
                    +91 {BRAND_CONFIG.contact.tertiaryPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start space-x-3 text-sm">
              <Clock className="h-5 w-5 text-salon-gold flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold uppercase text-zinc-400 block">Opening Hours</span>
                <span className="text-xs text-zinc-200 block">{BRAND_CONFIG.hours.display}</span>
                <span className="text-[11px] font-semibold text-emerald-400 block">Open All 7 Days of the Week</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={BRAND_CONFIG.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-2 border-salon-gold/50 text-salon-gold hover:bg-salon-gold hover:text-black w-full"
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Directions on Google Maps</span>
              </a>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="lg:col-span-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-salon-gold block">
                Quick Message
              </span>
              <h3 className="font-serif text-2xl font-bold text-white mt-1">
                Say Hello
              </h3>
              <p className="text-xs text-zinc-400">Have a custom question? Send our front desk a note.</p>
            </div>

            {enquirySuccess ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="font-serif text-lg font-bold text-white">Thank You!</h4>
                <p className="text-xs text-zinc-300">
                  Your message has been delivered to our reception desk. We will get back to you shortly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEnquirySuccess(false)}
                  className="mt-2 text-xs"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Your Full Name <span className="text-salon-gold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-sm text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Mobile Phone <span className="text-salon-gold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 7707000463"
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-sm text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Bridal Suite / Service of Interest
                  </label>
                  <select
                    value={enquiryService}
                    onChange={(e) => setEnquiryService(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-sm text-white focus:border-salon-gold focus:outline-none"
                  >
                    <option value="Bridal & Engagement Makeup">Bridal & Engagement Makeup</option>
                    <option value="Luxury Airbrush Suite">Luxury Airbrush Suite</option>
                    <option value="Pre-Bridal Radiance Ritual">Pre-Bridal Radiance Ritual</option>
                    <option value="Haldi & Sangeet Radiance">Haldi & Sangeet Radiance</option>
                    <option value="Everyday Hair Spa & Keratin">Everyday Hair Spa & Keratin</option>
                    <option value="Other / Custom Inquiry">Other / Custom Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Message / Special Query <span className="text-salon-gold">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Let us know your wedding date, lehenga color, or any special styling requests..."
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-sm text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  disabled={isSubmittingEnquiry}
                  className="w-full justify-center gap-2 py-4 font-bold text-sm"
                >
                  {isSubmittingEnquiry ? (
                    <span>Sending Your Inquiry...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message to Front Desk</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 21: FINAL BOOKING CTA                                  */}
      {/* ============================================================== */}
      <section id="reserve" className="relative py-24 overflow-hidden border-t border-white/10 bg-gradient-to-b from-zinc-950 via-salon-black to-black text-center scroll-mt-28">
        <div className="absolute inset-0 bg-radial-gradient from-salon-gold/10 via-transparent to-transparent pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 max-w-3xl space-y-6">
          <Badge variant="gold" className="text-xs uppercase tracking-widest font-semibold">
            SECURE YOUR SPOT
          </Badge>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            The spotlight, exclusively yours.
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
            We strictly limit our daily bridal appointments to ensure absolute, uncompromising attention to detail. Reserve your wedding date before your slot is taken.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="gold"
              size="lg"
              onClick={() => scrollToSection("availability")}
              className="w-full sm:w-auto gap-2 px-8 py-6 text-sm font-bold shadow-[0_0_25px_rgba(198,165,107,0.35)]"
            >
              <Calendar className="h-4 w-4" />
              <span>Book Bridal Appointment</span>
            </Button>

            <a
              href={`https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=Hello%20The%20Jawed%20Habib%20Salon%20Lalganj%2C%20I%20would%20like%20to%20reserve%20a%20bridal%20appointment.`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto gap-2 border-emerald-600/60 text-emerald-400 hover:bg-emerald-950/40 px-8 py-6 text-sm"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp Us →</span>
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox and Video Modals */}
      <LightboxModal
        photos={studioPhotos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />

      <VideoModal
        isOpen={activeVideo !== null}
        onClose={() => setActiveVideo(null)}
        video={activeVideo}
      />
    </div>
  );
}
