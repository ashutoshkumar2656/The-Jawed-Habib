import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { emailService } from "@/lib/email/service";
import { googleSheetsService } from "@/lib/sheets/google-sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin Endpoint to Retry Failed Email or Google Sheets Synchronization
 * POST /api/admin/enquiries/[id]/retry
 * Body: { target?: "email" | "sheets" | "all" }
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const enquiry = await dbRepo.getEnquiryById(id);
    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const target = body.target || "all";

    const createdAt = enquiry.createdAt ? new Date(enquiry.createdAt) : new Date();
    const submissionDate = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(createdAt);

    const submissionTime = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(createdAt);

    let updatedEmailStatus = enquiry.emailStatus || "PENDING";
    let updatedSheetsStatus = enquiry.googleSheetsStatus || "PENDING";
    let lastError: string | null = enquiry.lastError || null;

    // Retry Email
    if (target === "email" || target === "all") {
      try {
        const emailRes = await emailService.sendAdminEnquiryNotification({
          ...enquiry,
          submissionDate,
          submissionTime,
        });

        if (emailRes.success) {
          updatedEmailStatus = emailRes.simulated ? "SIMULATED" : "SENT";
        } else {
          updatedEmailStatus = "FAILED";
          lastError = emailRes.error || "Email retry failed";
        }
      } catch (err: any) {
        updatedEmailStatus = "FAILED";
        lastError = err.message || "Email retry exception";
      }
    }

    // Retry Google Sheets
    if (target === "sheets" || target === "all") {
      try {
        const sheetsRes = await googleSheetsService.appendEnquiryRow({
          enquiryId: enquiry.enquiryNumber || enquiry.id,
          submissionDate,
          submissionTime,
          customerName: enquiry.name,
          mobileNumber: enquiry.phone,
          serviceInterest: enquiry.serviceInterest || "General",
          message: enquiry.message,
          status: enquiry.status || "NEW",
          source: enquiry.source || "Website Contact Form",
        });

        updatedSheetsStatus = sheetsRes.status;
        if (!sheetsRes.success && sheetsRes.error) {
          lastError = lastError ? `${lastError}; Sheets: ${sheetsRes.error}` : sheetsRes.error;
        }
      } catch (sErr: any) {
        updatedSheetsStatus = "FAILED";
        lastError = lastError ? `${lastError}; Sheets: ${sErr.message}` : sErr.message;
      }
    }

    // Persist updated statuses
    const updated = await dbRepo.updateEnquiry(enquiry.id, {
      emailStatus: updatedEmailStatus as any,
      googleSheetsStatus: updatedSheetsStatus as any,
      emailSentAt: updatedEmailStatus === "SENT" || updatedEmailStatus === "SIMULATED" ? new Date() : enquiry.emailSentAt,
      sheetsSyncedAt: updatedSheetsStatus === "SYNCED" || updatedSheetsStatus === "SIMULATED" ? new Date() : enquiry.sheetsSyncedAt,
      lastError,
    });

    return NextResponse.json({
      success: true,
      message: "Integration retry operation completed",
      data: updated,
    });
  } catch (error: any) {
    console.error("Admin enquiry retry POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retry integration" },
      { status: 500 }
    );
  }
}
