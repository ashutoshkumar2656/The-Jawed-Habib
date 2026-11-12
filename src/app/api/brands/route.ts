import { NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brands = await dbRepo.getBrands();
    return NextResponse.json(
      {
        success: true,
        count: brands.length,
        data: brands,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    console.error("Brands API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch cosmetic brands" }, { status: 500 });
  }
}
