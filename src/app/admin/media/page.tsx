/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Image as ImageIcon,
  Video,
  Upload,
  UploadCloud,
  Copy,
  Check,
  Trash2,
  Edit2,
  Folder,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  ArrowUpDown,
  Search,
  Plus,
  RefreshCw,
  Crown,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Scissors,
  Layers,
  SlidersHorizontal,
  ArrowLeftRight,
  X,
} from "lucide-react";

interface MediaItem {
  id: string;
  title: string;
  altText: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  folder: "bridal" | "interior" | "transformations" | "services" | "hero" | "general";
  fileSize?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
}

interface Transformation {
  id: string;
  title: string;
  description: string | null;
  beforeImageUrl: string;
  afterImageUrl: string;
  serviceId: string | null;
  staffId: string | null;
  category?: string;
  clientGender: "UNISEX" | "FEMALE" | "MALE" | "KIDS";
  isFeatured: boolean;
  sortOrder: number;
  service?: { id: string; name: string } | null;
  staff?: { id: string; name: string } | null;
  createdAt?: string;
}

const FOLDERS = [
  { id: "all", label: "All Media" },
  { id: "bridal", label: "Bridal Artistry" },
  { id: "hero", label: "Hero & Video Experience" },
  { id: "interior", label: "Salon Interior & Ambience" },
  { id: "transformations", label: "Before & After" },
  { id: "services", label: "Hair & Skin Services" },
  { id: "general", label: "General & Branding" },
];

