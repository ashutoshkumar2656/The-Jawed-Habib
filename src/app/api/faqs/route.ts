import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const faqs = await dbRepo.getFaqs(category);

    return NextResponse.json(
      {
        success: true,
        count: faqs.length,
        data: faqs,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("FAQs API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch salon FAQs" }, { status: 500 });
  }
}
