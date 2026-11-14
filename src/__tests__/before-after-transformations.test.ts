import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { adminTransformationSchema } from "@/lib/validation/schemas";
import { NextRequest } from "next/server";
import { GET as getPublicTransformations } from "@/app/api/transformations/route";
import { POST as createAdminTransformation, GET as getAdminTransformations } from "@/app/api/admin/transformations/route";
import { PATCH as updateAdminTransformation, DELETE as deleteAdminTransformation } from "@/app/api/admin/transformations/[id]/route";

describe("Before & After Transformation Management System", () => {
  const validBeforeUrl = "https://res.cloudinary.com/qhoxax43/image/upload/v1794641749/jawed_habib_lalganj/transformations/before-haircut.png";
  const validAfterUrl = "https://res.cloudinary.com/qhoxax43/image/upload/v1794641749/jawed_habib_lalganj/transformations/after-haircut.png";

  describe("Validation & Schema Enforcement", () => {
    it("accepts valid HTTPS image URLs for both before and after images", () => {
      const validPayload = {
        title: "Copper Balayage & Keratin Smoothing",
        description: "Intense frizz control and dimensional warm balayage.",
        beforeImageUrl: validBeforeUrl,
        afterImageUrl: validAfterUrl,
        serviceId: null,
        staffId: null,
        clientGender: "FEMALE",
        isFeatured: true,
        sortOrder: 1,
      };

      const result = adminTransformationSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("accepts local asset paths starting with /", () => {
      const localPayload = {
        title: "Executive Low Taper Fade",
        description: "Beard sculpting and scissor work.",
        beforeImageUrl: "/images/transformations/trans-1-before.jpg",
        afterImageUrl: "/images/transformations/trans-1-after.jpg",
        clientGender: "MALE",
        isFeatured: true,
        sortOrder: 2,
      };

      const result = adminTransformationSchema.safeParse(localPayload);
      expect(result.success).toBe(true);
    });

    it("rejects insecure protocols or invalid image URLs", () => {
      const invalidPayload = {
        title: "Exploit Test",
        beforeImageUrl: "javascript:alert('xss')",
        afterImageUrl: validAfterUrl,
      };

      const result = adminTransformationSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("rejects empty before or after image URLs", () => {
      const emptyBefore = {
        title: "Missing Before",
        beforeImageUrl: "",
        afterImageUrl: validAfterUrl,
      };
      expect(adminTransformationSchema.safeParse(emptyBefore).success).toBe(false);

      const emptyAfter = {
        title: "Missing After",
        beforeImageUrl: validBeforeUrl,
        afterImageUrl: "",
      };
      expect(adminTransformationSchema.safeParse(emptyAfter).success).toBe(false);
    });
  });

  describe("Database Persistence & Lifecycle", () => {
    it("creates and persists a transformation with manually entered URLs", async () => {
      const created = await dbRepo.createTransformation({
        title: "Royal HD Bridal Artistry",
        description: "24K Gold skin priming and Charlotte Tilbury HD finish.",
        beforeImageUrl: "https://res.cloudinary.com/qhoxax43/image/upload/v1/bridal-before.jpg",
        afterImageUrl: "https://res.cloudinary.com/qhoxax43/image/upload/v1/bridal-after.jpg",
        serviceId: null,
        staffId: null,
        clientGender: "FEMALE",
        isFeatured: true,
        sortOrder: 1,
      });

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.beforeImageUrl).toBe("https://res.cloudinary.com/qhoxax43/image/upload/v1/bridal-before.jpg");
      expect(created.afterImageUrl).toBe("https://res.cloudinary.com/qhoxax43/image/upload/v1/bridal-after.jpg");
    });

    it("creates a transformation using Cloudinary uploaded image URLs", async () => {
      const created = await dbRepo.createTransformation({
        title: "Keratin Protein Silk Smoothing",
        description: "Zero frizz smoothing therapy.",
        beforeImageUrl: validBeforeUrl,
        afterImageUrl: validAfterUrl,
        serviceId: null,
        staffId: null,
        clientGender: "UNISEX",
        isFeatured: true,
        sortOrder: 2,
      });

      expect(created.beforeImageUrl).toContain("cloudinary.com");
      expect(created.afterImageUrl).toContain("cloudinary.com");
    });

    it("updates only the Before Image URL while preserving After Image URL", async () => {
      const tf = await dbRepo.createTransformation({
        title: "Balayage Transformation",
        beforeImageUrl: "https://example.com/initial-before.jpg",
        afterImageUrl: "https://example.com/original-after.jpg",
        clientGender: "FEMALE",
        isFeatured: true,
        sortOrder: 3,
      });

      const updated = await dbRepo.updateTransformation(tf.id, {
        beforeImageUrl: "https://res.cloudinary.com/qhoxax43/image/upload/v2/new-before.jpg",
      });

      expect(updated.beforeImageUrl).toBe("https://res.cloudinary.com/qhoxax43/image/upload/v2/new-before.jpg");
      expect(updated.afterImageUrl).toBe("https://example.com/original-after.jpg");
    });

    it("updates only the After Image URL while preserving Before Image URL", async () => {
      const tf = await dbRepo.createTransformation({
        title: "Fade & Beard Makeover",
        beforeImageUrl: "https://example.com/fade-before.jpg",
        afterImageUrl: "https://example.com/initial-after.jpg",
        clientGender: "MALE",
        isFeatured: true,
        sortOrder: 4,
      });

      const updated = await dbRepo.updateTransformation(tf.id, {
        afterImageUrl: "https://res.cloudinary.com/qhoxax43/image/upload/v2/new-after.jpg",
      });

      expect(updated.beforeImageUrl).toBe("https://example.com/fade-before.jpg");
      expect(updated.afterImageUrl).toBe("https://res.cloudinary.com/qhoxax43/image/upload/v2/new-after.jpg");
    });

    it("deletes a transformation safely", async () => {
      const tf = await dbRepo.createTransformation({
        title: "Temporary Makeover to Delete",
        beforeImageUrl: validBeforeUrl,
        afterImageUrl: validAfterUrl,
        clientGender: "UNISEX",
        isFeatured: false,
        sortOrder: 99,
      });

      const deleted = await dbRepo.deleteTransformation(tf.id);
      expect(deleted).toBe(true);

      const all = await dbRepo.getTransformations();
      const exists = all.some((item) => item.id === tf.id);
      expect(exists).toBe(false);
    });
  });

  describe("Public vs Admin Access & Visibility", () => {
    it("public API returns published transformations and excludes unfeatured/hidden ones", async () => {
      // Create one published, one unpublished
      const publishedTf = await dbRepo.createTransformation({
        title: "Published Showcase",
        beforeImageUrl: validBeforeUrl,
        afterImageUrl: validAfterUrl,
        clientGender: "UNISEX",
        isFeatured: true,
        sortOrder: 1,
      });

      const hiddenTf = await dbRepo.createTransformation({
        title: "Hidden Draft Showcase",
        beforeImageUrl: validBeforeUrl,
        afterImageUrl: validAfterUrl,
        clientGender: "UNISEX",
        isFeatured: false,
        sortOrder: 2,
      });

      const req = new NextRequest("http://localhost:3000/api/transformations");
      const res = await getPublicTransformations(req);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);

      // Verify the published item is included and hidden is excluded
      const hasPublished = json.data.some((item: any) => item.id === publishedTf.id);
      const hasHidden = json.data.some((item: any) => item.id === hiddenTf.id);

      expect(hasPublished).toBe(true);
      expect(hasHidden).toBe(false);
    });

    it("rejects unauthorized access to admin transformation management endpoints", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/transformations", {
        method: "POST",
        body: JSON.stringify({
          title: "Unauthorized Post",
          beforeImageUrl: validBeforeUrl,
          afterImageUrl: validAfterUrl,
        }),
      });

      const res = await createAdminTransformation(req);
      expect(res.status).toBe(401);
    });
  });
});

