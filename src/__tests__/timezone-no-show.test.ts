import { describe, it, expect } from "vitest";
import {
  getKolkataDateString,
  getKolkataTimeString,
  parseKolkataDateTime,
  checkNoShowEligibility,
} from "@/lib/utils/timezone";

describe("Asia/Kolkata Timezone & No-Show Eligibility", () => {
  it("formats date and time accurately in Asia/Kolkata", () => {
    // 2026-11-14 20:30 UTC = 2026-11-15 02:00 IST
    const utcDate = new Date("2026-11-14T20:30:00.000Z");
    expect(getKolkataDateString(utcDate)).toBe("2026-11-15");
    expect(getKolkataTimeString(utcDate)).toBe("02:00");
  });

  it("parses Kolkata date and time into exact timestamp", () => {
    const d = parseKolkataDateTime("2026-11-14", "14:00");
    expect(getKolkataDateString(d)).toBe("2026-11-14");
    expect(getKolkataTimeString(d)).toBe("14:00");
  });

  it("blocks NO_SHOW for future dates", () => {
    const res = checkNoShowEligibility("2026-12-30", "14:00");
    expect(res.isEligible).toBe(false);
    expect(res.reason).toContain("Cannot mark a future appointment");
  });

  it("allows NO_SHOW for past dates", () => {
    const res = checkNoShowEligibility("2026-10-01", "10:00");
    expect(res.isEligible).toBe(true);
  });

  it("blocks NO_SHOW for today's appointment if start time + grace period has not elapsed", () => {
    const today = getKolkataDateString();
    // 23:59 tonight has definitely not elapsed
    const res = checkNoShowEligibility(today, "23:59", 30);
    expect(res.isEligible).toBe(false);
    expect(res.reason).toContain("grace period");
  });

  it("allows NO_SHOW for today's appointment if start time + grace period has elapsed", () => {
    const today = getKolkataDateString();
    // 00:01 this morning has definitely elapsed
    const res = checkNoShowEligibility(today, "00:01", 30);
    expect(res.isEligible).toBe(true);
  });
});
