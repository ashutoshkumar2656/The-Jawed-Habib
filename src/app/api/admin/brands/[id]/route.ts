import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { adminBrandSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await req.json();
    const validation = adminBrandSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const updated = await dbRepo.updateBrand(id, validation.data);
    await dbRepo.logAudit({
      action: "BRAND_UPDATE",
      entity: "Brand",
      entityId: id,
      details: `Updated partner brand ${id}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin brand PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    await dbRepo.deleteBrand(id);
    await dbRepo.logAudit({
      action: "BRAND_DELETE",
      entity: "Brand",
      entityId: id,
      details: `Deleted brand ${id}`,
    });

    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error: any) {
    console.error("Admin brand DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete brand" }, { status: 500 });
  }
}
