import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE_BYTES = 30 * 1024 * 1024; // 30 MB

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided for upload" },
        { status: 400 }
      );
    }

    const mime = file.type.toLowerCase();
    const isImage = ALLOWED_IMAGE_MIMES.has(mime);
    const isVideo = ALLOWED_VIDEO_MIMES.has(mime);

    // Validate MIME type
    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type '${file.type}'. Allowed types: JPG, PNG, WEBP, SVG, GIF, MP4, WEBM, MOV.`,
        },
        { status: 400 }
      );
    }

    // Validate size depending on media category
    const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (file.size > maxSize) {
      const maxMb = isVideo ? "30MB" : "10MB";
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the ${maxMb} limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    // Sanitize folder
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30) || "general";
    const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolder);
    await fs.mkdir(uploadDir, { recursive: true });

    // Sanitize file extension & create unique name
    const ext = path.extname(file.name).toLowerCase() || ".webp";
    const baseSlug = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    const uniqueFilename = `${baseSlug}-${Date.now()}${ext}`;
    const destinationPath = path.join(uploadDir, uniqueFilename);

    // Write file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${safeFolder}/${uniqueFilename}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicUrl,
          filename: uniqueFilename,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin upload POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
