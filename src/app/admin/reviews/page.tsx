"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  Edit2,
  ShieldCheck,
  MapPin,
  BookOpen,
  MessageCircle,
  Globe,
  ArrowUpDown,
  Filter,
} from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  title: string | null;
  comment: string;
  source?: "GOOGLE_MAPS" | "SALON_GUESTBOOK" | "WHATSAPP_VERIFIED" | "WEBSITE";
  category?: string;
  isVerified?: boolean;
  sortOrder?: number;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

const CATEGORIES = ["ALL", "Bridal", "Hair Care", "Skin & Spa", "Makeup", "General"];
const SOURCES = [
  { id: "ALL", label: "All Sources" },
  { id: "GOOGLE_MAPS", label: "Google Maps" },
  { id: "SALON_GUESTBOOK", label: "Salon Guestbook" },
  { id: "WHATSAPP_VERIFIED", label: "WhatsApp Verified" },
  { id: "WEBSITE", label: "Website Direct" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "APPROVED" | "PENDING">("ALL");
  const [categoryFilter, setCategoryFilter] = React.useState("ALL");
  const [sourceFilter, setSourceFilter] = React.useState("ALL");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Add / Edit Modal
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    customerName: "",
    rating: 5,
    title: "",
    comment: "",
    source: "GOOGLE_MAPS" as "GOOGLE_MAPS" | "SALON_GUESTBOOK" | "WHATSAPP_VERIFIED" | "WEBSITE",
    category: "Bridal",
    isVerified: true,
    isApproved: true,
    isFeatured: true,
    sortOrder: 1,
  });

  const fetchReviews = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReviews(json.data);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      customerName: "",
      rating: 5,
      title: "",
      comment: "",
      source: "GOOGLE_MAPS",
      category: "Bridal",
      isVerified: true,
      isApproved: true,
      isFeatured: false,
      sortOrder: reviews.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (r: Review) => {
    setEditingId(r.id);
    setFormData({
      customerName: r.customerName,
      rating: r.rating,
      title: r.title || "",
      comment: r.comment,
      source: r.source || "GOOGLE_MAPS",
      category: r.category || "General",
      isVerified: r.isVerified !== undefined ? r.isVerified : true,
      isApproved: r.isApproved,
      isFeatured: r.isFeatured,
      sortOrder: r.sortOrder || 1,
    });
    setShowModal(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingId) {
        const res = await fetch(`/api/admin/reviews/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setFeedback("Review updated successfully!");
          setShowModal(false);
          fetchReviews();
        } else {
          alert(json.error || "Failed to update review");
        }
      } else {
        const res = await fetch("/api/admin/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setFeedback("Verified client review added!");
          setShowModal(false);
          fetchReviews();
        } else {
          alert(json.error || "Failed to create review");
        }
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleToggleStatus = async (id: string, isApproved: boolean) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("Approval status updated!");
        fetchReviews();
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("Featured spotlight updated!");
        fetchReviews();
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this client review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Review removed.");
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Reviews
  const filteredReviews = reviews.filter((r) => {
    if (categoryFilter !== "ALL" && (r.category || "General") !== categoryFilter) return false;
    if (sourceFilter !== "ALL" && (r.source || "WEBSITE") !== sourceFilter) return false;
    return true;
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Customer Voice</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Average Rating: {avgRating} ★ ({reviews.length} reviews)</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Customer Reviews &amp; Testimonial Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage legitimate verified reviews from Google Maps, Salon Guestbook, and WhatsApp client testimonials
          </p>
        </div>

        <Button variant="gold" onClick={openAddModal} className="gap-2 shadow">
          <Plus className="h-4 w-4" />
          <span>Add Verified Review</span>
        </Button>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs">
        {/* Status Filters */}
        <div className="flex items-center space-x-1">
          <span className="text-zinc-500 text-[11px] font-medium mr-2">Status:</span>
          {(["ALL", "APPROVED", "PENDING"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                statusFilter === filter
                  ? "bg-salon-gold text-black font-semibold"
                  : "text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          <span className="text-zinc-500 text-[11px] font-medium mr-2">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-zinc-800 text-salon-gold font-semibold border border-salon-gold/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Source Filter */}
        <div className="flex items-center space-x-1">
          <span className="text-zinc-500 text-[11px] font-medium mr-1">Source:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 focus:outline-none"
          >
            {SOURCES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading client reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          No reviews found matching current filters.
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 uppercase tracking-wider text-[11px] text-zinc-400 font-medium">
                <tr>
                  <th className="p-3.5">Order</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Rating &amp; Source</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Review Content</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Spotlight</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredReviews.map((r) => {
                  let sourceIcon = <Globe className="h-3 w-3 text-zinc-400 inline mr-1" />;
                  let sourceText = "Website";
                  if (r.source === "GOOGLE_MAPS") {
                    sourceIcon = <MapPin className="h-3 w-3 text-blue-400 inline mr-1" />;
                    sourceText = "Google Maps";
                  } else if (r.source === "SALON_GUESTBOOK") {
                    sourceIcon = <BookOpen className="h-3 w-3 text-amber-400 inline mr-1" />;
                    sourceText = "Guestbook";
                  } else if (r.source === "WHATSAPP_VERIFIED") {
                    sourceIcon = <MessageCircle className="h-3 w-3 text-emerald-400 inline mr-1" />;
                    sourceText = "WhatsApp";
                  }

                  return (
                    <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap font-mono text-zinc-500">
                        #{r.sortOrder || 1}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-medium text-white flex items-center gap-1.5">
                          <span>{r.customerName}</span>
                          {r.isVerified && (
                            <span title="Verified Client">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-salon-gold mb-1">
                          <Star className="h-3.5 w-3.5 fill-salon-gold text-salon-gold" />
                          <span>{r.rating} / 5</span>
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center">
                          {sourceIcon}
                          <span>{sourceText}</span>
                        </div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {r.category || "General"}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-sm">
                        {r.title && <p className="font-semibold text-white mb-0.5 text-xs">{r.title}</p>}
                        <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">{r.comment}</p>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(r.id, !r.isApproved)}
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                            r.isApproved
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60"
                              : "bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60"
                          }`}
                        >
                          {r.isApproved ? "Published" : "Unpublished"}
                        </button>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFeatured(r.id, !r.isFeatured)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                            r.isFeatured
                              ? "bg-salon-gold/20 text-salon-gold border-salon-gold/40 hover:bg-salon-gold/30"
                              : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                          }`}
                        >
                          {r.isFeatured ? "Featured ★" : "Make Featured"}
                        </button>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded text-zinc-400 hover:text-salon-gold transition-colors"
                          title="Edit Review"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingId ? "Edit Customer Review" : "Add Legitimate Customer Review"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Customer Full Name *</label>
                  <Input
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Star Rating (1-5) *</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-white font-medium focus:outline-none"
                  >
                    <option value={5}>5 Stars ★★★★★ (Exceptional)</option>
                    <option value={4}>4 Stars ★★★★☆ (Very Good)</option>
                    <option value={3}>3 Stars ★★★☆☆ (Good)</option>
                    <option value={2}>2 Stars ★★☆☆☆ (Average)</option>
                    <option value={1}>1 Star ★☆☆☆☆ (Needs Work)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Review Headline / Title</label>
                <Input
                  placeholder="e.g. Best bridal salon experience in Lalganj"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Review Comment / Feedback Text *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste genuine customer review comment..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-300 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Verification Source *</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 focus:outline-none"
                  >
                    <option value="GOOGLE_MAPS">Google Maps Review</option>
                    <option value="SALON_GUESTBOOK">Salon Guestbook (In-Person)</option>
                    <option value="WHATSAPP_VERIFIED">WhatsApp Verified Client</option>
                    <option value="WEBSITE">Website Direct Booking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Service Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 focus:outline-none"
                  >
                    <option value="Bridal">Bridal</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Skin & Spa">Skin &amp; Spa</option>
                    <option value="Makeup">Makeup</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Display Sort Order</label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="bg-zinc-900 border-zinc-800 text-white font-mono"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="rounded border-zinc-700 bg-zinc-900 text-salon-gold focus:ring-0"
                    />
                    <span>Mark as Verified Client</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-zinc-700 bg-zinc-900 text-salon-gold focus:ring-0"
                    />
                    <span>Spotlight on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : editingId ? "Update Review" : "Publish Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
