import { NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const packages = await dbRepo.getPackages();
    return NextResponse.json(
      {
        success: true,
        count: packages.length,
        data: packages,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Packages API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch packages" }, { status: 500 });
  }
}
