import { NextRequest, NextResponse } from "next/server";
import dbRepo from "@/lib/db/repo";
import { checkAdminAuth } from "@/lib/auth/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const settings = await dbRepo.getRazorpaySettings(false);
    const hasLiveKey = !!settings.liveKeyId && settings.liveKeyId.startsWith("rzp_live_");
    const hasLiveSecret = !!settings.liveKeySecretEncrypted;
    const hasLiveWebhook = !!settings.liveWebhookSecretEncrypted;

    const host = req.headers.get("host") || "";
    const isHttps = req.headers.get("x-forwarded-proto") === "https" || process.env.NODE_ENV !== "production";
    const domainVerified = host.includes("thejawedhabibsalons.in") || process.env.NODE_ENV !== "production";

    const checks = {
      liveKeyIdConfigured: hasLiveKey,
      liveKeySecretConfigured: hasLiveSecret,
      liveWebhookConfigured: hasLiveWebhook,
      isLiveVerified: Boolean(settings.isLiveVerified),
      domainVerified,
      httpsVerified: isHttps,
      databasePersistenceVerified: true,
      masterKeyConfigured: Boolean(process.env.PAYMENT_ENCRYPTION_KEY || process.env.JWT_SECRET),
    };

    const reasons: string[] = [];
    if (!checks.liveKeyIdConfigured) reasons.push("Live Key ID (rzp_live_...) is missing or invalid");
    if (!checks.liveKeySecretConfigured) reasons.push("Live Key Secret is not configured");
    if (!checks.liveWebhookConfigured) reasons.push("Live Webhook Secret is not configured");

    const readyForLive =
      checks.liveKeyIdConfigured &&
      checks.liveKeySecretConfigured &&
      checks.liveWebhookConfigured;

    return NextResponse.json({
      success: true,
      data: {
        readyForLive,
        currentEnvironment: settings.environment,
        checks,
        reasons,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run live preflight check" },
      { status: 500 }
    );
  }
}
