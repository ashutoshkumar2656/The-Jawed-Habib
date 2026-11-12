"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Award, Plus, Trash2, CheckCircle2, Edit2, Star } from "lucide-react";

interface BrandItem {
  id: string;
  name: string;
  logoUrl: string | null;
  category: string;
  description: string | null;
  isFeatured: boolean;
  sortOrder: number;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = React.useState<BrandItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    category: "Cosmetics & Haircare",
    description: "",
    logoUrl: "",
    isFeatured: true,
    sortOrder: 1,
  });

  const fetchBrands = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/brands");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBrands(json.data);
      }
    } catch (e) {
      console.error("Failed to load brands:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "Cosmetics & Haircare",
      description: "",
      logoUrl: "",
      isFeatured: true,
      sortOrder: brands.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (b: BrandItem) => {
    setEditingId(b.id);
    setFormData({
      name: b.name,
      category: b.category,
      description: b.description || "",
      logoUrl: b.logoUrl || "",
      isFeatured: b.isFeatured,
      sortOrder: b.sortOrder,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      const url = editingId ? `/api/admin/brands/${editingId}` : "/api/admin/brands";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(editingId ? "Brand partner updated!" : "Brand partner added!");
        setShowModal(false);
        fetchBrands();
      } else {
        alert(json.error || "Failed to save brand");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleToggleActive = async (b: BrandItem) => {
    try {
      const res = await fetch(`/api/admin/brands/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !b.isFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        fetchBrands();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete partner brand "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Brand deleted");
        fetchBrands();
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
            <Badge variant="gold">Partners</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Brands: {brands.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Premium Partner Brands Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage official cosmetic, haircare, and skin treatment brand partners showcased on the website
          </p>
        </div>

        <Button variant="gold" onClick={openAddModal} className="gap-2 shadow">
          <Plus className="h-4 w-4" />
          <span>Add Brand Partner</span>
        </Button>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Brands Table */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading partner brands...
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 uppercase tracking-wider text-[11px] text-zinc-400 font-medium">
                <tr>
                  <th className="p-3.5">Brand Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Display Order</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                      No brands recorded. Click &quot;Add Brand Partner&quot; above to add one.
                    </td>
                  </tr>
                ) : (
                  brands.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap font-medium text-white flex items-center gap-2">
                        <Award className="h-4 w-4 text-salon-gold" />
                        <span>{b.name}</span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-zinc-400">
                        {b.category}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-zinc-300">
                        #{b.sortOrder}
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-zinc-400">
                        {b.description || "Official Salon Product Partner"}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(b)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            b.isFeatured
                              ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                              : "bg-zinc-900 text-zinc-500 border-zinc-800"
                          }`}
                        >
                          {b.isFeatured ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit Brand"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name)}
                          className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Delete Brand"
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

      {/* Add / Edit Brand Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingId ? "Edit Brand Details" : "Add Premium Partner Brand"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Brand Name *</label>
                <Input
                  required
                  placeholder="e.g. L'Oreal Professionnel Paris"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Brand Logo URL</label>
                <Input
                  placeholder="/images/brands/loreal.webp"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Category</label>
                  <Input
                    placeholder="Cosmetics & Haircare"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
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
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Official partnership details..."
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
                  <span>Display on Website Homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : editingId ? "Save Changes" : "Add Brand"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
