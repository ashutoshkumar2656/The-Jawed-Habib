import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import { importHistoricalAppointments } from "@/lib/db/import-repo";
import { generateCsv } from "@/lib/reports/exporter";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

/**
 * GET: Download sample CSV template for Historical Salon Bookings
 */
export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const headers = ["customerName", "phone", "email", "date", "time", "amount"];
    const sampleRows = [
      ["Pooja Kumari", "9876501234", "pooja@example.com", "2026-10-15", "11:00", 1200],
      ["Amit Sharma", "9876505678", "amit@example.com", "2026-10-18", "16:30", 650],
      ["Neha Singh", "9876509012", "neha@example.com", "2026-10-22", "14:00", 2500],
    ];

    const csv = generateCsv(headers, sampleRows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="jawed_habib_historical_bookings_template.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Import historical records with Payment Safety Protection
 */
export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { records = [], dryRun = false } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, error: "No historical records provided" },
        { status: 400 }
      );
    }

    if (dryRun) {
      const errors: { row: number; error: string }[] = [];
      records.forEach((row, idx) => {
        const rowNum = idx + 1;
        if (!row.customerName) errors.push({ row: rowNum, error: "Customer name is required" });
        if (!row.phone) errors.push({ row: rowNum, error: "Phone number is required" });
      });

      return NextResponse.json({
        success: true,
        dryRun: true,
        totalRows: records.length,
        valid: errors.length === 0,
        errors,
        preview: records.slice(0, 10),
      });
    }

    // Safety enforcement: executes historical importer
    const result = await importHistoricalAppointments(records);

    return NextResponse.json({
      success: true,
      message: `Historical data safely imported: ${result.imported} bookings imported. Payment safety applied: records marked as MANUAL_IMPORT. Zero Razorpay ledger pollution.`,
      result,
    });
  } catch (error: any) {
    console.error("Historical import error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
