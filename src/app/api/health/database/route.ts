import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safe Database Health-Check Endpoint
 * /api/health/database
 *
 * Verifies live PostgreSQL connectivity by executing a lightweight SELECT 1 query.
 * Never leaks connection strings, credentials, or internal server paths.
 */
export async function GET() {
  const startTime = performance.now();

  try {
    // 3-second timeout protection for health checks
    const queryPromise = prisma.$queryRaw`SELECT 1 as connected`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database health-check timeout (3000ms)")), 3000)
    );

    await Promise.race([queryPromise, timeoutPromise]);
    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      provider: "postgresql",
      latencyMs: durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const isTimeout = error instanceof Error && error.message.includes("timeout");

    // Generic sanitized message - never disclose connection string or credentials
    const sanitizedMessage = isTimeout
      ? "Database connectivity timed out"
      : "Database connection unavailable or degraded";

    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        provider: "postgresql",
        error: sanitizedMessage,
        latencyMs: durationMs,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
