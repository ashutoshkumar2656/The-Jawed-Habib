"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, MapPin, Clock, Instagram, ExternalLink, ShieldCheck, Heart } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { siteConfig } from "@/config/site";
import { BrandLogo } from "@/components/ui/brand-logo";

export function Footer() {
  const [cms, setCms] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) setCms(j.data);
      })
      .catch(() => {});
  }, []);

  const businessIntro = cms.business_introduction || "The Jawed Habib Salon – Lalganj delivers an exceptional luxury grooming experience in the heart of Vaishali. Led by seasoned master stylists trained in Habib precision techniques, we combine international aesthetics with tailor-made haircare and skin therapies.";
  const physicalAddress = cms.physical_address || `${BRAND_CONFIG.location.addressLine1}, ${BRAND_CONFIG.location.landmark}, ${BRAND_CONFIG.location.city}, ${BRAND_CONFIG.location.state} – ${BRAND_CONFIG.location.pinCode}`;
  const openingHours = cms.opening_hours || "Monday to Sunday: 10:00 AM – 10:00 PM (Open all 7 days)";
  const primaryPhone = cms.primary_phone || BRAND_CONFIG.contact.primaryPhone;
  const secondaryPhone = cms.secondary_phone || BRAND_CONFIG.contact.secondaryPhone;
  const tertiaryPhone = cms.tertiary_phone || BRAND_CONFIG.contact.tertiaryPhone;
  const mapsUrl = cms.google_maps_url || BRAND_CONFIG.location.googleMapsUrl;
  const instaUrl = cms.instagram_url || BRAND_CONFIG.contact.instagramUrl;
  const footerDisclaimer = cms.footer_content || `© ${new Date().getFullYear()} ${BRAND_CONFIG.fullName}. All rights reserved.`;

  return (
    <footer className="border-t border-salon-borderBlack bg-salon-richBlack text-zinc-400">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <BrandLogo variant="primary" size="lg" showBranch />
            <p className="text-sm leading-relaxed text-zinc-400">
              {businessIntro}
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-salon-gold hover:border-salon-gold hover:bg-salon-gold hover:text-black transition-all"
                aria-label="Official Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-salon-gold hover:border-salon-gold hover:bg-salon-gold hover:text-black transition-all"
                aria-label="Google Maps Location"
              >
                <MapPin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Explore Salon
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-salon-gold transition-colors font-medium text-zinc-300">
                  About Our Salon &amp; Heritage
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-salon-gold transition-colors font-medium text-zinc-300">
                  Contact Front Desk &amp; Location
                </Link>
              </li>
              <li>
                <Link href="/bridal" className="hover:text-salon-gold transition-colors font-medium text-salon-goldLight">
                  Bridal Suites &amp; Wedding Makeup
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-salon-gold transition-colors">
                  Service Menu &amp; Categories
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-salon-gold transition-colors">
                  Curated Packages &amp; Bundles
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-salon-gold transition-colors">
                  Transparent Pricing &amp; Rates
                </Link>
              </li>
              <li>
                <Link href="/transformations" className="hover:text-salon-gold transition-colors">
                  Before &amp; After Transformations
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-salon-gold transition-colors">
                  Salon Ambience &amp; Stations
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-salon-gold transition-colors">
                  Customer Reviews &amp; Testimonials
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-salon-gold transition-colors">
                  Our Master Stylists &amp; Team
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-salon-gold transition-colors">
                  Special Packages &amp; Discounts
                </Link>
              </li>
              <li>
                <Link href="/consultation" className="hover:text-salon-gold transition-colors">
                  Personalized Consultation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-salon-gold transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Direct Contact
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 mt-1 text-salon-gold flex-shrink-0" />
                <div className="flex flex-col space-y-1">
                  {[primaryPhone, secondaryPhone, tertiaryPhone].filter(Boolean).map((phone) => (
                    <a
                      key={phone}
                      href={`tel:+91${phone}`}
                      className="hover:text-salon-gold transition-colors font-medium text-zinc-300 font-mono"
                    >
                      +91 {phone}
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <Clock className="h-4 w-4 text-salon-gold flex-shrink-0" />
                <span>{openingHours}</span>
              </div>
              <p className="text-[11px] text-salon-gold font-medium">Open All 7 Days of the Week</p>
            </div>
          </div>

          {/* Column 4: Salon Location */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Lalganj Location
            </h4>
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="h-4 w-4 mt-1 text-salon-gold flex-shrink-0" />
              <address className="not-italic leading-relaxed text-zinc-300">
                {physicalAddress}
              </address>
            </div>
            <div className="pt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-salon-gold hover:text-salon-goldLight"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-zinc-800/80 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex flex-col items-center md:items-start space-y-1 text-center md:text-left">
            <p>
              {footerDisclaimer}
            </p>
            <p className="text-[11px] text-zinc-400">
              Designed &amp; Developed by{" "}
              <a
                href="https://axivontech.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-salon-gold hover:text-salon-goldLight transition-colors font-medium underline-offset-4 hover:underline"
              >
                Axivon Technologies
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <Link href="/about" className="hover:text-salon-gold transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-salon-gold transition-colors">
              Contact Us
            </Link>
            <Link href="/pricing" className="hover:text-salon-gold transition-colors">
              Pricing Details
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-salon-gold transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-salon-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cancellation-refund-policy" className="hover:text-salon-gold transition-colors">
              Cancellation &amp; Refund Policy
            </Link>
            <Link href="/shipping-delivery-policy" className="hover:text-salon-gold transition-colors">
              Shipping &amp; Delivery Policy
            </Link>
            <Link href="/booking" className="hover:text-salon-gold transition-colors">
              Online Booking
            </Link>
            <Link href="/admin/login" className="flex items-center gap-1 text-zinc-500 hover:text-salon-gold transition-colors">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
