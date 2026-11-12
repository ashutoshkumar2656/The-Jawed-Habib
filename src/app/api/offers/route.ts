import { NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const offers = await dbRepo.getOffers();
    return NextResponse.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error("Offers API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch offers" }, { status: 500 });
  }
}
