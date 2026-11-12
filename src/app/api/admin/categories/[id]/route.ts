import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const categoryUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await req.json();
    const validation = categoryUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const updated = await dbRepo.updateCategory(id, validation.data);
    await dbRepo.logAudit({
      action: "CATEGORY_UPDATE",
      entity: "ServiceCategory",
      entityId: id,
      details: `Updated category ${id}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin category PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    await dbRepo.deleteCategory(id);
    await dbRepo.logAudit({
      action: "CATEGORY_DELETE",
      entity: "ServiceCategory",
      entityId: id,
      details: `Deleted category ${id}`,
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Admin category DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
