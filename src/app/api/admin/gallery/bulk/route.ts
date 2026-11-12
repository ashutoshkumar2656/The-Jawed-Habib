import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { adminGallerySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [body];

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "No media items provided" }, { status: 400 });
    }

    const createdItems = [];
    const errors: { index: number; error: any }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const validation = adminGallerySchema.safeParse(item);
      if (!validation.success) {
        errors.push({ index: i, error: validation.error.format() });
        continue;
      }
      const created = await dbRepo.createGalleryImage(validation.data);
      createdItems.push(created);
    }

    return NextResponse.json({
      success: true,
      count: createdItems.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      data: createdItems,
    });
  } catch (error: any) {
    console.error("Bulk gallery upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process bulk gallery upload" },
      { status: 500 }
    );
  }
}
