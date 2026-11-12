"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Calendar,
  Percent,
} from "lucide-react";

interface Offer {
  id: string;
  title: string;
  slug: string;
  description: string;
  discountType: string;
  discountValue: number;
  bannerImageUrl?: string | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isFeatured: boolean;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = React.useState<Offer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    title: "",
    slug: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 20,
    bannerImageUrl: "/images/hero/hero-bg.webp",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
    isFeatured: true,
  });

  const fetchOffers = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/offers");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOffers(json.data);
      }
    } catch (e) {
      console.error("Failed to load offers:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 20,
      bannerImageUrl: "/images/hero/hero-bg.webp",
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
      isFeatured: true,
    });
    setShowModal(true);
  };

  const openEditModal = (o: Offer) => {
    setEditingId(o.id);
    setFormData({
      title: o.title,
      slug: o.slug,
      description: o.description || "",
      discountType: (o.discountType as any) || "PERCENTAGE",
      discountValue: o.discountValue,
      bannerImageUrl: o.bannerImageUrl || "/images/hero/hero-bg.webp",
      validFrom: typeof o.validFrom === "string" ? o.validFrom.split("T")[0] : new Date().toISOString().split("T")[0],
      validUntil: typeof o.validUntil === "string" ? o.validUntil.split("T")[0] : new Date().toISOString().split("T")[0],
      isActive: o.isActive,
      isFeatured: o.isFeatured,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const url = editingId ? `/api/admin/offers/${editingId}` : "/api/admin/offers";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, slug }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(editingId ? "Offer campaign updated!" : "New campaign created!");
        setShowModal(false);
        fetchOffers();
      } else {
        alert(json.error || "Failed to save offer");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleToggleActive = async (o: Offer) => {
    try {
      const res = await fetch(`/api/admin/offers/${o.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !o.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        fetchOffers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete campaign "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Offer deleted");
        fetchOffers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Marketing</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Offers: {offers.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Promotional Offers &amp; Campaigns
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage festival discounts, new client promotions, and seasonal bundles
          </p>
        </div>

        <Button variant="gold" onClick={openAddModal} className="gap-2 shadow">
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </Button>
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

      {/* Offers Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading active campaigns...
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 uppercase tracking-wider text-[11px] text-zinc-400 font-medium">
                <tr>
                  <th className="p-3.5">Campaign Title</th>
                  <th className="p-3.5">Discount</th>
                  <th className="p-3.5">Validity Dates</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                      No active offers recorded. Click &quot;New Campaign&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  offers.map((o) => (
                    <tr key={o.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap font-medium text-white">
                        {o.title}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-bold text-salon-gold">
                        {o.discountType === "PERCENTAGE" ? `${o.discountValue}% OFF` : `₹${o.discountValue} FLAT OFF`}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                        {typeof o.validFrom === "string" ? o.validFrom.split("T")[0] : ""} → {typeof o.validUntil === "string" ? o.validUntil.split("T")[0] : ""}
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-zinc-400">
                        {o.description}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(o)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            o.isActive
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                              : "bg-zinc-900 text-zinc-500 border-zinc-800"
                          }`}
                        >
                          {o.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(o)}
                          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit Campaign"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(o.id, o.title)}
                          className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingId ? "Edit Campaign Offer" : "Create New Campaign Offer"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Campaign Headline *</label>
                <Input
                  required
                  placeholder="e.g. Wedding Season 25% Off Gold Facials"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-300 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Value *</label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Start Date *</label>
                  <Input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">End Date *</label>
                  <Input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Promotional Banner Image URL</label>
                <Input
                  placeholder="/images/hero/hero-bg.webp"
                  value={formData.bannerImageUrl}
                  onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Offer details and terms..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-salon-gold focus:ring-0"
                  />
                  <span>Active Campaign</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : editingId ? "Update Campaign" : "Publish Campaign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
