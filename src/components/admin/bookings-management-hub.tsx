"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  Clock,
  Calendar,
  Phone,
  User,
  CreditCard,
  Receipt,
  RotateCcw,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  XCircle,
  CalendarDays,
  FileSpreadsheet,
  Plus,
  Scissors,
  Check,
  Building2,
  DollarSign,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { format } from "date-fns";

export interface BookingRecord {
  id: string;
  appointmentNumber: string;
  customerProfileId: string;
  customerProfile?: {
    user?: {
      name: string;
      phone: string;
      email?: string | null;
    };
    address?: string | null;
  };
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string | null;
  staff?: {
    id?: string;
    name: string;
    designation: string;
  } | null;
  status: string;
  source?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  subtotal: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  notes?: string | null;
  adminNotes?: string | null;
  internalNotes?: string | null;
  createdAt: string;
  serviceIds?: string[];
  appointmentServices?: {
    service: {
      id: string;
      name: string;
      price: number;
      durationMinutes: number;
    };
  }[];
  package?: {
    id: string;
    name: string;
    price: number;
  } | null;
}

export function BookingsManagementHub() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get("status") || "ALL";

  const [bookings, setBookings] = React.useState<BookingRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusTab, setStatusTab] = React.useState(initialStatus);
  const [dateFilter, setDateFilter] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"table" | "calendar">("table");

  // Modals & Drawers
  const [selectedBooking, setSelectedBooking] = React.useState<BookingRecord | null>(null);
  const [collectingPaymentBooking, setCollectingPaymentBooking] = React.useState<BookingRecord | null>(null);
  const [collectAmount, setCollectAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<"CASH" | "UPI" | "CARD">("CASH");
  const [cashierName, setCashierName] = React.useState("Salon Reception Cashier");
  const [collectNotes, setCollectNotes] = React.useState("");
  const [paymentSubmitting, setPaymentSubmitting] = React.useState(false);

  const [reschedulingBooking, setReschedulingBooking] = React.useState<BookingRecord | null>(null);
  const [newDate, setNewDate] = React.useState("");
  const [newTime, setNewTime] = React.useState("11:00");
  const [rescheduleLoading, setRescheduleLoading] = React.useState(false);

  const [cancellingBooking, setCancellingBooking] = React.useState<BookingRecord | null>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [cancelLoading, setCancelLoading] = React.useState(false);

  const [selectedReceipt, setSelectedReceipt] = React.useState<{
    receiptNumber: string;
    bookingId: string;
    customerName: string;
    customerPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    serviceName: string;
    totalPrice: number;
    advancePaid: number;
    collectedNow: number;
    paymentMethod: string;
    newRemainingBalance: number;
    paymentStatus: string;
    receivedBy: string;
    receivedAt: string;
  } | null>(null);

  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch Bookings with caching and debounced parameters
  const fetchBookings = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (dateFilter) params.append("date", dateFilter);

      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch bookings:", e);
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  // Filter Bookings locally by Tab for instantaneous zero-latency navigation
  const filteredBookings = React.useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return bookings.filter((b) => {
      const bDate = typeof b.appointmentDate === "string" ? b.appointmentDate.split("T")[0] : "";
      if (statusTab === "TODAY") return bDate === todayStr;
      if (statusTab === "UPCOMING") return bDate >= todayStr && (b.status === "CONFIRMED" || b.status === "PENDING");
      if (statusTab === "PENDING") return b.status === "PENDING";
      if (statusTab === "CONFIRMED") return b.status === "CONFIRMED";
      if (statusTab === "COMPLETED") return b.status === "COMPLETED";
      if (statusTab === "CANCELLED") return b.status === "CANCELLED" || b.status === "REJECTED";
      return true;
    });
  }, [bookings, statusTab]);

  // Aggregate Metrics
  const metrics = React.useMemo(() => {
    const totalCount = bookings.length;
    const todayStr = new Date().toISOString().split("T")[0];
    const todayCount = bookings.filter((b) => (b.appointmentDate || "").startsWith(todayStr)).length;
    const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
    const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
    const totalCollected = bookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0);
    const totalRemaining = bookings.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);

    return { totalCount, todayCount, pendingCount, confirmedCount, totalCollected, totalRemaining };
  }, [bookings]);

  // Handle Counter Payment Collection
  const handleCollectRemaining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingPaymentBooking) return;

    try {
      setPaymentSubmitting(true);
      const res = await fetch("/api/bridal/payments/collect-remaining", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: collectingPaymentBooking.id,
          amount: collectAmount,
          paymentMethod,
          paymentDate: new Date().toISOString(),
          receivedBy: cashierName,
          notes: collectNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to record payment");
      }

      setFeedback({ type: "success", text: `Successfully collected ₹${collectAmount.toLocaleString("en-IN")}.` });
      setCollectingPaymentBooking(null);

      // Open official receipt modal if returned
      if (json.data?.receipt) {
        setSelectedReceipt({
          receiptNumber: json.data.receipt.receiptNumber,
          bookingId: json.data.receipt.bookingId,
          customerName: json.data.receipt.customerName,
          customerPhone: json.data.receipt.customerPhone,
          appointmentDate: json.data.receipt.appointmentDate,
          appointmentTime: json.data.receipt.appointmentTime,
          serviceName: json.data.receipt.serviceName,
          totalPrice: json.data.receipt.totalServicePrice,
          advancePaid: json.data.receipt.advancePaidOnline,
          collectedNow: json.data.receipt.collectedNow,
          paymentMethod: json.data.receipt.paymentMethod,
          newRemainingBalance: json.data.receipt.newRemainingBalance,
          paymentStatus: json.data.receipt.paymentStatus,
          receivedBy: json.data.receipt.receivedBy,
          receivedAt: json.data.receipt.receivedAt,
        });
      }

      fetchBookings();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to record payment" });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Handle Rescheduling
  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingBooking || !newDate || !newTime) return;

    try {
      setRescheduleLoading(true);
      const res = await fetch(`/api/admin/appointments/${reschedulingBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentDate: newDate,
          startTime: newTime,
          status: "CONFIRMED",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to reschedule booking");
      }

      setFeedback({ type: "success", text: `Booking rescheduled to ${newDate} at ${newTime}.` });
      setReschedulingBooking(null);
      fetchBookings();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to reschedule" });
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Handle Cancellation
  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingBooking) return;

    try {
      setCancelLoading(true);
      const res = await fetch(`/api/admin/appointments/${cancellingBooking.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to cancel booking");
      }

      setFeedback({ type: "success", text: "Appointment cancelled successfully." });
      setCancellingBooking(null);
      setCancelReason("");
      fetchBookings();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to cancel" });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-borderBlack pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="gold">Operations Central</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">All Appointments & Bridal Suites</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <CalendarCheck className="h-7 w-7 text-salon-gold" />
            <span>Booking Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Search, confirm, reschedule, manage deposits, and settle counter balances for Lalganj salon visits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={viewMode === "table" ? "gold" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="text-xs h-9"
          >
            Table View
          </Button>
          <Link href="/admin/calendar">
            <Button variant="outline" size="sm" className="text-xs h-9 gap-1.5 border-zinc-700">
              <CalendarDays className="h-3.5 w-3.5 text-salon-gold" />
              <span>Full Calendar</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            className="text-xs h-9 gap-1.5 border-zinc-700 hover:text-white"
            title="Refresh bookings"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-3.5">
          <p className="text-[11px] text-zinc-400 font-medium">Total Bookings</p>
          <p className="font-serif text-xl font-bold text-white mt-1">{metrics.totalCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">All-time appointments</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-3.5">
          <p className="text-[11px] text-emerald-400 font-medium">Today&apos;s Visits</p>
          <p className="font-serif text-xl font-bold text-emerald-400 mt-1">{metrics.todayCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Scheduled today</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-3.5">
          <p className="text-[11px] text-amber-400 font-medium">Pending Confirmation</p>
          <p className="font-serif text-xl font-bold text-amber-400 mt-1">{metrics.pendingCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Action needed</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-3.5">
          <p className="text-[11px] text-blue-400 font-medium">Confirmed</p>
          <p className="font-serif text-xl font-bold text-blue-400 mt-1">{metrics.confirmedCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">On calendar</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-3.5">
          <p className="text-[11px] text-salon-gold font-medium">Advance Collected</p>
          <p className="font-serif text-xl font-bold text-salon-gold mt-1">
            ₹{metrics.totalCollected.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Razorpay online</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-3.5">
          <p className="text-[11px] text-purple-400 font-medium">Remaining Due</p>
          <p className="font-serif text-xl font-bold text-purple-400 mt-1">
            ₹{metrics.totalRemaining.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Payable at counter</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-salon-richBlack/40 p-3 rounded-xl border border-salon-borderBlack">
        {/* Search Input with Debounce */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Booking ID, customer name, or phone number..."
            className="pl-9 bg-salon-black border-zinc-800 text-xs h-9 text-white placeholder:text-zinc-500 w-full"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-salon-black border border-zinc-800 text-xs text-white rounded-lg px-2.5 py-1.5 h-9"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1"
              title="Clear date filter"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 border-b border-salon-borderBlack overflow-x-auto pb-1 text-xs">
        {[
          { id: "ALL", label: "All Bookings", count: bookings.length },
          { id: "TODAY", label: "Today's Visits", count: metrics.todayCount },
          { id: "UPCOMING", label: "Upcoming", count: metrics.confirmedCount + metrics.pendingCount },
          { id: "PENDING", label: "Pending", count: metrics.pendingCount },
          { id: "CONFIRMED", label: "Confirmed", count: metrics.confirmedCount },
          { id: "COMPLETED", label: "Completed", count: bookings.filter((b) => b.status === "COMPLETED").length },
          { id: "CANCELLED", label: "Cancelled", count: bookings.filter((b) => b.status === "CANCELLED").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={`px-3 py-2 rounded-t-lg font-medium tracking-wide transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              statusTab === tab.id
                ? "border-salon-gold text-salon-gold bg-salon-gold/10 font-semibold"
                : "border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusTab === tab.id ? "bg-salon-gold text-black font-bold" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-salon-black/80 text-zinc-400 border-b border-salon-borderBlack uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="p-3.5">Booking Reference</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Appointment Date & Time</th>
                <th className="p-3.5">Package / Service</th>
                <th className="p-3.5">Advance / Remaining</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-salon-borderBlack/40 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <RotateCcw className="h-4 w-4 animate-spin text-salon-gold" />
                      <span>Loading booking ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No appointments found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const custName = b.customerName || b.customerProfile?.user?.name || "Client";
                  const custPhone = b.customerPhone || b.customerProfile?.user?.phone || "";
                  const srvName =
                    b.package?.name ||
                    (b.appointmentServices && b.appointmentServices[0]?.service?.name) ||
                    "Bridal Suite Service";

                  const isPending = b.status === "PENDING";
                  const isConfirmed = b.status === "CONFIRMED";
                  const isCompleted = b.status === "COMPLETED";
                  const isCancelled = b.status === "CANCELLED" || b.status === "REJECTED";

                  const remainingDue = b.remainingAmount ?? 0;
                  const hasRemaining = remainingDue > 0;

                  return (
                    <tr key={b.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Reference */}
                      <td className="p-3.5 font-mono">
                        <span className="font-semibold text-white">{b.appointmentNumber}</span>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {b.source ? b.source.replace(/_/g, " ") : "ONLINE"}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-3.5">
                        <div className="font-medium text-white">{custName}</div>
                        {custPhone && (
                          <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5 font-mono">
                            <Phone className="h-3 w-3 text-salon-gold" />
                            <span>{custPhone}</span>
                            <a
                              href={`https://wa.me/91${custPhone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(
                                custName
                              )},%20regarding%20your%20appointment%20${b.appointmentNumber}%20at%20The%20Jawed%20Habib%20Salon%20Lalganj...`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 ml-1"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="p-3.5">
                        <div className="font-medium text-white flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-salon-gold" />
                          <span>{b.appointmentDate ? b.appointmentDate.split("T")[0] : "—"}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-zinc-500" />
                          <span>{b.startTime} – {b.endTime}</span>
                        </div>
                      </td>

                      {/* Service / Package */}
                      <td className="p-3.5 max-w-[200px]">
                        <div className="font-medium text-white truncate" title={srvName}>
                          {srvName}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          ₹{(b.totalAmount || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="p-3.5">
                        <div className="text-xs font-mono">
                          <span className="text-emerald-400 font-semibold">
                            ₹{(b.depositAmount || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-zinc-500"> / </span>
                          <span className={hasRemaining ? "text-purple-400 font-bold" : "text-zinc-500"}>
                            ₹{remainingDue.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {b.paymentStatus === "PAID" ? (
                            <span className="text-emerald-400 font-medium">Fully Paid</span>
                          ) : b.paymentStatus === "PARTIALLY_PAID" ? (
                            <span className="text-amber-400 font-medium">Advance Paid</span>
                          ) : (
                            <span className="text-red-400 font-medium">Unpaid</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isConfirmed
                              ? "bg-blue-950/60 text-blue-400 border border-blue-800/60"
                              : isPending
                              ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                              : isCompleted
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                              : "bg-red-950/60 text-red-400 border border-red-800/60"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Collect Balance Button if balance exists */}
                          {hasRemaining && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCollectingPaymentBooking(b);
                                setCollectAmount(b.remainingAmount);
                              }}
                              className="h-7 px-2 text-[11px] border-purple-500/40 text-purple-300 hover:bg-purple-950/40"
                              title="Collect Remaining Balance at Salon Counter"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              <span>Collect ₹{b.remainingAmount}</span>
                            </Button>
                          )}

                          {/* Details Drawer */}
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            title="View Booking Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Reschedule */}
                          {!isCancelled && !isCompleted && (
                            <button
                              onClick={() => {
                                setReschedulingBooking(b);
                                setNewDate(b.appointmentDate ? b.appointmentDate.split("T")[0] : "");
                                setNewTime(b.startTime || "11:00");
                              }}
                              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white"
                              title="Reschedule Appointment"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                          )}

                          {/* Cancel */}
                          {!isCancelled && !isCompleted && (
                            <button
                              onClick={() => setCancellingBooking(b)}
                              className="p-1.5 rounded-md hover:bg-zinc-800 text-red-400 hover:text-red-300"
                              title="Cancel Appointment"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Balance Modal */}
      {collectingPaymentBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-salon-richBlack border border-salon-borderBlack rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-salon-gold" />
                  <span>Salon Counter Balance Settlement</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Ref: {collectingPaymentBooking.appointmentNumber} • {collectingPaymentBooking.customerName || "Client"}
                </p>
              </div>
              <button
                onClick={() => setCollectingPaymentBooking(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCollectRemaining} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-salon-black border border-zinc-800 space-y-1.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Total Service Value:</span>
                  <span className="font-mono text-white">₹{collectingPaymentBooking.totalAmount}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Advance Received:</span>
                  <span className="font-mono text-emerald-400">₹{collectingPaymentBooking.depositAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-zinc-800">
                  <span>Remaining Balance Due:</span>
                  <span className="font-mono text-purple-400">₹{collectingPaymentBooking.remainingAmount}</span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Amount to Collect (₹):
                </label>
                <Input
                  type="number"
                  required
                  min={1}
                  max={collectingPaymentBooking.remainingAmount}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="bg-salon-black border-zinc-800 text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "UPI", "CARD"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        paymentMethod === m
                          ? "border-salon-gold bg-salon-gold/15 text-salon-gold"
                          : "border-zinc-800 bg-salon-black text-zinc-400 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Cashier / Staff Name:
                </label>
                <Input
                  required
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Counter Receipt Notes:
                </label>
                <Input
                  placeholder="e.g. Paid in cash at front counter"
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  className="bg-salon-black border-zinc-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCollectingPaymentBooking(null)}
                  disabled={paymentSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  disabled={paymentSubmitting || collectAmount <= 0}
                  className="gap-1.5"
                >
                  {paymentSubmitting ? (
                    <RotateCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Record ₹{collectAmount} & Issue Receipt</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-salon-richBlack border border-salon-borderBlack rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-salon-gold" />
                  <span>Reschedule Appointment</span>
                </h3>
                <p className="text-xs text-zinc-400">Ref: {reschedulingBooking.appointmentNumber}</p>
              </div>
              <button
                onClick={() => setReschedulingBooking(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  New Appointment Date:
                </label>
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-salon-black border-zinc-800 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  New Appointment Time:
                </label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-salon-black border border-zinc-800 text-white rounded-lg p-2.5 text-xs"
                >
                  {["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReschedulingBooking(null)}
                  disabled={rescheduleLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  disabled={rescheduleLoading}
                  className="gap-1.5"
                >
                  {rescheduleLoading ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Save New Schedule</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-salon-richBlack border border-salon-borderBlack rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Cancel Appointment</span>
                </h3>
                <p className="text-xs text-zinc-400">Ref: {cancellingBooking.appointmentNumber}</p>
              </div>
              <button
                onClick={() => setCancellingBooking(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCancel} className="space-y-4 text-xs">
              <p className="text-zinc-300">
                Are you sure you want to cancel the reservation for{" "}
                <span className="font-semibold text-white">
                  {cancellingBooking.customerName || "this client"}
                </span>
                ?
              </p>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Reason for Cancellation:
                </label>
                <Input
                  required
                  placeholder="e.g. Customer requested cancellation due to family conflict"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="bg-salon-black border-zinc-800 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancellingBooking(null)}
                  disabled={cancelLoading}
                >
                  Keep Booking
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={cancelLoading}
                  className="gap-1.5"
                >
                  {cancelLoading ? <RotateCcw className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  <span>Confirm Cancellation</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white text-zinc-900 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 print:m-0 print:p-0">
            {/* Salon Header */}
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="font-serif text-xl font-bold tracking-tight uppercase text-zinc-950">
                The Jawed Habib Salon
              </h2>
              <p className="text-xs text-zinc-600 font-medium">Lalganj, Vaishali, Bihar – 844121</p>
              <p className="text-[11px] text-zinc-500">
                1st Floor, Tinpulwa Chowk, Above Killer Showroom • Phone: 7707000463
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-zinc-100 rounded-full text-xs font-mono font-bold text-zinc-800">
                OFFICIAL DIGITAL RECEIPT: {selectedReceipt.receiptNumber}
              </div>
            </div>

            {/* Receipt Details */}
            <div className="text-xs space-y-2 border-b pb-4">
              <div className="flex justify-between">
                <span className="text-zinc-600">Booking Reference:</span>
                <span className="font-mono font-bold">{selectedReceipt.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Client Name:</span>
                <span className="font-semibold">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Contact Number:</span>
                <span className="font-mono">{selectedReceipt.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Appointment Date:</span>
                <span>{selectedReceipt.appointmentDate} at {selectedReceipt.appointmentTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Service:</span>
                <span className="font-medium text-right max-w-[240px] truncate">{selectedReceipt.serviceName}</span>
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="text-xs space-y-1.5 bg-zinc-50 p-3.5 rounded-lg border border-zinc-200">
              <div className="flex justify-between text-zinc-600">
                <span>Total Package Price:</span>
                <span className="font-mono font-medium">₹{selectedReceipt.totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Advance Paid Online (Razorpay):</span>
                <span className="font-mono text-emerald-700 font-medium">
                  - ₹{selectedReceipt.advancePaid.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-zinc-900 font-bold border-t pt-1.5">
                <span>Collected at Salon Counter:</span>
                <span className="font-mono text-indigo-700">
                  ₹{selectedReceipt.collectedNow.toLocaleString("en-IN")} ({selectedReceipt.paymentMethod})
                </span>
              </div>
              <div className="flex justify-between text-zinc-700 font-semibold pt-1">
                <span>Remaining Balance Due:</span>
                <span className="font-mono">₹{selectedReceipt.newRemainingBalance.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-1">
                <span>Payment Status:</span>
                <span>{selectedReceipt.paymentStatus}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 text-center">
              Issued by {selectedReceipt.receivedBy} on {new Date(selectedReceipt.receivedAt).toLocaleString("en-IN")}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
                className="text-xs text-zinc-700"
              >
                Close
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => window.print()}
                className="text-xs gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Receipt</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Drawer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-salon-richBlack border border-salon-borderBlack rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-salon-gold" />
                  <span>Booking Dossier</span>
                </h3>
                <p className="text-xs text-zinc-400">Ref: {selectedBooking.appointmentNumber}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-salon-black p-3.5 rounded-lg border border-zinc-800">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Customer Name</span>
                  <span className="font-semibold text-white">
                    {selectedBooking.customerName || selectedBooking.customerProfile?.user?.name || "Client"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Contact Phone</span>
                  <span className="font-mono text-salon-gold">
                    {selectedBooking.customerPhone || selectedBooking.customerProfile?.user?.phone || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Scheduled Date</span>
                  <span className="text-white">
                    {selectedBooking.appointmentDate ? selectedBooking.appointmentDate.split("T")[0] : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Time Slot</span>
                  <span className="text-white">
                    {selectedBooking.startTime} – {selectedBooking.endTime}
                  </span>
                </div>
              </div>

              {/* Inclusions / Services */}
              <div className="space-y-1.5">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Booked Services & Suites
                </span>
                <div className="p-3 rounded-lg bg-salon-black border border-zinc-800">
                  <div className="font-medium text-white">
                    {selectedBooking.package?.name ||
                      (selectedBooking.appointmentServices && selectedBooking.appointmentServices[0]?.service?.name) ||
                      "Bridal Suite Service"}
                  </div>
                  {selectedBooking.notes && (
                    <p className="text-zinc-400 text-[11px] mt-1.5 italic">
                      Client Notes: &ldquo;{selectedBooking.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Financial Ledger */}
              <div className="space-y-1.5">
                <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider block">
                  Payment Ledger
                </span>
                <div className="p-3.5 rounded-lg bg-salon-black border border-zinc-800 space-y-1.5 font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Total Service Value:</span>
                    <span className="text-white font-bold">₹{selectedBooking.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Advance Collected:</span>
                    <span className="text-emerald-400">₹{selectedBooking.depositAmount || 0}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Remaining Due:</span>
                    <span className="text-purple-400">₹{selectedBooking.remainingAmount || 0}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold border-t border-zinc-800 pt-1">
                    <span>Payment Status:</span>
                    <span>{selectedBooking.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
