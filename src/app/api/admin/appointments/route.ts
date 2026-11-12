import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { appointmentBookingSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const date = searchParams.get("date") || undefined;
    const search = searchParams.get("search") || undefined;
    const serviceId = searchParams.get("serviceId") || undefined;
    const staffId = searchParams.get("staffId") || undefined;

    const appointments = await dbRepo.getAllAppointments({
      status,
      date,
      search,
      serviceId,
      staffId,
    });

    return NextResponse.json({ success: true, data: appointments });
  } catch (error: any) {
    console.error("Admin appointments GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = appointmentBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const booking = await dbRepo.createAppointment({
      ...validation.data,
      source: "WALK_IN" as any,
    });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error: any) {
    console.error("Admin create appointment error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create appointment" }, { status: 500 });
  }
}
