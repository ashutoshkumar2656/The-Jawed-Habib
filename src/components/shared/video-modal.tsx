"use client";

import * as React from "react";
import { X, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface VideoItem {
  id: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  category: string;
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem | null;
}

function getEmbedUrl(url: string): string {
  if (!url) return "";
  // Check if it's already an embed URL
  if (url.includes("youtube.com/embed/")) {
    return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  }
  // Standard watch URL: youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;
  }
  return url;
}

export function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const embedUrl = getEmbedUrl(video.videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-salon-gold/40 bg-salon-richBlack shadow-[0_0_50px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-salon-gold/50 bg-salon-gold/10 text-salon-gold">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
            <div>
              <h3 className="font-serif text-base font-semibold text-white line-clamp-1">
                {video.title}
              </h3>
              <span className="text-xs text-salon-gold">
                The Jawed Habib Salon • {video.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-zinc-700 bg-zinc-900 p-2 text-zinc-400 hover:border-salon-gold hover:text-white transition-colors"
            aria-label="Close video player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              Video source not available
            </div>
          )}
        </div>

        {/* Footer info */}
        {video.description && (
          <div className="border-t border-zinc-800/80 bg-zinc-950 px-6 py-3 text-xs text-zinc-400">
            <p>{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
