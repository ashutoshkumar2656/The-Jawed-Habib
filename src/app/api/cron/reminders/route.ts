import { NextRequest, NextResponse } from "next/server";
import emailService from "@/lib/email/service";
import dbRepo from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleCronExecution(req);
}

export async function POST(req: NextRequest) {
  return handleCronExecution(req);
}

async function handleCronExecution(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const cronSecretHeader = req.headers.get("x-cron-secret") || "";
    const configuredSecret = process.env.CRON_SECRET?.trim();

    // In production with CRON_SECRET configured, enforce strict token verification
    if (configuredSecret && configuredSecret !== "YOUR_RANDOM_CRON_SECRET") {
      const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
      const isAuthorized = bearerToken === configuredSecret || cronSecretHeader === configuredSecret;

      if (!isAuthorized) {
        console.warn("[UNAUTHORIZED_CRON_INVOCATION_ATTEMPT]", {
          ip: req.headers.get("x-forwarded-for") || "unknown",
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid CRON_SECRET token" },
          { status: 401 }
        );
      }
    }

    // 1. Process reminders due in approximately the next ~75 minutes (in Asia/Kolkata timezone)
    const result = await emailService.processScheduledReminders(75);

    // 2. Automatically expire abandoned online checkout reservations older than 60 minutes
    const expiryResult = await dbRepo.expireAbandonedOnlineReservations(60);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.eligibleCount} eligible appointments: ${result.sentCount} reminder(s) dispatched. Expired ${expiryResult.dbCount || expiryResult.memCount} abandoned online reservation(s).`,
      summary: {
        reminders: result,
        reservationsExpired: expiryResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CRON_REMINDERS_UNCAUGHT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process appointment reminders" },
      { status: 500 }
    );
  }
}
