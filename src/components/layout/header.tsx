"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  Calendar,
  Menu,
  X,
  Clock,
  MapPin,
  Instagram,
  User,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { siteConfig } from "@/config/site";
import { Button, buttonVariants } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [cms, setCms] = React.useState<Record<string, string>>({});
  const pathname = usePathname();

  React.useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) setCms(j.data);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change, lock body scroll, and listen for Escape key
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", href);
      }
    }
  };

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", href);
        }, 150);
      }
    }
  };

  const announcementText = cms.header_announcement || "✨ Wedding Season Booking Open • Reserve Your Bridal Suite in Lalganj with Instant Advance Confirmation";
  const ctaLabel = cms.header_cta_label || "Book Appointment";
  const ctaLink = cms.header_cta_link || "/booking";
  const primaryPhone = cms.primary_phone || BRAND_CONFIG.contact.primaryPhone;
  const openingHours = cms.opening_hours || BRAND_CONFIG.hours.display;

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Luxury Announcement Bar */}
      <div className="hidden border-b border-zinc-800/80 bg-zinc-950/95 py-1.5 text-xs text-zinc-400 md:block backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-6 min-w-0">
            <span className="flex items-center gap-1.5 text-salon-goldLight truncate max-w-lg">
              <Sparkles className="h-3.5 w-3.5 text-salon-gold shrink-0" />
              <span className="truncate">{announcementText}</span>
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300 shrink-0">
              <Clock className="h-3.5 w-3.5 text-salon-gold" />
              {openingHours}
            </span>
          </div>
          <div className="flex items-center space-x-5 shrink-0">
            <a
              href={BRAND_CONFIG.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-salon-gold"
              title="Official Instagram"
            >
              <Instagram className="h-3.5 w-3.5 text-salon-gold" />
              <span>{BRAND_CONFIG.contact.instagramHandle}</span>
            </a>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center space-x-3">
              <span className="text-[11px] text-zinc-400">Desk:</span>
              <a
                href={`tel:+91${primaryPhone}`}
                className="flex items-center gap-1 font-semibold text-salon-gold hover:underline"
              >
                <Phone className="h-3 w-3" />
                <span>+91 {primaryPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={cn(
          "w-full border-b transition-all duration-300",
          scrolled
            ? "border-salon-gold/30 bg-salon-black/95 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md"
            : "border-salon-borderBlack/60 bg-salon-black/85 backdrop-blur-sm"
        )}
      >
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center">
            <BrandLogo
              variant="primary"
              size="md"
              showBranch
              priority
              className="hover:scale-[1.02] transition-transform"
            />
          </div>

          {/* Desktop Navigation Links (7 Essential Destinations) */}
          <nav className="hidden lg:flex items-center space-x-6">
            {siteConfig.mainNav.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    "text-xs uppercase font-medium tracking-wider transition-colors py-1 relative",
                    isActive
                      ? "text-salon-gold font-semibold"
                      : "text-zinc-300 hover:text-salon-gold"
                  )}
                >
                  {item.title}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-salon-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <a
              href={`https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=Hello%20The%20Jawed%20Habib%20Salon%20Lalganj%2C%20I%20would%20like%20to%20consult%20regarding%20bridal%2Fhair%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-emerald-800/40"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp Consult</span>
            </a>
            <Link
              href={ctaLink}
              className={cn(buttonVariants({ variant: "gold", size: "default" }), "gap-2 shadow-md")}
            >
              <Calendar className="h-4 w-4" />
              <span>{ctaLabel}</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 hover:text-white lg:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-20 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation-drawer"
            className="fixed inset-x-0 top-20 z-50 border-b border-salon-borderBlack bg-salon-black/98 px-5 py-6 backdrop-blur-2xl lg:hidden max-h-[calc(100vh-5rem)] overflow-y-auto animate-in slide-in-from-top-4 duration-200 shadow-2xl pb-[calc(2rem+env(safe-area-inset-bottom,0px))]"
          >
          {/* Mobile Drawer Brand Header */}
          <div className="pb-4 mb-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div onClick={() => setMobileMenuOpen(false)}>
              <BrandLogo variant="primary" size="sm" showBranch />
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex flex-col space-y-2">
            {siteConfig.mainNav.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleMobileNavClick(e, item.href)}
                  className={cn(
                    "text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-between",
                    isActive
                      ? "bg-salon-gold/15 text-salon-gold font-semibold border-l-2 border-salon-gold"
                      : "text-zinc-200 hover:bg-zinc-900 hover:text-salon-gold"
                  )}
                >
                  <span>{item.title}</span>
                  {isActive && <Sparkles className="h-3.5 w-3.5 text-salon-gold" />}
                </Link>
              );
            })}

            {/* Secondary Destinations in Mobile Drawer */}
            <div className="pt-2 pb-1 border-t border-zinc-800/80 my-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 px-3">
                More Salon Options
              </span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {siteConfig.secondaryNav?.map((sec) => (
                  <Link
                    key={sec.href}
                    href={sec.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-zinc-300 hover:text-salon-gold px-3 py-1.5 rounded-md hover:bg-zinc-900/60"
                  >
                    {sec.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
              <Link
                href={ctaLink}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(buttonVariants({ variant: "gold" }), "w-full justify-center gap-2")}
              >
                <Calendar className="h-4 w-4" />
                <span>Book Appointment</span>
              </Link>
              <a
                href={`https://wa.me/91${BRAND_CONFIG.contact.whatsappPhone}?text=Hello%20The%20Jawed%20Habib%20Salon%20Lalganj%2C%20I%20would%20like%20to%20consult%20regarding%20bridal%2Fhair%20services.`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "w-full justify-center gap-2 text-xs text-emerald-400 border border-emerald-800/40"
                )}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp Consultation</span>
              </a>

              <div className="pt-3 border-t border-zinc-800/80 space-y-2 text-xs text-zinc-400">
                <div className="flex items-center justify-between">
                  <span>Primary Desk:</span>
                  <a
                    href={`tel:+91${BRAND_CONFIG.contact.primaryPhone}`}
                    className="text-salon-gold font-semibold"
                  >
                    +91 {BRAND_CONFIG.contact.primaryPhone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hours:</span>
                  <span>10:00 AM – 10:00 PM (All 7 Days)</span>
                </div>
              </div>
            </div>
          </nav>
        </div>
        </>
      )}
    </header>
  );
}
