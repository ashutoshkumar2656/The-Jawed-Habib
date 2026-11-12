import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/schemas";
import { comparePassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import dbRepo from "@/lib/db/repo";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const rateLimit = checkRateLimit(`login_ip_${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many login attempts. Please wait a few minutes before trying again.",
          retryAfterMs: rateLimit.resetInMs,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = loginSchema.safeParse(body);

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

    const { phoneOrEmail, password, rememberMe } = result.data;
    const user = await dbRepo.findUserByPhoneOrEmail(phoneOrEmail);

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone/email or password",
        },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone/email or password",
        },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Account is inactive. Please contact salon administration at 7707000463.",
        },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      role: user.roleType,
      phone: user.phone,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: `Welcome back, ${user.name}!`,
        data: {
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.roleType,
            customerProfile: user.customerProfile,
          },
          token,
        },
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: cookieMaxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
