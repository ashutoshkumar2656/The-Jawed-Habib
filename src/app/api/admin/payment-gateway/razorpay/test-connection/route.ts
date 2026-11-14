import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { testRazorpayConnection } from "@/lib/payments/razorpay";
import { checkAdminAuth } from "@/lib/auth/rbac";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const env = body.environment === "LIVE" ? "LIVE" : "TEST";

    const creds = await dbRepo.getRazorpayCredentials(env);
    const testKeyId = body.keyId || creds.keyId;
    const testKeySecret = (body.keySecret && !body.keySecret.includes("••••")) ? body.keySecret : creds.keySecret;

    if (!testKeyId || !testKeySecret) {
      return NextResponse.json(
        {
          success: false,
          error: `${env} mode credentials are not configured. Please enter Key ID and Secret first.`,
        },
        { status: 400 }
      );
    }

    const testResult = await testRazorpayConnection(testKeyId, testKeySecret);
    const now = new Date();

    if (testResult.success) {
      await dbRepo.updateRazorpaySettings({
        ...(env === "LIVE" ? { isLiveVerified: true } : { isTestVerified: true }),
        lastConnectionTestAt: now,
        lastConnectionStatus: "SUCCESS",
        lastConnectionError: null,
      });

      return NextResponse.json({
        success: true,
        message: testResult.message,
        environment: env,
        testedAt: now.toISOString(),
      });
    } else {
      await dbRepo.updateRazorpaySettings({
        ...(env === "LIVE" ? { isLiveVerified: false } : { isTestVerified: false }),
        lastConnectionTestAt: now,
        lastConnectionStatus: "FAILED",
        lastConnectionError: testResult.message,
      });

      return NextResponse.json(
        {
          success: false,
          error: testResult.message,
          code: testResult.code,
          environment: env,
          testedAt: now.toISOString(),
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to test Razorpay connection" },
      { status: 500 }
    );
  }
}
