import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { generateCsv, generateExcelXml } from "@/lib/reports/exporter";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format")?.toLowerCase();
    const search = searchParams.get("search");
    const minVisitsParam = searchParams.get("minVisits");
    const minVisits = minVisitsParam ? parseInt(minVisitsParam, 10) : 0;

    const customers = await dbRepo.getAllCustomers(search || undefined);

    let filtered = customers.filter((c: any) => {
      const visits = Number(c.totalVisits || (c.appointments ? c.appointments.length : 0));
      if (minVisits > 0 && visits < minVisits) return false;
      return true;
    });

    const enrichedRows = filtered.map((c: any) => {
      const u = c.user || {};
      const visits = Number(c.totalVisits || (c.appointments ? c.appointments.length : 0));
      
      // Calculate spend from completed appointments or c.totalSpent
      let lifetimeSpend = Number(c.totalSpent || 0);
      if (c.appointments && Array.isArray(c.appointments) && lifetimeSpend === 0) {
        lifetimeSpend = c.appointments
          .filter((a: any) => a.status === "COMPLETED" || a.paymentStatus === "PAID")
          .reduce((sum: number, a: any) => sum + (Number(a.totalAmount) || 0), 0);
      }

      // Find last visit
      let lastVisitDate = "N/A";
      if (c.appointments && Array.isArray(c.appointments) && c.appointments.length > 0) {
        const sortedApts = [...c.appointments].sort((a: any, b: any) => {
          const dateA = typeof a.appointmentDate === "string" ? a.appointmentDate : new Date(a.appointmentDate).toISOString();
          const dateB = typeof b.appointmentDate === "string" ? b.appointmentDate : new Date(b.appointmentDate).toISOString();
          return dateB.localeCompare(dateA);
        });
        const latest = sortedApts[0];
        lastVisitDate = typeof latest.appointmentDate === "string" 
          ? latest.appointmentDate.split("T")[0] 
          : new Date(latest.appointmentDate).toISOString().split("T")[0];
      }

      // Loyalty Tier
      let loyaltyTier = "New Client";
      if (visits >= 5 || lifetimeSpend >= 5000) {
        loyaltyTier = "VIP Club Member";
      } else if (visits >= 2 || lifetimeSpend >= 1500) {
        loyaltyTier = "Regular Guest";
      }

      const registeredDate = c.createdAt 
        ? new Date(c.createdAt).toISOString().split("T")[0] 
        : "N/A";

      return {
        customerId: c.id,
        fullName: u.name || "Salon Client",
        phone: u.phone || "N/A",
        email: u.email || "N/A",
        totalVisits: visits,
        lifetimeSpend,
        lastVisitDate,
        loyaltyTier,
        registeredDate,
      };
    });

    const headers = [
      "Customer ID",
      "Full Name",
      "Phone Number",
      "Email Address",
      "Total Visits",
      "Lifetime Spend",
      "Last Visit Date",
      "Loyalty Tier",
      "Registered Date",
    ];

    if (format === "csv") {
      const rows = enrichedRows.map((r) => [
        r.customerId,
        r.fullName,
        r.phone,
        r.email,
        r.totalVisits,
        r.lifetimeSpend,
        r.lastVisitDate,
        r.loyaltyTier,
        r.registeredDate,
      ]);

      const csv = generateCsv(headers, rows);
      const dateStamp = new Date().toISOString().split("T")[0];

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="customers_report_${dateStamp}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      const rows = enrichedRows.map((r) => [
        r.customerId,
        r.fullName,
        r.phone,
        r.email,
        r.totalVisits,
        r.lifetimeSpend,
        r.lastVisitDate,
        r.loyaltyTier,
        r.registeredDate,
      ]);

      const xml = generateExcelXml("Customer CRM Reports", headers, rows, [
        "String",
        "String",
        "String",
        "String",
        "Number",
        "Number",
        "String",
        "String",
        "String",
      ]);
      const dateStamp = new Date().toISOString().split("T")[0];

      return new NextResponse(xml, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.ms-excel",
          "Content-Disposition": `attachment; filename="customers_report_${dateStamp}.xlsx"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: enrichedRows.length,
      data: enrichedRows,
    });
  } catch (error: any) {
    console.error("Customer reports GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate customer reports" },
      { status: 500 }
    );
  }
}
