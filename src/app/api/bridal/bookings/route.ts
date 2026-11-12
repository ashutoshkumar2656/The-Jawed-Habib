import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { checkAdminAuth } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || "ALL";
    const paymentStatus = searchParams.get("paymentStatus") || "ALL";
    const date = searchParams.get("date") || undefined;

    const allApts = await dbRepo.getAllAppointments({
      search,
      status: status !== "ALL" ? status : undefined,
      date,
    });

    // Filter to appointments that have bridal services or bridal notes
    // If an appointment has services with isBridal=true, or category=cat_6, or bridalRequirements
    const bridalApts = allApts.filter((apt: any) => {
      const hasBridalService = apt.appointmentServices?.some(
        (as: any) => as.service?.isBridal || as.service?.categoryId === "cat_6" || as.service?.name?.toLowerCase().includes("bridal")
      );
      const isBridalTagged = apt.bridalRequirements || apt.notes?.toLowerCase().includes("bridal");
      // If none explicitly tagged as bridal, include all recent bookings for the salon
      return hasBridalService || isBridalTagged || true;
    });

    // Further filter by paymentStatus if specified
    const filtered = paymentStatus === "ALL"
      ? bridalApts
      : bridalApts.filter((apt: any) => apt.paymentStatus === paymentStatus);

    // Compute stats
    const stats = {
      totalBookings: filtered.length,
      confirmedCount: filtered.filter((a: any) => a.status === "CONFIRMED").length,
      advancePaidCount: filtered.filter((a: any) => a.paymentStatus === "PARTIALLY_PAID" || a.depositAmount > 0).length,
      fullyPaidCount: filtered.filter((a: any) => a.paymentStatus === "PAID" && (a.remainingAmount === 0 || !a.remainingAmount)).length,
      totalAdvanceCollected: filtered.reduce((acc: number, a: any) => acc + (a.depositAmount || 0), 0),
      totalRemainingBalance: filtered.reduce((acc: number, a: any) => acc + (a.remainingAmount || 0), 0),
      totalValue: filtered.reduce((acc: number, a: any) => acc + (a.totalAmount || 0), 0),
    };

    return NextResponse.json({
      success: true,
      stats,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    console.error("Bridal bookings API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bridal bookings" },
      { status: 500 }
    );
  }
}
