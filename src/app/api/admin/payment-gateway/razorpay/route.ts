import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { adminRazorpaySettingsSchema } from "@/lib/validation/schemas";
import { checkAdminAuth } from "@/lib/auth/rbac";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const settings = await dbRepo.getRazorpaySettings(true);
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch Razorpay settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = adminRazorpaySettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid settings payload",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await dbRepo.updateRazorpaySettings(validation.data);
    return NextResponse.json({
      success: true,
      message: "Razorpay settings updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update Razorpay settings" },
      { status: 400 }
    );
  }
}
