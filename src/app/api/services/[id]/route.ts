import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await dbRepo.getServiceById(params.id);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    // Get related services in same category
    const related = await dbRepo.getServices({
      categoryId: service.categoryId,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...service,
        relatedServices: related.filter((s) => s.id !== service.id).slice(0, 3),
      },
    });
  } catch (error) {
    console.error("Service detail API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch service details" },
      { status: 500 }
    );
  }
}
