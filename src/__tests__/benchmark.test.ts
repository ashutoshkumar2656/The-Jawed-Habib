import { describe, it, expect } from "vitest";
import { performance } from "perf_hooks";
import dbRepo from "@/lib/db/repo";
import { AppointmentStatus } from "@prisma/client";

describe("Phase 8: Production Performance & Benchmark Suite", () => {
  it("measures customer search query latency (Median & P95)", async () => {
    const latencies: number[] = [];
    const queries = ["Ananya", "98", "Sharma", "Roy", "NonExistent"];
    for (let i = 0; i < 30; i++) {
      const q = queries[i % queries.length];
      const t0 = performance.now();
      const res = await dbRepo.getAllCustomers(q);
      const t1 = performance.now();
      expect(Array.isArray(res)).toBe(true);
      latencies.push(t1 - t0);
    }
    latencies.sort((a, b) => a - b);
    const median = latencies[Math.floor(latencies.length / 2)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];

    console.log(`[PERF_BENCHMARK] Customer Search: Median=${median.toFixed(2)}ms, P95=${p95.toFixed(2)}ms, Min=${latencies[0].toFixed(2)}ms`);
    expect(median).toBeLessThan(50); // Fast sub-50ms search
  });

  it("measures admin analytics aggregation performance", async () => {
    const latencies: number[] = [];
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      const analytics = await dbRepo.getAdminAnalytics();
      const t1 = performance.now();
      expect(analytics).toBeDefined();
      expect(typeof analytics.totalRevenue).toBe("number");
      latencies.push(t1 - t0);
    }
    latencies.sort((a, b) => a - b);
    const median = latencies[Math.floor(latencies.length / 2)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];

    console.log(`[PERF_BENCHMARK] Admin Analytics: Median=${median.toFixed(2)}ms, P95=${p95.toFixed(2)}ms`);
    expect(median).toBeLessThan(100);
  });

  it("measures appointment lifecycle transition timings", async () => {
    const services = await dbRepo.getServices();
    const serviceIds = services.slice(0, 2).map((s) => s.id);
    const apt = await dbRepo.createAppointment({
      customerName: "Perf Client",
      customerPhone: "9988776655",
      serviceIds,
      appointmentDate: "2026-11-28",
      startTime: "12:00",
    });

    const tCheckIn0 = performance.now();
    await dbRepo.updateAppointmentStatus(apt.id, { status: AppointmentStatus.CHECKED_IN });
    const tCheckIn = performance.now() - tCheckIn0;

    const tInProgress0 = performance.now();
    await dbRepo.updateAppointmentStatus(apt.id, { status: AppointmentStatus.IN_PROGRESS });
    const tInProgress = performance.now() - tInProgress0;

    const tComplete0 = performance.now();
    await dbRepo.updateAppointmentStatus(apt.id, { status: AppointmentStatus.COMPLETED });
    const tComplete = performance.now() - tComplete0;

    console.log(`[PERF_BENCHMARK] Status Transitions: CHECKED_IN=${tCheckIn.toFixed(2)}ms, IN_PROGRESS=${tInProgress.toFixed(2)}ms, COMPLETED=${tComplete.toFixed(2)}ms`);
    expect(tCheckIn).toBeLessThan(50);
    expect(tInProgress).toBeLessThan(50);
    expect(tComplete).toBeLessThan(50);
  });

  it("measures payload sizes for CRM customer list and admin analytics", async () => {
    const customers = await dbRepo.getAllCustomers();
    const customerPayloadSize = Buffer.byteLength(JSON.stringify(customers), "utf8");
    const analytics = await dbRepo.getAdminAnalytics();
    const analyticsPayloadSize = Buffer.byteLength(JSON.stringify(analytics), "utf8");

    console.log(`[PERF_BENCHMARK] Payload Sizes: Customers=${(customerPayloadSize / 1024).toFixed(2)} KB, Analytics=${(analyticsPayloadSize / 1024).toFixed(2)} KB`);
    expect(customerPayloadSize).toBeGreaterThan(0);
    expect(analyticsPayloadSize).toBeGreaterThan(0);
  });
});

