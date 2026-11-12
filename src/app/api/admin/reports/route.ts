import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const timeframe = searchParams.get("timeframe") || "monthly";

    const report = await dbRepo.getReportsData(timeframe);

    if (format === "csv") {
      // Build CSV
      const headers = ["Appointment Number", "Customer Name", "Phone", "Date", "Time", "Status", "Amount", "Payment Status"];
      const rows = report.rawAppointments.map((a) => [
        a.number,
        `"${a.customerName.replace(/"/g, '""')}"`,
        a.phone,
        a.date,
        a.time,
        a.status,
        a.amount,
        a.paymentStatus,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="jawed_habib_lalganj_report_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error("Admin reports GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate reports" }, { status: 500 });
  }
}
