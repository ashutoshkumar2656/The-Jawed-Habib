import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(30),
  subtotal: z.number().min(0, "Subtotal must be positive"),
});

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`coupon_val_${clientIp}`, 15, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many coupon validation attempts. Please wait a few minutes.",
          retryAfterMs: rateLimit.resetInMs,
        },
        { status: 429 }
      );
    }

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
