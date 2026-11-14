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
  UploadCloud,
  Check,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Layers,
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
  service?: { id: string; name: string } | null;
  staff?: { id: string; name: string } | null;
  createdAt?: string;
}

export default function AdminTransformationsPage() {
  const [transformations, setTransformations] = React.useState<Transformation[]>([]);
  const [services, setServices] = React.useState<any[]>([]);
  const [staffList, setStaffList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // File Upload State
  const beforeFileInputRef = React.useRef<HTMLInputElement>(null);
  const afterFileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingBefore, setUploadingBefore] = React.useState(false);
  const [uploadingAfter, setUploadingAfter] = React.useState(false);
  const [beforeImgError, setBeforeImgError] = React.useState(false);
  const [afterImgError, setAfterImgError] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    beforeImageUrl: "",
    afterImageUrl: "",
    serviceId: "",
    staffId: "",
    clientGender: "UNISEX" as "UNISEX" | "FEMALE" | "MALE",
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

    // Fetch active services for dropdown
    fetch("/api/services")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setServices(j.data);
      })
      .catch(() => {});

    // Fetch staff for dropdown
    fetch("/api/staff")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setStaffList(j.data);
      })
      .catch(() => {});
  }, [fetchTransformations]);

  const openAddModal = () => {
    setEditingId(null);
    setBeforeImgError(false);
    setAfterImgError(false);
    setFormData({
      title: "",
      description: "",
      beforeImageUrl: "",
      afterImageUrl: "",
      serviceId: services[0]?.id || "",
      staffId: staffList[0]?.id || "",
      clientGender: "UNISEX",
      isFeatured: true,
      sortOrder: transformations.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (t: Transformation) => {
    setEditingId(t.id);
    setBeforeImgError(false);
    setAfterImgError(false);
    setFormData({
      title: t.title,
      description: t.description || "",
      beforeImageUrl: t.beforeImageUrl,
      afterImageUrl: t.afterImageUrl,
      serviceId: t.serviceId || "",
      staffId: t.staffId || "",
      clientGender: (t.clientGender as any) || "UNISEX",
      isFeatured: t.isFeatured,
      sortOrder: t.sortOrder,
    });
    setShowModal(true);
  };

  const handleFileUpload = async (file: File, type: "before" | "after") => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      alert("Invalid file format. Please upload JPG, PNG, WEBP, or GIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    const setUploading = type === "before" ? setUploadingBefore : setUploadingAfter;
    const setImgError = type === "before" ? setBeforeImgError : setAfterImgError;

    try {
      setUploading(true);
      setImgError(false);

      const data = new FormData();
      data.append("file", file);
      data.append("folder", "transformations");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (json.success && json.data?.url) {
        if (type === "before") {
          setFormData((prev) => ({ ...prev, beforeImageUrl: json.data.url }));
        } else {
          setFormData((prev) => ({ ...prev, afterImageUrl: json.data.url }));
        }
        setFeedback(`${type === "before" ? "Before" : "After"} image uploaded successfully via Cloudinary!`);
      } else {
        alert(json.error || "Failed to upload image.");
      }
    } catch (err: any) {
      alert(err.message || "Network error while uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveTransformation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.beforeImageUrl.trim()) {
      alert("Please provide a Before Image URL or upload a photo.");
      return;
    }
    if (!formData.afterImageUrl.trim()) {
      alert("Please provide an After Image URL or upload a photo.");
      return;
    }

    try {
      setActionLoading(true);
      const url = editingId ? `/api/admin/transformations/${editingId}` : "/api/admin/transformations";
      const method = editingId ? "PATCH" : "POST";

      const payload = {
        ...formData,
        serviceId: formData.serviceId || null,
        staffId: formData.staffId || null,
        description: formData.description || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(editingId ? "Transformation updated successfully!" : "New transformation published!");
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
    if (!confirm(`Are you sure you want to delete transformation "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/transformations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Transformation deleted successfully");
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
            <Badge variant="gold">Visual Proof of Artistry</Badge>
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
            <div className="col-span-full rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs space-y-3">
              <Sparkles className="h-8 w-8 text-salon-gold/40 mx-auto" />
              <p className="text-sm font-medium text-white">No transformations found</p>
              <p className="text-zinc-500 max-w-sm mx-auto">
                Click &quot;Add Transformation&quot; above to upload your first before and after client transformation.
              </p>
            </div>
          ) : (
            transformations.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-salon-borderBlack bg-salon-cardBlack overflow-hidden hover:border-salon-gold/50 transition-all flex flex-col justify-between"
              >
                {/* Before & After Dual Images */}
                <div className="grid grid-cols-2 gap-1 bg-zinc-900 relative">
                  <div className="relative aspect-square w-full bg-zinc-950">
                    <img
                      src={t.beforeImageUrl}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-zinc-300 border border-zinc-800">
                      BEFORE
                    </span>
                  </div>
                  <div className="relative aspect-square w-full bg-zinc-950">
                    <img
                      src={t.afterImageUrl}
                      alt="After"
                      className="w-full h-full object-cover"
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
                    <div className="pt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                      <span className="text-salon-gold font-medium">{t.service?.name || "General Service"}</span>
                      {t.staff?.name && <span>• {t.staff.name}</span>}
                    </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  {editingId ? "Edit Transformation" : "Add Before & After Showcase"}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Enter Before and After image URLs or upload photos directly through Cloudinary.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTransformation} className="space-y-5 text-xs">
              {/* Basic Makeover Info */}
              <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Makeover Title *</label>
                  <Input
                    required
                    placeholder="e.g. Copper Balayage & Keratin Smoothing"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Associated Service</label>
                    <select
                      value={formData.serviceId}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                      className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-zinc-300 focus:outline-none"
                    >
                      <option value="">None / General Makeover</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Stylist</label>
                    <select
                      value={formData.staffId}
                      onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                      className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-zinc-300 focus:outline-none"
                    >
                      <option value="">None / Any Certified Stylist</option>
                      {staffList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.designation || "Stylist"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Details of client transformation, products used (L'Oréal / Schwarzkopf), and technique..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* SECTION: BEFORE & AFTER IMAGE MANAGEMENT                  */}
              {/* ========================================================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-salon-gold" />
                    <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-salon-gold">
                      Before &amp; After Image Management
                    </h4>
                  </div>
                  <span className="text-[11px] text-zinc-500">Cloudinary Powered &bull; Max 10MB</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ----------------------------------------------------- */}
                  {/* A. BEFORE IMAGE                                       */}
                  {/* ----------------------------------------------------- */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                            Before Image *
                          </span>
                          {formData.beforeImageUrl && !beforeImgError && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                              <Check className="h-3 w-3" /> Ready
                            </span>
                          )}
                        </div>
                        {formData.beforeImageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, beforeImageUrl: "" }));
                              setBeforeImgError(false);
                            }}
                            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        )}
                      </div>

                      {/* URL Input */}
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
                          Paste Before Image URL
                        </label>
                        <Input
                          required
                          placeholder="https://res.cloudinary.com/... or /images/..."
                          value={formData.beforeImageUrl}
                          onChange={(e) => {
                            setFormData({ ...formData, beforeImageUrl: e.target.value });
                            setBeforeImgError(false);
                          }}
                          className="bg-zinc-950 border-zinc-800 text-xs font-mono"
                        />
                      </div>

                      {/* Upload Button */}
                      <div>
                        <input
                          type="file"
                          ref={beforeFileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "before");
                            e.target.value = "";
                          }}
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingBefore}
                          onClick={() => beforeFileInputRef.current?.click()}
                          className="w-full gap-2 border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-xs"
                        >
                          {uploadingBefore ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-salon-gold" />
                              <span>Uploading to Cloudinary...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-3.5 w-3.5 text-salon-gold" />
                              <span>
                                {formData.beforeImageUrl ? "Replace Before Image" : "Upload Before Image"}
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="pt-2">
                      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-zinc-800 bg-black/60 flex items-center justify-center">
                        {formData.beforeImageUrl ? (
                          beforeImgError ? (
                            <div className="text-center p-4 space-y-1 text-xs text-red-400">
                              <AlertTriangle className="h-6 w-6 mx-auto text-red-400/80" />
                              <p className="font-medium">Failed to load image</p>
                              <p className="text-[10px] text-zinc-500">Verify URL or re-upload photo</p>
                            </div>
                          ) : (
                            <>
                              <img
                                src={formData.beforeImageUrl}
                                alt="Before Preview"
                                onError={() => setBeforeImgError(true)}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-zinc-300 border border-zinc-700 backdrop-blur-sm">
                                BEFORE PREVIEW
                              </span>
                            </>
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center text-zinc-600 text-xs space-y-1 p-4 text-center">
                            <ImageIcon className="h-6 w-6 text-zinc-700" />
                            <span>No before photo selected</span>
                            <span className="text-[10px] text-zinc-600">Paste an HTTPS URL or upload from device</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ----------------------------------------------------- */}
                  {/* B. AFTER IMAGE                                        */}
                  {/* ----------------------------------------------------- */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-salon-gold bg-salon-gold/10 border border-salon-gold/30 px-2 py-0.5 rounded">
                            After Image *
                          </span>
                          {formData.afterImageUrl && !afterImgError && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                              <Check className="h-3 w-3" /> Ready
                            </span>
                          )}
                        </div>
                        {formData.afterImageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, afterImageUrl: "" }));
                              setAfterImgError(false);
                            }}
                            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        )}
                      </div>

                      {/* URL Input */}
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1 font-medium">
                          Paste After Image URL
                        </label>
                        <Input
                          required
                          placeholder="https://res.cloudinary.com/... or /images/..."
                          value={formData.afterImageUrl}
                          onChange={(e) => {
                            setFormData({ ...formData, afterImageUrl: e.target.value });
                            setAfterImgError(false);
                          }}
                          className="bg-zinc-950 border-zinc-800 text-xs font-mono"
                        />
                      </div>

                      {/* Upload Button */}
                      <div>
                        <input
                          type="file"
                          ref={afterFileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, "after");
                            e.target.value = "";
                          }}
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingAfter}
                          onClick={() => afterFileInputRef.current?.click()}
                          className="w-full gap-2 border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-xs"
                        >
                          {uploadingAfter ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-salon-gold" />
                              <span>Uploading to Cloudinary...</span>
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-3.5 w-3.5 text-salon-gold" />
                              <span>
                                {formData.afterImageUrl ? "Replace After Image" : "Upload After Image"}
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="pt-2">
                      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-zinc-800 bg-black/60 flex items-center justify-center">
                        {formData.afterImageUrl ? (
                          afterImgError ? (
                            <div className="text-center p-4 space-y-1 text-xs text-red-400">
                              <AlertTriangle className="h-6 w-6 mx-auto text-red-400/80" />
                              <p className="font-medium">Failed to load image</p>
                              <p className="text-[10px] text-zinc-500">Verify URL or re-upload photo</p>
                            </div>
                          ) : (
                            <>
                              <img
                                src={formData.afterImageUrl}
                                alt="After Preview"
                                onError={() => setAfterImgError(true)}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-salon-gold border border-salon-gold/50 backdrop-blur-sm">
                                AFTER PREVIEW
                              </span>
                            </>
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center text-zinc-600 text-xs space-y-1 p-4 text-center">
                            <ImageIcon className="h-6 w-6 text-zinc-700" />
                            <span>No after photo selected</span>
                            <span className="text-[10px] text-zinc-600">Paste an HTTPS URL or upload from device</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sorting & Target & Publishing Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 items-center">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Display Sort Order</label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Gender Target</label>
                  <select
                    value={formData.clientGender}
                    onChange={(e) => setFormData({ ...formData, clientGender: e.target.value as any })}
                    className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-zinc-300 focus:outline-none"
                  >
                    <option value="UNISEX">UNISEX</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="MALE">MALE</option>
                  </select>
                </div>

                <div className="pt-5 sm:pt-4">
                  <label className="flex items-center space-x-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-zinc-700 bg-zinc-900 text-salon-gold focus:ring-0 h-4 w-4"
                    />
                    <span className="font-medium text-white">Publish to Public Sliders</span>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  disabled={actionLoading || uploadingBefore || uploadingAfter}
                  className="gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : editingId ? (
                    "Update Transformation"
                  ) : (
                    "Save & Publish Transformation"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
