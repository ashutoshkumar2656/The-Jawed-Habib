import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { adminVideoSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await req.json();
    const validation = adminVideoSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const updated = await dbRepo.updateVideo(id, validation.data);
    await dbRepo.logAudit({
      action: "VIDEO_UPDATE",
      entity: "Video",
      entityId: id,
      details: `Updated salon video ${id}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin video PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    await dbRepo.deleteVideo(id);
    await dbRepo.logAudit({
      action: "VIDEO_DELETE",
      entity: "Video",
      entityId: id,
      details: `Deleted salon video ${id}`,
    });

    return NextResponse.json({ success: true, message: "Video deleted successfully" });
  } catch (error: any) {
    console.error("Admin video DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete video" }, { status: 500 });
  }
}
