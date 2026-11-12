import { NextRequest, NextResponse } from "next/server";
import { consultationRecommendSchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = consultationRecommendSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const recommendation = await dbRepo.recommendConsultation(result.data);

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error("Consultation recommend error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
