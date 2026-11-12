import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { adminFaqSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await req.json();
    const validation = adminFaqSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const updated = await dbRepo.updateFaq(id, validation.data);
    await dbRepo.logAudit({
      action: "FAQ_UPDATE",
      entity: "Faq",
      entityId: id,
      details: `Updated salon FAQ ${id}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin FAQ PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    await dbRepo.deleteFaq(id);
    await dbRepo.logAudit({
      action: "FAQ_DELETE",
      entity: "Faq",
      entityId: id,
      details: `Deleted FAQ ${id}`,
    });

    return NextResponse.json({ success: true, message: "FAQ deleted successfully" });
  } catch (error: any) {
    console.error("Admin FAQ DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete FAQ" }, { status: 500 });
  }
}
