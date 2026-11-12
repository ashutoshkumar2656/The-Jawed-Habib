import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const videos = await dbRepo.getVideos(category);

    return NextResponse.json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    console.error("Videos API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch salon videos" }, { status: 500 });
  }
}
