import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const reviewModerationSchema = z.object({
  isApproved: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  reply: z.string().optional(),
  customerName: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  title: z.string().optional(),
  comment: z.string().optional(),
  source: z.enum(["GOOGLE_MAPS", "SALON_GUESTBOOK", "WHATSAPP_VERIFIED", "WEBSITE"]).optional(),
  category: z.string().optional(),
  isVerified: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return handleUpdate(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleUpdate(req, params);
}

async function handleUpdate(req: NextRequest, params: { id: string }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await req.json();
    const validation = reviewModerationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const updated = await dbRepo.updateReviewStatus(id, validation.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin review update error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    await dbRepo.deleteReview(id);
    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Admin review DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete review" }, { status: 500 });
  }
}
