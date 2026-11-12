import { NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await dbRepo.getSiteSettings();
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Public content GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch website content" },
      { status: 500 }
    );
  }
}
