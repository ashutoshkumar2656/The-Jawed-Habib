import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import dbRepo from "@/lib/db/repo";
import { adminUserCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const users = await dbRepo.getAdminUsers();
    const sanitized = users.map((u) => {
      const copy: any = { ...u };
      delete copy.passwordHash;
      return copy;
    });

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const validation = adminUserCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
    }

    const created = await dbRepo.createAdminUser(validation.data);
    const sanitized: any = { ...created };
    delete sanitized.passwordHash;

    return NextResponse.json({ success: true, data: sanitized }, { status: 201 });
  } catch (error: any) {
    console.error("Admin user POST error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create user" }, { status: 500 });
  }
}
