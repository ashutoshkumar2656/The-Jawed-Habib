import { NextRequest, NextResponse } from "next/server";
import { priceEstimatorSchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = priceEstimatorSchema.safeParse(body);

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

    const estimate = await dbRepo.estimatePrice(result.data);

    return NextResponse.json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    console.error("Price estimator error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
