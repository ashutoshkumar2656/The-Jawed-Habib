import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { calendarSettingsSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const settings = await dbRepo.getCalendarSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error("Admin calendar-settings GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch calendar settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = calendarSettingsSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.format() },
        { status: 400 }
      );
    }

    const updated = await dbRepo.updateCalendarSettings(validation.data);
    await dbRepo.logAudit({
      action: "CALENDAR_SETTINGS_UPDATE",
      entity: "CalendarSettings",
      entityId: "calendar_settings_default",
      details: JSON.stringify(validation.data),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin calendar-settings PUT error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update calendar settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    if (body.action === "reset") {
      const resetSettings = await dbRepo.resetCalendarSettings();
      await dbRepo.logAudit({
        action: "CALENDAR_SETTINGS_RESET",
        entity: "CalendarSettings",
        entityId: "calendar_settings_default",
        details: "Reset to default Jawed Habib Lalganj operational hours",
      });
      return NextResponse.json({ success: true, data: resetSettings });
    }

    const validation = calendarSettingsSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.format() },
        { status: 400 }
      );
    }

    const updated = await dbRepo.updateCalendarSettings(validation.data);
    await dbRepo.logAudit({
      action: "CALENDAR_SETTINGS_UPDATE",
      entity: "CalendarSettings",
      entityId: "calendar_settings_default",
      details: JSON.stringify(validation.data),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin calendar-settings POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to perform calendar action" },
      { status: 500 }
    );
  }
}
