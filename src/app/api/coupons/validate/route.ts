import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";

const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = validateCouponSchema.safeParse(body);

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

    const { code, subtotal } = result.data;
    const validation = await dbRepo.validateCoupon(code, subtotal);

    return NextResponse.json({
      success: validation.isValid,
      data: validation,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
