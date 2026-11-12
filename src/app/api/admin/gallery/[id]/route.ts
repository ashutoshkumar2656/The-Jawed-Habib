import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { adminGallerySchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await req.json();
    const validation = adminGallerySchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const updated = await dbRepo.updateGalleryImage(id, validation.data);
    await dbRepo.logAudit({
      action: "GALLERY_UPDATE",
      entity: "GalleryImage",
      entityId: id,
      details: `Updated gallery photograph ${id}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin gallery PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update gallery image" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    await dbRepo.deleteGalleryImage(id);
    await dbRepo.logAudit({
      action: "GALLERY_DELETE",
      entity: "GalleryImage",
      entityId: id,
      details: `Deleted gallery photograph ${id}`,
    });

    return NextResponse.json({ success: true, message: "Gallery image deleted successfully" });
  } catch (error: any) {
    console.error("Admin gallery DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete gallery image" }, { status: 500 });
  }
}
