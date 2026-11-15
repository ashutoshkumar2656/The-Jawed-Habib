"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  Phone,
  Plus,
  ExternalLink,
  MapPin,
  ChevronRight,
  CalendarCheck,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { useAdminNav } from "@/components/layout/admin-nav-context";

// Map paths to readable breadcrumb titles
const pathTitleMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Overview",
  bookings: "Bookings",
  appointments: "Bookings",
  services: "Services & Packages",
  customers: "Customers",
  payments: "Payments & Ledger",
  content: "Website CMS",
  media: "Media Library",
  calendar: "Calendar & Availability",
  reports: "Reports & Analytics",
  settings: "Salon Settings",
  razorpay: "Razorpay Gateway",
  bridal: "Bridal",
};

export function AdminTopbar() {
  const pathname = usePathname();
  const { toggleMobileOpen } = useAdminNav();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(2);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network failure on logout
    } finally {
      window.location.href = "/admin/login";
    }
  };

  // Compute breadcrumb segments
  const pathSegments = React.useMemo(() => {
    if (!pathname) return [];
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const title = pathTitleMap[seg] || (seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "));
      return { title, href, isLast: idx === segments.length - 1 };
    });
  }, [pathname]);

  const notifications = [
    {
      id: "n1",
      title: "New Online Bridal Booking",
      time: "10 mins ago",
      desc: "Priya Sharma reserved Royal Rajputana Suite for 2026-11-20.",
      type: "booking",
    },
    {
      id: "n2",
      title: "Advance Payment Verified",
      time: "25 mins ago",
      desc: "₹1,000 online advance captured for booking JH-LAL-2026-000131.",
      type: "payment",
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-salon-borderBlack bg-salon-richBlack/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu Toggle + Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={toggleMobileOpen}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-salon-gold/50 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center space-x-1.5 text-xs text-zinc-400">
          {pathSegments.map((seg, i) => (
            <React.Fragment key={seg.href}>
              {i > 0 && <ChevronRight className="h-3 w-3 text-zinc-600 shrink-0" />}
              {seg.isLast ? (
                <span className="font-semibold text-white truncate max-w-[150px]">{seg.title}</span>
              ) : (
                <Link href={seg.href} className="hover:text-salon-gold transition-colors truncate max-w-[120px]">
                  {seg.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Live Branch Status Indicator */}
      <div className="hidden xl:flex items-center space-x-2 text-xs">
        <div className="flex items-center space-x-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 font-medium text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Lalganj Branch • Open 10:00 AM – 10:00 PM (All 7 Days)</span>
        </div>
      </div>

      {/* Right: Quick Actions & Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Support Direct Line */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-zinc-400 border-r border-zinc-800 pr-3">
          <Phone className="h-3.5 w-3.5 text-salon-gold shrink-0" />
          <span className="font-mono">{BRAND_CONFIG.contact.primaryPhone}</span>
        </div>

        {/* Quick New Booking Button */}
        <Link href="/admin/bookings?action=new">
          <Button variant="gold" size="sm" className="h-8 gap-1.5 text-xs shadow-md">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Booking</span>
          </Button>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-salon-gold/50 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-salon-gold text-[10px] font-bold text-black">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Live Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] text-salon-gold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-2.5 text-xs space-y-1 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{n.title}</span>
                      <span className="text-[10px] text-zinc-500">{n.time}</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin User Badge */}
        <Link
          href="/admin/settings"
          className="flex items-center space-x-2 border-l border-zinc-800 pl-2.5 hover:opacity-85 transition-opacity"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-salon-gold/20 border border-salon-gold/40 text-salon-gold font-serif text-xs font-bold">
            M
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-medium text-white leading-tight">Salon Manager</p>
            <p className="text-[9px] text-salon-gold font-mono tracking-wider">SUPER_ADMIN</p>
          </div>
        </Link>

        {/* Public Website Link */}
        <Link
          href="/"
          target="_blank"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-salon-gold/50 transition-colors"
          title="Open Public Website in New Tab"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-red-400 hover:border-red-900/50 transition-colors"
          title="Sign Out of Salon Admin"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
