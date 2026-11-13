import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/health/database/route";

describe("Database Health Endpoint (/api/health/database)", () => {
  it("exports nodejs runtime and force-dynamic directives", async () => {
    const routeModule = await import("@/app/api/health/database/route");
    expect(routeModule.runtime).toBe("nodejs");
    expect(routeModule.dynamic).toBe("force-dynamic");
  });

  it("handles database query safely and returns structured response", async () => {
    const res = await GET();
    expect(res).toBeDefined();
    expect(res.status).toBeDefined();

    const json = await res.json();
    expect(json.provider).toBe("postgresql");
    expect(json.timestamp).toBeDefined();
    expect(json).toHaveProperty("database");
    expect(json).toHaveProperty("latencyMs");

    // Must never leak connection strings or passwords
    const jsonStr = JSON.stringify(json);
    expect(jsonStr).not.toContain("password");
    expect(jsonStr).not.toContain("postgres://");
    expect(jsonStr).not.toContain("postgresql://");
    expect(jsonStr).not.toContain("neon.tech");
  });
});
