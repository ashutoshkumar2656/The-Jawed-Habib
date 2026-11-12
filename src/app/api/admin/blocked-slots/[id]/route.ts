import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    await dbRepo.deleteBlockedSlot(id);
    await dbRepo.logAudit({
      action: "BLOCK_SLOT_DELETE",
      entity: "BlockedSlot",
      entityId: id,
      details: `Removed blocked slot ${id}`,
    });

    return NextResponse.json({ success: true, message: "Blocked slot deleted successfully" });
  } catch (error: any) {
    console.error("Admin blocked-slot DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete blocked slot" }, { status: 500 });
  }
}
