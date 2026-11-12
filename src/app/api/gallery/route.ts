import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const images = await dbRepo.getGalleryImages(category);
    const published = (images as any[]).filter((img) => img.isPublished !== false);
    return NextResponse.json({
      success: true,
      count: published.length,
      data: published,
    });
  } catch (error: any) {
    console.error("Public gallery GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}
