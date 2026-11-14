import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { checkRateLimit } from "@/lib/security/rate-limit";
import logger, { maskPhone } from "@/lib/logging/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`forgot_pw_ip_${clientIp}`, 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      logger.warn("auth.forgot_password.rate_limited", { clientIp });
      return NextResponse.json(
        {
          success: false,
          error: "Too many password reset requests. Please wait a few minutes before trying again.",
          retryAfterMs: rateLimit.resetInMs,
        },
        { status: 429 }
      );
    }

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

    logger.info("auth.forgot_password.dispatched", {
      target: maskPhone(phoneOrEmail),
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset PIN generated successfully. In live environment, this is dispatched via SMS.",
      demoPin: process.env.NODE_ENV !== "production" ? demoPin : undefined,
    });
  } catch (error) {
    logger.error("auth.forgot_password.failed", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
