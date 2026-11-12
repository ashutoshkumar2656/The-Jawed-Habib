"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  Scissors,
  Star,
  Edit2,
  Eye,
  EyeOff,
} from "lucide-react";

interface Transformation {
  id: string;
  title: string;
  description: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  serviceId: string | null;
  staffId: string | null;
  clientGender: string;
  isFeatured: boolean;
  sortOrder: number;
}

export default function AdminTransformationsPage() {
  const [transformations, setTransformations] = React.useState<Transformation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    beforeImageUrl: "/images/services/hair-spa.webp",
    afterImageUrl: "/images/services/womens-cut.webp",
    serviceId: "srv_6",
    staffId: "stf_2",
    clientGender: "UNISEX" as const,
    isFeatured: true,
    sortOrder: 1,
  });

  const fetchTransformations = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/transformations");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTransformations(json.data);
      }
    } catch (e) {
      console.error("Failed to load transformations:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTransformations();
  }, [fetchTransformations]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      beforeImageUrl: "/images/services/hair-spa.webp",
      afterImageUrl: "/images/services/womens-cut.webp",
      serviceId: "srv_6",
      staffId: "stf_2",
      clientGender: "UNISEX",
      isFeatured: true,
      sortOrder: transformations.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (t: Transformation) => {
    setEditingId(t.id);
    setFormData({
      title: t.title,
      description: t.description || "",
      beforeImageUrl: t.beforeImageUrl,
      afterImageUrl: t.afterImageUrl,
      serviceId: t.serviceId || "srv_6",
      staffId: t.staffId || "stf_2",
      clientGender: (t.clientGender as any) || "UNISEX",
      isFeatured: t.isFeatured,
      sortOrder: t.sortOrder,
    });
    setShowModal(true);
  };

  const handleSaveTransformation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const url = editingId ? `/api/admin/transformations/${editingId}` : "/api/admin/transformations";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(editingId ? "Transformation updated!" : "New transformation published!");
        setShowModal(false);
        fetchTransformations();
      } else {
        alert(json.error || "Failed to save transformation");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleTogglePublish = async (t: Transformation) => {
    try {
      const res = await fetch(`/api/admin/transformations/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !t.isFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        fetchTransformations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTransformation = async (id: string, title: string) => {
    if (!confirm(`Delete transformation "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/transformations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Transformation deleted");
        fetchTransformations();
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
            <Badge variant="gold">Visual Proof</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Showcases: {transformations.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Before &amp; After Transformations
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage interactive makeover comparison sliders for hair coloring, styling, and treatments
          </p>
        </div>

        <Button variant="gold" onClick={openAddModal} className="gap-2 shadow">
          <Plus className="h-4 w-4" />
          <span>Add Transformation</span>
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

      {/* Transformations Grid */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading transformation showcases...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transformations.length === 0 ? (
            <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
              No transformations found. Click &quot;Add Transformation&quot; above to create one.
            </div>
          ) : (
            transformations.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-salon-borderBlack bg-salon-cardBlack overflow-hidden hover:border-salon-gold/50 transition-all flex flex-col justify-between"
              >
                {/* Before & After Dual Images */}
                <div className="grid grid-cols-2 gap-1 bg-zinc-900 relative">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={t.beforeImageUrl}
                      alt="Before"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-zinc-300">
                      BEFORE
                    </span>
                  </div>
                  <div className="relative aspect-square w-full">
                    <Image
                      src={t.afterImageUrl}
                      alt="After"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-salon-gold border border-salon-gold/40">
                      AFTER
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-sm font-bold text-white line-clamp-1">{t.title}</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">#{t.sortOrder}</span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2">{t.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleTogglePublish(t)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        t.isFeatured
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                          : "bg-zinc-900 text-zinc-500 border-zinc-800"
                      }`}
                    >
                      {t.isFeatured ? "Published" : "Hidden"}
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Edit Transformation"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransformation(t.id, t.title)}
                        className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        title="Delete Transformation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Transformation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingId ? "Edit Transformation" : "Add Before & After Showcase"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleSaveTransformation} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Makeover Title *</label>
                <Input
                  required
                  placeholder="e.g. Copper Balayage & Keratin Smoothing"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Before Image URL *</label>
                  <Input
                    required
                    placeholder="/images/services/hair-spa.webp"
                    value={formData.beforeImageUrl}
                    onChange={(e) => setFormData({ ...formData, beforeImageUrl: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">After Image URL *</label>
                  <Input
                    required
                    placeholder="/images/services/womens-cut.webp"
                    value={formData.afterImageUrl}
                    onChange={(e) => setFormData({ ...formData, afterImageUrl: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
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
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Gender Target</label>
                  <select
                    value={formData.clientGender}
                    onChange={(e) => setFormData({ ...formData, clientGender: e.target.value as any })}
                    className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-300 focus:outline-none"
                  >
                    <option value="UNISEX">UNISEX</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="MALE">MALE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details of client transformation and products used..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-salon-gold focus:ring-0"
                  />
                  <span>Publish to Public Sliders</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : editingId ? "Update Showcase" : "Publish Transformation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
