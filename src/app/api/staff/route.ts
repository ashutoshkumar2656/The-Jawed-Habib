import { NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const staff = await dbRepo.getStaffMembers();
    return NextResponse.json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    console.error("Staff API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff members" },
      { status: 500 }
    );
  }
}
