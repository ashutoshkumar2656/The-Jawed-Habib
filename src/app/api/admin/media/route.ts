import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const createMediaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  altText: z.string().min(1, "Alt text is required"),
  url: z.string().min(1, "Media URL is required"),
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  folder: z.enum(["bridal", "interior", "transformations", "services", "hero", "general"]),
  fileSize: z.string().optional(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || undefined;
    const mediaType = (searchParams.get("type") as "IMAGE" | "VIDEO") || undefined;

    const media = await dbRepo.getAllMedia(folder, mediaType);
    return NextResponse.json({ success: true, data: media });
  } catch (error: any) {
    console.error("Admin media GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = createMediaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const item = await dbRepo.createMediaItem(validation.data);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: any) {
    console.error("Admin media POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create media item" }, { status: 500 });
  }
}
