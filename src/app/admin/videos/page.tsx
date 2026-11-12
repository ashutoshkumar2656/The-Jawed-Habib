"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Video as VideoIcon,
  Plus,
  Trash2,
  ExternalLink,
  PlayCircle,
  Sparkles,
  Edit2,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  category: string;
  isFeatured: boolean;
  sortOrder: number;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = React.useState<VideoItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    category: "Transformations",
    isFeatured: true,
    sortOrder: 1,
  });

  const fetchVideos = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/videos");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVideos(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch videos:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      videoUrl: "https://www.youtube.com/watch?v=demo",
      thumbnailUrl: "/images/hero/hero-bg.webp",
      category: "Transformations",
      isFeatured: true,
      sortOrder: videos.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (vid: VideoItem) => {
    setEditingId(vid.id);
    setFormData({
      title: vid.title,
      description: vid.description || "",
      videoUrl: vid.videoUrl,
      thumbnailUrl: vid.thumbnailUrl || "",
      category: vid.category,
      isFeatured: vid.isFeatured,
      sortOrder: vid.sortOrder,
    });
    setShowModal(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const url = editingId ? `/api/admin/videos/${editingId}` : "/api/admin/videos";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(editingId ? "Video details updated!" : "New video added to showcase!");
        setShowModal(false);
        fetchVideos();
      } else {
        alert(json.error || "Failed to save video");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleTogglePublish = async (vid: VideoItem) => {
    try {
      const res = await fetch(`/api/admin/videos/${vid.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !vid.isFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        fetchVideos();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (!confirm(`Delete video "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback("Video deleted successfully");
        fetchVideos();
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
            <Badge variant="gold">Media Showcase</Badge>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">Total Videos: {videos.length}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-wide">
            Video Gallery Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage reels, styling demonstrations, and transformation video links for the salon website
          </p>
        </div>

        <Button variant="gold" onClick={openAddModal} className="gap-2 shadow">
          <Plus className="h-4 w-4" />
          <span>Add New Video</span>
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

      {/* Videos List Grid */}
      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
          Loading video library...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.length === 0 ? (
            <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-12 text-center text-zinc-500 text-xs">
              No videos added yet. Click &quot;Add New Video&quot; above to embed one.
            </div>
          ) : (
            videos.map((vid) => (
              <div
                key={vid.id}
                className="rounded-xl border border-salon-borderBlack bg-salon-cardBlack p-4 space-y-3 hover:border-salon-gold/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden group">
                    {vid.thumbnailUrl ? (
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform"
                        style={{ backgroundImage: `url(${vid.thumbnailUrl})` }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-600">
                        <PlayCircle className="h-10 w-10 text-salon-gold/70 mb-1" />
                        <span className="text-[10px]">Video Reel</span>
                      </div>
                    )}
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PlayCircle className="h-12 w-12 text-white drop-shadow-md" />
                    </a>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-salon-gold font-semibold">
                      {vid.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-sm font-bold text-white line-clamp-1">{vid.title}</h3>
                    {vid.description && <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{vid.description}</p>}
                  </div>

                  <a
                    href={vid.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-salon-gold hover:underline flex items-center gap-1 font-mono truncate"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{vid.videoUrl}</span>
                  </a>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleTogglePublish(vid)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      vid.isFeatured
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                        : "bg-zinc-900 text-zinc-500 border-zinc-800"
                    }`}
                  >
                    {vid.isFeatured ? "Published" : "Hidden"}
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(vid)}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Edit Video"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(vid.id, vid.title)}
                      className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      title="Delete Video"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Video Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingId ? "Edit Video Information" : "Add Salon Video Link"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Video Title *</label>
                <Input
                  required
                  placeholder="e.g. Master Balayage Transformation at Lalganj"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Video URL (YouTube, Vimeo, etc.) *</label>
                <Input
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Video Thumbnail URL</label>
                <Input
                  placeholder="/images/hero/hero-bg.webp"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-zinc-300 focus:outline-none"
                  >
                    <option value="Transformations">Transformations</option>
                    <option value="Hair Styling">Hair Styling</option>
                    <option value="Salon Tour">Salon Tour</option>
                    <option value="Masterclasses">Masterclasses</option>
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
                <label className="block text-zinc-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of techniques and results..."
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
                  <span>Publish to Public Website</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={actionLoading}>
                  {actionLoading ? "Saving..." : editingId ? "Update Video" : "Publish Video"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
