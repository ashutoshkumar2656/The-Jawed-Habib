import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { importCalendarOverrides } from "@/lib/db/import-repo";
import { generateCsv } from "@/lib/reports/exporter";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

/**
 * GET: Download sample CSV template for Calendar Overrides & Blocked Dates
 */
export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const headers = [
      "date",
      "type",
      "title",
      "startTime",
      "endTime",
      "isFullDay",
      "reason",
    ];

    const sampleRows = [
      ["2026-12-25", "HOLIDAY", "Christmas Day", "", "", "true", "National Festival Closure"],
      ["2026-11-25", "SPECIAL_HOURS", "Wedding Rush Extended Hours", "09:00", "23:00", "false", "Early opening for festive bridal bookings"],
      ["2026-11-28", "BLOCKED_DATE", "Maintenance & Sanitation", "14:00", "16:00", "false", "Scheduled deep cleaning and sanitization"],
    ];

    const csv = generateCsv(headers, sampleRows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="jawed_habib_calendar_overrides_template.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Dry-run validate or Commit Calendar Overrides
 */
export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { records = [], dryRun = false, overwrite = false } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, error: "No calendar records provided" },
        { status: 400 }
      );
    }

    const settings = await dbRepo.getCalendarSettings();
    const existingBlocked = settings.blockedDates || [];

    // Dry Run & Conflict Detection
    if (dryRun) {
      const errors: { row: number; error: string; severity?: "error" | "warning" }[] = [];
      const seenDates = new Set<string>();

      records.forEach((row, idx) => {
        const rowNum = idx + 1;
        const dateStr = row.date?.trim();

        if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          errors.push({ row: rowNum, error: `Invalid date format: ${dateStr}. Must be YYYY-MM-DD` });
          return;
        }

        // Duplicate within the file
        if (seenDates.has(dateStr)) {
          errors.push({
            row: rowNum,
            error: `Duplicate date within CSV file: ${dateStr}`,
            severity: "error",
          });
        }
        seenDates.add(dateStr);

        // Conflict with existing calendar settings
        const conflict = existingBlocked.find((b: any) => b.date === dateStr);
        if (conflict) {
          errors.push({
            row: rowNum,
            error: `Date ${dateStr} already has an override (${conflict.reason || "Blocked"}). Will overwrite if overwrite mode is enabled.`,
            severity: "warning",
          });
        }
      });

      const hasBlockingErrors = errors.some((e) => e.severity !== "warning");

      return NextResponse.json({
        success: true,
        dryRun: true,
        totalRows: records.length,
        valid: !hasBlockingErrors,
        errors,
        preview: records.slice(0, 10),
      });
    }

    // Execute Import
    const result = await importCalendarOverrides(records, overwrite);

    return NextResponse.json({
      success: true,
      message: `Calendar import complete: ${result.inserted} created, ${result.updated} updated, ${result.skipped} skipped`,
      result,
    });
  } catch (error: any) {
    console.error("Calendar import error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
