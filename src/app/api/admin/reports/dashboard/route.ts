import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus } from "@prisma/client";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "all"; // "daily", "weekly", "monthly", "all"

    const appointments = await dbRepo.getAllAppointments();
    const transactionsResult = await dbRepo.getPaymentTransactions();
    const transactions = Array.isArray(transactionsResult)
      ? transactionsResult
      : transactionsResult?.transactions || [];
    const services = await dbRepo.getServices();
    const categories = await dbRepo.getCategories();
    const customers = await dbRepo.getAllCustomers();

    // 1. Booked Value Metrics
    let grossBookedValue = 0;
    let confirmedCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let pendingCount = 0;
    let noShowCount = 0;

    appointments.forEach((apt) => {
      const amt = Number(apt.totalAmount || 0);
      grossBookedValue += amt;

      if (apt.status === AppointmentStatus.CONFIRMED) confirmedCount++;
      else if (apt.status === AppointmentStatus.COMPLETED) completedCount++;
      else if (apt.status === AppointmentStatus.CANCELLED) cancelledCount++;
      else if (apt.status === AppointmentStatus.PENDING) pendingCount++;
      else if (apt.status === AppointmentStatus.NO_SHOW) noShowCount++;
    });

    // 2. Verified Collected Revenue Metrics (Captured Transactions - Refunds)
    let grossCollectedRevenue = 0;
    let totalRefundsAmount = 0;
    let totalRefundsCount = 0;
    let advanceCollected = 0;
    let fullPaymentsCollected = 0;
    let remainingBalancesCollected = 0;
    let failedPaymentsCount = 0;
    let failedPaymentsAmount = 0;

    transactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      const refunded = Number(t.refundedAmount || 0);

      if (t.status === "CAPTURED" || t.status === "SUCCESS") {
        grossCollectedRevenue += amt;
        if (refunded > 0) {
          totalRefundsAmount += refunded;
          totalRefundsCount++;
        }

        if (t.paymentPurpose === "ADVANCE_DEPOSIT") {
          advanceCollected += amt;
        } else if (t.paymentPurpose === "REMAINING_BALANCE") {
          remainingBalancesCollected += amt;
        } else {
          fullPaymentsCollected += amt;
        }
      } else if (t.status === "FAILED") {
        failedPaymentsCount++;
        failedPaymentsAmount += amt;
      }
    });

    const netVerifiedRevenue = Math.max(0, grossCollectedRevenue - totalRefundsAmount);

    // 3. Outstanding Receivables (Remaining Balances on Active Bookings)
    let totalOutstandingBalance = 0;
    appointments.forEach((apt) => {
      if (apt.status !== AppointmentStatus.CANCELLED && apt.status !== AppointmentStatus.REJECTED) {
        const remaining = Number(apt.remainingAmount ?? (apt.totalAmount - (apt.depositAmount || 0)));
        if (remaining > 0 && apt.paymentStatus !== "PAID") {
          totalOutstandingBalance += remaining;
        }
      }
    });

    // 4. Service Breakdown (Popularity and Revenue)
    const serviceBreakdownMap: Record<string, { serviceName: string; categoryName: string; bookings: number; revenue: number }> = {};
    services.forEach((s) => {
      const cat = categories.find((c) => c.id === s.categoryId);
      serviceBreakdownMap[s.id] = {
        serviceName: s.name,
        categoryName: cat?.name || "General",
        bookings: 0,
        revenue: 0,
      };
    });

    appointments.forEach((apt) => {
      const sids: string[] =
        "serviceIds" in apt && Array.isArray((apt as any).serviceIds)
          ? (apt as any).serviceIds
          : "appointmentServices" in apt && Array.isArray((apt as any).appointmentServices)
          ? (apt as any).appointmentServices.map((as: any) => as.serviceId)
          : [];

      sids.forEach((sid) => {
        if (serviceBreakdownMap[sid]) {
          serviceBreakdownMap[sid].bookings += 1;
          if (apt.status === AppointmentStatus.COMPLETED || apt.paymentStatus === "PAID") {
            const srv = services.find((s) => s.id === sid);
            serviceBreakdownMap[sid].revenue += srv ? (srv.discountedPrice ?? srv.price) : 0;
          }
        }
      });
    });

    const topServices = Object.values(serviceBreakdownMap)
      .filter((s) => s.bookings > 0)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);

    // 5. Daily / Recent Activity Series (Past 7 days)
    const recentDaysMap: Record<string, { date: string; bookedAmount: number; collectedAmount: number; appointments: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      recentDaysMap[dateKey] = { date: dateKey, bookedAmount: 0, collectedAmount: 0, appointments: 0 };
    }

    appointments.forEach((apt) => {
      const dStr = typeof apt.appointmentDate === "string" 
        ? apt.appointmentDate 
        : new Date(apt.appointmentDate).toISOString().split("T")[0];
      if (recentDaysMap[dStr]) {
        recentDaysMap[dStr].appointments += 1;
        recentDaysMap[dStr].bookedAmount += Number(apt.totalAmount || 0);
      }
    });

    transactions.forEach((t) => {
      if ((t.status === "CAPTURED" || t.status === "SUCCESS") && t.createdAt) {
        const dStr = new Date(t.createdAt).toISOString().split("T")[0];
        if (recentDaysMap[dStr]) {
          recentDaysMap[dStr].collectedAmount += Number(t.amount || 0);
        }
      }
    });

    const dailyTrend = Object.values(recentDaysMap);

    return NextResponse.json({
      success: true,
      timeframe,
      data: {
        financials: {
          grossBookedValue,
          grossCollectedRevenue,
          totalRefundsAmount,
          totalRefundsCount,
          netVerifiedRevenue,
          advanceCollected,
          fullPaymentsCollected,
          remainingBalancesCollected,
          totalOutstandingBalance,
          failedPaymentsCount,
          failedPaymentsAmount,
        },
        operations: {
          totalAppointments: appointments.length,
          confirmedCount,
          completedCount,
          cancelledCount,
          pendingCount,
          noShowCount,
          cancellationRate: appointments.length > 0 ? Math.round((cancelledCount / appointments.length) * 100) : 0,
          totalCustomers: customers.length,
        },
        topServices,
        dailyTrend,
      },
    });
  } catch (error: any) {
    console.error("Dashboard reports GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate dashboard analytics" },
      { status: 500 }
    );
  }
}
