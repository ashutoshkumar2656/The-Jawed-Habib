import { NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export async function GET() {
  try {
    const categories = await dbRepo.getCategories();
    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        data: categories,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch service categories" },
      { status: 500 }
    );
  }
}
