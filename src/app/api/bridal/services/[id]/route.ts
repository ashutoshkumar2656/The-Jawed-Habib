import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { adminServiceSchema } from "@/lib/validation/schemas";
import { checkAdminAuth } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

// GET /api/bridal/services/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await dbRepo.getServiceById(params.id);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Bridal service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch service" },
      { status: 500 }
    );
  }
}

// PUT /api/bridal/services/[id]: Update or publish/unpublish bridal service
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();

    // Partial update validation
    const validated = adminServiceSchema.partial().safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for updating bridal service",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await dbRepo.updateService(params.id, {
      ...validated.data,
      isBridal: true,
    });

    return NextResponse.json({
      success: true,
      message: `Bridal service "${updated.name}" updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update bridal service" },
      { status: 500 }
    );
  }
}

// DELETE /api/bridal/services/[id]: Delete bridal service
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await dbRepo.deleteService(params.id);

    return NextResponse.json({
      success: true,
      message: "Bridal service deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete bridal service" },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

