import { NextRequest, NextResponse } from "next/server";
import { appointmentCancelSchema, appointmentRescheduleSchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { getRequestSessionUser } from "@/lib/auth/session";
import { isStaffOrAdmin } from "@/lib/auth/rbac";
import logger, { maskPhone } from "@/lib/logging/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getAppointmentCustomerPhone(apt: any): string | null {
  return (
    apt?.customerProfile?.user?.phone ||
    apt?.customerPhone ||
    apt?.phone ||
    null
  );
}

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

    const session = getRequestSessionUser(req);
    const isStaff = session ? isStaffOrAdmin(session.role) : false;
    const isOwner =
      session &&
      ((apt.customerProfile && session.userId === apt.customerProfile.userId) ||
        session.phone === getAppointmentCustomerPhone(apt));

    // If neither staff nor owner, sanitize sensitive internal/admin notes
    if (!isStaff && !isOwner) {
      const sanitizedApt = {
        ...apt,
        internalNotes: undefined,
        adminNotes: undefined,
      };
      return NextResponse.json({
        success: true,
        data: sanitizedApt,
      });
    }

    return NextResponse.json({
      success: true,
      data: apt,
    });
  } catch (error) {
    logger.error("appointment.get.failed", error, { appointmentId: params.id });
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
    const apt = await dbRepo.getAppointmentById(params.id);
    if (!apt) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    const session = getRequestSessionUser(req);
    const aptPhone = getAppointmentCustomerPhone(apt);
    const isStaff = session ? isStaffOrAdmin(session.role) : false;
    const isOwner =
      session &&
      ((apt.customerProfile && session.userId === apt.customerProfile.userId) ||
        (aptPhone && session.phone === aptPhone));

    const body = await req.json();
    const action = body.action; // "cancel" or "reschedule"

    // Verify caller has permission to modify this appointment
    const callerProvidedPhone = body.customerPhone
      ? String(body.customerPhone).replace(/\D/g, "").slice(-10)
      : null;
    const normalizedAptPhone = aptPhone ? aptPhone.replace(/\D/g, "").slice(-10) : null;
    const phoneMatches = callerProvidedPhone && normalizedAptPhone && callerProvidedPhone === normalizedAptPhone;

    if (!isStaff && !isOwner && !phoneMatches) {
      logger.warn("appointment.unauthorized_modification_attempt", {
        appointmentId: params.id,
        appointmentNumber: apt.appointmentNumber,
        action,
        hasSession: Boolean(session),
      });
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Valid customer phone verification or login is required to modify this appointment.",
        },
        { status: 403 }
      );
    }

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

        logger.info("booking.cancelled", {
          appointmentId: params.id,
          appointmentNumber: apt.appointmentNumber,
          customerPhone: maskPhone(aptPhone),
          cancelledBy: session?.userId || "CUSTOMER_PHONE_VERIFIED",
          reason: parsed.data.reason,
        });

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

        logger.info("booking.rescheduled", {
          appointmentId: params.id,
          appointmentNumber: apt.appointmentNumber,
          customerPhone: maskPhone(aptPhone),
          newDate: parsed.data.appointmentDate,
          newTime: parsed.data.startTime,
          rescheduledBy: session?.userId || "CUSTOMER_PHONE_VERIFIED",
        });

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
    logger.error("appointment.patch.failed", error, { appointmentId: params.id });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
