import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const transformations = await dbRepo.getTransformations();
    const published = (transformations as any[]).filter(
      (t) => t.isFeatured !== false && t.isPublished !== false
    );
    return NextResponse.json({
      success: true,
      count: published.length,
      data: published,
    });
  } catch (error: any) {
    console.error("Public transformations GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transformations" },
      { status: 500 }
    );
  }
}
