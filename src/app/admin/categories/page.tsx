"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowUpDown,
  Tag,
  AlertCircle,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  iconName: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    services?: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    sortOrder: 1,
    isActive: true,
  });

  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      sortOrder: cat.sortOrder || 1,
      isActive: cat.isActive,
    });
    setShowModal(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingId) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, name, slug }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Category name is required");
      return;
    }

    try {
      setActionLoading(true);
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setFeedback(
          editingId
            ? "Category updated successfully!"
            : "New category created successfully!"
        );
        fetchCategories();
      } else {
        alert(json.error || "Failed to save category");
      }
    } catch (e: any) {
      alert(e.message || "Failed to save category");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleTogglePublish = async (cat: CategoryItem) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: !cat.isActive } : c))
        );
        setFeedback(
          cat.isActive
            ? `Category '${cat.name}' unpublished`
            : `Category '${cat.name}' published to website`
        );
      }
    } catch (e) {
      console.error("Failed to toggle category status:", e);
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? Services linked to this category may need reassignment.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setFeedback(`Category '${name}' deleted successfully.`);
      } else {
        alert(json.error || "Failed to delete category");
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete category");
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Catalogue Architecture</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total: {categories.length} Categories</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Service Categories Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Add, reorder, edit, and toggle service category groupings displayed across the public website and booking calendar
          </p>
        </div>

        <Button
          variant="gold"
          onClick={openAddModal}
          className="gap-2 shadow-[0_0_20px_rgba(198,165,107,0.25)] hover:scale-[1.02] transition-transform"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </Button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs animate-in fade-in duration-200">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Controls: Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-salon-gold"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500 border border-zinc-800/80 rounded-2xl bg-zinc-950">
          Loading service categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center border border-zinc-800/80 rounded-2xl bg-zinc-950 space-y-3">
          <Layers className="h-8 w-8 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-400">No categories found matching your query.</p>
          <Button variant="outline" size="sm" onClick={openAddModal} className="text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Create First Category</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all group ${
                cat.isActive
                  ? "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                  : "border-zinc-900 bg-zinc-950/50 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {cat.imageUrl ? (
                      <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                        <Image src={cat.imageUrl} alt={cat.name} fill sizes="40px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-xl border border-salon-gold/30 bg-salon-gold/10 flex items-center justify-center shrink-0 text-salon-gold">
                        <Layers className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif text-base font-bold text-white group-hover:text-salon-gold transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] text-zinc-500 block">/{cat.slug}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      cat.isActive
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    {cat.isActive ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mt-2">
                  {cat.description || "No description specified for this category."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  Order: <strong className="text-zinc-300">#{cat.sortOrder}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(cat)}
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:text-white hover:border-zinc-700 text-zinc-400 transition-colors"
                    title={cat.isActive ? "Unpublish from website" : "Publish to website"}
                  >
                    {cat.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5 text-zinc-500" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:text-salon-gold hover:border-salon-gold/50 text-zinc-400 transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:text-red-400 hover:border-red-500/50 text-zinc-400 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {editingId ? "Edit Category" : "Add Service Category"}
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure category details, slug, banner image, and visibility
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Category Name <span className="text-salon-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haircuts & Styling, Bridal Makeup"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-xs text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. haircuts-styling"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-xs text-zinc-300 font-mono focus:border-salon-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the treatments and services covered under this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-xs text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none resize-none"
                />
              </div>

              {/* Image Uploader */}
              <ImageUploader
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                folder="categories"
                label="Category Banner / Thumbnail"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-xs text-white focus:border-salon-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-xs text-white focus:border-salon-gold focus:outline-none"
                  >
                    <option value="true">Published (Visible on site)</option>
                    <option value="false">Draft (Hidden from site)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  disabled={actionLoading}
                  className="text-xs gap-1.5"
                >
                  {actionLoading ? "Saving..." : editingId ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
