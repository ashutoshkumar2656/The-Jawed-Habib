import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { z } from "zod";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const customerNotesSchema = z.object({
  notes: z.string().max(1000),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const details = await dbRepo.getCustomerProfileDetails(id);
    return NextResponse.json({ success: true, data: details });
  } catch (error: any) {
    console.error("Admin customer GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customer profile" },
      { status: error.message?.includes("not found") ? 404 : 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await req.json();
    const validation = customerNotesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const updated = await dbRepo.updateCustomerNotes(id, validation.data.notes);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin customer PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update customer" }, { status: 500 });
  }
}
