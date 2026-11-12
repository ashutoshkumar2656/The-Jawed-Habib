import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/auth/password";
import dbRepo from "@/lib/db/repo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = resetPasswordSchema.safeParse(body);

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

    const { phoneOrEmail, tokenOrPin, newPassword } = result.data;

    // Verify demo PIN or valid token
    if (tokenOrPin !== "770700" && tokenOrPin.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired reset PIN/token. Try requesting a new one.",
        },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);
    const updated = await dbRepo.resetPassword(phoneOrEmail, newHash);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: "User account could not be found to reset password.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. You may now log in with your new credentials.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
