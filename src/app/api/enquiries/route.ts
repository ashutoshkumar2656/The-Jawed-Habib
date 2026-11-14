import { NextRequest, NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { emailService } from "@/lib/email/service";
import { googleSheetsService } from "@/lib/sheets/google-sheets";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// In-memory duplicate submission cache (phone+message -> timestamp)
const recentSubmissions = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Rate Limiting Protection (Max 10 per 10 minutes per IP)
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

    // 2. Anti-spam Honeypot Check (Silently drop bots without revealing detection)
    if (result.data._honey) {
      return NextResponse.json({
        success: true,
        message: "Thank you for contacting The Jawed Habib Salon, Lalganj!",
      });
    }

    const { name, phone, email, serviceInterest, type, source, message } = result.data;
    const cleanPhone = phone.replace(/\D/g, "");

    // 3. Duplicate Submission Protection (within 60 seconds)
    const duplicateKey = `${cleanPhone}:${message.trim().toLowerCase()}`;
    const now = Date.now();
    const lastSubmitted = recentSubmissions.get(duplicateKey);
    if (lastSubmitted && now - lastSubmitted < 60 * 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate enquiry detected. Our concierge has already received your message.",
        },
        { status: 409 }
      );
    }
    recentSubmissions.set(duplicateKey, now);

    // Clean old entries in duplicate cache
    if (recentSubmissions.size > 500) {
      recentSubmissions.forEach((ts, key) => {
        if (now - ts > 120 * 1000) recentSubmissions.delete(key);
      });
    }

    // 4. Save Enquiry in Neon PostgreSQL (Primary Source of Truth)
    let enquiry: any;
    try {
      enquiry = await dbRepo.createEnquiry({
        name: name.trim(),
        phone: cleanPhone,
        email: email ? email.trim().toLowerCase() : null,
        serviceInterest: serviceInterest || "Haircut & Styling",
        type: type || "GENERAL",
        source: source || "Website Contact Form",
        message: message.trim(),
        emailStatus: "PENDING",
        googleSheetsStatus: googleSheetsService.isConfigured() ? "PENDING" : "DISABLED",
      });
    } catch (dbErr: any) {
      console.error("[ENQUIRY_DATABASE_SAVE_FAILED]:", dbErr);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to securely save your inquiry in salon database. Please call our desk directly at 7707000463.",
        },
        { status: 500 }
      );
    }

    // 5. Post-Save Integration Tasks (Failure Isolated: Never drops saved DB record)
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

    let updatedEmailStatus = "PENDING";
    let updatedSheetsStatus = "PENDING";
    let lastError: string | null = null;

    // Task A: Email Notification to Salon Administrator
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
        lastError = emailRes.error || "Email delivery failed";
      }
    } catch (e: any) {
      updatedEmailStatus = "FAILED";
      lastError = e.message || "Email notification exception";
    }

    // Task B: Google Sheets Synchronization
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

    // Task C: Update Enquiry Integration Status in Neon PostgreSQL
    try {
      await dbRepo.updateEnquiry(enquiry.id, {
        emailStatus: updatedEmailStatus as any,
        googleSheetsStatus: updatedSheetsStatus as any,
        emailSentAt: updatedEmailStatus === "SENT" || updatedEmailStatus === "SIMULATED" ? new Date() : null,
        sheetsSyncedAt: updatedSheetsStatus === "SYNCED" || updatedSheetsStatus === "SIMULATED" ? new Date() : null,
        lastError,
      });
    } catch (updateErr) {
      console.warn("[ENQUIRY_STATUS_UPDATE_WARNING]:", updateErr);
    }

    // 6. Return Structured 201 Response to Customer
    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for contacting The Jawed Habib Salon, Lalganj! Our salon concierge will reach out to you shortly.",
        data: {
          id: enquiry.id,
          enquiryNumber: enquiry.enquiryNumber || enquiry.id,
          name: enquiry.name,
          phone: enquiry.phone,
          status: enquiry.status,
          submissionDate,
          submissionTime,
          emailStatus: updatedEmailStatus,
          googleSheetsStatus: updatedSheetsStatus,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Enquiry API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while processing your enquiry." },
      { status: 500 }
    );
  }
}
