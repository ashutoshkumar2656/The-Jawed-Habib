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
  Copy,
  Check,
  Trash2,
  Edit2,
  Folder,
  Eye,
  CheckCircle,
  Sparkles,
  ArrowUpDown,
  Search,
  Plus,
  RefreshCw,
  Crown,
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

const FOLDERS = [
  { id: "all", label: "All Media" },
  { id: "bridal", label: "Bridal Artistry" },
  { id: "hero", label: "Hero & Video Experience" },
  { id: "interior", label: "Salon Interior & Ambience" },
  { id: "transformations", label: "Before & After" },
  { id: "services", label: "Hair & Skin Services" },
  { id: "general", label: "General & Branding" },
];

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeFolder, setActiveFolder] = React.useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = React.useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [search, setSearch] = React.useState("");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Upload & Edit States
  const [uploading, setUploading] = React.useState(false);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MediaItem | null>(null);

  // Upload Form
  const [uploadFolder, setUploadFolder] = React.useState<"bridal" | "interior" | "transformations" | "services" | "hero" | "general">("bridal");
  const [uploadTitle, setUploadTitle] = React.useState("");
  const [uploadAltText, setUploadAltText] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setFeedback(`Copied URL for "${item.title}"`);
    setTimeout(() => {
      setCopiedId(null);
      setFeedback(null);
    }, 2500);
  };

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

  const handleUploadSubmit = async (e: React.FormEvent) => {
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
        setShowUploadModal(false);
        setSelectedFile(null);
        setFilePreview(null);
        setUploadTitle("");
        setUploadAltText("");
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
        setShowEditModal(false);
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

  const filteredMedia = mediaList.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.title.toLowerCase().includes(q) || m.altText.toLowerCase().includes(q) || m.url.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Media Assets</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Assets: {mediaList.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Salon Media Management &amp; Asset Library
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Upload, preview, replace, and organize high-definition bridal images, hero videos, and salon photography
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchMedia} className="gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button variant="gold" onClick={() => setShowUploadModal(true)} className="gap-2 shadow">
            <Upload className="h-4 w-4" />
            <span>Upload New Media</span>
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
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
              placeholder="Search title, alt text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border-zinc-800 pl-8 text-xs h-8"
            />
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading media assets...
        </div>
      ) : filteredMedia.length === 0 ? (
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
                    <Image
                      src={item.url}
                      alt={item.altText}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
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
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCopyUrl(item)}
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
                        setShowEditModal(true);
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
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Upload className="h-4 w-4 text-salon-gold" />
                <span>Upload Media Asset</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-salon-gold/50 transition-colors bg-zinc-900/40">
                {filePreview ? (
                  <div className="relative aspect-video max-h-48 mx-auto rounded-lg overflow-hidden border border-zinc-700">
                    <Image src={filePreview} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                ) : selectedFile ? (
                  <div className="py-4 space-y-1">
                    <Video className="h-8 w-8 text-salon-gold mx-auto" />
                    <p className="font-medium text-white">{selectedFile.name}</p>
                    <p className="text-[10px] text-zinc-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
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
                  <label className="block text-zinc-400 mb-1 font-medium">Destination Folder *</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value as any)}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 focus:outline-none"
                  >
                    <option value="bridal">Bridal Artistry</option>
                    <option value="hero">Hero &amp; Video</option>
                    <option value="interior">Salon Interior &amp; Ambience</option>
                    <option value="transformations">Before &amp; After</option>
                    <option value="services">Services &amp; Pricing</option>
                    <option value="general">General &amp; Branding</option>
                  </select>
                </div>

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
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Alt Text / Description (SEO) *</label>
                <Input
                  required
                  placeholder="e.g. Traditional bridal makeover with gold jewellery at Lalganj salon"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={uploading}>
                  {uploading ? "Uploading Asset..." : "Confirm & Save Asset"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">Edit Media Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-white">✕</button>
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
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
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
