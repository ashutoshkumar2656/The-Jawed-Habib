import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const createReviewSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
  source: z.enum(["GOOGLE_MAPS", "SALON_GUESTBOOK", "WHATSAPP_VERIFIED", "WEBSITE"]).default("GOOGLE_MAPS"),
  category: z.string().default("General"),
  isVerified: z.boolean().default(true),
  isApproved: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as any) || "ALL";
    const reviews = await dbRepo.getAllReviews(status);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = createReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const created = await dbRepo.createReview(validation.data);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Admin reviews POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create review" }, { status: 500 });
  }
}
