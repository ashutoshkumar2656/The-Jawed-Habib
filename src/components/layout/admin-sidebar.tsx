"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Crown,
  Users,
  CreditCard,
  FileText,
  Image as ImageIcon,
  CalendarDays,
  FileSpreadsheet,
  Settings,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useAdminNav } from "@/components/layout/admin-nav-context";

interface NavItem {
  title: string;
  shortTitle?: string;
  href: string;
  matchPrefixes?: string[];
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  group: "OPERATIONS" | "SERVICES & CLIENTS" | "MARKETING & CMS" | "SYSTEM";
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    shortTitle: "Overview",
    href: "/admin/dashboard",
    matchPrefixes: ["/admin/dashboard"],
    icon: LayoutDashboard,
    group: "OPERATIONS",
  },
  {
    title: "Booking Management",
    shortTitle: "Bookings",
    href: "/admin/bookings",
    matchPrefixes: ["/admin/bookings", "/admin/appointments", "/admin/bridal/bookings"],
    icon: CalendarCheck,
    badge: "Live",
    group: "OPERATIONS",
  },
  {
    title: "Calendar & Schedule",
    shortTitle: "Calendar",
    href: "/admin/calendar",
    matchPrefixes: ["/admin/calendar", "/admin/calendar-settings", "/admin/bridal/calendar"],
    icon: CalendarDays,
    group: "OPERATIONS",
  },
  {
    title: "Services & Packages",
    shortTitle: "Services",
    href: "/admin/services",
    matchPrefixes: ["/admin/services", "/admin/bridal/services", "/admin/packages", "/admin/categories"],
    icon: Crown,
    group: "SERVICES & CLIENTS",
  },
  {
    title: "Customer Directory",
    shortTitle: "Customers",
    href: "/admin/customers",
    matchPrefixes: ["/admin/customers", "/admin/enquiries"],
    icon: Users,
    group: "SERVICES & CLIENTS",
  },
  {
    title: "Payment Management",
    shortTitle: "Payments",
    href: "/admin/payments",
    matchPrefixes: ["/admin/payments", "/admin/bridal/payments"],
    icon: CreditCard,
    group: "SERVICES & CLIENTS",
  },
  {
    title: "Website Content CMS",
    shortTitle: "CMS",
    href: "/admin/content",
    matchPrefixes: [
      "/admin/content",
      "/admin/gallery",
      "/admin/transformations",
      "/admin/videos",
      "/admin/reviews",
      "/admin/faqs",
      "/admin/offers",
      "/admin/brands",
    ],
    icon: FileText,
    group: "MARKETING & CMS",
  },
  {
    title: "Media Library",
    shortTitle: "Media",
    href: "/admin/media",
    matchPrefixes: ["/admin/media"],
    icon: ImageIcon,
    badge: "Assets",
    group: "MARKETING & CMS",
  },
  {
    title: "Reports & Analytics",
    shortTitle: "Reports",
    href: "/admin/reports",
    matchPrefixes: ["/admin/reports", "/admin/analytics"],
    icon: FileSpreadsheet,
    group: "SYSTEM",
  },
  {
    title: "Salon Settings & Hours",
    shortTitle: "Settings",
    href: "/admin/settings",
    matchPrefixes: ["/admin/settings", "/admin/users", "/admin/staff"],
    icon: Settings,
    group: "SYSTEM",
  },
  {
    title: "Payment Gateway",
    shortTitle: "Gateway",
    href: "/admin/settings/payment-gateway",
    matchPrefixes: ["/admin/settings/payment-gateway", "/admin/settings/razorpay"],
    icon: Sliders,
    badge: "Razorpay",
    group: "SYSTEM",
  },
];

const navGroups = [
  { id: "OPERATIONS", label: "Operations" },
  { id: "SERVICES & CLIENTS", label: "Catalog & Clients" },
  { id: "MARKETING & CMS", label: "Showcase & CMS" },
  { id: "SYSTEM", label: "System & Config" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useAdminNav();

  // Close mobile drawer on route transition
  React.useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const renderNavContent = (collapsed: boolean, isMobile = false) => {
    return (
      <div className="flex flex-col h-full justify-between">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between border-b border-salon-borderBlack/60 bg-salon-black/60 transition-all",
              collapsed ? "p-3 flex-col gap-2" : "p-4"
            )}
          >
            <div className={cn("overflow-hidden flex items-center gap-2", collapsed && "justify-center")}>
              <BrandLogo
                variant="primary"
                size="sm"
                showBranch={!collapsed}
                branchClassName="text-[8px] text-salon-gold font-bold"
                href="/admin/dashboard"
              />
            </div>

            {isMobile ? (
              <button
                onClick={closeMobile}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                aria-label="Close mobile navigation"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={toggleCollapsed}
                className="hidden lg:flex items-center justify-center h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-salon-gold/50 transition-colors"
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Grouped Nav Items */}
          <nav className={cn("p-2.5 space-y-4", collapsed ? "px-1.5" : "px-3")}>
            {navGroups.map((group) => {
              const itemsInGroup = navItems.filter((i) => i.group === group.id);
              if (itemsInGroup.length === 0) return null;

              return (
                <div key={group.id} className="space-y-1">
                  {!collapsed && (
                    <h3 className="px-3 text-[10px] font-semibold tracking-wider uppercase text-zinc-500">
                      {group.label}
                    </h3>
                  )}
                  {collapsed && <div className="h-px bg-zinc-800/80 my-1 mx-2" />}

                  <div className="space-y-0.5 pt-0.5">
                    {itemsInGroup.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.matchPrefixes &&
                          item.matchPrefixes.some(
                            (p) => pathname === p || (p !== "/admin/dashboard" && pathname?.startsWith(p))
                          ));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={collapsed ? item.title : undefined}
                          className={cn(
                            "flex items-center rounded-lg text-xs font-medium tracking-wide transition-all group relative",
                            collapsed ? "justify-center p-2.5" : "justify-between px-3 py-2",
                            isActive
                              ? "bg-salon-gold/15 text-salon-goldLight border-l-2 border-salon-gold font-semibold shadow-[0_0_15px_rgba(198,165,107,0.15)]"
                              : "text-zinc-400 hover:text-white hover:bg-zinc-900/70"
                          )}
                        >
                          <div className={cn("flex items-center space-x-2.5 truncate", collapsed && "space-x-0")}>
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                                isActive ? "text-salon-gold" : "text-zinc-500"
                              )}
                            />
                            {!collapsed && <span className="truncate">{item.title}</span>}
                          </div>

                          {!collapsed && item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-salon-gold/20 text-salon-gold uppercase tracking-wider shrink-0">
                              {item.badge}
                            </span>
                          )}

                          {/* Hover Tooltip when collapsed */}
                          {collapsed && (
                            <div className="absolute left-full ml-2 px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-white text-[11px] font-medium rounded shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                              {item.title}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer info & status */}
        <div className={cn("border-t border-salon-borderBlack/60 bg-salon-black/40 p-3", collapsed ? "p-2 text-center" : "space-y-2")}>
          {!collapsed ? (
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span className="truncate">Lalganj Admin v1.0</span>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1 text-salon-gold hover:underline"
              >
                <span>Live Site</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <Link
              href="/"
              target="_blank"
              className="flex justify-center text-zinc-500 hover:text-salon-gold p-1"
              title="Open Public Site"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-salon-borderBlack bg-salon-richBlack min-h-screen shrink-0 shadow-xl transition-all duration-300 z-20",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {renderNavContent(isCollapsed, false)}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-salon-richBlack border-r border-salon-borderBlack lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderNavContent(false, true)}
      </aside>
    </>
  );
}
