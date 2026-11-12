"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = "general",
  label = "Image",
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isUrlMode, setIsUrlMode] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to upload image");
      }

      onChange(json.data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] text-salon-gold hover:underline flex items-center gap-1"
        >
          {isUrlMode ? (
            <>
              <Upload className="h-3 w-3" />
              <span>Switch to File Upload</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-3 w-3" />
              <span>Or Paste Direct URL</span>
            </>
          )}
        </button>
      </div>

      {isUrlMode ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg or /images/..."
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white placeholder-zinc-500 focus:border-salon-gold focus:outline-none"
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange("")}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${folder}-${label.toLowerCase().replace(/\s+/g, "-")}`}
          />
          <label
            htmlFor={`file-upload-${folder}-${label.toLowerCase().replace(/\s+/g, "-")}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 hover:border-salon-gold hover:bg-zinc-900/80 cursor-pointer text-xs font-medium text-zinc-300 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-salon-gold" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 text-salon-gold" />
                <span>Choose Image (Max 5MB)</span>
              </>
            )}
          </label>
        </div>
      )}

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {/* Image Preview */}
      {value && (
        <div className="relative mt-2 inline-block rounded-xl border border-zinc-800 bg-zinc-950 p-1">
          <div className="relative aspect-video w-36 overflow-hidden rounded-lg bg-zinc-900">
            <Image
              src={value}
              alt="Uploaded preview"
              fill
              sizes="150px"
              className="object-cover"
              onError={() => setError("Could not render image preview from URL")}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 shadow"
            title="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
          <span className="block text-[9px] text-zinc-400 truncate max-w-[140px] px-1 mt-0.5">
            {value}
          </span>
        </div>
      )}
    </div>
  );
}
