import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { adminPackageSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const packages = await dbRepo.getAllPackages();
    return NextResponse.json({ success: true, data: packages });
  } catch (error: any) {
    console.error("Admin packages GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = adminPackageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const created = await dbRepo.createPackage(validation.data);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Admin package POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create package" }, { status: 500 });
  }
}
