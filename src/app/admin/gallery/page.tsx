"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle,
  Tag,
  Star,
  Edit2,
  Eye,
  EyeOff,
  ArrowUpDown,
} from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  caption: string | null;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  sortOrder: number;
}

const CATEGORIES = [
  "ALL",
  "Salon Ambience",
  "Color Studio",
  "Skin & Spa",
  "Men's Lounge",
  "Bridal",
];

export default function AdminGalleryPage() {
  const [images, setImages] = React.useState<GalleryImage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState("ALL");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [showBulkModal, setShowBulkModal] = React.useState(false);
  const [bulkUrls, setBulkUrls] = React.useState("");
  const [bulkCategory, setBulkCategory] = React.useState("Salon Ambience");
  const [bulkTitlePrefix, setBulkTitlePrefix] = React.useState("Lalganj Salon Ambience");
  const [bulkIsFeatured, setBulkIsFeatured] = React.useState(true);
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    title: "",
    caption: "",
    imageUrl: "/images/hero/hero-bg.webp",
    category: "Salon Ambience",
    isFeatured: true,
    sortOrder: 1,
  });

  const fetchImages = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = activeCategory !== "ALL" ? `?category=${encodeURIComponent(activeCategory)}` : "";
      const res = await fetch(`/api/admin/gallery${params}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setImages(json.data);
      }
    } catch (e) {
      console.error("Failed to load gallery:", e);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  React.useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      caption: "",
      imageUrl: "/images/hero/hero-bg.webp",
      category: "Salon Ambience",
      isFeatured: true,
      sortOrder: images.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (img: GalleryImage) => {
    setEditingId(img.id);
    setFormData({
      title: img.title,
      caption: img.caption || "",
      imageUrl: img.imageUrl,
      category: img.category,
      isFeatured: img.isFeatured,
      sortOrder: img.sortOrder,
    });
    setShowModal(true);
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const url = editingId ? `/api/admin/gallery/${editingId}` : "/api/admin/gallery";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(editingId ? "Photograph details updated!" : "Photograph added to salon gallery!");
        setShowModal(false);
        fetchImages();
      } else {
        alert(json.error || "Failed to save image");
      }
    } catch (e: any) {
      alert(e.message || "Failed to save image");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleTogglePublish = async (img: GalleryImage) => {
    try {
      const res = await fetch(`/api/admin/gallery/${img.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !img.isFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        fetchImages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteImage = async (id: string, title: string) => {
    if (!confirm(`Delete image "${title}" from salon gallery?`)) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Photograph deleted");
        fetchImages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = bulkUrls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) {
      alert("Please enter at least one image URL.");
      return;
    }

    try {
      setBulkLoading(true);
      const items = urls.map((url, idx) => ({
        title: `${bulkTitlePrefix} ${idx + 1}`,
        caption: `Authentic photograph of The Jawed Habib Salon – Lalganj (${bulkCategory})`,
        imageUrl: url,
        category: bulkCategory,
        isFeatured: bulkIsFeatured,
        sortOrder: images.length + idx + 1,
      }));

      const res = await fetch("/api/admin/gallery/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`Successfully uploaded ${json.count} photographs to ${bulkCategory}`);
        setShowBulkModal(false);
        setBulkUrls("");
        fetchImages();
      } else {
        alert(json.error || "Failed to bulk upload");
      }
    } catch (e: any) {
      alert("Bulk upload failed: " + e.message);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Media Showcase</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Photos: {images.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Photo Gallery Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Curate salon ambience, stations, and styling photography for the public website
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulkModal(true)}
            className="border-salon-gold/50 text-salon-goldLight hover:bg-salon-gold/10"
          >
            <span>Bulk Media Upload</span>
          </Button>
          <Button variant="gold" onClick={openAddModal} className="gap-2 shadow">
            <Plus className="h-4 w-4" />
            <span>Upload Photograph</span>
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

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-salon-gold text-black font-semibold shadow-sm"
                : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading gallery photos...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {images.length === 0 ? (
            <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
              No photos in category &quot;{activeCategory}&quot;. Click &quot;Upload Photograph&quot; to add one.
            </div>
          ) : (
            images.map((img) => (
              <div
                key={img.id}
                className="group rounded-xl border border-salon-borderBlack bg-salon-cardBlack overflow-hidden hover:border-salon-gold/50 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] w-full bg-zinc-900 overflow-hidden">
                  <Image
                    src={img.imageUrl}
                    alt={img.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-salon-gold border border-salon-gold/30">
                      {img.category}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] text-zinc-400 border border-zinc-800">
                      #{img.sortOrder}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleTogglePublish(img)}
                      className={`p-1 rounded-md text-[10px] font-semibold backdrop-blur-sm transition-colors ${
                        img.isFeatured
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
                          : "bg-zinc-900/80 text-zinc-400 border border-zinc-800"
                      }`}
                      title={img.isFeatured ? "Published on website" : "Hidden"}
                    >
                      {img.isFeatured ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-white line-clamp-1">{img.title}</h3>
                    {img.caption && <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{img.caption}</p>}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-500">
                      {img.isFeatured ? "Status: Published" : "Status: Hidden"}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(img)}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Edit Photograph Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img.id, img.title)}
                        className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        title="Delete Photograph"
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

      {/* Add / Edit Image Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingId ? "Edit Photograph Details" : "Upload Salon Photograph"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleSaveImage} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Photograph Title *</label>
                <Input
                  required
                  placeholder="e.g. Lalganj VIP Styling Chair"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Image URL / Path *</label>
                <Input
                  required
                  placeholder="/images/hero/hero-bg.webp"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-300 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
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
                <label className="block text-zinc-400 mb-1 font-medium">Caption / Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief story or feature description..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
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
                  <span>Publish to Public Website</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : editingId ? "Save Changes" : "Publish Photo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Bulk Media Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-salon-borderBlack bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Bulk Media Upload</h3>
                <p className="text-[11px] text-zinc-400">
                  Import multiple authentic salon photographs at once with automatic sequencing.
                </p>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-zinc-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Target Category *</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-300 focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Title Prefix *</label>
                <Input
                  required
                  placeholder="e.g. Lalganj Salon Interior"
                  value={bulkTitlePrefix}
                  onChange={(e) => setBulkTitlePrefix(e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">
                  Image URLs / Paths * (One URL per line)
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={`/images/gallery/ambience-1.webp\n/images/gallery/ambience-2.webp\n/images/gallery/styling-stations.webp`}
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 font-mono text-[11px] text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400">
                <strong>Authenticity Note:</strong> Zero fake Before & After associations. All media tagged
                authentically with verified salon ambience, stations, and styling areas.
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkIsFeatured}
                    onChange={(e) => setBulkIsFeatured(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-salon-gold focus:ring-0"
                  />
                  <span>Publish to Public Website Immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={bulkLoading}>
                  {bulkLoading ? "Uploading Media..." : "Ingest Bulk Media"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
