"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  User,
  Search,
  Award,
  Calendar,
  FileText,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Eye,
  Edit3,
  RotateCcw,
  MessageCircle,
  CreditCard,
  Clock,
  X,
  Check,
  Building2,
  CalendarCheck,
} from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { getKolkataDateString } from "@/lib/utils/timezone";

interface CustomerRecord {
  id: string;
  userId: string;
  notes: string | null;
  address: string | null;
  alternatePhone?: string | null;
  dateOfBirth?: string | null;
  anniversary?: string | null;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  totalBookings?: number;
  completedVisits?: number;
  upcomingAppointments?: number;
  cancelledAppointments?: number;
  noShowCount?: number;
  outstandingBalance?: number;
  lastVisitDate?: string | null;
  nextAppointmentDate?: string | null;
  loyaltyTier?: "VIP" | "REGULAR" | "NEW";
  createdAt: string;
  lastAppointmentDate: string | null;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    isActive: boolean;
  };
  appointments?: any[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = React.useState<CustomerRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerRecord | null>(null);

  const [profileLoading, setProfileLoading] = React.useState(false);
  const [customerDetails, setCustomerDetails] = React.useState<{
    customer: any;
    metrics: any;
    bookingHistory: any[];
    visitHistory: any[];
    financialSummary: any;
  } | null>(null);
  const [activeTab, setActiveTab] = React.useState<"details" | "bookings" | "visits" | "financials">("details");

  const [editingNotes, setEditingNotes] = React.useState(false);
  const [notesText, setNotesText] = React.useState("");
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  const fetchCustomers = React.useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm.trim())}` : "";
      const res = await fetch(`/api/admin/customers${params}`, { signal: controller.signal });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCustomers(json.data);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Failed to load customers:", e);
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  // Open Details & Load Full 4-Section Profile Dossier
  const handleOpenDetails = async (c: CustomerRecord) => {
    setSelectedCustomer(c);
    setNotesText(c.notes || "");
    setEditingNotes(false);
    setActiveTab("details");
    setCustomerDetails(null);
    setProfileLoading(true);

    try {
      const res = await fetch(`/api/admin/customers/${c.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomerDetails(json.data);
        if (json.data.customer?.notes !== undefined) {
          setNotesText(json.data.customer.notes || "");
        }
      }
    } catch (err) {
      console.error("Failed to load customer dossier:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    try {
      setSavingNotes(true);
      const res = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesText }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update notes");
      }
      setFeedback({ type: "success", text: "Customer styling preferences updated." });
      setSelectedCustomer({ ...selectedCustomer, notes: notesText });
      if (customerDetails) {
        setCustomerDetails({
          ...customerDetails,
          customer: { ...customerDetails.customer, notes: notesText },
        });
      }
      setEditingNotes(false);
      fetchCustomers();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSavingNotes(false);
    }
  };

  // Quick Stats
  const stats = React.useMemo(() => {
    const totalCustomers = customers.length;
    const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
    const totalLoyalty = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
    return { totalCustomers, totalSpentAll, totalOutstanding, totalLoyalty };
  }, [customers]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-salon-borderBlack pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="gold">Customer Relations</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Profiles, Visit History & Preferences</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Users className="h-7 w-7 text-salon-gold" />
            <span>Customer Directory</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track customer booking history, lifetime salon spend, loyalty rewards, and customized styling notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
            className="text-xs h-9 border-zinc-700 hover:text-white"
            title="Reload customers"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Toast Feedback */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-4">
          <p className="text-[11px] text-zinc-400 font-medium">Registered Clients</p>
          <p className="font-serif text-2xl font-bold text-white mt-1">{stats.totalCustomers}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Lalganj salon client base</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-4">
          <p className="text-[11px] text-salon-gold font-medium">Total Lifetime Spend</p>
          <p className="font-serif text-2xl font-bold text-salon-gold mt-1">
            ₹{stats.totalSpentAll.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Cumulative verified revenue</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-4">
          <p className="text-[11px] text-purple-400 font-medium">Outstanding Balances</p>
          <p className="font-serif text-2xl font-bold text-purple-400 mt-1">
            ₹{stats.totalOutstanding.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Payable at salon counter</p>
        </div>
        <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/60 p-4">
          <p className="text-[11px] text-emerald-400 font-medium">Loyalty Points Issued</p>
          <p className="font-serif text-2xl font-bold text-emerald-400 mt-1">{stats.totalLoyalty}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Active customer rewards</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-salon-richBlack/40 p-3 rounded-xl border border-salon-borderBlack flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, mobile phone number, or email..."
            className="pl-8 bg-salon-black border-zinc-800 text-xs h-8 text-white placeholder:text-zinc-500"
          />
        </div>
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="text-xs text-zinc-400 hover:text-white px-2">
            Clear
          </button>
        )}
      </div>

      {/* Customers Table (Desktop / Tablet) */}
      <div className="hidden md:block rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-salon-black/80 text-zinc-400 border-b border-salon-borderBlack uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="p-3.5">Client Profile</th>
                <th className="p-3.5">Contact Number</th>
                <th className="p-3.5">Tier</th>
                <th className="p-3.5">Visits / Bookings</th>
                <th className="p-3.5">Lifetime Spend</th>
                <th className="p-3.5">Balance Due</th>
                <th className="p-3.5">Last Visit</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-salon-borderBlack/40 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <RotateCcw className="h-4 w-4 animate-spin text-salon-gold" />
                      <span>Loading customer profiles...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    No customers found matching your search term.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const tier = c.loyaltyTier || (c.totalSpent >= 10000 ? "VIP" : c.totalVisits >= 2 ? "REGULAR" : "NEW");
                  const balance = c.outstandingBalance || 0;

                  return (
                    <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{c.user.name}</div>
                        {c.user.email && <div className="text-[10px] text-zinc-500">{c.user.email}</div>}
                      </td>
                      <td className="p-3.5 font-mono text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-salon-gold" />
                          <span>{c.user.phone}</span>
                          <a
                            href={`https://wa.me/91${c.user.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 ml-1"
                            title="Message on WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </a>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tier === "VIP"
                              ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                              : tier === "REGULAR"
                              ? "bg-blue-950/60 text-blue-400 border border-blue-800/60"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}
                        >
                          {tier}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-white">{c.completedVisits || c.totalVisits || 1}</span>
                        <span className="text-zinc-500 text-[10px]"> / {c.totalBookings || c.totalVisits || 1}</span>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="font-bold text-salon-gold">
                          ₹{(c.totalSpent || 0).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">
                        {balance > 0 ? (
                          <span className="text-purple-400 font-bold">₹{balance.toLocaleString("en-IN")}</span>
                        ) : (
                          <span className="text-zinc-500">₹0</span>
                        )}
                      </td>
                      <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                        {c.lastVisitDate || c.lastAppointmentDate || "—"}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(c)}
                          className="h-7 px-2 text-[11px] border-zinc-700 hover:text-white gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Profile</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Customer Cards (Smartphone Screens) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 rounded-xl border border-salon-borderBlack bg-salon-richBlack/50">
            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4 animate-spin text-salon-gold" />
              <span>Loading customer profiles...</span>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 text-xs">
            No customers found matching your search term.
          </div>
        ) : (
          customers.map((c) => {
            const tier = c.loyaltyTier || (c.totalSpent >= 10000 ? "VIP" : c.totalVisits >= 2 ? "REGULAR" : "NEW");
            const balance = c.outstandingBalance || 0;

            return (
              <div
                key={c.id}
                className="rounded-xl border border-salon-borderBlack bg-salon-cardBlack p-4 space-y-3 shadow-md"
              >
                {/* Header: Name + Tier Badge */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{c.user.name}</h4>
                    {c.user.email && (
                      <span className="text-[10px] text-zinc-500 truncate block max-w-[200px]">
                        {c.user.email}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tier === "VIP"
                        ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                        : tier === "REGULAR"
                        ? "bg-blue-950/60 text-blue-400 border border-blue-800/60"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {tier}
                  </span>
                </div>

                {/* Contact Row */}
                <div className="flex items-center justify-between text-xs border-t border-zinc-800/60 pt-2.5">
                  <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                    <Phone className="h-3.5 w-3.5 text-salon-gold" />
                    <a
                      href={`tel:+91${c.user.phone.replace(/\D/g, "")}`}
                      className="text-salon-gold hover:underline"
                    >
                      {c.user.phone}
                    </a>
                  </div>
                  <a
                    href={`https://wa.me/91${c.user.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs px-2 py-1 rounded bg-emerald-950/40 border border-emerald-800/40"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-3 gap-2 bg-black/40 rounded-lg p-2.5 border border-zinc-800/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Visits</span>
                    <span className="font-mono font-bold text-white">
                      {c.completedVisits || c.totalVisits || 1}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Spend</span>
                    <span className="font-mono font-bold text-salon-gold">
                      ₹{(c.totalSpent || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Balance</span>
                    <span className={`font-mono font-bold ${balance > 0 ? "text-purple-400" : "text-zinc-500"}`}>
                      ₹{balance.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Last Visit & Action */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-zinc-500 text-[11px]">
                    Last Visit: {c.lastVisitDate || c.lastAppointmentDate || "—"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetails(c)}
                    className="h-8 px-2.5 text-xs border-zinc-700 hover:text-white gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Profile</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Profile & 4-Section Dossier Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-salon-richBlack border border-salon-borderBlack rounded-xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-salon-gold" />
                    <span>{selectedCustomer.user.name}</span>
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (customerDetails?.metrics?.loyaltyTier || selectedCustomer.loyaltyTier) === "VIP"
                        ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                        : "bg-blue-950/60 text-blue-400 border border-blue-800/60"
                    }`}
                  >
                    {customerDetails?.metrics?.loyaltyTier || selectedCustomer.loyaltyTier || "CLIENT"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{selectedCustomer.user.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-zinc-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics (4 pillars) */}
            <div className="grid grid-cols-4 gap-2 bg-salon-black p-3 rounded-lg border border-zinc-800 text-center text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Total Bookings</span>
                <span className="font-mono text-sm font-bold text-white">
                  {customerDetails?.metrics?.totalBookings ?? selectedCustomer.totalBookings ?? selectedCustomer.totalVisits ?? 1}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Completed Visits</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {customerDetails?.metrics?.completedVisits ?? selectedCustomer.completedVisits ?? selectedCustomer.totalVisits ?? 1}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Lifetime Spend</span>
                <span className="font-mono text-sm font-bold text-salon-gold">
                  ₹{(customerDetails?.metrics?.totalSpent ?? selectedCustomer.totalSpent ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Balance Due</span>
                <span className="font-mono text-sm font-bold text-purple-400">
                  ₹{(customerDetails?.metrics?.outstandingBalance ?? selectedCustomer.outstandingBalance ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Direct Communication Bar */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedCustomer.user.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs font-semibold hover:text-white"
              >
                <Phone className="h-3.5 w-3.5 text-salon-gold" />
                <span>Call Client</span>
              </a>
              <a
                href={`https://wa.me/91${selectedCustomer.user.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs font-semibold hover:text-emerald-200"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
              <a
                href="/admin/calendar"
                className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-salon-gold/10 border border-salon-gold/40 text-salon-goldLight text-xs font-semibold hover:bg-salon-gold/20"
              >
                <CalendarCheck className="h-3.5 w-3.5 text-salon-gold" />
                <span>Book Appointment</span>
              </a>
            </div>

            {/* 4-Section Tabs */}
            <div className="flex items-center gap-1 border-b border-zinc-800 text-xs">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === "details"
                    ? "border-salon-gold text-salon-gold font-semibold"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                A. Profile & Notes
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === "bookings"
                    ? "border-salon-gold text-salon-gold font-semibold"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                <span>B. Booking History</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
                  {customerDetails?.bookingHistory?.length ?? 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("visits")}
                className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === "visits"
                    ? "border-salon-gold text-salon-gold font-semibold"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                <span>C. Visit History</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400">
                  {customerDetails?.visitHistory?.length ?? 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("financials")}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === "financials"
                    ? "border-salon-gold text-salon-gold font-semibold"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                D. Financial Ledger
              </button>
            </div>

            {/* TAB CONTENT */}
            {profileLoading ? (
              <div className="p-8 text-center text-zinc-500 flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4 animate-spin text-salon-gold" />
                <span>Loading complete customer dossier...</span>
              </div>
            ) : (
              <>
                {/* Section A: Details & Styling Notes */}
                {activeTab === "details" && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3 bg-salon-black p-3.5 rounded-lg border border-zinc-800">
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Full Name</span>
                        <span className="font-semibold text-white">{selectedCustomer.user.name}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Primary Phone</span>
                        <span className="font-mono text-salon-gold">{selectedCustomer.user.phone}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Email</span>
                        <span className="text-zinc-300">{selectedCustomer.user.email || "Not provided"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Registered Date</span>
                        <span className="text-zinc-300">
                          {new Date(selectedCustomer.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      {selectedCustomer.address && (
                        <div className="col-span-2">
                          <span className="text-zinc-500 block text-[10px] uppercase">Address</span>
                          <span className="text-zinc-300">{selectedCustomer.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Custom Styling Notes */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                          Client Styling Preferences & Notes
                        </span>
                        {!editingNotes ? (
                          <button
                            onClick={() => setEditingNotes(true)}
                            className="text-[11px] text-salon-gold hover:underline flex items-center gap-1"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit Notes</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingNotes(false)}
                              className="text-[11px] text-zinc-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveNotes}
                              disabled={savingNotes}
                              className="text-[11px] text-emerald-400 font-bold hover:underline"
                            >
                              Save Notes
                            </button>
                          </div>
                        )}
                      </div>

                      {editingNotes ? (
                        <textarea
                          rows={3}
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="e.g. Prefers gold shimmer eye palette, sensitive scalp, ammonia-free hair color only..."
                          className="w-full bg-salon-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                        />
                      ) : (
                        <div className="p-3 rounded-lg bg-salon-black border border-zinc-800 text-zinc-300 italic text-[11px]">
                          {notesText || "No custom styling notes recorded yet."}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section B: Real Booking History */}
                {activeTab === "bookings" && (
                  <div className="space-y-2 text-xs max-h-[350px] overflow-y-auto pr-1">
                    {!customerDetails?.bookingHistory || customerDetails.bookingHistory.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 bg-salon-black rounded-lg border border-zinc-800">
                        No appointments on record for this client.
                      </div>
                    ) : (
                      customerDetails.bookingHistory.map((b: any) => {
                        const srvName =
                          b.package?.name ||
                          (b.appointmentServices && b.appointmentServices[0]?.service?.name) ||
                          "Salon Service";
                        const dateStr =
                          typeof b.appointmentDate === "string"
                            ? b.appointmentDate.split("T")[0]
                            : getKolkataDateString(new Date(b.appointmentDate));

                        return (
                          <div
                            key={b.id}
                            className="p-3 rounded-lg bg-salon-black border border-zinc-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono text-salon-gold font-bold">{b.appointmentNumber}</span>
                              <span className="text-zinc-400">
                                {dateStr} at {b.startTime}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">{srvName}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  b.status === "COMPLETED"
                                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                                    : b.status === "CONFIRMED"
                                    ? "bg-blue-950/60 text-blue-400 border border-blue-800/60"
                                    : b.status === "CHECKED_IN"
                                    ? "bg-teal-950/60 text-teal-400 border border-teal-800/60"
                                    : b.status === "IN_PROGRESS"
                                    ? "bg-indigo-950/60 text-indigo-400 border border-indigo-800/60"
                                    : b.status === "NO_SHOW"
                                    ? "bg-rose-950/60 text-rose-400 border border-rose-800/60"
                                    : "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                            {b.staff && (
                              <div className="text-[11px] text-zinc-400">
                                Stylist: <span className="text-zinc-300">{b.staff.user?.name || b.staff.name}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-900 font-mono">
                              <span>Total: ₹{b.totalAmount}</span>
                              <span>Advance: ₹{b.depositAmount || 0}</span>
                              <span
                                className={
                                  (b.remainingAmount || 0) > 0 ? "text-purple-400 font-bold" : "text-emerald-400"
                                }
                              >
                                Due: ₹{b.remainingAmount || 0}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Section C: Real Visit History (Completed appointments) */}
                {activeTab === "visits" && (
                  <div className="space-y-2 text-xs max-h-[350px] overflow-y-auto pr-1">
                    {!customerDetails?.visitHistory || customerDetails.visitHistory.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 bg-salon-black rounded-lg border border-zinc-800">
                        No completed visits recorded yet.
                      </div>
                    ) : (
                      customerDetails.visitHistory.map((v: any) => {
                        const srvName =
                          v.package?.name ||
                          (v.appointmentServices && v.appointmentServices[0]?.service?.name) ||
                          "Salon Service";
                        const dateStr =
                          typeof v.appointmentDate === "string"
                            ? v.appointmentDate.split("T")[0]
                            : getKolkataDateString(new Date(v.appointmentDate));

                        return (
                          <div
                            key={v.id}
                            className="p-3 rounded-lg bg-salon-black border border-zinc-800 space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-white">{srvName}</span>
                              <span className="font-mono text-salon-gold font-bold">
                                ₹{v.totalAmount?.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                              <span>Visit Date: {dateStr} at {v.startTime}</span>
                              <span className="text-emerald-400 font-medium">Verified Completed</span>
                            </div>
                            {v.staff && (
                              <div className="text-[10px] text-zinc-500">
                                Performed by {v.staff.user?.name || v.staff.name}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Section D: Financial Ledger Summary */}
                {activeTab === "financials" && (
                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-lg bg-salon-black border border-zinc-800 space-y-2 font-mono">
                      <div className="flex justify-between text-zinc-400">
                        <span>Total Lifetime Billed:</span>
                        <span className="text-white font-bold">
                          ₹{(customerDetails?.financialSummary?.totalBilled ?? selectedCustomer.totalSpent ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Total Advance / Online Paid:</span>
                        <span className="text-emerald-400 font-semibold">
                          ₹{(customerDetails?.financialSummary?.totalAdvancePaid ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-white font-bold border-t border-zinc-800 pt-2">
                        <span>Outstanding Counter Balance:</span>
                        <span
                          className={
                            (customerDetails?.financialSummary?.outstandingBalance ?? 0) > 0
                              ? "text-purple-400 text-sm font-bold"
                              : "text-zinc-500"
                          }
                        >
                          ₹{(customerDetails?.financialSummary?.outstandingBalance ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-salon-black border border-zinc-800 text-zinc-400 text-[11px]">
                      <span className="font-semibold text-zinc-300 block mb-1">Payment Reconciliation:</span>
                      All counter balances must be settled at the salon reception desk. Once collected via the Booking Management Hub, official digital receipts are generated.
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
