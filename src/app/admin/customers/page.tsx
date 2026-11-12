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

interface CustomerRecord {
  id: string;
  userId: string;
  notes: string | null;
  address: string | null;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
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

  const [editingNotes, setEditingNotes] = React.useState(false);
  const [notesText, setNotesText] = React.useState("");
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCustomers = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = searchTerm ? `?search=${encodeURIComponent(searchTerm.trim())}` : "";
      const res = await fetch(`/api/admin/customers${params}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCustomers(json.data);
      }
    } catch (e) {
      console.error("Failed to load customers:", e);
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

  // Open Details
  const handleOpenDetails = (c: CustomerRecord) => {
    setSelectedCustomer(c);
    setNotesText(c.notes || "");
    setEditingNotes(false);
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
    const totalLoyalty = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
    return { totalCustomers, totalSpentAll, totalLoyalty };
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          <p className="text-[11px] text-purple-400 font-medium">Loyalty Points Issued</p>
          <p className="font-serif text-2xl font-bold text-purple-400 mt-1">{stats.totalLoyalty}</p>
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

      {/* Customers Table */}
      <div className="rounded-xl border border-salon-borderBlack bg-salon-richBlack/50 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-salon-black/80 text-zinc-400 border-b border-salon-borderBlack uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="p-3.5">Client Profile</th>
                <th className="p-3.5">Contact Number</th>
                <th className="p-3.5">Total Visits</th>
                <th className="p-3.5">Total Spend</th>
                <th className="p-3.5">Loyalty Points</th>
                <th className="p-3.5">Registered Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-salon-borderBlack/40 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <RotateCcw className="h-4 w-4 animate-spin text-salon-gold" />
                      <span>Loading customer profiles...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No customers found matching your search term.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
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
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-white">{c.totalVisits || 1}</span> visits
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-salon-gold">
                        ₹{(c.totalSpent || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/60 text-purple-400 border border-purple-800/60">
                        {c.loyaltyPoints || 0} pts
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & Booking History Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-salon-richBlack border border-salon-borderBlack rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-salon-gold" />
                  <span>{selectedCustomer.user.name}</span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono">{selectedCustomer.user.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-zinc-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-salon-black p-3 rounded-lg border border-zinc-800 text-center">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Visits</span>
                <span className="font-mono text-sm font-bold text-white">{selectedCustomer.totalVisits || 1}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Total Spent</span>
                <span className="font-mono text-sm font-bold text-salon-gold">
                  ₹{(selectedCustomer.totalSpent || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Loyalty Points</span>
                <span className="font-mono text-sm font-bold text-purple-400">
                  {selectedCustomer.loyaltyPoints || 0}
                </span>
              </div>
            </div>

            {/* Direct Communication Buttons */}
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
            </div>

            {/* Custom Styling Notes */}
            <div className="space-y-1.5 text-xs">
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
                    <span>Edit</span>
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
                      Save
                    </button>
                  </div>
                )}
              </div>

              {editingNotes ? (
                <textarea
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="e.g. Prefers gold shimmer eye palette, sensitive skin to ammonia, prefers morning slots..."
                  className="w-full bg-salon-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white"
                />
              ) : (
                <div className="p-3 rounded-lg bg-salon-black border border-zinc-800 text-zinc-300 italic text-[11px]">
                  {selectedCustomer.notes || "No custom styling notes recorded yet."}
                </div>
              )}
            </div>

            {/* Booking History */}
            <div className="space-y-2 text-xs">
              <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider block">
                Appointment History
              </span>
              <div className="p-3 rounded-lg bg-salon-black border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-salon-gold font-bold">JH-LAL-2026-000131</span>
                  <span className="text-zinc-400">2026-11-16 at 15:00</span>
                </div>
                <div className="text-white font-medium">Party Makeup & Glam Styling</div>
                <div className="flex justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-900 font-mono">
                  <span>Advance: ₹1,000</span>
                  <span className="text-emerald-400 font-bold">PAID (Settled)</span>
                </div>
              </div>
            </div>

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
