import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import emailService from "@/lib/email/service";
import { EmailEventType, EmailDeliveryStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointmentId") || undefined;
    const customerEmail = searchParams.get("customerEmail") || undefined;
    const eventType = (searchParams.get("eventType") as EmailEventType) || undefined;
    const deliveryStatus = (searchParams.get("deliveryStatus") as EmailDeliveryStatus) || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = await dbRepo.getEmailLogs({
      appointmentId,
      customerEmail,
      eventType,
      deliveryStatus,
      limit,
    });

    return NextResponse.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error: any) {
    console.error("[ADMIN_GET_EMAILS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve email logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const emailLogId = body?.emailLogId?.trim();

    if (!emailLogId) {
      return NextResponse.json(
        { success: false, error: "emailLogId is required to retry transactional email delivery" },
        { status: 400 }
      );
    }

    const result = await emailService.retryFailedEmail(emailLogId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Retry attempt failed" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transactional email re-queued and dispatched successfully.",
      data: result,
    });
  } catch (error: any) {
    console.error("[ADMIN_RETRY_EMAIL_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retry email delivery" },
      { status: 500 }
    );
  }
}