const STANDARD_CATEGORIES = [
  "Hair Styling",
  "Hair Coloring & Balayage",
  "Hair Spa & Keratin Therapy",
  "Bridal Makeover",
  "Skin Glow & Facial",
  "Beard Sculpting & Grooming",
];

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = React.useState<MediaItem[]>([]);
  const [transformations, setTransformations] = React.useState<Transformation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeFolder, setActiveFolder] = React.useState("all");
  const [transformationsSubTab, setTransformationsSubTab] = React.useState<"PAIRED" | "ASSETS">("PAIRED");
  const [mediaTypeFilter, setMediaTypeFilter] = React.useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [search, setSearch] = React.useState("");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Upload & Edit Modal States
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [uploadFolder, setUploadFolder] = React.useState<"bridal" | "interior" | "transformations" | "services" | "hero" | "general">("bridal");
  const [uploading, setUploading] = React.useState(false);

  // Standard Single Media Upload Form
  const [uploadTitle, setUploadTitle] = React.useState("");
  const [uploadAltText, setUploadAltText] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);

  // Paired Before & After Transformation Form
  const [editingTransformationId, setEditingTransformationId] = React.useState<string | null>(null);
  const [transformationTitle, setTransformationTitle] = React.useState("");
  const [transformationDescription, setTransformationDescription] = React.useState("");
  const [transformationCategory, setTransformationCategory] = React.useState("Hair Styling");
  const [transformationAltText, setTransformationAltText] = React.useState("");
  const [transformationGender, setTransformationGender] = React.useState<"UNISEX" | "FEMALE" | "MALE" | "KIDS">("UNISEX");
  const [transformationIsFeatured, setTransformationIsFeatured] = React.useState(true);
  const [transformationSortOrder, setTransformationSortOrder] = React.useState(1);

  const [beforeImageUrl, setBeforeImageUrl] = React.useState("");
  const [afterImageUrl, setAfterImageUrl] = React.useState("");
  const [beforeImgError, setBeforeImgError] = React.useState(false);
  const [afterImgError, setAfterImgError] = React.useState(false);
  const [uploadingBefore, setUploadingBefore] = React.useState(false);
  const [uploadingAfter, setUploadingAfter] = React.useState(false);

  const beforeFileInputRef = React.useRef<HTMLInputElement>(null);
  const afterFileInputRef = React.useRef<HTMLInputElement>(null);

  // Single Item Edit State
  const [showEditItemModal, setShowEditItemModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MediaItem | null>(null);

  // 1. Fetch Media Items
  const fetchMedia = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFolder !== "all") params.append("folder", activeFolder);
      if (mediaTypeFilter !== "ALL") params.append("type", mediaTypeFilter);

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMediaList(json.data);
      }
    } catch (e) {
      console.error("Failed to load media:", e);
    } finally {
      setLoading(false);
    }
  }, [activeFolder, mediaTypeFilter]);

  // 2. Fetch Transformations
  const fetchTransformations = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/transformations");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTransformations(json.data);
      }
    } catch (e) {
      console.error("Failed to load transformations:", e);
    }
  }, []);

  React.useEffect(() => {
    fetchMedia();
    fetchTransformations();
  }, [fetchMedia, fetchTransformations]);

  // Copy helper
  const handleCopyText = (text: string, label: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(keyId);
    setFeedback(`Copied ${label}`);
    setTimeout(() => {
      setCopiedId(null);
      setFeedback(null);
    }, 2500);
  };

  // URL Validator helper
  const isValidUrl = (url: string) => {
    if (!url || !url.trim()) return false;
    const trimmed = url.trim();
    if (
      trimmed.toLowerCase().startsWith("javascript:") ||
      trimmed.toLowerCase().startsWith("data:") ||
      trimmed.toLowerCase().startsWith("vbscript:")
    ) {
      return false;
    }
    return trimmed.startsWith("https://") || trimmed.startsWith("http://") || trimmed.startsWith("/");
  };

  // Open modal for new upload / transformation
  const handleOpenUploadModal = (folderChoice?: "bridal" | "interior" | "transformations" | "services" | "hero" | "general") => {
    const targetFolder = folderChoice || (activeFolder !== "all" ? (activeFolder as any) : "transformations");
    setUploadFolder(targetFolder);
    setEditingTransformationId(null);

    // Reset standard form
    setSelectedFile(null);
    setFilePreview(null);
    setUploadTitle("");
    setUploadAltText("");

    // Reset paired form
    setTransformationTitle("");
    setTransformationDescription("");
    setTransformationCategory("Hair Styling");
    setTransformationAltText("");
    setTransformationGender("UNISEX");
    setTransformationIsFeatured(true);
    setTransformationSortOrder(transformations.length + 1);
    setBeforeImageUrl("");
    setAfterImageUrl("");
    setBeforeImgError(false);
    setAfterImgError(false);

    setShowUploadModal(true);
  };

  // Open modal to pair an existing media asset
  const handlePairExistingAsset = (item: MediaItem) => {
    setUploadFolder("transformations");
    setEditingTransformationId(null);
    setTransformationTitle(item.title.replace(/\s*(before|after)\s*/i, "").trim() || "Salon Transformation");
    setTransformationDescription(item.altText || "");
    setTransformationCategory("Hair Styling");
    setTransformationAltText(`The Jawed Habib Salon Lalganj - ${item.title}`);
    setTransformationGender("UNISEX");
    setTransformationIsFeatured(true);
    setTransformationSortOrder(transformations.length + 1);

    if (item.title.toLowerCase().includes("after")) {
      setAfterImageUrl(item.url);
      setBeforeImageUrl("");
    } else {
      setBeforeImageUrl(item.url);
      setAfterImageUrl("");
    }
    setBeforeImgError(false);
    setAfterImgError(false);

    setShowUploadModal(true);
  };

  // Open modal to edit existing transformation
  const handleEditTransformation = (t: Transformation) => {
    setUploadFolder("transformations");
    setEditingTransformationId(t.id);
    setTransformationTitle(t.title);
    setTransformationDescription(t.description || "");
    setTransformationCategory(t.category || t.service?.name || "Hair Styling");
    setTransformationAltText(`The Jawed Habib Salon Lalganj - ${t.title}`);
    setTransformationGender(t.clientGender || "UNISEX");
    setTransformationIsFeatured(t.isFeatured);
    setTransformationSortOrder(t.sortOrder || 1);
    setBeforeImageUrl(t.beforeImageUrl);
    setAfterImageUrl(t.afterImageUrl);
    setBeforeImgError(false);
    setAfterImgError(false);

    setShowUploadModal(true);
  };

  // Close upload / transformation modal
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setEditingTransformationId(null);
    setSelectedFile(null);
    setFilePreview(null);
    setBeforeImageUrl("");
    setAfterImageUrl("");
  };

  // Cloudinary image file upload handler for Before & After
  const handleUploadImageFile = async (file: File, target: "before" | "after") => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowed.includes(file.type.toLowerCase())) {
      alert("Invalid file format. Please upload JPG, PNG, WEBP, GIF, or SVG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    const setUploadingImg = target === "before" ? setUploadingBefore : setUploadingAfter;
    const setImgError = target === "before" ? setBeforeImgError : setAfterImgError;
    const setUrl = target === "before" ? setBeforeImageUrl : setAfterImageUrl;

    try {
      setUploadingImg(true);
      setImgError(false);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "transformations");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success && json.data?.url) {
        setUrl(json.data.url);
        setFeedback(`${target === "before" ? "Before" : "After"} image uploaded successfully via Cloudinary!`);
        setTimeout(() => setFeedback(null), 3500);
      } else {
        alert(json.error || `Failed to upload ${target} image.`);
      }
    } catch (err: any) {
      alert(err.message || "Network error while uploading image.");
    } finally {
      setUploadingImg(false);
    }
  };

  // Save Paired Transformation
  const handleSaveTransformationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transformationTitle.trim() || transformationTitle.trim().length < 2) {
      alert("Please provide a valid Transformation Title (at least 2 characters).");
      return;
    }

    if (!isValidUrl(beforeImageUrl)) {
      alert("Please provide a valid Before Image URL (HTTPS URL or local path) or upload a photo.");
      return;
    }

    if (!isValidUrl(afterImageUrl)) {
      alert("Please provide a valid After Image URL (HTTPS URL or local path) or upload a photo.");
      return;
    }

    try {
      setUploading(true);
      const isEditing = Boolean(editingTransformationId);
      const endpoint = isEditing ? `/api/admin/transformations/${editingTransformationId}` : "/api/admin/transformations";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        title: transformationTitle.trim(),
        description: transformationDescription.trim() || null,
        beforeImageUrl: beforeImageUrl.trim(),
        afterImageUrl: afterImageUrl.trim(),
        category: transformationCategory || "Hair Styling",
        clientGender: transformationGender,
        isFeatured: transformationIsFeatured,
        sortOrder: Number(transformationSortOrder) || 1,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        // Register or keep synchronized in media items as well
        if (!isEditing) {
          try {
            await fetch("/api/admin/media", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: transformationTitle.trim(),
                altText: transformationAltText.trim() || `${transformationTitle} Transformation at The Jawed Habib Salon Lalganj`,
                url: afterImageUrl.trim(),
                mediaType: "IMAGE",
                folder: "transformations",
                isPublished: transformationIsFeatured,
                sortOrder: transformationSortOrder,
              }),
            });
          } catch {}
        }

        setFeedback(isEditing ? "Transformation updated successfully!" : "New transformation created and paired!");
        handleCloseUploadModal();
        fetchTransformations();
        fetchMedia();
      } else {
        alert(json.error || "Failed to save transformation");
      }
    } catch (e: any) {
      alert(e.message || "Network error while saving transformation");
    } finally {
      setUploading(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Toggle publish / draft for transformation
  const handleToggleTransformationPublish = async (t: Transformation) => {
    try {
      const res = await fetch(`/api/admin/transformations/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !t.isFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Transformation "${t.title}" is now ${!t.isFeatured ? "Published (Visible)" : "Draft (Hidden)"}`);
        fetchTransformations();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete transformation
  const handleDeleteTransformation = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete transformation "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/transformations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Transformation deleted successfully");
        fetchTransformations();
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Single Standard File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
      if (!uploadAltText) {
        setUploadAltText(`The Jawed Habib Salon Lalganj - ${file.name.replace(/\.[^/.]+$/, "")}`);
      }
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleStandardUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", uploadFolder);

      // 1. Upload file binary
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) {
        alert(uploadJson.error || "File upload failed");
        return;
      }

      const mediaUrl = uploadJson.data.url;
      const isVideo = selectedFile.type.startsWith("video/");
      const sizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;

      // 2. Register media record
      const recordRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          altText: uploadAltText,
          url: mediaUrl,
          mediaType: isVideo ? "VIDEO" : "IMAGE",
          folder: uploadFolder,
          fileSize: sizeStr,
          isPublished: true,
          sortOrder: mediaList.length + 1,
        }),
      });

      const recordJson = await recordRes.json();
      if (recordJson.success) {
        setFeedback("Media uploaded and registered successfully!");
        handleCloseUploadModal();
        fetchMedia();
      } else {
        alert(recordJson.error || "Failed to register media");
      }
    } catch (e: any) {
      alert(e.message || "Upload error");
    } finally {
      setUploading(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Single Item Update
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch(`/api/admin/media/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("Media item updated!");
        setShowEditItemModal(false);
        setEditingItem(null);
        fetchMedia();
      } else {
        alert(json.error || "Failed to update item");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleTogglePublish = async (item: MediaItem) => {
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      const json = await res.json();
      if (json.success) {
        fetchMedia();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this media asset?")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Media asset removed");
        fetchMedia();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered lists
  const filteredMedia = mediaList.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.altText.toLowerCase().includes(q) ||
      m.url.toLowerCase().includes(q)
    );
  });

  const filteredTransformations = transformations.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      t.beforeImageUrl.toLowerCase().includes(q) ||
      t.afterImageUrl.toLowerCase().includes(q)
    );
  });

  const isTransformationsFolder = activeFolder === "transformations";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Media Assets</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Assets: {mediaList.length}</span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-salon-gold font-medium">
              Transformations: {transformations.length}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
            Salon Media Management &amp; Asset Library
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Upload, preview, replace, and organize high-definition bridal images, hero videos, and Before &amp; After transformations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchMedia();
              fetchTransformations();
            }}
            className="gap-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

          {isTransformationsFolder ? (
            <Button
              variant="gold"
              onClick={() => handleOpenUploadModal("transformations")}
              className="gap-2 shadow-[0_0_20px_rgba(198,165,107,0.3)]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Add Transformation</span>
            </Button>
          ) : (
            <Button
              variant="gold"
              onClick={() => handleOpenUploadModal()}
              className="gap-2 shadow"
            >
              <Upload className="h-4 w-4" />
              <span>Upload New Media</span>
            </Button>
          )}
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
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs">
          {/* Folders */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 lg:pb-0">
            {FOLDERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  activeFolder === f.id
                    ? "bg-salon-gold text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-800"
                }`}
              >
                {f.label}
                {f.id === "transformations" && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-black/40 text-current">
                    {transformations.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Type filter */}
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
              {(["ALL", "IMAGE", "VIDEO"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMediaTypeFilter(type)}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                    mediaTypeFilter === type
                      ? "bg-zinc-800 text-salon-gold font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <Input
                placeholder="Search title, alt text, URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-900 border-zinc-800 pl-8 text-xs h-8 text-white"
              />
            </div>
          </div>
        </div>

        {/* Sub-view switcher for Before & After Category */}
        {isTransformationsFolder && (
          <div className="flex items-center justify-between bg-zinc-950/80 border border-salon-gold/30 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 font-medium">Viewing Category:</span>
              <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5">
                <button
                  onClick={() => setTransformationsSubTab("PAIRED")}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    transformationsSubTab === "PAIRED"
                      ? "bg-salon-gold text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Paired Transformations ({filteredTransformations.length})</span>
                </button>
                <button
                  onClick={() => setTransformationsSubTab("ASSETS")}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    transformationsSubTab === "ASSETS"
                      ? "bg-salon-gold text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Individual Media Assets ({filteredMedia.length})</span>
                </button>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenUploadModal("transformations")}
              className="gap-1.5 text-xs border-salon-gold/40 text-salon-gold hover:bg-salon-gold hover:text-black"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Paired Transformation</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-salon-gold/60" />
          <span>Loading media assets &amp; transformations...</span>
        </div>
      ) : isTransformationsFolder && transformationsSubTab === "PAIRED" ? (
        /* -------------------------------------------------------------
           VIEW A: PAIRED BEFORE & AFTER TRANSFORMATIONS
        ------------------------------------------------------------- */
        filteredTransformations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-12 text-center space-y-3">
            <Sparkles className="h-10 w-10 text-salon-gold/60 mx-auto" />
            <p className="text-sm font-medium text-white">No Transformations Found</p>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Create your first interactive Before &amp; After showcase by pasting image URLs or uploading high-resolution photos via Cloudinary.
            </p>
            <Button
              variant="gold"
              onClick={() => handleOpenUploadModal("transformations")}
              className="gap-2 text-xs mx-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Transformation Now</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTransformations.map((t) => (
              <div
                key={t.id}
                className="group rounded-2xl border border-zinc-800 bg-zinc-950/90 overflow-hidden shadow-lg hover:border-salon-gold/60 transition-all flex flex-col justify-between"
              >
                {/* Visual Header: Split Before & After Preview */}
                <div className="relative aspect-[16/10] w-full bg-zinc-900 overflow-hidden flex">
                  {/* Left: Before Image */}
                  <div className="relative w-1/2 h-full overflow-hidden border-r border-salon-gold/40">
                    <img
                      src={t.beforeImageUrl}
                      alt={`${t.title} - Before`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 z-10">
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase bg-black/80 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded shadow backdrop-blur-sm">
                        BEFORE
                      </span>
                    </div>
                  </div>

                  {/* Right: After Image */}
                  <div className="relative w-1/2 h-full overflow-hidden">
                    <img
                      src={t.afterImageUrl}
                      alt={`${t.title} - After`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 z-10">
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase bg-black/80 text-salon-gold border border-salon-gold/50 px-2 py-0.5 rounded shadow backdrop-blur-sm">
                        AFTER
                      </span>
                    </div>
                  </div>

                  {/* Bottom Badges */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase bg-black/80 text-salon-gold border border-salon-gold/30 backdrop-blur-sm">
                      {t.category || t.service?.name || "Hair & Beauty"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-semibold border backdrop-blur-sm ${
                        t.isFeatured
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                          : "bg-amber-950/80 text-amber-300 border-amber-800"
                      }`}
                    >
                      {t.isFeatured ? "Published" : "Draft / Hidden"}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-serif text-sm font-bold text-white line-clamp-1" title={t.title}>
                        {t.title}
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {t.clientGender}
                      </span>
                    </div>

                    {t.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {t.description}
                      </p>
                    )}

                    {/* URLs Section with Quick-Copy */}
                    <div className="mt-3 space-y-1.5 pt-2 border-t border-zinc-900 text-[10px] font-mono">
                      {/* Before URL */}
                      <div className="flex items-center justify-between gap-1 bg-zinc-900/60 rounded px-2 py-1">
                        <span className="text-zinc-500 uppercase text-[9px] font-bold w-12 shrink-0">Before:</span>
                        <span className="text-zinc-400 truncate flex-1 text-[10px]" title={t.beforeImageUrl}>
                          {t.beforeImageUrl}
                        </span>
                        <button
                          onClick={() => handleCopyText(t.beforeImageUrl, "Before Image URL", `before-${t.id}`)}
                          className="text-zinc-400 hover:text-salon-gold transition-colors ml-1 p-0.5"
                          title="Copy Before URL"
                        >
                          {copiedId === `before-${t.id}` ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      {/* After URL */}
                      <div className="flex items-center justify-between gap-1 bg-zinc-900/60 rounded px-2 py-1">
                        <span className="text-salon-gold uppercase text-[9px] font-bold w-12 shrink-0">After:</span>
                        <span className="text-zinc-400 truncate flex-1 text-[10px]" title={t.afterImageUrl}>
                          {t.afterImageUrl}
                        </span>
                        <button
                          onClick={() => handleCopyText(t.afterImageUrl, "After Image URL", `after-${t.id}`)}
                          className="text-zinc-400 hover:text-salon-gold transition-colors ml-1 p-0.5"
                          title="Copy After URL"
                        >
                          {copiedId === `after-${t.id}` ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-zinc-500">
                      Sort: #{t.sortOrder || 1}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleTransformationPublish(t)}
                        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900"
                        title={t.isFeatured ? "Hide from public website" : "Publish to public website"}
                      >
                        {t.isFeatured ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5 text-amber-400" />}
                      </button>
                      <button
                        onClick={() => handleEditTransformation(t)}
                        className="p-1.5 rounded text-zinc-400 hover:text-salon-gold hover:bg-zinc-900"
                        title="Edit Transformation Pair"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransformation(t.id, t.title)}
                        className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900"
                        title="Delete Transformation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* -------------------------------------------------------------
           VIEW B: STANDARD SINGLE MEDIA ITEMS
        ------------------------------------------------------------- */
        filteredMedia.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
            No media assets found in this folder. Click &quot;Upload New Media&quot; to add photos or videos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-sm hover:border-salon-gold/50 transition-all flex flex-col justify-between"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                  {item.mediaType === "VIDEO" ? (
                    <div className="h-full w-full relative flex items-center justify-center bg-black">
                      <video
                        src={item.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        loop
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                        onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                      />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-salon-gold flex items-center gap-1 border border-salon-gold/30">
                        <Video className="h-3 w-3" />
                        <span>VIDEO</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full relative">
                      <img
                        src={item.url}
                        alt={item.altText}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-zinc-300 flex items-center gap-1 border border-zinc-700">
                        <ImageIcon className="h-3 w-3 text-salon-gold" />
                        <span>IMAGE</span>
                      </div>
                    </div>
                  )}

                  {/* Folder & Size badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-900/80 backdrop-blur-sm text-[9px] font-mono text-zinc-400 border border-zinc-800">
                      {item.folder}
                    </span>
                  </div>

                  {/* Published Indicator */}
                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                        item.isPublished
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-800"
                          : "bg-amber-950/80 text-amber-300 border-amber-800"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Hidden"}
                    </span>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-xs truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5" title={item.altText}>
                      {item.altText}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500 truncate mt-1">
                      {item.url}
                    </p>

                    {/* Helper to Pair if in transformations folder */}
                    {item.folder === "transformations" && (
                      <button
                        onClick={() => handlePairExistingAsset(item)}
                        className="mt-2 text-[10px] text-salon-gold bg-salon-gold/10 hover:bg-salon-gold/20 border border-salon-gold/30 rounded px-2 py-0.5 flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>Pair into Transformation</span>
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleCopyText(item.url, item.title, item.id)}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-salon-gold transition-colors"
                      title="Copy Public URL"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className="p-1 rounded text-zinc-400 hover:text-white"
                        title={item.isPublished ? "Hide from public" : "Publish to public"}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowEditItemModal(true);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-salon-gold"
                        title="Edit Meta / Alt Text"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400"
                        title="Delete Asset"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* =============================================================
          MODAL: UPLOAD NEW MEDIA / BEFORE & AFTER TRANSFORMATION
      ============================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="gold">
                    {uploadFolder === "transformations" ? "Before & After Transformation" : "Media Asset Upload"}
                  </Badge>
                  {editingTransformationId && (
                    <span className="text-xs text-amber-400 font-medium">Edit Mode</span>
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                  {uploadFolder === "transformations"
                    ? editingTransformationId
                      ? "Edit Before & After Transformation"
                      : "BEFORE & AFTER TRANSFORMATION"
                    : "Upload Media Asset"}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {uploadFolder === "transformations"
                    ? "Link Before and After photographs into a single interactive makeover showcase"
                    : "Upload high-definition photos or video showcases for the salon website"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseUploadModal}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Folder Selector (Allows switching anytime) */}
            <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <label className="text-xs font-medium text-zinc-300">Destination Folder:</label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value as any)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-salon-gold focus:outline-none"
              >
                <option value="transformations">Before &amp; After (Paired Transformation)</option>
                <option value="bridal">Bridal Artistry</option>
                <option value="hero">Hero &amp; Video Experience</option>
                <option value="interior">Salon Interior &amp; Ambience</option>
                <option value="services">Hair &amp; Skin Services</option>
                <option value="general">General &amp; Branding</option>
              </select>
            </div>

            {/* =========================================================
                FORM A: PAIRED BEFORE & AFTER TRANSFORMATION FORM
            ========================================================= */}
            {uploadFolder === "transformations" ? (
              <form onSubmit={handleSaveTransformationSubmit} className="space-y-6 text-xs">
                {/* -----------------------------------------------------
                    SECTION A – TRANSFORMATION DETAILS
                ----------------------------------------------------- */}
                <div className="space-y-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <Sparkles className="h-4 w-4 text-salon-gold" />
                    <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
                      Section A – Transformation Details
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-zinc-300 mb-1 font-medium">Transformation Title *</label>
                      <Input
                        required
                        placeholder="e.g. L'Oréal Keratin Smoothing Transformation"
                        value={transformationTitle}
                        onChange={(e) => setTransformationTitle(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 mb-1 font-medium">Category</label>
                      <select
                        value={transformationCategory}
                        onChange={(e) => setTransformationCategory(e.target.value)}
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-200 focus:outline-none focus:border-salon-gold"
                      >
                        {STANDARD_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Intense frizz control, deep hair nourishment, and liquid hair silk finish lasting 4+ months."
                      value={transformationDescription}
                      onChange={(e) => setTransformationDescription(e.target.value)}
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2.5 text-zinc-200 focus:outline-none focus:border-salon-gold resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-zinc-300 mb-1 font-medium">Alt Text / SEO</label>
                      <Input
                        placeholder="SEO description for search engines"
                        value={transformationAltText}
                        onChange={(e) => setTransformationAltText(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 mb-1 font-medium">Client Gender</label>
                      <select
                        value={transformationGender}
                        onChange={(e) => setTransformationGender(e.target.value as any)}
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-200 focus:outline-none focus:border-salon-gold"
                      >
                        <option value="UNISEX">Unisex</option>
                        <option value="FEMALE">Female Makeover</option>
                        <option value="MALE">Male Grooming</option>
                        <option value="KIDS">Kids Haircut</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-300 mb-1 font-medium">Publication Status</label>
                      <select
                        value={transformationIsFeatured ? "published" : "draft"}
                        onChange={(e) => setTransformationIsFeatured(e.target.value === "published")}
                        className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-200 focus:outline-none focus:border-salon-gold"
                      >
                        <option value="published">Published (Visible Publicly)</option>
                        <option value="draft">Draft (Hidden from Public)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* -----------------------------------------------------
                    SECTION B – BEFORE IMAGE
                ----------------------------------------------------- */}
                <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-zinc-400" />
                      <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
                        Section B – Before Image (Original / Pre-Treatment)
                      </h4>
                    </div>
                    {beforeImageUrl && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Image linked
                      </span>
                    )}
                  </div>

                  {/* Input & Upload Controls */}
                  <div className="space-y-2">
                    <label className="block text-zinc-400 text-[11px]">
                      Paste Before Image URL or Upload via Cloudinary:
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        required
                        placeholder="Paste Before Image URL here... (e.g. https://... or /images/...)"
                        value={beforeImageUrl}
                        onChange={(e) => {
                          setBeforeImageUrl(e.target.value);
                          setBeforeImgError(false);
                        }}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs flex-1"
                      />

                      <input
                        type="file"
                        ref={beforeFileInputRef}
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImageFile(file, "before");
                        }}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingBefore}
                        onClick={() => beforeFileInputRef.current?.click()}
                        className="gap-1.5 shrink-0 border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-salon-gold hover:border-salon-gold"
                      >
                        {uploadingBefore ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="h-3.5 w-3.5 text-salon-gold" />
                            <span>Upload Before Image</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Before Image Preview Box */}
                  {beforeImageUrl ? (
                    <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative aspect-video w-40 shrink-0 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                        <img
                          src={beforeImageUrl}
                          alt="Before Preview"
                          onError={() => setBeforeImgError(true)}
                          onLoad={() => setBeforeImgError(false)}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-zinc-300 border border-zinc-700">
                          BEFORE
                        </span>
                      </div>

                      <div className="flex-1 space-y-1.5 w-full">
                        {beforeImgError ? (
                          <div className="rounded border border-red-500/40 bg-red-950/40 p-2 text-[11px] text-red-300 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                            <span>Failed to load image from URL. Please verify the URL or upload a file.</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Before image preview loaded successfully</span>
                          </div>
                        )}
                        <p className="font-mono text-[10px] text-zinc-400 truncate max-w-sm">
                          {beforeImageUrl}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => beforeFileInputRef.current?.click()}
                            className="text-[11px] text-salon-gold hover:underline"
                          >
                            Replace Before Image
                          </button>
                          <span className="text-zinc-600">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setBeforeImageUrl("");
                              setBeforeImgError(false);
                            }}
                            className="text-[11px] text-red-400 hover:underline"
                          >
                            Remove Before Image
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-800 rounded-lg p-4 text-center text-zinc-500 text-[11px]">
                      Paste an HTTPS image URL above or click &quot;Upload Before Image&quot; (JPG, PNG, WEBP up to 10MB)
                    </div>
                  )}
                </div>

                {/* -----------------------------------------------------
                    SECTION C – AFTER IMAGE
                ----------------------------------------------------- */}
                <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-salon-gold" />
                      <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
                        Section C – After Image (Finished Result / Transformation)
                      </h4>
                    </div>
                    {afterImageUrl && (
                      <span className="text-[10px] text-salon-gold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Image linked
                      </span>
                    )}
                  </div>

                  {/* Input & Upload Controls */}
                  <div className="space-y-2">
                    <label className="block text-zinc-400 text-[11px]">
                      Paste After Image URL or Upload via Cloudinary:
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        required
                        placeholder="Paste After Image URL here... (e.g. https://... or /images/...)"
                        value={afterImageUrl}
                        onChange={(e) => {
                          setAfterImageUrl(e.target.value);
                          setAfterImgError(false);
                        }}
                        className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs flex-1"
                      />

                      <input
                        type="file"
                        ref={afterFileInputRef}
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImageFile(file, "after");
                        }}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingAfter}
                        onClick={() => afterFileInputRef.current?.click()}
                        className="gap-1.5 shrink-0 border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-salon-gold hover:border-salon-gold"
                      >
                        {uploadingAfter ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="h-3.5 w-3.5 text-salon-gold" />
                            <span>Upload After Image</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* After Image Preview Box */}
                  {afterImageUrl ? (
                    <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative aspect-video w-40 shrink-0 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                        <img
                          src={afterImageUrl}
                          alt="After Preview"
                          onError={() => setAfterImgError(true)}
                          onLoad={() => setAfterImgError(false)}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-salon-gold border border-salon-gold/50">
                          AFTER
                        </span>
                      </div>

                      <div className="flex-1 space-y-1.5 w-full">
                        {afterImgError ? (
                          <div className="rounded border border-red-500/40 bg-red-950/40 p-2 text-[11px] text-red-300 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                            <span>Failed to load image from URL. Please verify the URL or upload a file.</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>After image preview loaded successfully</span>
                          </div>
                        )}
                        <p className="font-mono text-[10px] text-zinc-400 truncate max-w-sm">
                          {afterImageUrl}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => afterFileInputRef.current?.click()}
                            className="text-[11px] text-salon-gold hover:underline"
                          >
                            Replace After Image
                          </button>
                          <span className="text-zinc-600">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAfterImageUrl("");
                              setAfterImgError(false);
                            }}
                            className="text-[11px] text-red-400 hover:underline"
                          >
                            Remove After Image
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-zinc-800 rounded-lg p-4 text-center text-zinc-500 text-[11px]">
                      Paste an HTTPS image URL above or click &quot;Upload After Image&quot; (JPG, PNG, WEBP up to 10MB)
                    </div>
                  )}
                </div>

                {/* -----------------------------------------------------
                    LIVE SIDE-BY-SIDE VERIFICATION STRIP
                ----------------------------------------------------- */}
                {beforeImageUrl && afterImageUrl && (
                  <div className="rounded-xl border border-salon-gold/30 bg-zinc-900/40 p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-salon-gold font-medium">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Paired Transformation Verification Preview</span>
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Will be stored as 1 linked Transformation record
                      </span>
                    </div>

                    <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden border border-zinc-800 flex">
                      <div className="relative w-1/2 h-full border-r border-salon-gold/50">
                        <img
                          src={beforeImageUrl}
                          alt="Before Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-zinc-300 border border-zinc-700">
                          BEFORE
                        </span>
                      </div>
                      <div className="relative w-1/2 h-full">
                        <img
                          src={afterImageUrl}
                          alt="After Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-salon-gold border border-salon-gold/50">
                          AFTER
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseUploadModal}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gold"
                    disabled={uploading || uploadingBefore || uploadingAfter}
                    className="shadow-[0_0_20px_rgba(198,165,107,0.3)]"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        <span>Saving Transformation...</span>
                      </>
                    ) : editingTransformationId ? (
                      <span>Save Changes</span>
                    ) : (
                      <span>Save &amp; Link Transformation</span>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* =========================================================
                  FORM B: STANDARD SINGLE MEDIA ASSET FORM
              ========================================================= */
              <form onSubmit={handleStandardUploadSubmit} className="space-y-4 text-xs">
                {/* File Dropzone */}
                <div className="border-2 border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-salon-gold/50 transition-colors bg-zinc-900/40">
                  {filePreview ? (
                    <div className="relative aspect-video max-h-48 mx-auto rounded-lg overflow-hidden border border-zinc-700">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : selectedFile ? (
                    <div className="py-4 space-y-1">
                      <Video className="h-8 w-8 text-salon-gold mx-auto" />
                      <p className="font-medium text-white">{selectedFile.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <Upload className="h-8 w-8 text-salon-gold mx-auto opacity-80" />
                      <p className="text-zinc-300 font-medium">Click to select or drag and drop file</p>
                      <p className="text-[11px] text-zinc-500">
                        Images (JPG, PNG, WEBP, SVG up to 10MB) • Videos (MP4, WEBM up to 30MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm,video/quicktime"
                    onChange={handleFileChange}
                    className="mt-3 block w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Asset Title *</label>
                    <Input
                      required
                      placeholder="e.g. Royal HD Bridal Look"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-medium">Alt Text / SEO Description *</label>
                    <Input
                      required
                      placeholder="e.g. Traditional bridal makeover at Lalganj salon"
                      value={uploadAltText}
                      onChange={(e) => setUploadAltText(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                  <Button type="button" variant="outline" onClick={handleCloseUploadModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gold" disabled={uploading}>
                    {uploading ? "Uploading Asset..." : "Confirm & Save Asset"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL: EDIT STANDARD SINGLE MEDIA ASSET
      ============================================================= */}
      {showEditItemModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">Edit Media Details</h3>
              <button onClick={() => setShowEditItemModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Asset Title</label>
                <Input
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Alt Text / Description (SEO)</label>
                <Input
                  required
                  value={editingItem.altText}
                  onChange={(e) => setEditingItem({ ...editingItem, altText: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Media URL / Path (Replace)</label>
                <Input
                  required
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Folder</label>
                  <select
                    value={editingItem.folder}
                    onChange={(e) => setEditingItem({ ...editingItem, folder: e.target.value as any })}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 focus:outline-none"
                  >
                    <option value="bridal">Bridal Artistry</option>
                    <option value="hero">Hero &amp; Video</option>
                    <option value="interior">Salon Interior</option>
                    <option value="transformations">Before &amp; After</option>
                    <option value="services">Services</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Sort Order</label>
                  <Input
                    type="number"
                    min={1}
                    value={editingItem.sortOrder}
                    onChange={(e) => setEditingItem({ ...editingItem, sortOrder: Number(e.target.value) })}
                    className="bg-zinc-900 border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowEditItemModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
