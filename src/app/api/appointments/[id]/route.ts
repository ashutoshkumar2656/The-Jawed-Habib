import { NextRequest, NextResponse } from "next/server";
import { appointmentCancelSchema, appointmentRescheduleSchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { getRequestSessionUser } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apt = await dbRepo.getAppointmentById(params.id);
    if (!apt) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: apt,
    });
  } catch (error) {
    console.error("Appointment detail API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getRequestSessionUser(req);
    const body = await req.json();
    const action = body.action; // "cancel" or "reschedule"

    if (action === "cancel") {
      const parsed = appointmentCancelSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      try {
        const cancelled = await dbRepo.cancelAppointment(
          params.id,
          parsed.data.reason,
          session?.userId
        );
        return NextResponse.json({
          success: true,
          message: "Appointment successfully cancelled.",
          data: cancelled,
        });
      } catch (cancelErr: unknown) {
        return NextResponse.json(
          {
            success: false,
            error: (cancelErr as Error).message || "Cancellation failed",
          },
          { status: 400 }
        );
      }
    } else if (action === "reschedule") {
      const parsed = appointmentRescheduleSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      try {
        const rescheduled = await dbRepo.rescheduleAppointment(
          params.id,
          parsed.data.appointmentDate,
          parsed.data.startTime,
          parsed.data.staffId,
          parsed.data.rescheduleReason
        );
        return NextResponse.json({
          success: true,
          message: "Appointment successfully rescheduled.",
          data: rescheduled,
        });
      } catch (rescheduleErr: unknown) {
        return NextResponse.json(
          {
            success: false,
            error: (rescheduleErr as Error).message || "Rescheduling failed",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action. Must be 'cancel' or 'reschedule'.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Appointment PATCH API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
