import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { adminEnquiryUpdateSchema } from "@/lib/validation/schemas";

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
    const validation = adminEnquiryUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const updated = await dbRepo.updateEnquiry(id, validation.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Admin enquiry PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update enquiry" }, { status: 500 });
  }
}
