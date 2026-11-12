import { NextRequest, NextResponse } from "next/server";
import { customerRegisterSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import dbRepo from "@/lib/db/repo";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = customerRegisterSchema.safeParse(body);

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

    const { name, phone, email, password, address } = result.data;

    // Check if phone or email already registered
    const existing = await dbRepo.findUserByPhoneOrEmail(phone);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "A customer account with this phone number already exists. Please log in.",
        },
        { status: 409 }
      );
    }

    if (email) {
      const existingEmail = await dbRepo.findUserByPhoneOrEmail(email);
      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email address already exists.",
          },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hashPassword(password);
    const user = await dbRepo.createUserWithCustomerProfile({
      name,
      phone,
      email: email || null,
      passwordHash,
      address,
    });

    const token = signToken({
      userId: user.id,
      role: user.roleType,
      phone: user.phone,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful! Welcome to The Jawed Habib Salon, Lalganj.",
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
      { status: 201 }
    );

    // Set HTTP-only secure cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
