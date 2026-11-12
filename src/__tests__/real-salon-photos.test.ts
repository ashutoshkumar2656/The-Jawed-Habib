import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import repo from "@/lib/db/repo";
import { BRAND_CONFIG } from "@/lib/constants/brand";

describe("Real Salon Photography Suite - Lalganj", () => {
  const publicDir = path.join(process.cwd(), "public");
  const manifestPath = path.join(publicDir, "images", "salon", "manifest.json");

  it("verifies manifest.json exists and catalogs all 35 authentic photos", () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content);
    expect(Array.isArray(manifest)).toBe(true);
    expect(manifest.length).toBe(35);

    // Verify key fields
    manifest.forEach((item: any) => {
      expect(item.id).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.webp_path).toBeDefined();
      expect(item.category).toBeDefined();
    });
  });

  it("verifies all primary real photo files exist in WebP format", () => {
    const essentialImages = [
      "images/salon/interior/jh-lalganj-salon-interior-main.webp",
      "images/salon/interior/jh-lalganj-triple-styling-stations.webp",
      "images/salon/interior/jh-lalganj-reception-desk.webp",
      "images/salon/interior/jh-lalganj-bridal-makeup-room.webp",
      "images/salon/interior/jh-lalganj-pedicure-spa-throne.webp",
      "images/salon/services/jh-lalganj-jawed-habib-mastercut.webp",
      "images/salon/services/jh-lalganj-styling-scissors.webp",
      "images/salon/services/jh-lalganj-hydrafacial-machine.webp",
      "images/salon/opening/jh-lalganj-jawed-habib-team.webp",
      "images/salon/opening/jh-lalganj-banner-felicitation.webp",
    ];

    essentialImages.forEach((relPath) => {
      const fullPath = path.join(publicDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).size).toBeGreaterThan(1000);
    });
  });

  it("verifies BRAND_CONFIG has real salon photo references", () => {
    expect(BRAND_CONFIG.assets.salonInteriorMain).toBe(
      "/images/salon/interior/jh-lalganj-salon-interior-main.webp"
    );
    expect(BRAND_CONFIG.assets.salonReceptionDesk).toBe(
      "/images/salon/interior/jh-lalganj-reception-desk.webp"
    );
    expect(BRAND_CONFIG.assets.salonTripleStations).toBe(
      "/images/salon/interior/jh-lalganj-triple-styling-stations.webp"
    );
  });

  it("verifies repository returns authentic Lalganj gallery items", async () => {
    const images = await repo.getGalleryImages();
    expect(images.length).toBeGreaterThanOrEqual(14);

    const interiorMain = images.find((img) =>
      img.imageUrl.includes("jh-lalganj-salon-interior-main")
    );
    expect(interiorMain).toBeDefined();

    const mastercut = images.find((img) =>
      img.imageUrl.includes("jh-lalganj-jawed-habib-mastercut")
    );
    expect(mastercut).toBeDefined();
  });
});
