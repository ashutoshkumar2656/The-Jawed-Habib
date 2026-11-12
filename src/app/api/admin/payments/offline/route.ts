import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { adminOfflinePaymentSchema } from "@/lib/validation/schemas";
import { checkAdminAuth } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = adminOfflinePaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid offline payment payload",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const creds = await dbRepo.getRazorpayCredentials();
    if (!creds.allowOfflineRecording) {
      return NextResponse.json(
        {
          success: false,
          error: "Manual offline payment recording is disabled in payment settings.",
        },
        { status: 403 }
      );
    }

    const result = await dbRepo.recordOfflinePayment({
      ...validation.data,
      recordedBy: validation.data.recordedBy || auth.user?.name || "Receptionist",
    });

    return NextResponse.json({
      success: true,
      message: `Successfully recorded offline payment of ₹${validation.data.amount} via ${validation.data.paymentMethod}.`,
      data: result,
    });
  } catch (error: any) {
    console.error("Offline payment recording error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record offline payment" },
      { status: 500 }
    );
  }
}
