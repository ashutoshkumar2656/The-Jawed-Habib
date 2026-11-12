"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Phone,
  CheckCircle,
  MessageSquare,
  Clock,
  UserCheck,
  Eye,
  MessageCircle,
} from "lucide-react";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  serviceInterest: string | null;
  type: string;
  message: string;
  adminNotes?: string | null;
  status: "NEW" | "CONTACTED" | "SCHEDULED" | "RESOLVED" | "SPAM";
  createdAt: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = React.useState<Enquiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = React.useState<Enquiry | null>(null);
  const [editNotes, setEditNotes] = React.useState("");

  const fetchEnquiries = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/enquiries${params}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEnquiries(json.data);
      }
    } catch (e) {
      console.error("Failed to load enquiries:", e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleUpdateStatus = async (id: string, newStatus: Enquiry["status"]) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Enquiry marked as ${newStatus}`);
        fetchEnquiries();
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      } else {
        alert(json.error || "Failed to update enquiry");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedEnquiry.status,
          adminNotes: editNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("Internal notes saved successfully!");
        fetchEnquiries();
        setSelectedEnquiry({ ...selectedEnquiry, adminNotes: editNotes });
      } else {
        alert(json.error || "Failed to save notes");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const openDetails = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setEditNotes(enq.adminNotes || "");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Inbound Leads</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Leads: {enquiries.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Client Enquiries &amp; Consultation Leads
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage inquiries submitted from website contact forms, bridal consultations, and styling queries
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {["ALL", "NEW", "CONTACTED", "SCHEDULED", "RESOLVED", "SPAM"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                statusFilter === filter
                  ? "bg-salon-gold text-black font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Enquiries Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading inquiries...
        </div>
      ) : enquiries.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          No inquiries found under filter &quot;{statusFilter}&quot;.
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 uppercase tracking-wider text-[11px] text-zinc-400 font-medium">
                <tr>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Interest / Query</th>
                  <th className="p-3.5">Message Content</th>
                  <th className="p-3.5">Received Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3.5 whitespace-nowrap font-medium text-white">
                      <button
                        onClick={() => openDetails(e)}
                        className="hover:text-salon-gold transition-colors text-left font-semibold"
                      >
                        {e.name}
                      </button>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono text-salon-gold block">{e.phone}</span>
                      {e.email && <span className="text-[11px] text-zinc-500">{e.email}</span>}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-semibold text-white">
                      {e.serviceInterest || "General Inquiry"}
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-zinc-300">
                      {e.message}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                      {typeof e.createdAt === "string" ? e.createdAt.split("T")[0] : ""}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <select
                        value={e.status}
                        onChange={(ev) => handleUpdateStatus(e.id, ev.target.value as any)}
                        className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-salon-gold"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="SPAM">SPAM</option>
                      </select>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => openDetails(e)}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors inline-block"
                        title="View Details & Add Internal Notes"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={`https://wa.me/91${e.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(e.name)},%20thank%20you%20for%20contacting%20The%20Jawed%20Habib%20Salon,%20Lalganj.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900 transition-colors inline-block"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={`tel:+91${e.phone.replace(/\D/g, "")}`}
                        className="p-1.5 rounded bg-zinc-900 text-salon-gold border border-zinc-800 hover:bg-zinc-800 transition-colors inline-block"
                        title="Call Client"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enquiry Detail & Internal Notes Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Lead Enquiry Details</span>
                <h3 className="font-serif text-lg font-bold text-white">{selectedEnquiry.name}</h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="h-7 w-7 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-3.5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Phone Number</span>
                    <a href={`tel:+91${selectedEnquiry.phone}`} className="font-semibold text-salon-gold hover:underline">
                      {selectedEnquiry.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Email Address</span>
                    <span className="text-zinc-300">{selectedEnquiry.email || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Service Interest</span>
                    <span className="text-white font-medium">{selectedEnquiry.serviceInterest || "General"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Lead Status</span>
                    <span className="font-semibold text-salon-gold">{selectedEnquiry.status}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] mb-1">Customer Message</span>
                  <p className="text-zinc-200 bg-black/40 p-2.5 rounded border border-zinc-900 leading-relaxed">
                    {selectedEnquiry.message}
                  </p>
                </div>
              </div>

              {/* Internal Admin Notes Form */}
              <form onSubmit={handleSaveNotes} className="space-y-2">
                <label className="block text-salon-gold font-semibold text-[11px]">
                  Internal Staff Notes:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Called client on 10th Nov, interested in Bridal makeup package for Dec wedding..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 focus:outline-none focus:border-salon-gold"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="submit" variant="gold" size="sm" disabled={actionLoading}>
                    {actionLoading ? "Saving..." : "Save Internal Notes"}
                  </Button>
                </div>
              </form>

              {/* Direct Quick Contact Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Direct Contact:</span>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/91${selectedEnquiry.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(selectedEnquiry.name)},%20this%20is%20The%20Jawed%20Habib%20Salon,%20Lalganj.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="border-emerald-700 text-emerald-400 gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </Button>
                  </a>
                  <a href={`tel:+91${selectedEnquiry.phone.replace(/\D/g, "")}`}>
                    <Button variant="outline" size="sm" className="border-zinc-700 text-salon-gold gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call Now</span>
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
