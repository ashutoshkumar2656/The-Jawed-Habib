import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const updateMediaSchema = z.object({
  title: z.string().optional(),
  altText: z.string().optional(),
  url: z.string().optional(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
  folder: z.enum(["bridal", "interior", "transformations", "services", "hero", "general"]).optional(),
  fileSize: z.string().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await req.json();
    const validation = updateMediaSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const updated = await dbRepo.updateMediaItem(id, validation.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin media PUT error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update media item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    await dbRepo.deleteMediaItem(id);
    return NextResponse.json({ success: true, message: "Media item deleted successfully" });
  } catch (error: any) {
    console.error("Admin media DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete media item" }, { status: 500 });
  }
}
