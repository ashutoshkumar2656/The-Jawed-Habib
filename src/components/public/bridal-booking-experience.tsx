"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  Check,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Info,
  Heart,
  Crown,
  Loader2,
  MessageCircle,
  X,
  CalendarCheck,
  FileText,
  Printer,
  RotateCcw,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import { useSearchParams } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isBefore, startOfToday } from "date-fns";
import { getKolkataDateString } from "@/lib/utils/timezone";

// Timezone-safe date string formatter (prevents UTC date shifts)
export function formatDateSafe(dateStr: string, formatPattern: string): string {
  if (!dateStr) return "";
  const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const d = new Date(`${cleanDate}T12:00:00`);
  return format(d, formatPattern);
}

export interface BridalService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detailedDescription?: string | null;
  price: number;
  discountedPrice: number | null;
  durationMinutes: number;
  gender: string;
  categoryId: string;
  imageUrl: string | null;
  galleryImages?: string[];
  isBridal?: boolean;
  minAdvanceAmount?: number;
  maxAdvanceAmount?: number;
  suggestedAdvanceOptions?: number[];
  allowOnlineBooking?: boolean;
  allowAdvancePayment?: boolean;
  depositValue?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface DayAvailability {
  date: string;
  isPast: boolean;
  isClosed: boolean;
  isFullyBooked: boolean;
  availableSlotCount: number;
}

const DEFAULT_TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
  "07:00 PM",
];

// Fallback curated bridal packages in case of initial offline boot
const FALLBACK_BRIDAL_PACKAGES: BridalService[] = [
  {
    id: "cmwfznrsc00014ju3nkd2eqpu",
    name: "Jawed Habib Signature HD Bridal Makeup",
    slug: "jawed-habib-hd-bridal-makeup",
    description: "Complete signature HD bridal makeup, false lashes, premium hair styling, and dupatta draping.",
    detailedDescription: "Our premier bridal package engineered for high-definition photography and long-lasting radiance under event lighting. Uses top-tier international products (MAC, Huda Beauty, Kryolan, NARS). Includes skin prep, HD contouring, custom eye look, floral/jeweled hair architecture, and expert jewelry & dupatta placement.",
    price: 5000,
    discountedPrice: 5000,
    durationMinutes: 180,
    gender: "FEMALE",
    categoryId: "cmwfvl97u002et9uykk7q9z7o",
    imageUrl: "/images/services/service-bridal-makeup.jpg",
    minAdvanceAmount: 1000,
    maxAdvanceAmount: 2500,
    depositValue: 2000,
    suggestedAdvanceOptions: [1000, 1500, 2000, 2500],
    isPopular: true,
    isFeatured: true,
  },
  {
    id: "cmwfznrym00034ju39trebrqd",
    name: "Luxury Airbrush & Saree Draping Bridal Suite",
    slug: "luxury-airbrush-bridal-suite",
    description: "Water-resistant, feather-light Airbrush bridal transformation with luxury hairstyle and bridal glow.",
    detailedDescription: "Silicone-based micro-fine airbrush application ensuring 18-hour crease-free, waterproof, and heat-resistant finish. Perfect for outdoor and humid Bihar ceremonies. Includes pre-makeup lymphatic de-puffing massage, 3D mink lashes, designer saree/lehenga draping, and touchup kit.",
    price: 7500,
    discountedPrice: 7500,
    durationMinutes: 210,
    gender: "FEMALE",
    categoryId: "cmwfvl97u002et9uykk7q9z7o",
    imageUrl: "/images/makeup/makeup-bridal-1.jpg",
    minAdvanceAmount: 1000,
    maxAdvanceAmount: 2500,
    depositValue: 2000,
    suggestedAdvanceOptions: [1000, 1500, 2000, 2500],
    isPopular: true,
    isFeatured: true,
  },
  {
    id: "cmwfzns1c00054ju3ygv8x7t8",
    name: "Royal Rajputana Grand Bridal Suite",
    slug: "royal-rajputana-grand-bridal-suite",
    description: "Ultra-luxe high-coverage bridal artistry, 24K gold skin priming, 3D lashes, custom hair architecture, and dual-dupatta royal draping.",
    detailedDescription: "Our flagship bridal transformation designed for regal wedding ceremonies. Includes deep skin hydration, Charlotte Tilbury and MAC HD airbrush sculpting, dramatic royal eye look, 3D mink lashes, floral hair bun with premium extensions, royal dual-dupatta setting, and luxury bridal emergency touch-up kit.",
    price: 9999,
    discountedPrice: 9999,
    durationMinutes: 240,
    gender: "FEMALE",
    categoryId: "cmwfvl97u002et9uykk7q9z7o",
    imageUrl: "/images/makeup/makeup-bridal-2.jpg",
    minAdvanceAmount: 1500,
    maxAdvanceAmount: 2500,
    depositValue: 2500,
    suggestedAdvanceOptions: [1500, 2000, 2500],
    isPopular: true,
    isFeatured: true,
  },
  {
    id: "srv_bridal_3",
    name: "Pre-Bridal Radiance Glow & Hair Spa Ritual",
    slug: "pre-bridal-radiance-glow-ritual",
    description: "Intensive 24K gold skin luminescence therapy, therapeutic keratin hair spa, and bridal manicure/pedicure.",
    detailedDescription: "Comprehensive grooming session conducted 2-3 days prior to wedding rituals. Features gentle enzyme exfoliation, multi-vitamin oxygen infusion, 24K gold leaf mask, L'Oréal deep restorative hair spa, and soothing aromatherapy massage.",
    price: 3500,
    discountedPrice: 3500,
    durationMinutes: 120,
    gender: "FEMALE",
    categoryId: "cat_6",
    imageUrl: "/images/services/service-facial.jpg",
    minAdvanceAmount: 1000,
    maxAdvanceAmount: 2500,
    depositValue: 1500,
    suggestedAdvanceOptions: [1000, 1500, 2000, 2500],
    isPopular: false,
    isFeatured: true,
  },
  {
    id: "srv_bridal_4",
    name: "Reception & Engagement Glam Artistry",
    slug: "reception-engagement-glam-artistry",
    description: "Contemporary reception makeup, soft Hollywood waves or modern updo, and luminous glass skin glow.",
    detailedDescription: "Designed for evening reception, engagement, or sangeet ceremonies. Focuses on multidimensional shimmer eyes, sculpted cheekbones, transfer-resistant lips, and modern hair textures.",
    price: 3000,
    discountedPrice: 3000,
    durationMinutes: 90,
    gender: "FEMALE",
    categoryId: "cat_6",
    imageUrl: "/images/services/service-party-makeup.jpg",
    minAdvanceAmount: 1000,
    maxAdvanceAmount: 2500,
    depositValue: 1000,
    suggestedAdvanceOptions: [1000, 1500, 2000, 2500],
    isPopular: false,
    isFeatured: true,
  },
  {
    id: "srv_bridal_5",
    name: "Haldi & Sangeet Sunshine Radiance",
    slug: "haldi-sangeet-sunshine-radiance",
    description: "Vibrant, sweat-proof festive makeup, fresh floral hair styling, and dewy turmeric-safe skin prep.",
    detailedDescription: "Specially formulated for morning Haldi and evening Sangeet festivities. Features transfer-resistant HD base, luminous golden highlighter, smudge-proof kajal, fresh floral hair braiding, and quick lehenga adjustment.",
    price: 2500,
    discountedPrice: 2500,
    durationMinutes: 90,
    gender: "FEMALE",
    categoryId: "cat_6",
    imageUrl: "/images/makeup/makeup-party-1.jpg",
    minAdvanceAmount: 1000,
    maxAdvanceAmount: 2000,
    depositValue: 1000,
    suggestedAdvanceOptions: [1000, 1500, 2000],
    isPopular: true,
    isFeatured: true,
  },
];

