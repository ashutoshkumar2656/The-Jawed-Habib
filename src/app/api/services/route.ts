import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { GenderTarget } from "@prisma/client";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const gender = (searchParams.get("gender") as GenderTarget) || undefined;
    const isPopular = searchParams.get("popular") === "true" ? true : undefined;
    const isFeatured = searchParams.get("featured") === "true" ? true : undefined;
    const bridalOnly = searchParams.get("bridal") === "true" ? true : undefined;
    const allowOnlineBooking = searchParams.get("online") === "true" ? true : undefined;
    const search = searchParams.get("q") || undefined;

    const services = await dbRepo.getServices({
      categoryId,
      categorySlug,
      gender,
      isPopular,
      isFeatured,
      bridalOnly,
      allowOnlineBooking,
      search,
    });

    return NextResponse.json(
      {
        success: true,
        count: services.length,
        data: services,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Services API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
