import { NextRequest, NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const rateLimit = checkRateLimit(`enquiry_ip_${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many enquiries submitted from this network. Please wait a few minutes.",
          retryAfterMs: rateLimit.resetInMs,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = enquirySchema.safeParse(body);

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

    // Check honeypot field for spam prevention
    if (result.data._honey) {
      return NextResponse.json({ success: true, message: "Enquiry recorded" });
    }

    const { name, phone, email, serviceInterest, type, message } = result.data;

    const enquiry = await dbRepo.createEnquiry({
      name,
      phone,
      email: email || null,
      serviceInterest,
      type,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for contacting The Jawed Habib Salon, Lalganj! Our front desk executive will contact you shortly.",
        data: {
          id: enquiry.id,
          name: enquiry.name,
          phone: enquiry.phone,
          status: enquiry.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enquiry API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