import { BRIDAL_ADDONS, type BridalAddonItem } from "@/lib/constants/bridal";
export { BRIDAL_ADDONS, type BridalAddonItem };

export function BridalBookingExperience() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const paramService = searchParams?.get("service") || searchParams?.get("package");

  // Dynamic Data
  const [bridalPackages, setBridalPackages] = React.useState<BridalService[]>(FALLBACK_BRIDAL_PACKAGES);
  const [loadingServices, setLoadingServices] = React.useState(true);

  // Selected Booking State
  const kolkataToday = React.useMemo(() => getKolkataDateString(), []);
  const [selectedPackage, setSelectedPackage] = React.useState<BridalService>(FALLBACK_BRIDAL_PACKAGES[0]);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = React.useState<string>(kolkataToday);
  const [selectedTime, setSelectedTime] = React.useState<string>("11:30 AM");
  const [availableSlots, setAvailableSlots] = React.useState<string[]>(DEFAULT_TIME_SLOTS);
  const [loadingSlots, setLoadingSlots] = React.useState(false);

  // Month Availability State
  const [monthData, setMonthData] = React.useState<{
    availableDates: string[];
    unavailableDates: string[];
    blockedDates: string[];
  } | null>(null);
  const [loadingMonth, setLoadingMonth] = React.useState(false);

  // Advance Deposit State
  const [advanceAmount, setAdvanceAmount] = React.useState<number>(2000);

  // Form Fields
  const [customerName, setCustomerName] = React.useState<string>("");
  const [customerPhone, setCustomerPhone] = React.useState<string>("");
  const [customerEmail, setCustomerEmail] = React.useState<string>("");
  const [customerLocality, setCustomerLocality] = React.useState<string>("Lalganj, Vaishali");
  const [eventDate, setEventDate] = React.useState<string>("");
  const [weddingVenue, setWeddingVenue] = React.useState<string>("");
  const [selectedAddonIds, setSelectedAddonIds] = React.useState<string[]>([]);
  const [bridalNotes, setBridalNotes] = React.useState<string>("");

  // UI Filtering & Modal State
  const [activeCategoryTab, setActiveCategoryTab] = React.useState<string>("ALL");
  const [priceSort, setPriceSort] = React.useState<"RECOMMENDED" | "PRICE_ASC" | "PRICE_DESC">("RECOMMENDED");
  const [inspectingPackage, setInspectingPackage] = React.useState<BridalService | null>(null);

  // Processing & Confirmation State
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [confirmedBooking, setConfirmedBooking] = React.useState<{
    bookingReference: string;
    customerName: string;
    serviceName: string;
    appointmentDate: string;
    startTime: string;
    advancePaid: number;
    remainingBalance: number;
    eventDate?: string;
    weddingVenue?: string;
    addons?: string[];
  } | null>(null);

  // Fetch dynamic bridal services from API
  React.useEffect(() => {
    let isMounted = true;
    async function loadBridalServices() {
      try {
        const res = await fetch("/api/bridal/services");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            if (isMounted) {
              setBridalPackages(data.data);
              // Pick URL-matched package, or popular, or first available package
              const matched = paramService ? data.data.find((s: BridalService) => s.id === paramService || s.slug === paramService) : null;
              const primary = matched || data.data.find((s: BridalService) => s.isPopular) || data.data[0];
              setSelectedPackage(primary);
              setAdvanceAmount(primary.depositValue || 2000);
            }
          }
        }
      } catch (err) {
        console.warn("Using fallback bridal packages:", err);
      } finally {
        if (isMounted) setLoadingServices(false);
      }
    }
    loadBridalServices();
    return () => {
      isMounted = false;
    };
  }, [paramService]);

  // Fetch dynamic month availability
  React.useEffect(() => {
    let isMounted = true;
    async function loadMonthAvailability() {
      setLoadingMonth(true);
      try {
        const ym = format(currentMonth, "yyyy-MM");
        const srvId = selectedPackage?.id || "srv_1";
        const res = await fetch(`/api/appointments/availability?month=${ym}&serviceIds=${srvId}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data?.month) {
            setMonthData(json.data.month);
          }
        }
      } catch (err) {
        console.warn("Could not load month availability:", err);
      } finally {
        if (isMounted) setLoadingMonth(false);
      }
    }
    loadMonthAvailability();
    return () => {
      isMounted = false;
    };
  }, [currentMonth, selectedPackage?.id]);

  // Fetch slot availability when selected date changes
  React.useEffect(() => {
    let isMounted = true;
    async function fetchSlots() {
      if (!selectedDate) return;
      setLoadingSlots(true);
      try {
        const srvId = selectedPackage?.id || "srv_1";
        const res = await fetch(`/api/appointments/availability?date=${selectedDate}&serviceIds=${srvId}`);
        if (res.ok) {
          const data = await res.json();
          const rawSlots = data?.data?.slots || data?.slots;
          if (data.success && Array.isArray(rawSlots)) {
            const openSlots = rawSlots.filter((s: { isAvailable: boolean }) => s.isAvailable);
            const openTimes = openSlots.map((s: { time: string }) => s.time);
            if (isMounted) {
              if (openTimes.length > 0) {
                const formattedSlots = openTimes.map((t: string) => {
                  if (t.includes("AM") || t.includes("PM")) return t;
                  const [hStr, mStr] = t.split(":");
                  const h = parseInt(hStr, 10);
                  const period = h >= 12 ? "PM" : "AM";
                  const h12 = h % 12 || 12;
                  return `${h12.toString().padStart(2, "0")}:${mStr} ${period}`;
                });
                setAvailableSlots(formattedSlots);
                setSelectedTime((prevTime) => (formattedSlots.includes(prevTime) ? prevTime : formattedSlots[0]));
              } else {
                setAvailableSlots([]);
                setSelectedTime("");
              }
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Using fallback time slots on network error:", err);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
      if (isMounted) {
        if (selectedDate >= kolkataToday) {
          setAvailableSlots(DEFAULT_TIME_SLOTS);
          setSelectedTime((prev) => prev || DEFAULT_TIME_SLOTS[0]);
        } else {
          setAvailableSlots([]);
          setSelectedTime("");
        }
      }
    }
    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, kolkataToday, selectedPackage?.id]);

  // Sync advance amount within package constraints whenever package changes
  React.useEffect(() => {
    if (!selectedPackage) return;
    const minAdv = selectedPackage.minAdvanceAmount || 1000;
    const maxAdv = Math.min(selectedPackage.maxAdvanceAmount || 2500, selectedPackage.price);
    const defAdv = selectedPackage.depositValue || 2000;

    setAdvanceAmount((prev) => {
      if (prev < minAdv) return minAdv;
      if (prev > maxAdv) return maxAdv;
      return defAdv;
    });
  }, [selectedPackage]);

  // Calendar dates generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayIndex = monthStart.getDay(); // 0 is Sunday
  const today = startOfToday();

  // Handle Date Selection
  const handleSelectDate = (d: Date) => {
    const formatted = format(d, "yyyy-MM-dd");
    setSelectedDate(formatted);
  };

  // Scroll Helpers
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Optional add-ons calculation
  const addonsTotal = React.useMemo(() => {
    return selectedAddonIds.reduce((sum, id) => {
      const addon = BRIDAL_ADDONS.find((a) => a.id === id);
      return sum + (addon?.price || 0);
    }, 0);
  }, [selectedAddonIds]);

  const basePackagePrice = selectedPackage?.price || 5000;
  const totalPrice = basePackagePrice + addonsTotal;
  const currentAdvance = Math.min(advanceAmount, totalPrice);
  const remainingBalance = Math.max(0, totalPrice - currentAdvance);

  // Filtered and sorted packages
  const filteredPackages = React.useMemo(() => {
    let list = bridalPackages;
    if (activeCategoryTab === "SUITES") {
      list = bridalPackages.filter((p) => p.price >= 5000);
    } else if (activeCategoryTab === "PRE_BRIDAL") {
      list = bridalPackages.filter(
        (p) =>
          p.name.toLowerCase().includes("pre-bridal") ||
          p.name.toLowerCase().includes("ritual") ||
          p.name.toLowerCase().includes("facial") ||
          p.name.toLowerCase().includes("spa")
      );
    } else if (activeCategoryTab === "RECEPTION") {
      list = bridalPackages.filter(
        (p) =>
          p.name.toLowerCase().includes("reception") ||
          p.name.toLowerCase().includes("engagement") ||
          p.name.toLowerCase().includes("sangeet") ||
          p.name.toLowerCase().includes("haldi") ||
          p.name.toLowerCase().includes("party")
      );
    }

    const sorted = [...list];
    if (priceSort === "PRICE_ASC") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (priceSort === "PRICE_DESC") {
      sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
  }, [bridalPackages, activeCategoryTab, priceSort]);

  // Razorpay Payment & Booking Submission
  const handleProceedPayment = async () => {
    const cleanPhone = customerPhone.replace(/\D/g, "");

    if (!customerName || customerName.trim().length < 2) {
      toast({
        type: "error",
        title: "Name Required",
        message: "Please enter your full name (minimum 2 characters).",
      });
      scrollToId("booking-form-section");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast({
        type: "error",
        title: "Valid Mobile Number Required",
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
      scrollToId("booking-form-section");
      return;
    }

    if (!customerEmail || !customerEmail.includes("@")) {
      toast({
        type: "error",
        title: "Valid Email Required",
        message: "Please provide a valid email address to receive your confirmation receipt.",
      });
      scrollToId("booking-form-section");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Authoritative Server-Side Appointment Reservation
      const aptRes = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim(),
          serviceIds: [selectedPackage.id],
          packageId: null,
          appointmentDate: selectedDate,
          startTime: selectedTime,
          advanceAmount: currentAdvance,
          eventDate: eventDate || undefined,
          weddingVenue: weddingVenue || undefined,
          selectedAddons: selectedAddonIds,
          notes: bridalNotes || undefined,
          bridalRequirements: [
            bridalNotes ? `Notes: ${bridalNotes}` : "",
            eventDate ? `Event Date: ${eventDate}` : "",
            weddingVenue ? `Venue: ${weddingVenue}` : "",
            selectedAddonIds.length > 0 ? `Addons: ${selectedAddonIds.join(", ")}` : "",
          ].filter(Boolean).join(" | ") || undefined,
        }),
      });

      const aptData = await aptRes.json();
      if (!aptRes.ok || !aptData.success) {
        const errorMsg = aptData.error || (aptData.details && Object.values(aptData.details).flat()[0]) || "Failed to create reservation slot. Please select another time or date.";
        throw new Error(errorMsg);
      }

      const createdAppointment = aptData.data;

      // 2. Create Razorpay Payment Order for the Created Appointment
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: createdAppointment.id,
          paymentPurpose: "ADVANCE_DEPOSIT",
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        // Fallback: If online payment gateway is offline or in maintenance, the appointment is still safely held
        setConfirmedBooking({
          bookingReference: createdAppointment.appointmentNumber,
          customerName: customerName.trim(),
          serviceName: selectedPackage.name,
          appointmentDate: selectedDate,
          startTime: selectedTime,
          advancePaid: 0,
          remainingBalance: totalPrice,
          eventDate: eventDate || undefined,
          weddingVenue: weddingVenue || undefined,
          addons: selectedAddonIds.map((id) => BRIDAL_ADDONS.find((a) => a.id === id)?.name).filter(Boolean) as string[],
        });
        toast({
          type: "info",
          title: "Appointment Reserved (Pay at Salon Counter)",
          message: orderData.error || "Online payment unavailable. Your appointment has been recorded, please pay advance at the salon.",
        });
        scrollToId("booking-confirmation-view");
        return;
      }

      const { orderId, keyId, amountInPaise } = orderData.data;

      // 3. Load Razorpay Checkout Script if not available
      if (!(window as any).Razorpay) {
        const scriptLoaded = await new Promise<boolean>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        if (!scriptLoaded) {
          setConfirmedBooking({
            bookingReference: createdAppointment.appointmentNumber,
            customerName: customerName.trim(),
            serviceName: selectedPackage.name,
            appointmentDate: selectedDate,
            startTime: selectedTime,
            advancePaid: 0,
            remainingBalance: totalPrice,
            eventDate: eventDate || undefined,
            weddingVenue: weddingVenue || undefined,
            addons: selectedAddonIds.map((id) => BRIDAL_ADDONS.find((a) => a.id === id)?.name).filter(Boolean) as string[],
          });
          toast({
            type: "info",
            title: "Appointment Reserved (Pay at Salon Counter)",
            message: "Online payment gateway is temporarily unreachable. Your appointment slot is securely reserved under Ref #" + createdAppointment.appointmentNumber + "! Please pay the advance at the salon counter.",
          });
          scrollToId("booking-confirmation-view");
          return;
        }
      }

      // 4. Trigger Razorpay Standard Checkout
      const options = {
        key: keyId,
        amount: amountInPaise,
        currency: "INR",
        name: "The Jawed Habib Salon",
        description: `Advance Deposit · ${selectedPackage.name}`,
        image: "/brand/jawed-habib/logo-icon.svg",
        order_id: orderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: cleanPhone,
        },
        theme: {
          color: "#C6A56B",
        },
        handler: async function (response: any) {
          try {
            // 5. Server-Side HMAC SHA256 Signature Verification
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointmentId: createdAppointment.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setConfirmedBooking({
                bookingReference: verifyData.data?.appointmentNumber || createdAppointment.appointmentNumber,
                customerName: customerName.trim(),
                serviceName: selectedPackage.name,
                appointmentDate: selectedDate,
                startTime: selectedTime,
                advancePaid: currentAdvance,
                remainingBalance,
                eventDate: eventDate || undefined,
                weddingVenue: weddingVenue || undefined,
                addons: selectedAddonIds.map((id) => BRIDAL_ADDONS.find((a) => a.id === id)?.name).filter(Boolean) as string[],
              });

              toast({
                type: "success",
                title: "Bridal Appointment Confirmed!",
                message: `Booking Ref: ${verifyData.data?.appointmentNumber || createdAppointment.appointmentNumber}. Advance ₹${currentAdvance.toLocaleString("en-IN")} captured.`,
              });

              scrollToId("booking-confirmation-view");
            } else {
              throw new Error(verifyData.error || "Payment verification failed.");
            }
          } catch (err: any) {
            toast({
              type: "error",
              title: "Verification Error",
              message: err.message || "Could not confirm booking with salon server.",
            });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            toast({
              type: "info",
              title: "Payment Window Closed",
              message: `Your booking slot is reserved under Ref #${createdAppointment.appointmentNumber}. You may complete payment at the salon counter.`,
            });
            setConfirmedBooking({
              bookingReference: createdAppointment.appointmentNumber,
              customerName: customerName.trim(),
              serviceName: selectedPackage.name,
              appointmentDate: selectedDate,
              startTime: selectedTime,
              advancePaid: 0,
              remainingBalance: totalPrice,
              eventDate: eventDate || undefined,
              weddingVenue: weddingVenue || undefined,
              addons: selectedAddonIds.map((id) => BRIDAL_ADDONS.find((a) => a.id === id)?.name).filter(Boolean) as string[],
            });
            scrollToId("booking-confirmation-view");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Booking Session Failed",
        message: err.message || "An unexpected error occurred while contacting payment server.",
      });
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="w-full">
      {/* ============================================================== */}
      {/* SECTION 03: WEDDING SEASON / SPECIAL HIGHLIGHTS                */}
      {/* ============================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-salon-gold/30 bg-gradient-to-r from-salon-black via-zinc-950 to-salon-cardBlack p-8 md:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-salon-gold/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-salon-gold/40 bg-salon-gold/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-salon-gold">
                <Crown className="h-3.5 w-3.5" />
                <span>Wedding & Festive Season Reservations</span>
              </div>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
                Reserve before your wedding date is taken.
              </h3>
              <p className="text-sm leading-relaxed text-zinc-300 md:text-base">
                We strictly limit our bridal bookings per day to ensure dedicated, personalized care, a private bridal dressing suite, and uninterrupted master artist attention.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Button
                variant="gold"
                size="lg"
                onClick={() => scrollToId("availability")}
                className="gap-2 shadow-lg"
              >
                <span>Check Available Dates →</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToId("packages")}
                className="border-salon-gold/40 text-salon-gold hover:bg-salon-gold/10"
              >
                <span>Explore Packages</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 04: WEDDING DATE CALENDAR & APPOINTMENT AVAILABILITY    */}
      {/* ============================================================== */}
      <section id="availability" className="scroll-mt-28 mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="max-w-3xl space-y-3 mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            Wedding Date
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Reserve before your date is taken.
          </h2>
          <p className="text-sm text-zinc-400 md:text-base">
            Select your preferred wedding or event date to check real-time bridal artist availability at our Lalganj studio.
          </p>
        </div>

        {/* Spacious Calendar Container */}
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-salon-cardBlack/70 p-3 sm:p-6 md:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-6 md:gap-8 md:flex-row">
            {/* Calendar Grid (Left Column) */}
            <div className="flex-1 rounded-xl sm:rounded-2xl border border-white/10 bg-black/40 p-3 sm:p-6">
              {/* Month Navigation */}
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  disabled={format(currentMonth, "yyyy-MM") <= format(new Date(), "yyyy-MM")}
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="font-serif text-lg font-semibold text-salon-ivory md:text-xl flex items-center gap-2">
                  <span>{format(currentMonth, "MMMM yyyy")}</span>
                  {loadingMonth && <Loader2 className="h-3.5 w-3.5 animate-spin text-salon-gold" />}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Weekday Labels */}
              <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="pb-2 text-xs font-medium text-zinc-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {/* Empty prefix slots */}
                {Array.from({ length: startDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 w-full" />
                ))}

                {/* Day Buttons */}
                {calendarDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const isPast = dateStr < kolkataToday;
                  const isBlocked = monthData?.blockedDates?.includes(dateStr) ?? false;
                  const isClosed = monthData
                    ? !monthData.availableDates.includes(dateStr) && !isPast && !isBlocked
                    : false;
                  const isDisabled = isPast || isBlocked || isClosed;
                  const isSelected = selectedDate === dateStr;

                  let title = "Available for Appointment";
                  if (isPast) title = "Past date";
                  else if (isBlocked) title = "Salon Holiday / Closed";
                  else if (isClosed) title = "Fully Booked or Salon Closed";

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isDisabled}
                      title={title}
                      onClick={() => handleSelectDate(day)}
                      className={cn(
                        "relative flex h-9 sm:h-10 w-full items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all select-none min-h-[38px]",
                        isPast
                          ? "cursor-not-allowed text-zinc-700"
                          : isBlocked
                          ? "cursor-not-allowed text-rose-500/50 line-through bg-rose-950/20"
                          : isClosed
                          ? "cursor-not-allowed text-zinc-600 bg-zinc-900/30"
                          : isSelected
                          ? "bg-salon-gold text-black font-bold shadow-[0_0_15px_rgba(198,165,107,0.5)] scale-105"
                          : "text-zinc-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <span>{format(day, "d")}</span>
                      {isSelected && (
                        <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-white" />
                      )}
                      {isBlocked && (
                        <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-rose-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Working Hours & Legend */}
              <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-xs text-zinc-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-salon-goldLight">
                    <Clock className="h-3.5 w-3.5 text-salon-gold" />
                    <span>Salon Hours: 10:00 AM – 10:00 PM</span>
                  </span>
                  <span className="text-zinc-500">Open all 7 days</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-salon-gold" />
                    <span>Selected</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    <span>Available</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Closed / Holiday</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Time Slot Selection (Right Column) */}
            <div className="flex flex-col justify-between md:w-80">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wider text-zinc-500">Selected Date</div>
                  <div className="font-serif text-lg font-bold text-salon-gold">
                    {formatDateSafe(selectedDate, "EEEE, MMMM d, yyyy")}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    <span>Available Slot Times</span>
                    {loadingSlots && <Loader2 className="h-3.5 w-3.5 animate-spin text-salon-gold" />}
                  </div>

                  {availableSlots.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-black/40 p-5 text-center text-xs text-zinc-400 space-y-1.5">
                      <Clock className="h-5 w-5 text-salon-gold/60 mx-auto" />
                      <p className="font-semibold text-white">No Open Slots on This Date</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        All stylist slots for this day are either fully reserved or the salon is closed. Please pick an alternate date on the calendar.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2">
                      {availableSlots.map((slot) => {
                        const isTimeSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              "rounded-xl border py-3 px-2 text-xs font-semibold transition-all select-none text-center min-h-[44px] flex items-center justify-center",
                              isTimeSelected
                                ? "border-salon-gold bg-salon-gold text-black shadow-md font-bold"
                                : "border-white/10 bg-black/30 text-zinc-300 hover:border-salon-gold/50 hover:bg-white/5"
                            )}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Proceed to Form Button */}
              <div className="mt-8 pt-4 border-t border-white/10">
                <Button
                  variant="gold"
                  size="lg"
                  disabled={availableSlots.length === 0 || !selectedTime}
                  className="w-full gap-2 font-bold tracking-wide shadow-md disabled:opacity-50"
                  onClick={() => scrollToId("booking-form-section")}
                >
                  <span>SELECT DATE & TIME ↓</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 05: CUSTOMER BOOKING DETAILS FORM                      */}
      {/* ============================================================== */}
      <section id="booking-form-section" className="scroll-mt-28 mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="max-w-3xl space-y-3 mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            Booking Details
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Fill the form.
          </h2>
          <p className="text-sm text-zinc-400 md:text-base">
            Please share your wedding day contact details and bridal preferences so our senior artist can review your reservation.
          </p>
        </div>

        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-salon-cardBlack/70 p-6 md:p-10 shadow-2xl backdrop-blur-md">
          {/* Selected Date & Time Pill Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-salon-gold/30 bg-salon-gold/5 p-4">
            <div className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 text-salon-gold" />
              <div>
                <span className="text-xs text-zinc-400">Appointment Scheduled For:</span>
                <p className="font-serif font-bold text-salon-ivory">
                  {formatDateSafe(selectedDate, "EEEE, d MMMM yyyy")} · {selectedTime || "Select a time"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => scrollToId("availability")}
              className="text-xs font-semibold text-salon-gold hover:underline"
            >
              Change Date/Time
            </button>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); scrollToId("packages"); }}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Full Name (Required)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-3 text-base sm:text-sm text-white placeholder-zinc-600 focus:border-salon-gold focus:outline-none focus:ring-1 focus:ring-salon-gold transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Mobile Number (Required)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-3 text-base sm:text-sm text-white placeholder-zinc-600 focus:border-salon-gold focus:outline-none focus:ring-1 focus:ring-salon-gold transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Email Address (Required)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. priya@gmail.com"
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-3 text-base sm:text-sm text-white placeholder-zinc-600 focus:border-salon-gold focus:outline-none focus:ring-1 focus:ring-salon-gold transition-colors"
                  />
                </div>
              </div>

              {/* City / Locality */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  City / Locality (Required)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={customerLocality}
                    onChange={(e) => setCustomerLocality(e.target.value)}
                    placeholder="e.g. Lalganj, Vaishali, Hajipur"
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-3 text-base sm:text-sm text-white placeholder-zinc-600 focus:border-salon-gold focus:outline-none focus:ring-1 focus:ring-salon-gold transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Event / Wedding Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Wedding / Function Date (Optional)
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-salon-gold focus:outline-none focus:ring-1 focus:ring-salon-gold transition-colors"
                  />
                </div>
              </div>

              {/* Wedding Venue / Location */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Wedding Venue / Ceremony Hall (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={weddingVenue}
                    onChange={(e) => setWeddingVenue(e.target.value)}
                    placeholder="e.g. Rajmahal Vivah Bhavan, Lalganj"
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-salon-gold focus:outline-none focus:ring-1 focus:ring-salon-gold transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Optional Bridal Add-ons */}
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-salon-gold block">
                Enhance Your Experience (Optional Add-ons)
              </span>
              <div className="space-y-2.5">
                {BRIDAL_ADDONS.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all",
                        isChecked
                          ? "border-salon-gold/60 bg-salon-gold/10 text-white"
                          : "border-white/5 bg-white/5 text-zinc-300 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddonIds([...selectedAddonIds, addon.id]);
                            } else {
                              setSelectedAddonIds(selectedAddonIds.filter((id) => id !== addon.id));
                            }
                          }}
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-salon-gold focus:ring-salon-gold"
                        />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold">{addon.name}</p>
                          <p className="text-[11px] text-zinc-400">{addon.description}</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-salon-gold shrink-0">
                        +₹{addon.price.toLocaleString("en-IN")}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Bridal Requirements */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Bridal Preferences / Lehenga Colour & Ritual Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={bridalNotes}
                onChange={(e) => setBridalNotes(e.target.value)}
                placeholder="Mention your outfit colors, saree/lehenga draping style, jewellery notes, or skin concerns..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-3.5 text-sm text-white placeholder-zinc-600 focus:border-salon-gold focus:outline-none focus:ring-1 focus:ring-salon-gold transition-colors resize-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="gap-2 font-bold"
              >
                <span>PROCEED TO CHOOSE BRIDAL PACKAGE ↓</span>
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 06 & 07: BRIDAL PACKAGE CATALOGUE & DEPOSIT SELECTION  */}
      {/* ============================================================== */}
      <section id="packages" className="scroll-mt-28 mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="max-w-3xl space-y-3 mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-salon-gold">
            Secure Your Package
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Choose Your Experience
          </h2>
          <p className="text-sm text-zinc-400 md:text-base">
            Select one primary bridal suite or ceremony look. Each package includes comprehensive skin prep, hair architecture, and draping.
          </p>
        </div>

        {/* Category Filter Tabs & Price Sorting Controls */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "ALL", label: `All Packages (${bridalPackages.length})` },
              { id: "SUITES", label: "Bridal Ceremonies" },
              { id: "PRE_BRIDAL", label: "Pre-Wedding" },
              { id: "RECEPTION", label: "Reception & Party" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryTab(tab.id)}
                className={cn(
                  "rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all select-none",
                  activeCategoryTab === tab.id
                    ? "bg-salon-gold text-black font-bold shadow-md"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Price Sorting */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Sort:</span>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPriceSort("RECOMMENDED")}
                className={cn(
                  "rounded-lg px-3 py-1 font-medium transition-colors",
                  priceSort === "RECOMMENDED" ? "bg-salon-gold text-black font-semibold" : "text-zinc-400 hover:text-white"
                )}
              >
                Featured
              </button>
              <button
                type="button"
                onClick={() => setPriceSort("PRICE_ASC")}
                className={cn(
                  "rounded-lg px-3 py-1 font-medium transition-colors",
                  priceSort === "PRICE_ASC" ? "bg-salon-gold text-black font-semibold" : "text-zinc-400 hover:text-white"
                )}
              >
                Price ↑
              </button>
              <button
                type="button"
                onClick={() => setPriceSort("PRICE_DESC")}
                className={cn(
                  "rounded-lg px-3 py-1 font-medium transition-colors",
                  priceSort === "PRICE_DESC" ? "bg-salon-gold text-black font-semibold" : "text-zinc-400 hover:text-white"
                )}
              >
                Price ↓
              </button>
            </div>
          </div>
        </div>

        {/* Package Cards Grid - No Internal Scrollbars! */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => {
            const isSelected = selectedPackage?.id === pkg.id;

            return (
              <div
                key={pkg.id}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300",
                  isSelected
                    ? "border-salon-gold bg-salon-cardBlack shadow-[0_0_30px_rgba(198,165,107,0.25)] ring-1 ring-salon-gold"
                    : "border-white/10 bg-salon-cardBlack/60 hover:border-salon-gold/40 hover:bg-salon-cardBlack"
                )}
              >
                {/* Package Thumbnail */}
                <div className="relative h-60 w-full overflow-hidden bg-zinc-900">
                  <Image
                    src={pkg.imageUrl || "/images/services/service-bridal-makeup.jpg"}
                    alt={pkg.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-salon-black via-transparent to-black/30" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {pkg.isPopular && (
                      <Badge variant="gold" className="text-[10px] font-bold uppercase tracking-wider">
                        Most Requested
                      </Badge>
                    )}
                    {isSelected && (
                      <Badge className="bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-wider">
                        Selected Package
                      </Badge>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5 text-salon-gold" />
                    <span>{pkg.durationMinutes} minutes</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-salon-gold transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-xs leading-relaxed text-zinc-400 line-clamp-3">
                      {pkg.description}
                    </p>

                    {/* Price Breakdown */}
                    <div className="pt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-2xl font-bold text-salon-gold">
                          ₹{pkg.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-zinc-500">all-inclusive</span>
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-400">
                        Online Advance: ₹{(pkg.depositValue || 2000).toLocaleString("en-IN")} · Balance at Salon: ₹{(pkg.price - (pkg.depositValue || 2000)).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInspectingPackage(pkg)}
                      className="flex-1 border-white/20 text-xs text-zinc-300 hover:bg-white/10 hover:text-white"
                    >
                      <Info className="h-3.5 w-3.5 mr-1" />
                      <span>View Details</span>
                    </Button>
                    <Button
                      variant={isSelected ? "gold" : "secondary"}
                      size="sm"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        scrollToId("deposit-section");
                      }}
                      className={cn(
                        "flex-1 text-xs font-bold",
                        isSelected ? "bg-salon-gold text-black" : "bg-white/10 text-white hover:bg-salon-gold hover:text-black"
                      )}
                    >
                      {isSelected ? "Selected ✓" : "Select Package"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION 07: SELECT DEPOSIT (Spacious Slider & Breakdown) */}
        <div id="deposit-section" className="scroll-mt-28 mx-auto mt-16 max-w-2xl overflow-hidden rounded-3xl border border-salon-gold/30 bg-salon-cardBlack p-8 md:p-10 shadow-2xl backdrop-blur-md">
          <div className="text-center space-y-2 mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-salon-gold">
              Initial Deposit
            </span>
            <h4 className="font-serif text-3xl font-bold text-white md:text-4xl">
              Select Advance Amount
            </h4>
            <p className="text-xs text-zinc-400">
              Lock in your booking date with a secure online advance through Razorpay. Pay the remaining balance when you visit our salon.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Big Deposit Typography */}
            <div className="font-serif text-5xl font-bold text-salon-gold drop-shadow-[0_0_20px_rgba(198,165,107,0.4)] md:text-6xl">
              ₹{currentAdvance.toLocaleString("en-IN")}
            </div>

            {/* Slider */}
            <div className="w-full max-w-md px-4">
              <input
                type="range"
                min={selectedPackage?.minAdvanceAmount || 1000}
                max={Math.min(selectedPackage?.maxAdvanceAmount || 2500, totalPrice)}
                step={250}
                value={currentAdvance}
                onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                className="w-full accent-salon-gold cursor-pointer"
              />
              <div className="mt-2 flex justify-between text-xs text-zinc-500">
                <span>Min: ₹{(selectedPackage?.minAdvanceAmount || 1000).toLocaleString("en-IN")}</span>
                <span>Max: ₹{Math.min(selectedPackage?.maxAdvanceAmount || 2500, totalPrice).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              {[1000, 1500, 2000, 2500].filter((val) => val <= totalPrice).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAdvanceAmount(val)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-xs font-semibold transition-all select-none",
                    currentAdvance === val
                      ? "border-salon-gold bg-salon-gold text-black font-bold shadow-md"
                      : "border-white/10 bg-black/40 text-zinc-300 hover:border-salon-gold/50"
                  )}
                >
                  ₹{val.toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            {/* Breakdown Card */}
            <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Package Total ({selectedPackage?.name}):</span>
                <span className="font-semibold text-white">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-salon-gold">
                <span>Payable Online (Advance Deposit):</span>
                <span className="font-bold">₹{currentAdvance.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-zinc-300">
                <span>Remaining Balance (Payable at Salon):</span>
                <span className="font-bold text-white">₹{remainingBalance.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full gap-2 font-bold tracking-wide shadow-lg"
              onClick={() => scrollToId("final-summary-section")}
            >
              <span>REVIEW FINAL SUMMARY & PAY ADVANCE ↓</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 08: FINAL BOOKING SUMMARY & RAZORPAY CONFIRMATION      */}
      {/* ============================================================== */}
      <section id="final-summary-section" className="scroll-mt-28 mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-salon-gold/40 bg-gradient-to-b from-salon-cardBlack to-salon-black p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          <div className="space-y-3 mb-8 border-b border-white/10 pb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-salon-gold/40 bg-salon-gold/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-salon-gold">
              <ShieldCheck className="h-4 w-4" />
              <span>Step 8: Final Booking Verification</span>
            </div>
            <h3 className="font-serif text-3xl font-bold text-white md:text-4xl">
              Review & Pay Advance
            </h3>
            <p className="text-xs text-zinc-400">
              Verify your booking details below before proceeding to secure payment via Razorpay.
            </p>
          </div>

          <div className="space-y-4 text-sm">
            {/* Package */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400">Selected Bridal Experience:</span>
              <span className="font-serif font-bold text-salon-ivory text-right">
                {selectedPackage?.name}
              </span>
            </div>

            {/* Selected Add-ons if any */}
            {selectedAddonIds.length > 0 && (
              <div className="border-b border-white/10 pb-3 space-y-1">
                <span className="text-xs text-zinc-400">Selected Add-ons:</span>
                {selectedAddonIds.map((id) => {
                  const addon = BRIDAL_ADDONS.find((a) => a.id === id);
                  return (
                    <div key={id} className="flex justify-between text-xs text-zinc-300">
                      <span>• {addon?.name}</span>
                      <span className="text-salon-gold">+₹{addon?.price.toLocaleString("en-IN")}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Date & Time */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400">Appointment Date & Time:</span>
              <span className="font-semibold text-white">
                {formatDateSafe(selectedDate, "EEE, d MMM yyyy")} · {selectedTime}
              </span>
            </div>

            {/* Event Date & Venue if provided */}
            {(eventDate || weddingVenue) && (
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                <span className="text-zinc-400">Wedding Event & Venue:</span>
                <span className="text-zinc-300 text-right">
                  {eventDate ? formatDateSafe(eventDate, "d MMM yyyy") : "Date pending"}{weddingVenue ? ` · ${weddingVenue}` : ""}
                </span>
              </div>
            )}

            {/* Customer */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400">Client Contact:</span>
              <span className="text-white">
                {customerName || "Name not provided"} ({customerPhone || "Phone pending"})
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400">Salon Location:</span>
              <span className="text-zinc-300 text-right">
                1st Floor Tinpulwa Chowk, Lalganj
              </span>
            </div>

            {/* Financial Highlights */}
            <div className="rounded-2xl border border-salon-gold/30 bg-black/60 p-5 space-y-3">
              <div className="flex justify-between text-zinc-400 text-xs">
                <span>Total Service Price:</span>
                <span className="font-semibold text-white">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-salon-gold font-bold">
                <span>Advance Payable Online Now:</span>
                <span>₹{currentAdvance.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-xs text-zinc-300">
                <span>Remaining Balance at Salon:</span>
                <span className="font-semibold text-white">₹{remainingBalance.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => scrollToId("booking-form-section")}
                className="text-xs text-salon-gold hover:underline flex items-center gap-1"
              >
                <span>← Edit Form Details</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToId("packages")}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <span>Change Package →</span>
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-[11px] text-zinc-400 leading-relaxed">
              <p>
                By clicking below, you will open Razorpay Standard Checkout to securely pay the advance of ₹{currentAdvance.toLocaleString("en-IN")}. By proceeding, you agree to our{" "}
                <Link href="/terms-and-conditions" target="_blank" className="text-salon-gold hover:underline font-medium">
                  Terms &amp; Conditions
                </Link>
                {", "}
                <Link href="/privacy-policy" target="_blank" className="text-salon-gold hover:underline font-medium">
                  Privacy Policy
                </Link>
                {", and "}
                <Link href="/cancellation-refund-policy" target="_blank" className="text-salon-gold hover:underline font-medium">
                  Cancellation &amp; Refund Policy
                </Link>
                .
              </p>
              <p className="text-[10px] text-zinc-500">
                Secure transaction processed by Razorpay. Card numbers, CVV, and banking credentials are never stored on salon servers.
              </p>
            </div>

            <Button
              variant="gold"
              size="lg"
              disabled={isProcessingPayment}
              onClick={handleProceedPayment}
              className="mt-4 w-full gap-2 py-4 text-base font-bold shadow-xl tracking-wide"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>PAY ADVANCE & CONFIRM BOOKING (₹{currentAdvance.toLocaleString("en-IN")})</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* CONFIRMATION MODAL / DISPLAY VIEW                              */}
      {/* ============================================================== */}
      {confirmedBooking && (
        <div id="booking-confirmation-view" className="scroll-mt-28 mx-auto max-w-3xl px-4 py-12 md:px-6">
          <div className="overflow-hidden rounded-3xl border border-emerald-500/50 bg-gradient-to-b from-zinc-950 to-black p-8 md:p-12 shadow-[0_0_50px_rgba(16,185,129,0.2)] print:border-none print:shadow-none print:bg-white print:text-black">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 print:hidden">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 print:text-emerald-700">
                  Appointment Confirmed
                </span>
                <h3 className="font-serif text-3xl font-bold text-white md:text-4xl print:text-black">
                  We look forward to styling you!
                </h3>
              </div>

              <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/5 p-4 text-xs print:border-black/20 print:bg-zinc-100">
                <span className="text-zinc-400 print:text-zinc-600">Unique Booking Reference ID:</span>
                <p className="font-mono text-lg font-bold text-salon-gold tracking-widest mt-1 print:text-black">
                  {confirmedBooking.bookingReference}
                </p>
              </div>

              <div className="mx-auto max-w-md text-left text-xs space-y-2 border-t border-white/10 pt-4 print:border-black/20">
                <div className="flex justify-between text-zinc-300 print:text-black">
                  <span>Bride / Client:</span>
                  <span className="font-semibold text-white print:text-black">{confirmedBooking.customerName}</span>
                </div>
                <div className="flex justify-between text-zinc-300 print:text-black">
                  <span>Bridal Suite:</span>
                  <span className="font-semibold text-white print:text-black">{confirmedBooking.serviceName}</span>
                </div>
                {confirmedBooking.addons && confirmedBooking.addons.length > 0 && (
                  <div className="flex justify-between text-zinc-300 print:text-black">
                    <span>Add-ons:</span>
                    <span className="font-medium text-salon-gold print:text-zinc-700">{confirmedBooking.addons.join(", ")}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-300 print:text-black">
                  <span>Appointment:</span>
                  <span className="font-semibold text-white print:text-black">{confirmedBooking.appointmentDate} at {confirmedBooking.startTime}</span>
                </div>
                {(confirmedBooking.eventDate || confirmedBooking.weddingVenue) && (
                  <div className="flex justify-between text-zinc-300 print:text-black">
                    <span>Wedding Event:</span>
                    <span className="text-zinc-200 print:text-black">{confirmedBooking.eventDate || ""} {confirmedBooking.weddingVenue ? `(${confirmedBooking.weddingVenue})` : ""}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-400 font-bold pt-1 print:text-emerald-700">
                  <span>Advance Received:</span>
                  <span>₹{confirmedBooking.advancePaid.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-zinc-400 print:text-zinc-700">
                  <span>Remaining Balance (Due at Salon):</span>
                  <span>₹{confirmedBooking.remainingBalance.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-zinc-400 border-t border-white/10 pt-2 print:border-black/20 print:text-zinc-700">
                  <span>Salon Desk Phone:</span>
                  <span className="font-semibold text-salon-gold print:text-black">+91 {BRAND_CONFIG.contact.primaryPhone}</span>
                </div>
                <div className="flex justify-between text-zinc-400 print:text-zinc-700">
                  <span>Address:</span>
                  <span className="text-right text-[11px] text-zinc-300 print:text-black">1st Floor Tinpulwa Chowk, Lalganj, Bihar – 844121</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-6 print:hidden">
                <a
                  href={`https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=Hello%20The%20Jawed%20Habib%20Salon%2C%20my%20bridal%20booking%20ID%20is%20${confirmedBooking.bookingReference}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30 inline-flex"
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Salon Desk</span>
                </a>
                <Button
                  variant="gold"
                  size="default"
                  onClick={() => window.print()}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Details Modal (View Details Dialog) */}
      {inspectingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-salon-gold/30 bg-salon-cardBlack p-6 md:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setInspectingPackage(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-zinc-900">
                <Image
                  src={inspectingPackage.imageUrl || "/images/services/service-bridal-makeup.jpg"}
                  alt={inspectingPackage.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-salon-gold">Bridal Experience Details</div>
                <h4 className="font-serif text-2xl font-bold text-white">{inspectingPackage.name}</h4>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-300">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-salon-gold" />
                  {inspectingPackage.durationMinutes} mins
                </span>
                <span className="font-serif text-lg font-bold text-salon-gold">
                  ₹{inspectingPackage.price.toLocaleString("en-IN")}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-zinc-300">
                {inspectingPackage.detailedDescription || inspectingPackage.description}
              </p>

              <div className="space-y-2 border-t border-white/10 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  What&apos;s Included:
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-salon-gold" />
                    <span>Hydrating skin prep & contouring tailored to Indian skin tones</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-salon-gold" />
                    <span>Certified international luxury products (MAC, Charlotte Tilbury, Kryolan)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-salon-gold" />
                    <span>Custom hair architecture, floral/jeweled bun, and dupatta setting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-salon-gold" />
                    <span>Access to private air-conditioned luxury bridal dressing room</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Button
                  variant="gold"
                  size="default"
                  className="w-full font-bold"
                  onClick={() => {
                    setSelectedPackage(inspectingPackage);
                    setInspectingPackage(null);
                    scrollToId("deposit-section");
                  }}
                >
                  <span>Select This Package (₹{inspectingPackage.price.toLocaleString("en-IN")})</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
