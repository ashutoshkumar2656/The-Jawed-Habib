import { NextRequest, NextResponse } from "next/server";
import { availabilityQuerySchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const serviceIds = searchParams.get("serviceIds") || "srv_1";
    const staffId = searchParams.get("staffId") || undefined;

    const validation = availabilityQuerySchema.safeParse({
      date: date || undefined,
      month: month || undefined,
      serviceIds,
      staffId,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const serviceIdArray = (validation.data.serviceIds || "srv_1")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Phase 3: Trigger safe on-demand cleanup of abandoned online checkout reservations older than 60 minutes
    // before computing availability. This ensures released slots are immediately bookable even with a once-daily cron.
    await dbRepo.expireAbandonedOnlineReservations(60);

    let monthData = null;
    let slotsData = null;

    if (validation.data.month) {
      monthData = await dbRepo.getMonthAvailability(
        validation.data.month,
        serviceIdArray,
        validation.data.staffId
      );
    }

    if (validation.data.date) {
      slotsData = await dbRepo.getAvailableSlots(
        validation.data.date,
        serviceIdArray,
        validation.data.staffId
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        month: monthData,
        slots: slotsData?.slots || null,
        date: validation.data.date || null,
        operatingHours: slotsData?.operatingHours || monthData?.operatingHours,
      },
    });
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate appointment availability" },
      { status: 500 }
    );
  }
}
