"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  CheckCircle2,
  Phone,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  FileText,
  Tag,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";

export interface BookingServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  notes?: string;
}

export interface BookingPackageItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  durationMinutes: number;
  servicesList?: string[];
}

export const BOOKING_SERVICES: BookingServiceItem[] = [
  {
    id: "srv_1",
    name: "Standard Precision Haircut",
    category: "Hair",
    price: 299,
    duration: "30 mins",
    notes: "Face-shape profiling & texturizing",
  },
  {
    id: "srv_2",
    name: "Haircut with Deep Hairwash & Blowdry",
    category: "Hair",
    price: 399,
    duration: "45 mins",
    notes: "Cleansing shampoo & blowout styling",
  },
  {
    id: "srv_5",
    name: "L'Oréal Deep Nourishing Hair Spa",
    category: "Hair Spa",
    price: 999,
    duration: "60 mins",
    notes: "Cellular conditioning & scalp massage",
  },
  {
    id: "srv_3",
    name: "Global Hair Colour",
    category: "Hair Color",
    price: 2499,
    duration: "90 mins",
    notes: "Uniform root-to-tip ammonia-free color",
  },
  {
    id: "srv_4",
    name: "Creative Highlights & Balayage",
    category: "Hair Color",
    price: 1999,
    duration: "120 mins",
    notes: "Dimensional blonde or honey ribbons",
  },
  {
    id: "srv_7",
    name: "Jawed Habib Signature 24K Gold Facial",
    category: "Skin",
    price: 1699,
    duration: "60 mins",
    notes: "Instant luminous glow & skin detox",
  },
  {
    id: "srv_8",
    name: "Royal Hot Towel Beard Sculpting",
    category: "Grooming",
    price: 199,
    duration: "25 mins",
    notes: "Steam razor edging & argan conditioning",
  },
  {
    id: "srv_9",
    name: "Party Makeup & Glam Styling",
    category: "Makeup",
    price: 1499,
    duration: "60 mins",
    notes: "HD camera-ready base & hair setting",
  },
  {
    id: "srv_6",
    name: "Keratin Protein Treatment & Smoothening",
    category: "Hair Spa",
    price: 3499,
    duration: "150 mins",
    notes: "Ultra-silky anti-frizz fiber seal",
  },
];

const DEFAULT_TIME_SLOTS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM", "08:30 PM", "09:00 PM",
];

function formatDisplayDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function convertTo24Hour(time12h: string): string {
  const parts = time12h.split(" ");
  if (parts.length < 2) return time12h;
  const [time, modifier] = parts;
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function convertTo12Hour(time24h: string): string {
  const [hStr, mStr] = time24h.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, "0")}:${m} ${ampm}`;
}

interface AppointmentBookingSectionProps {
  initialServiceId?: string;
  onBookingSuccess?: (bookingId: string) => void;
}

export function AppointmentBookingSection({
  initialServiceId = "srv_1",
}: AppointmentBookingSectionProps) {
  const { toast } = useToast();

  // Calendar State
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // Default to tomorrow or today
  const defaultDateStr = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [selectedDate, setSelectedDate] = React.useState<string>(defaultDateStr);
  const [selectedTime, setSelectedTime] = React.useState<string>("11:30 AM");

  // Booking Form State
  const [selectedServices, setSelectedServices] = React.useState<string[]>([initialServiceId]);
  const [bookingServices, setBookingServices] = React.useState<BookingServiceItem[]>(BOOKING_SERVICES);
  const [availablePackages, setAvailablePackages] = React.useState<BookingPackageItem[]>([]);
  const [selectedPackageId, setSelectedPackageId] = React.useState<string | null>(null);
  const [customerName, setCustomerName] = React.useState<string>("");
  const [customerPhone, setCustomerPhone] = React.useState<string>("");
  const [customerEmail, setCustomerEmail] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");
  const [couponCode, setCouponCode] = React.useState<string>("WELCOME100");
  const [couponApplied, setCouponApplied] = React.useState<boolean>(true);

  // Real Backend Availability State
  const [availableDates, setAvailableDates] = React.useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = React.useState<string[]>([]);
  const [backendSlots, setBackendSlots] = React.useState<
    { time: string; endTime: string; isAvailable: boolean; conflictReason?: string }[]
  >([]);
  const [isLoadingMonth, setIsLoadingMonth] = React.useState<boolean>(false);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState<boolean>(false);

  // Status
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = React.useState<{
    appointmentNumber: string;
    date: string;
    time: string;
    total: number;
    services: string[];
    packageName?: string | null;
    customerName: string;
    whatsappUrl?: string;
  } | null>(null);

  // Fetch services and packages dynamically from database API
  React.useEffect(() => {
    let isMounted = true;
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: BookingServiceItem[] = data.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category?.name || "Salon Care",
            price: s.price,
            duration: `${s.durationMinutes} mins`,
            notes: s.description || undefined,
          }));
          setBookingServices(mapped);
          setSelectedServices((prev) => {
            const valid = prev.filter((id) => mapped.some((m) => m.id === id));
            return valid.length > 0 ? valid : [mapped[0].id];
          });
        }
      } catch (err) {
        console.error("Booking services fetch error:", err);
      }
    };

    const fetchPackages = async () => {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAvailablePackages(data.data);
        }
      } catch (err) {
        console.error("Booking packages fetch error:", err);
      }
    };

    fetchServices();
    fetchPackages();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update selected service if prop changes externally
  React.useEffect(() => {
    if (initialServiceId) {
      setSelectedServices((prev) =>
        prev.includes(initialServiceId) ? prev : [initialServiceId]
      );
    }
  }, [initialServiceId]);

  // Fetch real month availability from backend
  React.useEffect(() => {
    let isMounted = true;
    const fetchMonthData = async () => {
      const ym = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
      try {
        setIsLoadingMonth(true);
        const res = await fetch(
          `/api/appointments/availability?month=${ym}&serviceIds=${selectedServices.join(",")}`
        );
        const data = await res.json();
        if (isMounted && data.success && data.data?.month) {
          setAvailableDates(data.data.month.availableDates || []);
          setUnavailableDates(data.data.month.unavailableDates || []);
        }
      } catch (err) {
        console.error("Month availability fetch error:", err);
      } finally {
        if (isMounted) setIsLoadingMonth(false);
      }
    };

    fetchMonthData();
    return () => {
      isMounted = false;
    };
  }, [currentMonth, selectedServices]);

  // Fetch real date slots from backend
  React.useEffect(() => {
    let isMounted = true;
    const fetchSlotsData = async () => {
      try {
        setIsLoadingSlots(true);
        const res = await fetch(
          `/api/appointments/availability?date=${selectedDate}&serviceIds=${selectedServices.join(",")}`
        );
        const data = await res.json();
        if (isMounted && data.success && data.data?.slots) {
          const slots: any[] = data.data.slots.map((s: any) => ({
            time: s.time.includes("M") ? s.time : convertTo12Hour(s.time),
            endTime: s.endTime.includes("M") ? s.endTime : convertTo12Hour(s.endTime),
            isAvailable: s.isAvailable,
            conflictReason: s.conflictReason,
          }));

          setBackendSlots(slots);

          // If current selected time is unavailable, auto-pick first open slot
          const currentSlot = slots.find((s) => s.time === selectedTime);
          if (!currentSlot || !currentSlot.isAvailable) {
            const firstAvailable = slots.find((s) => s.isAvailable);
            if (firstAvailable) {
              setSelectedTime(firstAvailable.time);
            }
          }
        }
      } catch (err) {
        console.error("Date slots fetch error:", err);
      } finally {
        if (isMounted) setIsLoadingSlots(false);
      }
    };

    fetchSlotsData();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedServices, selectedTime]);

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev >= minMonth) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const todayStr = today.toISOString().split("T")[0];
    if (dateStr >= todayStr && (!unavailableDates.includes(dateStr) || availableDates.includes(dateStr))) {
      setSelectedDate(dateStr);
    }
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((s) => s !== id) : prev;
      }
      return [...prev, id];
    });
  };

  // Pricing calculations
  const chosenServices = bookingServices.filter((s) => selectedServices.includes(s.id));
  const chosenPackage = availablePackages.find((p) => p.id === selectedPackageId);
  const packagePrice = chosenPackage ? chosenPackage.price : 0;
  const subtotal = chosenServices.reduce((sum, s) => sum + s.price, 0) + packagePrice;
  const isCouponValid = couponApplied && couponCode.trim().toUpperCase() === "WELCOME100" && subtotal >= 499;
  const discount = isCouponValid ? 100 : 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "WELCOME100") {
      if (subtotal < 499) {
        toast({
          type: "error",
          title: "Minimum Order Required",
          message: "Coupon WELCOME100 requires a minimum service total of ₹499.",
        });
      } else {
        setCouponApplied(true);
        toast({
          type: "success",
          title: "Coupon WELCOME100 Applied!",
          message: "Flat ₹100 discount deducted from your reservation.",
        });
      }
    } else {
      toast({
        type: "error",
        title: "Invalid Coupon Code",
        message: "Code not recognized. Use WELCOME100 for ₹100 OFF on orders ₹499+.",
      });
    }
  };

  // Submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || customerName.trim().length < 2) {
      toast({
        type: "error",
        title: "Name Required",
        message: "Please enter your full name (minimum 2 characters).",
      });
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast({
        type: "error",
        title: "Valid Phone Required",
        message: "Please enter a valid 10-digit Indian mobile number (e.g., 7707000463).",
      });
      return;
    }

    if (selectedServices.length === 0) {
      toast({
        type: "error",
        title: "Service Required",
        message: "Please select at least one salon service.",
      });
      return;
    }

    // Verify selected slot is available in backend
    const currentBackendSlot = backendSlots.find((s) => s.time === selectedTime);
    if (currentBackendSlot && !currentBackendSlot.isAvailable) {
      toast({
        type: "error",
        title: "Slot Unavailable",
        message: "The selected time slot is already booked. Please choose an open slot.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const time24h = convertTo24Hour(selectedTime);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim() || undefined,
          serviceIds: selectedServices,
          packageId: selectedPackageId || undefined,
          appointmentDate: selectedDate,
          startTime: time24h,
          couponCode: isCouponValid ? couponCode.trim().toUpperCase() : undefined,
          notes: notes.trim() || undefined,
          source: "ONLINE_WEBSITE",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          type: "error",
          title: "Reservation Unsuccessful",
          message: data.error || "Could not reserve slot. Please select another time or call salon.",
        });
        setIsSubmitting(false);
        return;
      }

      setConfirmedBooking({
        appointmentNumber: data.data.appointmentNumber || `JH-LLG-${Date.now().toString().slice(-6)}`,
        date: selectedDate,
        time: selectedTime,
        total,
        services: chosenServices.map((s) => s.name),
        packageName: chosenPackage?.name || null,
        customerName: customerName.trim(),
        whatsappUrl: data.data.whatsappUrl,
      });

      toast({
        type: "success",
        title: "Appointment Reserved Successfully!",
        message: "Your booking request is registered and pending confirmation.",
      });
    } catch (err) {
      console.error("Booking submission error:", err);
      toast({
        type: "error",
        title: "Network Issue",
        message: "Failed to connect to salon booking desk. Please retry or WhatsApp us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedSlots = backendSlots.length > 0
    ? backendSlots
    : DEFAULT_TIME_SLOTS.map((t) => ({ time: t, endTime: t, isAvailable: true }));

  return (
    <div id="appointment" className="scroll-mt-24">
      {/* If booking confirmed, show luxury receipt card with prefilled WhatsApp integration */}
      {confirmedBooking ? (
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-salon-gold/60 bg-gradient-to-b from-zinc-950 via-salon-richBlack to-black p-8 text-center shadow-[0_0_50px_rgba(198,165,107,0.2)] animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-950/40 text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <span className="mt-4 inline-block font-sans text-xs uppercase tracking-widest text-salon-gold">
            Booking Received • Pending Salon Confirmation
          </span>
          <h3 className="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
            We Look Forward to Welcoming You
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            Thank you, <span className="font-semibold text-white">{confirmedBooking.customerName}</span>. Your appointment has been recorded at <span className="text-salon-gold font-semibold">The Jawed Habib Salon, Lalganj</span>.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 text-left text-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-zinc-400">Booking Reference:</span>
              <span className="font-mono font-bold text-salon-goldLight">
                {confirmedBooking.appointmentNumber}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-zinc-400">Date & Slot:</span>
              <span className="font-semibold text-white">
                {formatDisplayDate(confirmedBooking.date)} at {confirmedBooking.time}
              </span>
            </div>
            <div className="border-b border-zinc-800 pb-3">
              <span className="text-zinc-400 block mb-1">Reserved Services:</span>
              <ul className="list-inside list-disc space-y-0.5 text-xs text-zinc-300">
                {confirmedBooking.services.map((srv, idx) => (
                  <li key={idx}>{srv}</li>
                ))}
              </ul>
            </div>
            {confirmedBooking.packageName && (
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-zinc-400">Curated Package:</span>
                <span className="font-semibold text-salon-gold">
                  {confirmedBooking.packageName}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-zinc-400">Payment Option:</span>
              <span className="font-medium text-emerald-400">
                Pay In-Person at Salon Post-Service
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-zinc-400">Estimated Total:</span>
              <span className="font-serif text-lg font-bold text-salon-gold">
                ₹{confirmedBooking.total}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={
                confirmedBooking.whatsappUrl ||
                `https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=${encodeURIComponent(
                  `Hello The Jawed Habib Salon Lalganj!\n\nI have booked an appointment:\n• Reference: ${confirmedBooking.appointmentNumber}\n• Customer: ${confirmedBooking.customerName}\n• Date: ${confirmedBooking.date}\n• Time: ${confirmedBooking.time}\n\nKindly confirm.`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" className="w-full gap-2 border-emerald-600/50 text-emerald-400 hover:bg-emerald-950/40">
                <MessageCircle className="h-4 w-4" />
                <span>Confirm on WhatsApp</span>
              </Button>
            </a>
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmedBooking(null);
                setCustomerName("");
                setCustomerPhone("");
                setSelectedPackageId(null);
                setNotes("");
              }}
              className="w-full sm:w-auto text-xs"
            >
              Book Another Service
            </Button>
          </div>

          <div className="mt-6 border-t border-zinc-900 pt-4 text-xs text-zinc-500">
            1st Floor, Tinpulwa Chowk, Above Killer Showroom, Opposite Manglam Mart, Lalganj • Desk: +91 {BRAND_CONFIG.contact.primaryPhone}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================== */}
          {/* SECTION 04: APPOINTMENT CALENDAR WIDGET */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 rounded-2xl border border-salon-borderBlack bg-gradient-to-b from-zinc-900/90 to-black p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-salon-gold/50 bg-salon-gold/10 text-salon-gold">
                  <CalendarIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Select Appointment Date
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Step 1: Choose real verified date & slot
                  </p>
                </div>
              </div>
              <Badge variant="gold" className="text-[10px] uppercase tracking-wider">
                10 AM – 10 PM
              </Badge>
            </div>

            {/* Operating Hours Banner */}
            <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3.5 py-2 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 text-salon-goldLight">
                <Clock className="h-3.5 w-3.5 text-salon-gold" />
                Mon – Sun: 10:00 AM – 10:00 PM
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open All 7 Days
              </span>
            </div>

            {/* Month Header Navigation */}
            <div className="mt-5 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-semibold text-white">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                {isLoadingMonth && <Loader2 className="h-3.5 w-3.5 animate-spin text-salon-gold" />}
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-salon-gold hover:text-white transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-salon-gold hover:text-white transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Day Names Grid */}
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Days */}
            <div className="mt-2 grid grid-cols-7 gap-1.5 text-sm">
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-9 w-full" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const todayStr = today.toISOString().split("T")[0];
                const isPast = dateStr < todayStr;
                const isExplicitlyUnavailable = unavailableDates.includes(dateStr);
                const isExplicitlyAvailable = availableDates.includes(dateStr);
                const isDisabled = isPast || (availableDates.length > 0 && !isExplicitlyAvailable);
                const isSelected = dateStr === selectedDate;
                const isTodayDate = dateStr === todayStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "flex h-9 w-full flex-col items-center justify-center rounded-lg font-medium transition-all relative text-xs",
                      isDisabled && "cursor-not-allowed text-zinc-700 bg-zinc-950/40 line-through decoration-zinc-800",
                      !isDisabled && !isSelected && "text-zinc-300 hover:border-salon-gold/50 hover:bg-zinc-800/80 hover:text-white border border-transparent",
                      isSelected && "bg-salon-gold text-black font-bold shadow-[0_0_15px_rgba(198,165,107,0.4)]",
                      isTodayDate && !isSelected && "border border-salon-gold/60 text-salon-gold font-bold"
                    )}
                  >
                    <span>{day}</span>
                    {!isDisabled && (
                      <span
                        className={cn(
                          "h-1 w-1 rounded-full absolute bottom-1",
                          isSelected ? "bg-black" : "bg-emerald-400"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Available Time Slots Header */}
            <div className="mt-6 border-t border-zinc-800/80 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  Time Slots for {formatDisplayDate(selectedDate)}
                  {isLoadingSlots && <Loader2 className="h-3 w-3 animate-spin text-salon-gold" />}
                </span>
                <span className="text-[11px] text-salon-gold">30m intervals</span>
              </div>

              {/* Time Slots Chips Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {displayedSlots.map((slot) => {
                  const isSelected = slot.time === selectedTime;
                  const isAvailable = slot.isAvailable;

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedTime(slot.time)}
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-medium transition-all border text-center relative",
                        !isAvailable && "cursor-not-allowed border-zinc-800/60 bg-zinc-950/40 text-zinc-600 line-through",
                        isAvailable && !isSelected && "border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:border-zinc-700 hover:text-white",
                        isSelected && isAvailable && "border-salon-gold bg-salon-gold/20 text-salon-gold font-bold shadow-[0_0_10px_rgba(198,165,107,0.25)]"
                      )}
                    >
                      <span>{slot.time}</span>
                      {!isAvailable && (
                        <span className="block text-[9px] text-zinc-600 font-normal">Booked</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Date & Slot Preview Indicator */}
            <div className="mt-5 rounded-xl border border-salon-gold/30 bg-salon-gold/5 p-3 text-xs flex items-center justify-between text-zinc-300">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-salon-gold block">
                  Chosen Time Window
                </span>
                <span className="font-semibold text-white">
                  {formatDisplayDate(selectedDate)} • {selectedTime}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Check className="h-3 w-3" /> Slot Verified
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 05: SINGLE-SCREEN APPOINTMENT RESERVATION FORM */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 rounded-2xl border border-salon-borderBlack bg-gradient-to-b from-zinc-950 via-salon-richBlack to-black p-6 sm:p-8 shadow-2xl">
            <div className="border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-salon-gold/50 bg-salon-gold/10 text-salon-gold">
                  <Scissors className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    Appointment Reservation Form
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Step 2: Pick services & confirm reservation in Lalganj
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="mt-6 space-y-6">
              {/* Service Selection Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Select Services ({selectedServices.length} Selected)
                  </label>
                  <span className="text-[11px] text-zinc-500">Tap to toggle</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {bookingServices.map((srv) => {
                    const isSelected = selectedServices.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={cn(
                          "cursor-pointer rounded-xl border p-3 transition-all flex items-start justify-between gap-2 select-none",
                          isSelected
                            ? "border-salon-gold bg-salon-gold/10 shadow-[0_0_12px_rgba(198,165,107,0.15)]"
                            : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className={cn("text-xs font-semibold line-clamp-1", isSelected ? "text-white" : "text-zinc-300")}>
                            {srv.name}
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {srv.duration} • {srv.category}
                          </span>
                        </div>
                        <span className={cn("font-serif text-xs font-bold whitespace-nowrap", isSelected ? "text-salon-gold" : "text-zinc-400")}>
                          ₹{srv.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Package (If applicable) */}
              {availablePackages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-salon-gold" />
                      <span>Selected Package (Optional)</span>
                    </label>
                    {selectedPackageId && (
                      <button
                        type="button"
                        onClick={() => setSelectedPackageId(null)}
                        className="text-[11px] text-zinc-400 hover:text-salon-gold transition-colors"
                      >
                        Remove Package
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availablePackages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() =>
                            setSelectedPackageId(isSelected ? null : pkg.id)
                          }
                          className={cn(
                            "cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between select-none relative",
                            isSelected
                              ? "border-salon-gold bg-salon-gold/15 shadow-[0_0_15px_rgba(198,165,107,0.2)]"
                              : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className={cn("text-xs font-bold block", isSelected ? "text-white" : "text-zinc-200")}>
                                {pkg.name}
                              </span>
                              <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                                {pkg.description}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={cn("font-serif text-xs font-bold block", isSelected ? "text-salon-gold" : "text-zinc-300")}>
                                ₹{pkg.price}
                              </span>
                              {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                <span className="text-[10px] text-zinc-500 line-through">
                                  ₹{pkg.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800/60 pt-2">
                            <span>{pkg.durationMinutes} mins duration</span>
                            <span className={cn("font-semibold flex items-center gap-1", isSelected ? "text-salon-gold" : "text-zinc-500")}>
                              {isSelected ? "Selected ✓" : "Tap to Add"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Client Personal Information Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Full Name <span className="text-salon-gold">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Singh / Rajesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Mobile Number (10 Digits) <span className="text-salon-gold">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 7707000463"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="For booking receipt & reminders"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Special Requests / Hair Concerns
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. Sensitive scalp, bridal trial"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Bar */}
              <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-salon-gold flex-shrink-0" />
                  <span className="text-zinc-300">
                    Promo Code: <span className="font-mono font-bold text-salon-goldLight">WELCOME100</span> (₹100 OFF on orders ₹499+)
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-28 rounded-lg border border-zinc-700 bg-black px-2.5 py-1.5 text-xs text-center font-mono uppercase text-salon-goldLight focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleApplyCoupon}
                    className="text-xs border border-zinc-700 hover:border-salon-gold"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Order Summary & Pricing Calculation */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Selected Date & Time:</span>
                  <span className="font-semibold text-white">
                    {formatDisplayDate(selectedDate)} at {selectedTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Services Subtotal:</span>
                  <span className="font-semibold text-white">₹{chosenServices.reduce((sum, s) => sum + s.price, 0)}</span>
                </div>
                {chosenPackage && (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Selected Package ({chosenPackage.name}):</span>
                    <span className="font-semibold text-salon-gold">₹{chosenPackage.price}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Discount (WELCOME100):</span>
                    <span className="font-semibold">- ₹{discount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-sm">
                  <span className="font-semibold text-white">Pay at Salon (Post Service):</span>
                  <span className="font-serif text-lg font-bold text-salon-gold">
                    ₹{total}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center gap-2 py-6 text-sm font-bold shadow-[0_0_20px_rgba(198,165,107,0.3)]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    Registering Your Slot...
                  </span>
                ) : (
                  <>
                    <CalendarIcon className="h-4 w-4" />
                    <span>Confirm Appointment Reservation</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-salon-gold" />
                  Zero Cancellation Penalty
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Instant Confirmation
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-salon-gold" />
                  Pay In-Person Post Service
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
