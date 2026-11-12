import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";

export const dynamic = "force-dynamic";

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  iconName: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const categories = await dbRepo.getCategories(true);
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const created = await dbRepo.createCategory(validation.data);
    await dbRepo.logAudit({
      action: "CATEGORY_CREATE",
      entity: "ServiceCategory",
      entityId: created.id,
      details: `Created category ${created.name}`,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create category" }, { status: 500 });
  }
}
