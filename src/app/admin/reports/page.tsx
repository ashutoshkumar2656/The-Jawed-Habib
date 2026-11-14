"use client";

import * as React from "react";
import {
  Download,
  FileSpreadsheet,
  TrendingUp,
  Calendar,
  CreditCard,
  Users,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  Scissors,
  ArrowUpRight,
  ShieldCheck,
  IndianRupee,
  Clock,
  Layers,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardAnalytics {
  financials: {
    grossBookedValue: number;
    grossCollectedRevenue: number;
    totalRefundsAmount: number;
    totalRefundsCount: number;
    netVerifiedRevenue: number;
    advanceCollected: number;
    fullPaymentsCollected: number;
    remainingBalancesCollected: number;
    totalOutstandingBalance: number;
    failedPaymentsCount: number;
    failedPaymentsAmount: number;
  };
  operations: {
    totalAppointments: number;
    confirmedCount: number;
    completedCount: number;
    cancelledCount: number;
    pendingCount: number;
    noShowCount: number;
    cancellationRate: number;
    totalCustomers: number;
  };
  topServices: {
    serviceName: string;
    categoryName: string;
    bookings: number;
    revenue: number;
  }[];
  dailyTrend: {
    date: string;
    bookedAmount: number;
    collectedAmount: number;
    appointments: number;
  }[];
}

interface BookingReportRow {
  bookingReference: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  service: string;
  appointmentDate: string;
  appointmentTime: string;
  servicePriceSnapshot: number;
  advanceAmount: number;
  amountPaid: number;
  remainingBalance: number;
  bookingStatus: string;
  paymentStatus: string;
  createdDate: string;
}

interface PaymentReportRow {
  internalTransactionId: string;
  bookingReference: string;
  customerName: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  paymentPurpose: string;
  paymentMethod: string;
  paymentStatus: string;
  refundAmount: number;
  refundStatus: string;
  transactionDate: string;
}

interface CustomerReportRow {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  totalVisits: number;
  lifetimeSpend: number;
  lastVisitDate: string;
  loyaltyTier: string;
  registeredDate: string;
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = React.useState<"analytics" | "bookings" | "payments" | "customers">("analytics");
  
  // Dashboard Analytics State
  const [analytics, setAnalytics] = React.useState<DashboardAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(true);

  // Booking Reports State
  const [bookings, setBookings] = React.useState<BookingReportRow[]>([]);
  const [bookingLoading, setBookingLoading] = React.useState(false);
  const [bookingFilters, setBookingFilters] = React.useState({
    startDate: "",
    endDate: "",
    status: "ALL",
    paymentStatus: "ALL",
    search: "",
  });

  // Payment Reports State
  const [payments, setPayments] = React.useState<PaymentReportRow[]>([]);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [paymentFilters, setPaymentFilters] = React.useState({
    startDate: "",
    endDate: "",
    status: "ALL",
    environment: "ALL",
    paymentMethod: "ALL",
    search: "",
  });

  // Customer Reports State
  const [customers, setCustomers] = React.useState<CustomerReportRow[]>([]);
  const [customerLoading, setCustomerLoading] = React.useState(false);
  const [customerFilters, setCustomerFilters] = React.useState({
    search: "",
    minVisits: "0",
  });

  // Load Dashboard Analytics
  const loadAnalytics = React.useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const res = await fetch("/api/admin/reports/dashboard");
      const json = await res.json();
      if (json.success && json.data) {
        setAnalytics(json.data);
      }
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Load Bookings Report
  const loadBookings = React.useCallback(async () => {
    try {
      setBookingLoading(true);
      const params = new URLSearchParams();
      if (bookingFilters.startDate) params.set("startDate", bookingFilters.startDate);
      if (bookingFilters.endDate) params.set("endDate", bookingFilters.endDate);
      if (bookingFilters.status !== "ALL") params.set("status", bookingFilters.status);
      if (bookingFilters.paymentStatus !== "ALL") params.set("paymentStatus", bookingFilters.paymentStatus);
      if (bookingFilters.search) params.set("search", bookingFilters.search);

      const res = await fetch(`/api/admin/reports/bookings?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setBookings(json.data);
      }
    } catch (e) {
      console.error("Failed to load bookings:", e);
    } finally {
      setBookingLoading(false);
    }
  }, [bookingFilters]);

  // Load Payments Report
  const loadPayments = React.useCallback(async () => {
    try {
      setPaymentLoading(true);
      const params = new URLSearchParams();
      if (paymentFilters.startDate) params.set("startDate", paymentFilters.startDate);
      if (paymentFilters.endDate) params.set("endDate", paymentFilters.endDate);
      if (paymentFilters.status !== "ALL") params.set("status", paymentFilters.status);
      if (paymentFilters.environment !== "ALL") params.set("environment", paymentFilters.environment);
      if (paymentFilters.paymentMethod !== "ALL") params.set("paymentMethod", paymentFilters.paymentMethod);
      if (paymentFilters.search) params.set("search", paymentFilters.search);

      const res = await fetch(`/api/admin/reports/payments?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPayments(json.data);
      }
    } catch (e) {
      console.error("Failed to load payments:", e);
    } finally {
      setPaymentLoading(false);
    }
  }, [paymentFilters]);

  // Load Customers Report
  const loadCustomers = React.useCallback(async () => {
    try {
      setCustomerLoading(true);
      const params = new URLSearchParams();
      if (customerFilters.search) params.set("search", customerFilters.search);
      if (customerFilters.minVisits !== "0") params.set("minVisits", customerFilters.minVisits);

      const res = await fetch(`/api/admin/reports/customers?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomers(json.data);
      }
    } catch (e) {
      console.error("Failed to load customers:", e);
    } finally {
      setCustomerLoading(false);
    }
  }, [customerFilters]);

  React.useEffect(() => {
    if (activeTab === "analytics") loadAnalytics();
    else if (activeTab === "bookings") loadBookings();
    else if (activeTab === "payments") loadPayments();
    else if (activeTab === "customers") loadCustomers();
  }, [activeTab, loadAnalytics, loadBookings, loadPayments, loadCustomers]);

  // Download export triggers
  const downloadBookings = (format: "csv" | "xlsx") => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (bookingFilters.startDate) params.set("startDate", bookingFilters.startDate);
    if (bookingFilters.endDate) params.set("endDate", bookingFilters.endDate);
    if (bookingFilters.status !== "ALL") params.set("status", bookingFilters.status);
    if (bookingFilters.paymentStatus !== "ALL") params.set("paymentStatus", bookingFilters.paymentStatus);
    if (bookingFilters.search) params.set("search", bookingFilters.search);
    window.open(`/api/admin/reports/bookings?${params.toString()}`, "_blank");
  };

  const downloadPayments = (format: "csv" | "xlsx") => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (paymentFilters.startDate) params.set("startDate", paymentFilters.startDate);
    if (paymentFilters.endDate) params.set("endDate", paymentFilters.endDate);
    if (paymentFilters.status !== "ALL") params.set("status", paymentFilters.status);
    if (paymentFilters.environment !== "ALL") params.set("environment", paymentFilters.environment);
    if (paymentFilters.paymentMethod !== "ALL") params.set("paymentMethod", paymentFilters.paymentMethod);
    if (paymentFilters.search) params.set("search", paymentFilters.search);
    window.open(`/api/admin/reports/payments?${params.toString()}`, "_blank");
  };

  const downloadCustomers = (format: "csv" | "xlsx") => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (customerFilters.search) params.set("search", customerFilters.search);
    if (customerFilters.minVisits !== "0") params.set("minVisits", customerFilters.minVisits);
    window.open(`/api/admin/reports/customers?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-borderBlack/60 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-salon-gold/20 text-salon-gold border border-salon-gold/30">
              Executive Auditing & CRM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Reports & Business Ledger
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            The Jawed Habib Salon – Lalganj &bull; Financial Reconciliation, Booking Datasets & CRM Exports
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-salon-borderBlack">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-salon-gold text-salon-richBlack font-semibold shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Analytics & Recon
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "bookings"
                ? "bg-salon-gold text-salon-richBlack font-semibold shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Booking Reports
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "payments"
                ? "bg-salon-gold text-salon-richBlack font-semibold shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Payment Reports
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "customers"
                ? "bg-salon-gold text-salon-richBlack font-semibold shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Customer CRM
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ANALYTICS & FINANCIAL RECONCILIATION */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
              <RefreshCw className="h-8 w-8 animate-spin text-salon-gold mb-3" />
              <span>Reconciling financial metrics and appointments...</span>
            </div>
          ) : analytics ? (
            <>
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Booked Gross Value */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-salon-borderBlack shadow-lg">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Booked Face Value</span>
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="mt-3 text-2xl font-bold font-serif text-white">
                    ₹ {analytics.financials.grossBookedValue.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Gross potential of {analytics.operations.totalAppointments} booked visits
                  </div>
                </div>

                {/* 2. Verified Collected Revenue */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-salon-gold/30 shadow-lg shadow-salon-gold/5">
                  <div className="flex items-center justify-between text-salon-gold text-xs font-medium">
                    <span>Verified Realized Revenue</span>
                    <IndianRupee className="h-4 w-4 text-salon-gold" />
                  </div>
                  <div className="mt-3 text-2xl font-bold font-serif text-salon-goldLight">
                    ₹ {analytics.financials.netVerifiedRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Online Razorpay + counter captured payments
                  </div>
                </div>

                {/* 3. Advance Deposits Collected */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-salon-borderBlack shadow-lg">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Advance Deposits Held</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-3 text-2xl font-bold font-serif text-emerald-400">
                    ₹ {analytics.financials.advanceCollected.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Slot reservations secured in advance
                  </div>
                </div>

                {/* 4. Outstanding Receivables */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-salon-borderBlack shadow-lg">
                  <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                    <span>Pending Counter Balance</span>
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="mt-3 text-2xl font-bold font-serif text-amber-300">
                    ₹ {analytics.financials.totalOutstandingBalance.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    To be collected at salon counter upon service
                  </div>
                </div>
              </div>

              {/* Operations & Safety Audit Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reconciliation Summary */}
                <div className="p-6 rounded-2xl bg-zinc-900/70 border border-salon-borderBlack space-y-4">
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-salon-gold" />
                    <span>Financial Reconciliation</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-zinc-800">
                      <span className="text-zinc-400">Gross Captured Payments</span>
                      <span className="text-white font-semibold">
                        ₹ {analytics.financials.grossCollectedRevenue.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-800">
                      <span className="text-zinc-400">Refunds Processed ({analytics.financials.totalRefundsCount})</span>
                      <span className="text-red-400 font-semibold">
                        - ₹ {analytics.financials.totalRefundsAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-zinc-800">
                      <span className="text-salon-gold font-medium">Net Realized Revenue</span>
                      <span className="text-salon-gold font-bold">
                        ₹ {analytics.financials.netVerifiedRevenue.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-zinc-400">Failed / Aborted Transactions</span>
                      <span className="text-zinc-300">
                        {analytics.financials.failedPaymentsCount} attempts (₹ {analytics.financials.failedPaymentsAmount.toLocaleString("en-IN")})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Appointment Operational Status */}
                <div className="p-6 rounded-2xl bg-zinc-900/70 border border-salon-borderBlack space-y-4">
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-salon-gold" />
                    <span>Operational Performance</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <div className="text-zinc-500">Confirmed Bookings</div>
                      <div className="text-lg font-bold text-white mt-1">
                        {analytics.operations.confirmedCount}
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <div className="text-zinc-500">Completed Visits</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">
                        {analytics.operations.completedCount}
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <div className="text-zinc-500">Cancelled Bookings</div>
                      <div className="text-lg font-bold text-rose-400 mt-1">
                        {analytics.operations.cancelledCount}
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                      <div className="text-zinc-500">Cancellation Rate</div>
                      <div className="text-lg font-bold text-amber-400 mt-1">
                        {analytics.operations.cancellationRate}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Services by Demand */}
                <div className="p-6 rounded-2xl bg-zinc-900/70 border border-salon-borderBlack space-y-4">
                  <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center space-x-2">
                    <Scissors className="h-4 w-4 text-salon-gold" />
                    <span>Top Performing Services</span>
                  </h3>
                  <div className="space-y-2.5 overflow-y-auto max-h-56">
                    {analytics.topServices.length === 0 ? (
                      <div className="text-zinc-500 text-xs py-4 text-center">
                        No service bookings recorded yet
                      </div>
                    ) : (
                      analytics.topServices.map((srv, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs"
                        >
                          <div>
                            <div className="font-medium text-white">{srv.serviceName}</div>
                            <div className="text-[10px] text-zinc-500">{srv.categoryName}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-salon-gold">{srv.bookings} visits</div>
                            <div className="text-[10px] text-zinc-400">
                              ₹ {srv.revenue.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOOKING REPORTS & EXPORT */}
      {/* ========================================================================= */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          {/* Filter Bar & Export Actions */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-salon-borderBlack flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search client, phone, ref..."
                  value={bookingFilters.search}
                  onChange={(e) => setBookingFilters({ ...bookingFilters, search: e.target.value })}
                  className="pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-salon-gold w-48"
                />
              </div>

              <div>
                <input
                  type="date"
                  value={bookingFilters.startDate}
                  onChange={(e) => setBookingFilters({ ...bookingFilters, startDate: e.target.value })}
                  className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-salon-gold"
                />
              </div>

              <div>
                <input
                  type="date"
                  value={bookingFilters.endDate}
                  onChange={(e) => setBookingFilters({ ...bookingFilters, endDate: e.target.value })}
                  className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-salon-gold"
                />
              </div>

              <select
                value={bookingFilters.status}
                onChange={(e) => setBookingFilters({ ...bookingFilters, status: e.target.value })}
                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-salon-gold"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PENDING">PENDING</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <select
                value={bookingFilters.paymentStatus}
                onChange={(e) => setBookingFilters({ ...bookingFilters, paymentStatus: e.target.value })}
                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-salon-gold"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">PAID</option>
                <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                <option value="UNPAID">UNPAID</option>
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadBookings("csv")}
                className="text-xs border-salon-gold/40 text-salon-goldLight hover:bg-salon-gold/10"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={() => downloadBookings("xlsx")}
                className="text-xs bg-salon-gold hover:bg-salon-goldLight text-salon-richBlack font-semibold"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                Export Excel (.xlsx)
              </Button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="rounded-2xl border border-salon-borderBlack bg-zinc-950/60 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-salon-borderBlack uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3 text-right">Price (₹)</th>
                    <th className="p-3 text-right">Advance (₹)</th>
                    <th className="p-3 text-right">Paid (₹)</th>
                    <th className="p-3 text-right">Balance (₹)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {bookingLoading ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-zinc-500">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-salon-gold mb-2" />
                        Loading bookings dataset...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-zinc-500">
                        No appointments found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((row) => (
                      <tr key={row.bookingReference} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-3 font-mono font-medium text-salon-gold">
                          {row.bookingReference}
                        </td>
                        <td className="p-3 font-medium text-white">{row.customerName}</td>
                        <td className="p-3 text-zinc-400">
                          <div>{row.mobileNumber}</div>
                          <div className="text-[10px] text-zinc-500">{row.email}</div>
                        </td>
                        <td className="p-3 text-zinc-300 max-w-xs truncate">{row.service}</td>
                        <td className="p-3">
                          <div>{String(row.appointmentDate || "")}</div>
                          <div className="text-[10px] text-zinc-500">{row.appointmentTime}</div>
                        </td>
                        <td className="p-3 text-right font-medium text-white">
                          ₹ {row.servicePriceSnapshot.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right text-zinc-400">
                          ₹ {row.advanceAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right text-emerald-400 font-semibold">
                          ₹ {row.amountPaid.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right text-amber-300 font-semibold">
                          ₹ {row.remainingBalance.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              row.bookingStatus === "CONFIRMED"
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                                : row.bookingStatus === "COMPLETED"
                                ? "bg-blue-950/80 text-blue-400 border border-blue-800/40"
                                : row.bookingStatus === "CANCELLED"
                                ? "bg-red-950/80 text-red-400 border border-red-800/40"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {row.bookingStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              row.paymentStatus === "PAID"
                                ? "bg-emerald-950/80 text-emerald-400"
                                : row.paymentStatus === "PARTIALLY_PAID"
                                ? "bg-amber-950/80 text-amber-300"
                                : "bg-red-950/80 text-red-400"
                            }`}
                          >
                            {row.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAYMENT LEDGER REPORTS & EXPORT */}
      {/* ========================================================================= */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          {/* Filter Bar & Export Actions */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-salon-borderBlack flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search customer, ID, order..."
                  value={paymentFilters.search}
                  onChange={(e) => setPaymentFilters({ ...paymentFilters, search: e.target.value })}
                  className="pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-salon-gold w-48"
                />
              </div>

              <div>
                <input
                  type="date"
                  value={paymentFilters.startDate}
                  onChange={(e) => setPaymentFilters({ ...paymentFilters, startDate: e.target.value })}
                  className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-salon-gold"
                />
              </div>

              <div>
                <input
                  type="date"
                  value={paymentFilters.endDate}
                  onChange={(e) => setPaymentFilters({ ...paymentFilters, endDate: e.target.value })}
                  className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-salon-gold"
                />
              </div>

              <select
                value={paymentFilters.status}
                onChange={(e) => setPaymentFilters({ ...paymentFilters, status: e.target.value })}
                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-salon-gold"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="CAPTURED">CAPTURED / SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>

              <select
                value={paymentFilters.environment}
                onChange={(e) => setPaymentFilters({ ...paymentFilters, environment: e.target.value })}
                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-salon-gold"
              >
                <option value="ALL">All Environments</option>
                <option value="TEST">TEST</option>
                <option value="LIVE">LIVE</option>
                <option value="OFFLINE">OFFLINE COUNTER</option>
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadPayments("csv")}
                className="text-xs border-salon-gold/40 text-salon-goldLight hover:bg-salon-gold/10"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={() => downloadPayments("xlsx")}
                className="text-xs bg-salon-gold hover:bg-salon-goldLight text-salon-richBlack font-semibold"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                Export Excel (.xlsx)
              </Button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="rounded-2xl border border-salon-borderBlack bg-zinc-950/60 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-salon-borderBlack uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Txn Reference</th>
                    <th className="p-3">Appointment</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Razorpay Order ID</th>
                    <th className="p-3">Payment ID</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Method</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Refund</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {paymentLoading ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-zinc-500">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-salon-gold mb-2" />
                        Loading transaction ledger...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-zinc-500">
                        No payment transactions recorded matching your filters.
                      </td>
                    </tr>
                  ) : (
                    payments.map((row) => (
                      <tr key={row.internalTransactionId} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-3 font-mono font-medium text-salon-gold">
                          {row.internalTransactionId}
                        </td>
                        <td className="p-3 font-mono text-zinc-400">{row.bookingReference}</td>
                        <td className="p-3 font-medium text-white">{row.customerName}</td>
                        <td className="p-3 font-mono text-zinc-400 text-[10px]">{row.razorpayOrderId}</td>
                        <td className="p-3 font-mono text-zinc-400 text-[10px]">{row.razorpayPaymentId}</td>
                        <td className="p-3 text-right font-bold text-emerald-400">
                          ₹ {row.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-zinc-400 text-[10px] uppercase">
                          {row.paymentPurpose.replace(/_/g, " ")}
                        </td>
                        <td className="p-3 text-zinc-300">{row.paymentMethod}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              row.paymentStatus === "CAPTURED" || row.paymentStatus === "SUCCESS"
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                                : row.paymentStatus === "FAILED"
                                ? "bg-red-950/80 text-red-400 border border-red-800/40"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {row.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {row.refundAmount > 0 ? (
                            <span className="text-red-400 font-medium">
                              ₹ {row.refundAmount.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="p-3 text-zinc-400 text-[10px]">{row.transactionDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CUSTOMER CRM REPORTS & EXPORT */}
      {/* ========================================================================= */}
      {activeTab === "customers" && (
        <div className="space-y-4">
          {/* Filter Bar & Export Actions */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-salon-borderBlack flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search name, phone, email..."
                  value={customerFilters.search}
                  onChange={(e) => setCustomerFilters({ ...customerFilters, search: e.target.value })}
                  className="pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-salon-gold w-64"
                />
              </div>

              <select
                value={customerFilters.minVisits}
                onChange={(e) => setCustomerFilters({ ...customerFilters, minVisits: e.target.value })}
                className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-salon-gold"
              >
                <option value="0">All Customer Tiers</option>
                <option value="2">2+ Visits (Returning)</option>
                <option value="5">5+ Visits (VIP Salon Club)</option>
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadCustomers("csv")}
                className="text-xs border-salon-gold/40 text-salon-goldLight hover:bg-salon-gold/10"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export CRM CSV
              </Button>
              <Button
                size="sm"
                onClick={() => downloadCustomers("xlsx")}
                className="text-xs bg-salon-gold hover:bg-salon-goldLight text-salon-richBlack font-semibold"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                Export CRM Excel
              </Button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-2xl border border-salon-borderBlack bg-zinc-950/60 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-salon-borderBlack uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Customer ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 text-center">Visits</th>
                    <th className="p-3 text-right">Lifetime Spend (₹)</th>
                    <th className="p-3">Last Visit</th>
                    <th className="p-3 text-center">Loyalty Tier</th>
                    <th className="p-3">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {customerLoading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-zinc-500">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto text-salon-gold mb-2" />
                        Loading customer CRM dataset...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-zinc-500">
                        No customer profiles found matching your query.
                      </td>
                    </tr>
                  ) : (
                    customers.map((row) => (
                      <tr key={row.customerId} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-3 font-mono text-zinc-400 text-[10px]">{row.customerId}</td>
                        <td className="p-3 font-medium text-white">{row.fullName}</td>
                        <td className="p-3 text-salon-gold font-mono">{row.phone}</td>
                        <td className="p-3 text-zinc-400">{row.email}</td>
                        <td className="p-3 text-center font-bold text-white">{row.totalVisits}</td>
                        <td className="p-3 text-right font-semibold text-emerald-400">
                          ₹ {row.lifetimeSpend.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-zinc-300">{row.lastVisitDate}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              row.loyaltyTier === "VIP Club Member"
                                ? "bg-salon-gold/20 text-salon-gold border border-salon-gold/40"
                                : row.loyaltyTier === "Regular Guest"
                                ? "bg-blue-950/80 text-blue-300 border border-blue-800/40"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            {row.loyaltyTier}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-500 text-[10px]">{row.registeredDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
