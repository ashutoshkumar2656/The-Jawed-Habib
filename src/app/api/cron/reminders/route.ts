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

    // 1. Automatic 1-hour appointment reminders under Vercel Hobby daily schedule:
    // On Vercel Hobby plan, cron jobs execute at most once per day ("0 0 * * *", 00:00 UTC / ~05:30 IST).
    // A daily cron cannot reliably dispatch exact 1-hour prior reminders for salon appointments (10:00 - 22:00 IST).
    // Automatic 1-hour reminders are safely paused by default under once-daily execution to prevent late or incorrectly timed emails.
    // They can be enabled when a high-frequency cron scheduler or Vercel Pro is available via ENABLE_SCHEDULED_REMINDERS="true".
    const shouldDispatchHourlyReminders = process.env.ENABLE_SCHEDULED_REMINDERS === "true";

    let reminderResult = {
      eligibleCount: 0,
      sentCount: 0,
      skippedCount: 0,
      status: "PAUSED_DAILY_CRON",
      notice: "Automatic ~1-hour reminders safely paused under Vercel Hobby once-daily schedule (00:00 UTC). Exact 1-hour prior delivery requires high-frequency cron scheduling or Vercel Pro. Can be enabled with ENABLE_SCHEDULED_REMINDERS=true.",
      errors: [] as string[],
    };

    if (shouldDispatchHourlyReminders) {
      const execResult = await emailService.processScheduledReminders(75);
      reminderResult = {
        ...execResult,
        status: "ACTIVE",
        notice: "Dispatched via high-frequency reminder scheduler.",
      };
    }

    // 2. Daily sweep: Automatically expire abandoned online checkout reservations older than 60 minutes
    // (Serves as nightly backup sweep alongside on-demand availability cleanup)
    const expiryResult = await dbRepo.expireAbandonedOnlineReservations(60);

    return NextResponse.json({
      success: true,
      cronSchedule: "0 0 * * * (Once daily at 00:00 UTC / ~05:30 IST)",
      message: `Daily maintenance completed: ${expiryResult.dbCount || expiryResult.memCount} stale reservation(s) expired. Reminders status: ${reminderResult.status}.`,
      summary: {
        reminders: reminderResult,
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
