import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";

export const dynamic = "force-dynamic";

const blockedSlotCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM"),
  reason: z.string().max(255).optional().nullable(),
  staffId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const month = searchParams.get("month") || undefined;
    const staffId = searchParams.get("staffId") || undefined;

    const blockedSlots = await dbRepo.getBlockedSlots({ date, month, staffId });
    return NextResponse.json({ success: true, data: blockedSlots });
  } catch (error: any) {
    console.error("Admin blocked-slots GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch blocked slots" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = blockedSlotCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const created = await dbRepo.createBlockedSlot(validation.data);
    await dbRepo.logAudit({
      action: "BLOCK_SLOT_CREATE",
      entity: "BlockedSlot",
      entityId: created.id,
      details: `Blocked slot on ${created.date} from ${created.startTime} to ${created.endTime} (${created.reason || "No reason specified"})`,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Admin blocked-slots POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create blocked slot" }, { status: 500 });
  }
}
