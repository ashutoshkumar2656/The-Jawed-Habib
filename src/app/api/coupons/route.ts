import { NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupons = await dbRepo.getAllCoupons();
    const active = coupons.filter((c: any) => c.isActive !== false);
    return NextResponse.json({
      success: true,
      data: active,
    });
  } catch (error) {
    console.error("Public coupons API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch coupons" }, { status: 500 });
  }
}
