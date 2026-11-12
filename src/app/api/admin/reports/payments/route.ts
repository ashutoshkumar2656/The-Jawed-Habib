import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { generateCsv, generateExcelXml } from "@/lib/reports/exporter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format")?.toLowerCase(); // "csv", "xlsx", or "json"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const environment = searchParams.get("environment");
    const paymentMethod = searchParams.get("paymentMethod");
    const search = searchParams.get("search");

    // Fetch transactions with filters from repo
    const transactionsResult = await dbRepo.getPaymentTransactions({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status && status !== "ALL" ? status : undefined,
      environment: environment && environment !== "ALL" ? environment : undefined,
      paymentMethod: paymentMethod && paymentMethod !== "ALL" ? paymentMethod : undefined,
      search: search || undefined,
    });
    const transactions = Array.isArray(transactionsResult)
      ? transactionsResult
      : transactionsResult?.transactions || [];

    // Map into the exact 13 fields requested in Phase 2 with strict secret redaction
    const enrichedRows = transactions.map((t) => {
      const dateStr = t.createdAt
        ? new Date(t.createdAt).toISOString().replace("T", " ").substring(0, 19)
        : "N/A";

      const refundAmount = Number(t.refundedAmount || 0);
      let refundStatus = "NONE";
      if (refundAmount > 0) {
        refundStatus = refundAmount >= t.amount ? "FULLY_REFUNDED" : "PARTIALLY_REFUNDED";
      }

      return {
        internalTransactionId: t.transactionRef || t.id,
        bookingReference: t.appointmentNumber || "N/A",
        customerName: t.customerName || "Salon Client",
        razorpayOrderId: t.razorpayOrderId || "N/A",
        razorpayPaymentId: t.razorpayPaymentId || "N/A",
        amount: Number(t.amount || 0),
        currency: t.currency || "INR",
        paymentPurpose: t.paymentPurpose || "ADVANCE_DEPOSIT",
        paymentMethod: t.paymentMethod || "Razorpay Online",
        paymentStatus: t.status === "SUCCESS" ? "CAPTURED" : t.status,
        refundAmount,
        refundStatus,
        transactionDate: dateStr,
      };
    });

    const headers = [
      "Internal Transaction ID",
      "Booking Reference",
      "Customer Name",
      "Razorpay Order ID",
      "Razorpay Payment ID",
      "Amount",
      "Currency",
      "Payment Purpose",
      "Payment Method",
      "Payment Status",
      "Refund Amount",
      "Refund Status",
      "Transaction Date",
    ];

    if (format === "csv") {
      const rows = enrichedRows.map((r) => [
        r.internalTransactionId,
        r.bookingReference,
        r.customerName,
        r.razorpayOrderId,
        r.razorpayPaymentId,
        r.amount,
        r.currency,
        r.paymentPurpose,
        r.paymentMethod,
        r.paymentStatus,
        r.refundAmount,
        r.refundStatus,
        r.transactionDate,
      ]);

      const csv = generateCsv(headers, rows);
      const dateStamp = new Date().toISOString().split("T")[0];

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="payments_report_${dateStamp}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      const rows = enrichedRows.map((r) => [
        r.internalTransactionId,
        r.bookingReference,
        r.customerName,
        r.razorpayOrderId,
        r.razorpayPaymentId,
        r.amount,
        r.currency,
        r.paymentPurpose,
        r.paymentMethod,
        r.paymentStatus,
        r.refundAmount,
        r.refundStatus,
        r.transactionDate,
      ]);

      const xml = generateExcelXml("Payment Reports", headers, rows, [
        "String",
        "String",
        "String",
        "String",
        "String",
        "Number",
        "String",
        "String",
        "String",
        "String",
        "Number",
        "String",
        "String",
      ]);
      const dateStamp = new Date().toISOString().split("T")[0];

      return new NextResponse(xml, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.ms-excel",
          "Content-Disposition": `attachment; filename="payments_report_${dateStamp}.xlsx"`,
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
    console.error("Payment reports GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate payment reports" },
      { status: 500 }
    );
  }
}
