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
  Search,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  RotateCw,
  Copy,
  Check,
  ExternalLink,
  X,
  Send,
} from "lucide-react";

interface Enquiry {
  id: string;
  enquiryNumber?: string | null;
  name: string;
  phone: string;
  email: string | null;
  serviceInterest: string | null;
  type: string;
  source?: string | null;
  message: string;
  adminNotes?: string | null;
  status: "NEW" | "CONTACTED" | "SCHEDULED" | "RESOLVED" | "SPAM";
  emailStatus?: "PENDING" | "SENT" | "FAILED" | "SIMULATED" | null;
  googleSheetsStatus?: "PENDING" | "SYNCED" | "FAILED" | "DISABLED" | null;
  emailSentAt?: string | null;
  sheetsSyncedAt?: string | null;
  lastError?: string | null;
  createdAt: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = React.useState<Enquiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [retryingId, setRetryingId] = React.useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = React.useState<Enquiry | null>(null);
  const [editNotes, setEditNotes] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  const fetchEnquiries = React.useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search.trim()) params.append("q", search.trim());

      const res = await fetch(`/api/admin/enquiries?${params.toString()}`, {
        signal: controller.signal,
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEnquiries(json.data);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Failed to load enquiries:", e);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchEnquiries();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEnquiries]);

  const handleCopyText = (text: string, label: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(keyId);
    setFeedback(`Copied ${label}`);
    setTimeout(() => {
      setCopiedId(null);
      setFeedback(null), 2500;
    });
  };

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

  const handleRetryIntegration = async (id: string, target: "email" | "sheets" | "all") => {
    try {
      setRetryingId(`${id}-${target}`);
      const res = await fetch(`/api/admin/enquiries/${id}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Integration retry completed (${target.toUpperCase()})`);
        fetchEnquiries();
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry(json.data);
        }
      } else {
        alert(json.error || "Retry failed");
      }
    } catch (err: any) {
      alert(err.message || "Retry network error");
    } finally {
      setRetryingId(null);
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
        setFeedback("Internal staff notes saved successfully!");
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

  const formatIST = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: "" };
      const date = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
      const time = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(d);
      return { date, time };
    } catch {
      return { date: dateStr, time: "" };
    }
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
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-emerald-400">
              New: {enquiries.filter((e) => e.status === "NEW").length}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Client Enquiries &amp; Consultation Leads
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage inquiries submitted from website contact forms, bridal consultations, Google Sheets synchronization, and email alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchEnquiries} className="gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs">
        {/* Status Filters */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 lg:pb-0">
          {["ALL", "NEW", "CONTACTED", "SCHEDULED", "RESOLVED", "SPAM"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${statusFilter === filter
                ? "bg-salon-gold text-black font-semibold shadow-sm"
                : "text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800"
                }`}
            >
              {filter}
              {filter !== "ALL" && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-black/40 text-current">
                  {enquiries.filter((e) => e.status === filter).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Database-side Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            placeholder="Search name, phone, service, ref ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border-zinc-800 pl-8 text-xs h-8 text-white"
          />
        </div>
      </div>

      {/* Enquiries Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading inquiries...
        </div>
      ) : enquiries.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          No inquiries found under filter &quot;{statusFilter}&quot;{search ? ` matching "${search}"` : ""}.
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 uppercase tracking-wider text-[11px] text-zinc-400 font-medium">
                <tr>
                  <th className="p-3.5">Ref ID &amp; Client</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Interest / Query</th>
                  <th className="p-3.5">Message Content</th>
                  <th className="p-3.5">Date &amp; Time (IST)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Sync &amp; Alerts</th>
                  <th className="p-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {enquiries.map((e) => {
                  const { date, time } = formatIST(e.createdAt);
                  const refId = e.enquiryNumber || e.id;
                  const isRetryingEmail = retryingId === `${e.id}-email`;
                  const isRetryingSheets = retryingId === `${e.id}-sheets`;

                  return (
                    <tr key={e.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Ref ID & Name */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[10px] text-salon-gold font-bold">
                            {refId}
                          </span>
                          <button
                            onClick={() => handleCopyText(refId, "Enquiry Ref ID", `ref-${e.id}`)}
                            className="text-zinc-500 hover:text-salon-gold p-0.5"
                            title="Copy Ref ID"
                          >
                            {copiedId === `ref-${e.id}` ? (
                              <Check className="h-2.5 w-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-2.5 w-2.5" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => openDetails(e)}
                          className="hover:text-salon-gold transition-colors text-left font-semibold text-white block truncate max-w-[140px]"
                          title={e.name}
                        >
                          {e.name}
                        </button>
                      </td>

                      {/* Contact Details */}
                      <td className="p-3.5 whitespace-nowrap">
                        <a
                          href={`tel:+91${e.phone.replace(/\D/g, "")}`}
                          className="font-mono text-salon-gold hover:underline font-semibold block"
                        >
                          +91 {e.phone}
                        </a>
                        {e.email ? (
                          <span className="text-[11px] text-zinc-400 truncate block max-w-[150px]" title={e.email}>
                            {e.email}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-600 block">No email provided</span>
                        )}
                      </td>

                      {/* Interest & Source */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-semibold text-white block">
                          {e.serviceInterest || "General Inquiry"}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">
                          Source: {e.source || e.type || "Website"}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="p-3.5 max-w-xs text-zinc-300">
                        <p className="line-clamp-2 text-xs" title={e.message}>
                          {e.message}
                        </p>
                      </td>

                      {/* Date & Time */}
                      <td className="p-3.5 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                        <div>{date}</div>
                        <div className="text-[10px] text-zinc-500">{time}</div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3.5 whitespace-nowrap">
                        <select
                          value={e.status}
                          onChange={(ev) => handleUpdateStatus(e.id, ev.target.value as any)}
                          className={`rounded border px-2 py-1 text-[11px] font-semibold focus:outline-none focus:border-salon-gold ${e.status === "NEW"
                            ? "bg-amber-950/80 text-amber-300 border-amber-800"
                            : e.status === "CONTACTED"
                              ? "bg-blue-950/80 text-blue-300 border-blue-800"
                              : e.status === "SCHEDULED"
                                ? "bg-purple-950/80 text-purple-300 border-purple-800"
                                : e.status === "RESOLVED"
                                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                  : "bg-red-950/80 text-red-300 border-red-800"
                            }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="SPAM">SPAM</option>
                        </select>
                      </td>

                      {/* Sync & Notification Badges */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          {/* Email Status */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-zinc-500 uppercase font-mono w-10">Email:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${e.emailStatus === "SENT" || e.emailStatus === "SIMULATED"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                : e.emailStatus === "FAILED"
                                  ? "bg-red-950/80 text-red-300 border-red-800"
                                  : "bg-amber-950/80 text-amber-300 border-amber-800"
                                }`}
                            >
                              {e.emailStatus || "PENDING"}
                            </span>
                            {e.emailStatus === "FAILED" && (
                              <button
                                onClick={() => handleRetryIntegration(e.id, "email")}
                                disabled={isRetryingEmail}
                                className="text-zinc-400 hover:text-salon-gold text-[9px] underline flex items-center gap-0.5 ml-1"
                                title="Retry Email Delivery"
                              >
                                <RotateCw className={`h-2.5 w-2.5 ${isRetryingEmail ? "animate-spin" : ""}`} />
                                <span>Retry</span>
                              </button>
                            )}
                          </div>

                          {/* Sheets Status */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-zinc-500 uppercase font-mono w-10">Sheets:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${e.googleSheetsStatus === "SYNCED" || (e.googleSheetsStatus as any) === "SIMULATED"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                                : e.googleSheetsStatus === "DISABLED"
                                  ? "bg-zinc-900 text-zinc-500 border-zinc-800"
                                  : e.googleSheetsStatus === "FAILED"
                                    ? "bg-red-950/80 text-red-300 border-red-800"
                                    : "bg-amber-950/80 text-amber-300 border-amber-800"
                                }`}
                            >
                              {e.googleSheetsStatus || "PENDING"}
                            </span>
                            {e.googleSheetsStatus === "FAILED" && (
                              <button
                                onClick={() => handleRetryIntegration(e.id, "sheets")}
                                disabled={isRetryingSheets}
                                className="text-zinc-400 hover:text-salon-gold text-[9px] underline flex items-center gap-0.5 ml-1"
                                title="Retry Google Sheets Sync"
                              >
                                <RotateCw className={`h-2.5 w-2.5 ${isRetryingSheets ? "animate-spin" : ""}`} />
                                <span>Retry</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="p-3.5 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => openDetails(e)}
                          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors inline-block"
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enquiry Detail & Internal Notes Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="gold">
                    {selectedEnquiry.enquiryNumber || selectedEnquiry.id}
                  </Badge>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">
                    {selectedEnquiry.source || "Website Contact Form"}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white">{selectedEnquiry.name}</h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="h-7 w-7 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer & Inquiry Details Card */}
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Mobile Phone</span>
                    <a href={`tel:+91${selectedEnquiry.phone}`} className="font-semibold text-salon-gold hover:underline font-mono">
                      +91 {selectedEnquiry.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Email Address</span>
                    <span className="text-zinc-300">{selectedEnquiry.email || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Service of Interest</span>
                    <span className="text-white font-medium">{selectedEnquiry.serviceInterest || "General Inquiry"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Current Status</span>
                    <span className="font-semibold text-salon-gold">{selectedEnquiry.status}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] mb-1 font-semibold uppercase tracking-wider">
                    Customer Submitted Message
                  </span>
                  <p className="text-zinc-200 bg-black/60 p-3 rounded-lg border border-zinc-800/80 leading-relaxed whitespace-pre-wrap">
                    {selectedEnquiry.message}
                  </p>
                </div>
              </div>

              {/* Integration Status & Synchronization Card */}
              <div className="rounded-xl bg-zinc-900/40 border border-zinc-800 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-salon-gold" />
                    <span>External Synchronization &amp; Alerts</span>
                  </span>
                  <button
                    onClick={() => handleRetryIntegration(selectedEnquiry.id, "all")}
                    disabled={Boolean(retryingId)}
                    className="text-salon-gold hover:underline text-[10px] flex items-center gap-1"
                  >
                    <RotateCw className={`h-3 w-3 ${retryingId ? "animate-spin" : ""}`} />
                    <span>Sync All Now</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Email Alert:</span>
                      <span className="font-semibold text-white">{selectedEnquiry.emailStatus || "PENDING"}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetryIntegration(selectedEnquiry.id, "email")}
                      disabled={Boolean(retryingId)}
                      className="h-6 text-[10px] px-2"
                    >
                      Retry Email
                    </Button>
                  </div>

                  <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-zinc-500 block text-[10px]">Google Sheets:</span>
                      <span className="font-semibold text-white">{selectedEnquiry.googleSheetsStatus || "PENDING"}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetryIntegration(selectedEnquiry.id, "sheets")}
                      disabled={Boolean(retryingId)}
                      className="h-6 text-[10px] px-2"
                    >
                      Retry Sheets
                    </Button>
                  </div>
                </div>

                {selectedEnquiry.lastError && (
                  <div className="rounded border border-red-500/30 bg-red-950/30 p-2 text-[10px] text-red-300 flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
                    <span className="break-all">{selectedEnquiry.lastError}</span>
                  </div>
                )}
              </div>

              {/* Status Update Quick Buttons */}
              <div className="space-y-1.5">
                <span className="text-zinc-400 block text-[11px] font-medium">Quick Status Change:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(["CONTACTED", "SCHEDULED", "RESOLVED", "SPAM"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedEnquiry.id, st)}
                      disabled={actionLoading}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-colors ${selectedEnquiry.status === st
                        ? "bg-salon-gold text-black border-salon-gold"
                        : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-salon-gold/50"
                        }`}
                    >
                      Mark as {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Admin Notes Form */}
              <form onSubmit={handleSaveNotes} className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="block text-salon-gold font-semibold text-[11px]">
                  Internal Staff Notes &amp; Follow-Up Logs:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Called client on 14th Nov, interested in Bridal package for December wedding..."
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
                <span className="text-zinc-500 text-[11px]">Direct Client Contact:</span>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/91${selectedEnquiry.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(selectedEnquiry.name)},%20this%20is%20The%20Jawed%20Habib%20Salon,%20Lalganj.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="border-emerald-700 text-emerald-400 gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp Chat</span>
                    </Button>
                  </a>
                  <a href={`tel:+91${selectedEnquiry.phone.replace(/\D/g, "")}`}>
                    <Button variant="outline" size="sm" className="border-zinc-700 text-salon-gold gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call Client</span>
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
