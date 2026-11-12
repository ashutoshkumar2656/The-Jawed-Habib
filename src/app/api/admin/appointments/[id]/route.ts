import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { adminAppointmentStatusSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await req.json();
    const validation = adminAppointmentStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const updated = await dbRepo.updateAppointmentStatus(id, {
      status: validation.data.status as any,
      staffId: validation.data.staffId,
      adminNotes: validation.data.adminNotes,
      internalNotes: validation.data.internalNotes,
      rescheduledDate: validation.data.rescheduledDate,
      rescheduledTime: validation.data.rescheduledTime,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin appointment PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    let reason = "Cancelled by administrator";
    try {
      const text = await req.text();
      if (text && text.trim().length > 0) {
        const body = JSON.parse(text);
        if (body?.reason) reason = body.reason;
      }
    } catch {}

    const updated = await dbRepo.updateAppointmentStatus(id, {
      status: "CANCELLED" as any,
      adminNotes: reason,
    });

    return NextResponse.json({ success: true, message: "Appointment cancelled", data: updated });
  } catch (error: any) {
    console.error("Admin appointment DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to cancel appointment" }, { status: 500 });
  }
}

