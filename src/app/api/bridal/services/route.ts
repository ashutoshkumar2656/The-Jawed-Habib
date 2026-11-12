import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { adminServiceSchema } from "@/lib/validation/schemas";
import { checkAdminAuth } from "@/lib/auth/rbac";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

// GET /api/bridal/services: List all bridal services
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";
    const search = searchParams.get("search") || undefined;

    const services = await dbRepo.getServices({
      bridalOnly: true,
      includeInactive,
      search,
    });

    return NextResponse.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error: any) {
    console.error("Bridal Services API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bridal services" },
      { status: 500 }
    );
  }
}

// POST /api/bridal/services: Create a new bridal service
export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();

    // Default category to Bridal (cat_6) if not explicitly set
    if (!body.categoryId) {
      body.categoryId = "cat_6";
    }
    body.isBridal = true;

    // Validate using adminServiceSchema
    const validated = adminServiceSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for bridal service",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Business validation: Advance payment must never exceed service price
    const servicePrice = validated.data.discountedPrice ?? validated.data.price;
    const minAdv = validated.data.minAdvanceAmount ?? 1000;
    const maxAdv = validated.data.maxAdvanceAmount ?? 2500;

    if (minAdv > servicePrice) {
      // If service costs less than minimum advance, clamp minAdv to price
      validated.data.minAdvanceAmount = servicePrice;
    }
    if (maxAdv < (validated.data.minAdvanceAmount ?? 1000)) {
      validated.data.maxAdvanceAmount = validated.data.minAdvanceAmount;
    }

    const newService = await dbRepo.createService({
      ...validated.data,
      isBridal: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Bridal service "${newService.name}" created successfully.`,
        data: newService,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create bridal service error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create bridal service" },
      { status: 500 }
    );
  }
}
