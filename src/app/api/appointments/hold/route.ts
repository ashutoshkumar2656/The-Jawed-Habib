import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";
import { normalizeTimeTo24h } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const holdRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z
    .string()
    .transform(normalizeTimeTo24h)
    .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "Start time must be HH:MM or hh:mm AM/PM",
    }),
  endTime: z
    .string()
    .transform(normalizeTimeTo24h)
    .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
      message: "End time must be HH:MM or hh:mm AM/PM",
    }),
  serviceIds: z.array(z.string()).min(1),
  customerPhone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = holdRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.format() },
        { status: 400 }
      );
    }

    const hold = await dbRepo.holdTimeSlot(validation.data);
    return NextResponse.json({ success: true, data: hold });
  } catch (error: any) {
    console.error("Hold slot error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to hold time slot" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const holdToken = searchParams.get("token");
    if (holdToken) {
      dbRepo.releaseTimeSlot(holdToken);
    }
    return NextResponse.json({ success: true, message: "Slot released" });
  } catch (error: any) {
    console.error("Release hold error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to release hold" },
      { status: 500 }
    );
  }
}
