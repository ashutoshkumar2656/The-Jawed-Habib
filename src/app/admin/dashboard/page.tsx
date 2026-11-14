import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
  Sparkles,
  CalendarDays,
  CreditCard,
  IndianRupee,
  Users,
  CalendarCheck,
  MessageCircle,
  Receipt,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import dbRepo from "@/lib/db/repo";
import logger from "@/lib/logging/logger";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Operations Dashboard | The Jawed Habib Salon – Lalganj",
};

function formatDashboardDate(dateVal: any): string {
  if (!dateVal) return "—";
  if (dateVal instanceof Date) {
    return dateVal.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  if (typeof dateVal === "string") {
    const parsed = new Date(dateVal);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return dateVal;
  }
  return String(dateVal);
}

export default async function AdminDashboardPage() {
  let analytics: any;
  try {
    analytics = await dbRepo.getAdminAnalytics();
  } catch (error) {
    logger.error("admin.dashboard.getAdminAnalytics_failed", error);
    analytics = {
      totalAppointments: 0,
      todayAppointments: 0,
      todayArrived: 0,
      todayInProgress: 0,
      todayCompleted: 0,
      todayNoShow: 0,
      todayConfirmed: 0,
      todayPending: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      totalEnquiries: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      totalCustomers: 0,
      newCustomers: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      pendingPaymentsCount: 0,
      advanceCollected: 0,
      remainingBalance: 0,
      recentCustomers: [],
      popularServices: [],
      recentBookings: [],
      upcomingAppointments: [],
      recentEnquiries: [],
      monthlyTrends: [],
    };
  }

  // Summary Cards representing operational & financial metrics
  const kpis = [
    {
      title: "Total Bookings",
      value: (analytics.totalAppointments || 0).toString(),
      subtext: "All-time bookings",
      icon: CalendarCheck,
      variant: "gold",
      href: "/admin/bookings",
    },
    {
      title: "Today's Bookings",
      value: (analytics.todayAppointments || 0).toString(),
      subtext: "Visits scheduled today",
      icon: Clock,
      variant: "emerald",
      href: "/admin/bookings?status=TODAY",
    },
    {
      title: "Upcoming Bookings",
      value: (analytics.upcomingAppointments?.length || 0).toString(),
      subtext: "Confirmed & pending",
      icon: CalendarDays,
      variant: "blue",
      href: "/admin/bookings?status=UPCOMING",
    },
    {
      title: "Confirmed Bookings",
      value: ((analytics.confirmedAppointments ?? analytics.confirmedBookings) || 0).toString(),
      subtext: "Confirmed on calendar",
      icon: CheckCircle2,
      variant: "blue",
      href: "/admin/bookings?status=CONFIRMED",
    },
    {
      title: "Pending Confirmation",
      value: ((analytics.pendingPaymentsCount ?? analytics.pendingAppointments) || 0).toString(),
      subtext: "Action required",
      icon: AlertCircle,
      variant: "amber",
      href: "/admin/bookings?status=PENDING",
    },
    {
      title: "Advance Collected",
      value: `₹${(analytics.advanceCollected || 0).toLocaleString("en-IN")}`,
      subtext: "Razorpay online deposits",
      icon: IndianRupee,
      variant: "gold",
      href: "/admin/payments",
    },
    {
      title: "Outstanding Balances",
      value: `₹${(analytics.remainingBalance || 0).toLocaleString("en-IN")}`,
      subtext: "Due at salon counter",
      icon: CreditCard,
      variant: "purple",
      href: "/admin/payments",
    },
  ];

  const total = Math.max(1, analytics.totalAppointments || 0);
  const pendingPct = Math.round((((analytics.pendingAppointments ?? analytics.pendingBookings) || 0) / total) * 100);
  const confirmedPct = Math.round((((analytics.confirmedAppointments ?? analytics.confirmedBookings) || 0) / total) * 100);
  const completedPct = Math.round(((analytics.completedAppointments || 0) / total) * 100);
  const cancelledPct = Math.round(((analytics.cancelledAppointments || 0) / total) * 100);

  const upcomingList = analytics.upcomingAppointments || [];
  const recentCustomersList = (analytics as any).recentCustomers || [];

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-borderBlack pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="gold">Lalganj Executive Operations</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Open 10:00 AM – 10:00 PM (All 7 Days)</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Salon Management Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {BRAND_CONFIG.fullName} • 1st Floor, Tinpulwa Chowk, Above Killer Showroom, Lalganj, Bihar – 844121
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/calendar">
            <Button variant="outline" className="border-salon-gold/40 text-salon-goldLight hover:bg-salon-gold/10 gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Full Calendar</span>
            </Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="gold" className="gap-2 shadow-lg hover:shadow-salon-gold/20">
              <Plus className="h-4 w-4" />
              <span>Manage Bookings</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid (7 core metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.title} href={kpi.href}>
              <Card className="h-full border-salon-borderBlack bg-salon-richBlack/70 hover:border-salon-gold/50 transition-all hover:-translate-y-0.5 shadow-sm group">
                <CardContent className="p-3.5 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-zinc-400 line-clamp-1">{kpi.title}</p>
                    <Icon className="h-3.5 w-3.5 text-salon-gold group-hover:scale-110 transition-transform shrink-0" />
                  </div>
                  <div className="mt-2.5">
                    <h3 className="font-serif text-xl font-bold text-white tracking-tight truncate">
                      {kpi.value}
                    </h3>
                    <p className="text-[10px] text-salon-goldLight/80 mt-0.5 truncate">{kpi.subtext}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Today's Salon Operations Strip */}
      <div className="rounded-xl border border-salon-borderBlack bg-salon-cardBlack p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-serif text-sm font-bold text-white tracking-wide">
              Today&apos;s Live Salon Operations ({new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "short" })})
            </h3>
          </div>
          <Link href="/admin/bookings?status=TODAY" className="text-xs text-salon-gold hover:underline font-medium">
            View Today&apos;s Appointments →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-1">
          <div className="bg-salon-black p-3 rounded-lg border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Total Scheduled</span>
            <span className="font-mono text-xl font-bold text-white mt-0.5 block">{analytics.todayAppointments || 0}</span>
            <span className="text-[10px] text-zinc-500">Full day slots</span>
          </div>
          <div className="bg-salon-black p-3 rounded-lg border border-teal-800/40">
            <span className="text-[10px] text-teal-400 uppercase tracking-wider block">Checked In</span>
            <span className="font-mono text-xl font-bold text-teal-400 mt-0.5 block">{(analytics as any).todayArrived || 0}</span>
            <span className="text-[10px] text-zinc-500">In waiting lounge</span>
          </div>
          <div className="bg-salon-black p-3 rounded-lg border border-indigo-800/40">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider block">In Service</span>
            <span className="font-mono text-xl font-bold text-indigo-400 mt-0.5 block">{(analytics as any).todayInProgress || 0}</span>
            <span className="text-[10px] text-zinc-500">Styling in chair</span>
          </div>
          <div className="bg-salon-black p-3 rounded-lg border border-emerald-800/40">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Completed</span>
            <span className="font-mono text-xl font-bold text-emerald-400 mt-0.5 block">{(analytics as any).todayCompleted || 0}</span>
            <span className="text-[10px] text-zinc-500">Service finished</span>
          </div>
          <div className="bg-salon-black p-3 rounded-lg border border-blue-800/40">
            <span className="text-[10px] text-blue-400 uppercase tracking-wider block">Confirmed</span>
            <span className="font-mono text-xl font-bold text-blue-400 mt-0.5 block">{(analytics as any).todayConfirmed || 0}</span>
            <span className="text-[10px] text-zinc-500">Expected later</span>
          </div>
          <div className="bg-salon-black p-3 rounded-lg border border-rose-800/40">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider block">No-Show</span>
            <span className="font-mono text-xl font-bold text-rose-400 mt-0.5 block">{(analytics as any).todayNoShow || 0}</span>
            <span className="text-[10px] text-zinc-500">Missed appointments</span>
          </div>
        </div>
      </div>

      {/* Status Breakdown & Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution (1 column) */}
        <div className="rounded-xl border border-salon-borderBlack bg-salon-cardBlack p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-salon-gold" />
              <span>Booking Status Distribution</span>
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono">{analytics.totalAppointments} Total</span>
          </div>

          {/* Multi-segment progress bar */}
          <div className="h-3 w-full rounded-full bg-zinc-900 flex overflow-hidden border border-zinc-800">
            <div style={{ width: `${completedPct}%` }} className="bg-emerald-500" title={`Completed: ${completedPct}%`} />
            <div style={{ width: `${confirmedPct}%` }} className="bg-blue-500" title={`Confirmed: ${confirmedPct}%`} />
            <div style={{ width: `${pendingPct}%` }} className="bg-amber-500" title={`Pending: ${pendingPct}%`} />
            <div style={{ width: `${cancelledPct}%` }} className="bg-red-500" title={`Cancelled: ${cancelledPct}%`} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <span className="text-zinc-400 block text-[11px]">Completed</span>
                <span className="font-semibold text-white">{analytics.completedAppointments} ({completedPct}%)</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
              <div>
                <span className="text-zinc-400 block text-[11px]">Confirmed</span>
                <span className="font-semibold text-white">{analytics.confirmedAppointments ?? analytics.confirmedBookings} ({confirmedPct}%)</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
              <div>
                <span className="text-zinc-400 block text-[11px]">Pending</span>
                <span className="font-semibold text-white">{analytics.pendingAppointments ?? analytics.pendingBookings} ({pendingPct}%)</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
              <div>
                <span className="text-zinc-400 block text-[11px]">Cancelled</span>
                <span className="font-semibold text-white">{analytics.cancelledAppointments} ({cancelledPct}%)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Operating Hours: 10:00 AM – 10:00 PM</span>
            <Link href="/admin/calendar" className="text-salon-gold hover:underline font-semibold">
              Manage Hours
            </Link>
          </div>
        </div>

        {/* 6-Month Booking Volume (2 columns) */}
        <div className="lg:col-span-2 rounded-xl border border-salon-borderBlack bg-salon-cardBlack p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-salon-gold" />
              <span>Monthly Booking Volume (Last 6 Months)</span>
            </h3>
            <span className="text-[11px] text-zinc-400">Database verified</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
            {(analytics.monthlyTrends || []).map((trend: { month: string; appointments: number; revenue: number }) => {
              const maxApts = Math.max(1, ...(analytics.monthlyTrends || []).map((t: { appointments: number }) => t.appointments));
              const heightPct = Math.max(15, Math.round((trend.appointments / maxApts) * 100));

              return (
                <div key={trend.month} className="flex flex-col items-center justify-end h-40 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
                  <div className="w-full flex flex-col items-center justify-end flex-1 pb-2">
                    <span className="text-[10px] text-salon-gold font-semibold mb-1 font-mono">
                      {trend.appointments}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-8 rounded-t bg-gradient-to-t from-salon-goldDark to-salon-gold transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider text-center">
                    {trend.month.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
                    ₹{trend.revenue > 0 ? (trend.revenue / 1000).toFixed(1) + "k" : "0"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Bookings & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Customer Bookings Table (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="h-4 w-4 text-salon-gold" />
              <h2 className="font-serif text-lg font-bold text-white">
                Recent Customer Bookings
              </h2>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs text-salon-gold hover:underline flex items-center gap-1 font-medium"
            >
              <span>View All ({analytics.totalAppointments})</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-medium uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Ref #</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Advance</th>
                    <th className="p-3.5">Remaining</th>
                    <th className="p-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {analytics.recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-500">
                        No appointment bookings recorded yet.
                      </td>
                    </tr>
                  ) : (
                    analytics.recentBookings.map((apt: any) => {
                      const clientName = apt.customerProfile?.user?.name || (apt as any).customerName || "Client";
                      const clientPhone = apt.customerProfile?.user?.phone || (apt as any).customerPhone || "";
                      const adv = apt.depositAmount || 0;
                      const rem = apt.remainingAmount ?? Math.max(0, apt.totalAmount - adv);

                      let badgeColor = "bg-zinc-800 text-zinc-300 border-zinc-700";
                      if (apt.status === "CONFIRMED") badgeColor = "bg-blue-950/60 text-blue-300 border-blue-800";
                      if (apt.status === "PENDING") badgeColor = "bg-amber-950/60 text-amber-300 border-amber-800";
                      if (apt.status === "COMPLETED") badgeColor = "bg-emerald-950/60 text-emerald-300 border-emerald-800";
                      if (apt.status === "CANCELLED" || apt.status === "REJECTED") badgeColor = "bg-red-950/60 text-red-300 border-red-800";

                      return (
                        <tr key={apt.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-salon-gold">
                            <Link href={`/admin/bookings?search=${apt.appointmentNumber}`} className="hover:underline">
                              {apt.appointmentNumber}
                            </Link>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-semibold text-white">{apt.startTime}</span>
                            <span className="block text-[11px] text-zinc-500">{formatDashboardDate(apt.appointmentDate)}</span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-medium text-white">{clientName}</span>
                            <span className="block text-[11px] text-zinc-400 font-mono">{clientPhone}</span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-emerald-400 font-mono font-medium">
                            ₹{adv.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-purple-400 font-mono font-medium">
                            ₹{rem.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5 whitespace-nowrap text-right font-mono font-bold text-white">
                            ₹{(apt.totalAmount || 0).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Customers & Upcoming Visits */}
        <div className="space-y-6">
          {/* Recent Customers Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-salon-gold" />
                <h3 className="font-serif text-sm font-bold text-white">Recent Clients</h3>
              </div>
              <Link href="/admin/customers" className="text-xs text-salon-gold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentCustomersList.length === 0 ? (
                <p className="text-xs text-zinc-500 py-3 text-center">No customer records yet.</p>
              ) : (
                recentCustomersList.map((c: any) => {
                  const name = c.user?.name || c.name || "Salon Client";
                  const phone = c.user?.phone || c.phone || "";
                  return (
                    <div key={c.id} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-2.5 text-xs flex items-center justify-between hover:border-zinc-800 transition-colors">
                      <div>
                        <span className="font-semibold text-white block">{name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{phone}</span>
                      </div>
                      {phone && (
                        <a
                          href={`https://wa.me/91${String(phone).replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-md hover:bg-emerald-950/30 transition-colors"
                          title="WhatsApp Client"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Appointments Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-salon-gold" />
                <h3 className="font-serif text-sm font-bold text-white">Upcoming Visits</h3>
              </div>
              <Link href="/admin/bookings?status=UPCOMING" className="text-xs text-salon-gold hover:underline">
                Bookings
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingList.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  No upcoming appointments scheduled for today or upcoming dates.
                </p>
              ) : (
                upcomingList.map((apt: any) => {
                  const customerName = apt.customerProfile?.user?.name || (apt as any).customerName || "Customer";
                  const customerPhone = apt.customerProfile?.user?.phone || (apt as any).customerPhone || "";
                  return (
                    <div key={apt.id} className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3 text-xs space-y-1.5 hover:border-zinc-800 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{customerName}</span>
                        <span className="text-[10px] font-semibold text-salon-gold font-mono">{apt.startTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>{formatDashboardDate(apt.appointmentDate)}</span>
                        <span className="font-mono text-zinc-300">₹{(apt.totalAmount || 0).toLocaleString("en-IN")}</span>
                      </div>
                      {customerPhone && (
                        <p className="text-[10px] text-zinc-500 font-mono truncate">{customerPhone}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Fast Navigation Shortcuts */}
          <div className="rounded-xl border border-salon-gold/30 bg-salon-gold/5 p-4 text-xs space-y-3">
            <p className="font-serif font-bold text-salon-goldLight">Salon Operational Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/calendar" className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-center text-zinc-300 hover:text-white hover:border-salon-gold transition-colors block">
                Calendar Slots
              </Link>
              <Link href="/admin/services" className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-center text-zinc-300 hover:text-white hover:border-salon-gold transition-colors block">
                Menu & Prices
              </Link>
              <Link href="/admin/payments" className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-center text-zinc-300 hover:text-white hover:border-salon-gold transition-colors block">
                Settle Balances
              </Link>
              <Link href="/admin/content" className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 text-center text-zinc-300 hover:text-white hover:border-salon-gold transition-colors block">
                Website Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
