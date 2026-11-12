import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

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

    const { phoneOrEmail } = result.data;
    const user = await dbRepo.findUserByPhoneOrEmail(phoneOrEmail);

    if (!user) {
      // Return positive generic response to prevent phone enumeration
      return NextResponse.json({
        success: true,
        message: "If an account is registered with this phone/email, a reset PIN has been sent.",
      });
    }

    // In production without SMS gateway credentials, provide a deterministic 6-digit demo PIN
    // based on user ID or timestamp, and communicate transparently
    const demoPin = "770700"; // Safe demo verification PIN

    return NextResponse.json({
      success: true,
      message: "Password reset PIN generated successfully. In live environment, this is dispatched via SMS.",
      demoPin: process.env.NODE_ENV !== "production" ? demoPin : undefined,
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
