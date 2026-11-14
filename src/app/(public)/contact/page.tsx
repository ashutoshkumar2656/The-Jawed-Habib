"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import {
  Phone,
  MapPin,
  Clock,
  Instagram,
  ExternalLink,
  Send,
  Calendar,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [service, setService] = React.useState("Haircut & Styling");
  const [message, setMessage] = React.useState("");
  const [honey, setHoney] = React.useState("");
  const [referenceId, setReferenceId] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast({
        type: "error",
        title: "Required Fields Missing",
        message: "Please enter your name and 10-digit mobile number.",
      });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast({
        type: "error",
        title: "Invalid Phone Number",
        message: "Please enter a valid 10-digit Indian phone number.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          serviceInterest: service,
          type: "GENERAL",
          source: "Website Contact Form",
          message: message.trim() || "Enquiry from Lalganj contact page.",
          _honey: honey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          type: "error",
          title: "Submission Failed",
          message: data.error || "Could not submit inquiry. Please try again.",
        });
        return;
      }

      setReferenceId(data.data?.enquiryNumber || data.data?.id || null);
      setSubmitted(true);
      toast({
        type: "success",
        title: "Inquiry Received!",
        message: `Thank you, ${name}. Our salon concierge will contact you at ${phone} shortly.`,
      });
    } catch {
      toast({
        type: "error",
        title: "Connection Error",
        message: "Failed to connect to inquiry server. Please call 7707000463 directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-salon-black text-salon-ivory min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Contact Us & Location" }]} />

        {/* 1. Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold">Direct Salon Concierge</Badge>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Contact The Jawed Habib Salon in Lalganj, Vaishali
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light">
            Located conveniently on Tinpulwa Chowk above Killer Showroom. Walk in, call our desk, or submit your enquiry below.
          </p>
        </div>

        {/* 2. Contact Details & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Salon Facts, Coordinates, Hours */}
          <div className="space-y-6">
            <div className="luxury-card rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 space-y-6">
              <h2 className="font-serif text-xl font-bold text-white border-b border-zinc-800 pb-3">
                Lalganj Branch Address &amp; Operating Hours
              </h2>

              <div className="space-y-5 text-xs sm:text-sm">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-5 w-5 text-salon-gold mt-1 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">Physical Address</h4>
                    <p className="text-zinc-300 leading-relaxed">
                      {BRAND_CONFIG.location.fullAddress}
                    </p>
                    <p className="text-[11px] text-salon-gold pt-0.5">
                      Landmark: Above Killer Showroom, Opposite Manglam Mart
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 border-t border-zinc-800/80 pt-4">
                  <Phone className="h-5 w-5 text-salon-gold mt-1 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">Direct Phone Lines</h4>
                    <div className="space-y-1.5">
                      {BRAND_CONFIG.contact.phones.map((p, idx) => (
                        <div key={p} className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-500">
                            {idx === 0 ? "Primary Desk:" : idx === 1 ? "Support Line 2:" : "Support Line 3:"}
                          </span>
                          <a
                            href={`tel:+91${p}`}
                            className="font-bold text-salon-gold hover:underline"
                          >
                            +91 {p}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 border-t border-zinc-800/80 pt-4">
                  <Clock className="h-5 w-5 text-salon-gold mt-1 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">Operating Timings</h4>
                    <p className="text-zinc-300">{BRAND_CONFIG.hours.display}</p>
                    <span className="inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                      Open All 7 Days of the Week
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-4 border-t border-zinc-800/80 pt-4">
                  <Instagram className="h-5 w-5 text-salon-gold mt-1 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">Official Social Media</h4>
                    <a
                      href={BRAND_CONFIG.contact.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-salon-gold hover:underline flex items-center gap-1"
                    >
                      <span>{BRAND_CONFIG.contact.instagramHandle}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <a
                  href={BRAND_CONFIG.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "gold" }), "w-full gap-2 text-xs")}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="luxury-card rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="font-serif text-xl font-bold text-white">
                Send an Online Inquiry to Front Desk
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Have a question regarding bridal bookings, pricing, or custom packages?
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="h-14 w-14 rounded-full bg-emerald-950/80 border border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-white">
                  Message Sent Successfully!
                </h4>
                {referenceId && (
                  <div className="inline-block px-3 py-1 rounded bg-zinc-900 border border-salon-gold/40 text-[11px] font-mono text-salon-gold">
                    Enquiry Ref: {referenceId}
                  </div>
                )}
                <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{name}</span>. Our salon manager will get in touch with you shortly at{" "}
                  <span className="text-salon-gold font-semibold">{phone}</span>.
                </p>
                <Button
                  variant="goldOutline"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage("");
                    setReferenceId(null);
                  }}
                  className="mt-4 text-xs"
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Anti-spam honeypot */}
                <input
                  type="text"
                  name="_honey"
                  value={honey}
                  onChange={(e) => setHoney(e.target.value)}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold tracking-wider text-zinc-300">
                    Your Full Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold tracking-wider text-zinc-300">
                    Mobile Number (10 Digits) *
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold tracking-wider text-zinc-300">
                    Service of Interest
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-salon-borderBlack bg-zinc-950/70 px-3 py-2 text-xs text-salon-ivory focus-visible:outline-none focus-visible:border-salon-gold"
                  >
                    <option value="Haircut & Styling">Haircut & Texture Styling</option>
                    <option value="Hair Spa & Treatments">L&apos;Oréal Hair Spa & Keratin</option>
                    <option value="Hair Colour">Hair Colour & Highlights</option>
                    <option value="24K Gold Facial">Skin Facials & D-Tan</option>
                    <option value="Bridal Makeover">Bridal & Engagement Packages</option>
                    <option value="Men Grooming">Men&apos;s Royal Grooming</option>
                    <option value="Other">Other Query</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold tracking-wider text-zinc-300">
                    Your Message / Specific Requirements
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your hair type, desired timing, or event date..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex w-full rounded-md border border-salon-borderBlack bg-zinc-950/70 px-3 py-2 text-xs text-salon-ivory focus-visible:outline-none focus-visible:border-salon-gold"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="gold" size="lg" className="w-full gap-2 text-xs">
                    <Send className="h-4 w-4" />
                    <span>Submit Inquiry</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* 3. Interactive Embedded Map Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-salon-gold" />
              <span>Location on Map</span>
            </h2>
            <a
              href={BRAND_CONFIG.location.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-salon-gold hover:underline flex items-center gap-1"
            >
              <span>Open in Google Maps App</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="w-full h-80 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14364.551608678672!2d85.1664!3d25.8675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed57f74c76a74b%3A0xb3a2296d9f3f4e24!2sTinpulwa%20Chowk%2C%20Lalganj%2C%20Bihar%20844121!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The Jawed Habib Salon Lalganj Map"
            />
          </div>
        </div>

        {/* 4. Operating Hours & Visiting Guidelines */}
        <div className="luxury-card rounded-2xl border border-zinc-800 bg-zinc-950/70 p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Clock className="h-4 w-4 text-salon-gold" />
            <h2 className="font-serif text-lg font-bold text-white">
              Visiting Guidelines &amp; Operating Schedule
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-300">
            <div className="space-y-1.5 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <span className="text-salon-gold font-bold uppercase tracking-wider text-[11px] block">
                Regular Hours
              </span>
              <p className="font-semibold text-white">Monday – Sunday: 10:00 AM – 10:00 PM</p>
              <p className="text-zinc-400 text-[11px]">We operate on all 7 days without weekday closures.</p>
            </div>
            <div className="space-y-1.5 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <span className="text-salon-gold font-bold uppercase tracking-wider text-[11px] block">
                Walk-ins Welcome
              </span>
              <p className="font-semibold text-white">Walk-in or Prior Booking</p>
              <p className="text-zinc-400 text-[11px]">Walk-ins served based on chair availability; advance booking recommended on weekends.</p>
            </div>
            <div className="space-y-1.5 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <span className="text-salon-gold font-bold uppercase tracking-wider text-[11px] block">
                Parking & Accessibility
              </span>
              <p className="font-semibold text-white">Tinpulwa Chowk Main Market</p>
              <p className="text-zinc-400 text-[11px]">1st Floor location with direct street stair access above Killer Showroom.</p>
            </div>
          </div>
        </div>

        {/* 5. Booking CTA Banner */}
        <div className="rounded-2xl border border-salon-gold/40 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-8 sm:p-12 text-center space-y-5">
          <Badge variant="gold">Fast Reservation</Badge>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
            Plan Your Salon Visit in Advance
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Skip the waiting room. Reserve your styling chair and preferred master stylist online in less than 2 minutes.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/booking"
              className={cn(buttonVariants({ variant: "gold", size: "lg" }), "gap-2 text-xs font-semibold")}
            >
              <Calendar className="h-4 w-4" />
              <span>Book Appointment Online</span>
            </Link>
            <a
              href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "text-xs")}
            >
              Call Direct: +91 {BRAND_CONFIG.contact.primaryPhone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
