import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/lib/constants/brand";
import { getSanitizedEnvReport, validateEnv } from "@/lib/env";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET() {
  const envCheck = validateEnv();
  const envReport = getSanitizedEnvReport();

  return NextResponse.json({
    status: envCheck.valid ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    environment: envReport.environment,
    configuration: {
      valid: envCheck.valid,
      databaseConfigured: envReport.hasDatabaseUrl,
      jwtConfigured: envReport.hasJwtSecret,
      razorpayConfigured: envReport.hasRazorpayCredentials,
      storageConfigured: envReport.hasCloudinaryCredentials,
    },
    salon: {
      name: BRAND_CONFIG.fullName,
      location: BRAND_CONFIG.location.city,
      district: BRAND_CONFIG.location.district,
      state: BRAND_CONFIG.location.state,
      address: BRAND_CONFIG.location.fullAddress,
      contacts: BRAND_CONFIG.contact.phones,
      hours: BRAND_CONFIG.hours.display,
    },
    version: "2.0.0",
  });
}
