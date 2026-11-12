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
    const format = searchParams.get("format")?.toLowerCase(); // "csv", "xlsx", or json
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const serviceId = searchParams.get("serviceId");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");

    // Fetch all appointments
    const allAppointments = await dbRepo.getAllAppointments({
      status: status && status !== "ALL" ? status : undefined,
      serviceId: serviceId && serviceId !== "ALL" ? serviceId : undefined,
      search: search || undefined,
    });

    // Apply additional in-depth date range & paymentStatus filters
    let filtered = allAppointments.filter((apt) => {
      if (startDate) {
        const aptDateStr = typeof apt.appointmentDate === "string" 
          ? apt.appointmentDate 
          : new Date(apt.appointmentDate).toISOString().split("T")[0];
        if (aptDateStr < startDate) return false;
      }
      if (endDate) {
        const aptDateStr = typeof apt.appointmentDate === "string" 
          ? apt.appointmentDate 
          : new Date(apt.appointmentDate).toISOString().split("T")[0];
        if (aptDateStr > endDate) return false;
      }
      if (paymentStatus && paymentStatus !== "ALL") {
        if (apt.paymentStatus !== paymentStatus) return false;
      }
      return true;
    });

    // Map into the exact 14 reporting fields
    const enrichedRows = filtered.map((apt) => {
      const cust = apt.customerProfile?.user;
      const customerName = cust?.name || "Salon Client";
      const customerPhone = cust?.phone || "";
      const customerEmail = cust?.email || "N/A";

      // Services list string
      const serviceNames: string[] = [];
      if (apt.appointmentServices && Array.isArray(apt.appointmentServices)) {
        for (const s of apt.appointmentServices) {
          if (s.service?.name) serviceNames.push(s.service.name);
        }
      }
      const serviceStr = serviceNames.length > 0 ? serviceNames.join(", ") : "Custom Salon Service";

      const aptDateStr = typeof apt.appointmentDate === "string"
        ? apt.appointmentDate
        : new Date(apt.appointmentDate).toISOString().split("T")[0];

      const totalAmount = Number(apt.totalAmount || 0);
      const depositAmount = Number(apt.depositAmount || 0);
      const remainingAmount = Number(apt.remainingAmount ?? (totalAmount - depositAmount));
      const amountPaid = Math.max(0, totalAmount - remainingAmount);
      const createdDateStr = apt.createdAt
        ? new Date(apt.createdAt).toISOString().replace("T", " ").substring(0, 19)
        : "N/A";

      return {
        bookingReference: apt.appointmentNumber || apt.id,
        customerName,
        mobileNumber: customerPhone,
        email: customerEmail,
        service: serviceStr,
        appointmentDate: aptDateStr,
        appointmentTime: apt.startTime || "N/A",
        servicePriceSnapshot: totalAmount,
        advanceAmount: depositAmount,
        amountPaid,
        remainingBalance: remainingAmount,
        bookingStatus: apt.status,
        paymentStatus: apt.paymentStatus || "UNPAID",
        createdDate: createdDateStr,
      };
    });

    const headers = [
      "Booking Reference",
      "Customer Name",
      "Mobile Number",
      "Email",
      "Service",
      "Appointment Date",
      "Appointment Time",
      "Service Price Snapshot",
      "Advance Amount",
      "Amount Paid",
      "Remaining Balance",
      "Booking Status",
      "Payment Status",
      "Created Date",
    ];

    if (format === "csv") {
      const rows = enrichedRows.map((r) => [
        r.bookingReference,
        r.customerName,
        r.mobileNumber,
        r.email,
        r.service,
        r.appointmentDate,
        r.appointmentTime,
        r.servicePriceSnapshot,
        r.advanceAmount,
        r.amountPaid,
        r.remainingBalance,
        r.bookingStatus,
        r.paymentStatus,
        r.createdDate,
      ]);

      const csv = generateCsv(headers, rows);
      const dateStamp = new Date().toISOString().split("T")[0];

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bookings_report_${dateStamp}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      const rows = enrichedRows.map((r) => [
        r.bookingReference,
        r.customerName,
        r.mobileNumber,
        r.email,
        r.service,
        r.appointmentDate,
        r.appointmentTime,
        r.servicePriceSnapshot,
        r.advanceAmount,
        r.amountPaid,
        r.remainingBalance,
        r.bookingStatus,
        r.paymentStatus,
        r.createdDate,
      ]);

      const xml = generateExcelXml("Booking Reports", headers, rows, [
        "String",
        "String",
        "String",
        "String",
        "String",
        "String",
        "String",
        "Number",
        "Number",
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
          "Content-Disposition": `attachment; filename="bookings_report_${dateStamp}.xlsx"`,
        },
      });
    }

    // Default JSON
    return NextResponse.json({
      success: true,
      count: enrichedRows.length,
      data: enrichedRows,
    });
  } catch (error: any) {
    console.error("Booking reports GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate booking reports" },
      { status: 500 }
    );
  }
}
