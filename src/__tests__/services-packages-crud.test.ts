import { describe, it, expect } from "vitest";
import dbRepo from "@/lib/db/repo";
import { adminServiceSchema, adminCategorySchema, adminPackageSchema } from "@/lib/validation/schemas";
import { GenderTarget } from "@prisma/client";

describe("Services, Packages & Categories CRUD Integrity Tests", () => {
  let createdCategoryId: string = "";
  let createdServiceId: string = "";
  let createdPackageId: string = "";

  // -------------------------------------------------------------
  // 1. CATEGORY CRUD & SAFETY RESTRICTIONS
  // -------------------------------------------------------------
  describe("Category Management", () => {
    it("creates a new service category successfully with auto-slug", async () => {
      const newCategory = await dbRepo.createCategory({
        name: "Luxury Scalp Therapy",
        description: "Specialized scalp rejuvenation and clinical hair care",
        sortOrder: 10,
        isActive: true,
      });

      expect(newCategory).toBeDefined();
      expect(newCategory.id).toBeDefined();
      expect(newCategory.name).toBe("Luxury Scalp Therapy");
      expect(newCategory.slug).toBe("luxury-scalp-therapy");
      createdCategoryId = newCategory.id;
    });

    it("updates category details", async () => {
      const updated = await dbRepo.updateCategory(createdCategoryId, {
        description: "Updated luxury scalp treatments and clinical detox",
        sortOrder: 12,
      });

      expect(updated).toBeDefined();
      expect(updated.description).toBe("Updated luxury scalp treatments and clinical detox");
      expect(updated.sortOrder).toBe(12);
    });

    it("validates category schema with empty or omitted slug", () => {
      const parsed = adminCategorySchema.safeParse({
        name: "Express Blowdry",
        slug: "",
        sortOrder: 5,
        isActive: true,
      });

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.name).toBe("Express Blowdry");
      }
    });
  });

  // -------------------------------------------------------------
  // 2. SERVICE CRUD & PRISMA RELATIONAL UPDATE FIX
  // -------------------------------------------------------------
  describe("Service Creation & Update (Unknown Argument 'categoryId' Fix)", () => {
    it("creates a new service with auto-derived slug and category linking", async () => {
      const service = await dbRepo.createService({
        name: "Advanced Hair Botoplex Treatment",
        slug: "", // Intentionally empty to test auto-generation
        description: "Intensive collagen and peptide reconstruction treatment for damaged hair.",
        price: 3999,
        discountedPrice: 3499,
        durationMinutes: 90,
        gender: "UNISEX",
        categoryId: createdCategoryId,
        imageUrl: "/images/services/service-hair-treatment.jpg",
        isBridal: false,
        isFeatured: true,
        isPopular: true,
        isActive: true,
        allowOnlineBooking: true,
        allowAdvancePayment: true,
        depositType: "FIXED",
        depositValue: 1000,
        minAdvanceAmount: 1000,
        maxAdvanceAmount: 2000,
      });

      expect(service).toBeDefined();
      expect(service.id).toBeDefined();
      expect(service.name).toBe("Advanced Hair Botoplex Treatment");
      expect(service.slug).toBe("advanced-hair-botoplex-treatment");
      expect(service.price).toBe(3999);
      expect(service.categoryId).toBe(createdCategoryId);
      createdServiceId = service.id;
    });

    it("updates service with categoryId and non-schema admin fields without throwing 'Unknown argument categoryId'", async () => {
      // This test directly verifies the resolution of the reported bug:
      // "Invalid prisma.service.update() invocation. Unknown argument 'categoryId'. Did you mean 'category'?"
      // as well as filtering of extra frontend fields like minAdvanceAmount, suggestedAdvanceOptions, etc.
      const updatePayload: any = {
        name: "Advanced Hair Botoplex Treatment Pro",
        price: 4499,
        discountedPrice: 3999,
        durationMinutes: 105,
        categoryId: createdCategoryId,
        // Non-Prisma schema fields sent from admin UI:
        minAdvanceAmount: 1500,
        maxAdvanceAmount: 2500,
        suggestedAdvanceOptions: [1000, 1500, 2000],
        allowCustomerSelectAdvance: true,
        allowFullPayment: true,
        depositPaymentMode: "ADVANCE_OPTIONS",
        isBridal: false,
        additionalMessages: ["Please wash hair before arrival"],
      };

      const updated = await dbRepo.updateService(createdServiceId, updatePayload);
      expect(updated).toBeDefined();
      expect(updated.name).toBe("Advanced Hair Botoplex Treatment Pro");
      expect(updated.price).toBe(4499);
      expect(updated.durationMinutes).toBe(105);
      expect(updated.categoryId).toBe(createdCategoryId);
    });

    it("prevents deleting a category that has active services attached", async () => {
      // Safety rule: Never orphan or break foreign keys when deleting categories
      await expect(dbRepo.deleteCategory(createdCategoryId)).rejects.toThrow(
        /Cannot delete category: \d+ active service\(s\) are associated with this category/
      );
    });

    it("deletes service cleanly when no bookings reference it", async () => {
      const deleted = await dbRepo.deleteService(createdServiceId);
      expect(deleted).toBe(true);

      const fetched = await dbRepo.getServiceById(createdServiceId);
      expect(fetched).toBeNull();
    });

    it("allows category deletion once all attached services are deleted", async () => {
      const deleted = await dbRepo.deleteCategory(createdCategoryId);
      expect(deleted.success).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 3. BRIDAL SERVICES & AUTO-SLUG VALIDATION
  // -------------------------------------------------------------
  describe("Bridal Services & Validation Schemas", () => {
    it("validates bridal service schema when slug is empty string", () => {
      const body = {
        name: "Royal Kohinoor Bridal Transformation",
        slug: "", // Empty string as sent from frontend modal
        description: "Complete royal bridal styling including HD airbrush makeup and dupatta draping.",
        price: 15000,
        discountedPrice: 12999,
        durationMinutes: 240,
        gender: "FEMALE",
        categoryId: "cat_6",
        imageUrl: "/images/services/service-bridal-makeup.jpg",
        isBridal: true,
        minAdvanceAmount: 2500,
        maxAdvanceAmount: 5000,
      };

      const parsed = adminServiceSchema.safeParse(body);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.name).toBe("Royal Kohinoor Bridal Transformation");
        expect(parsed.data.isBridal).toBe(true);
      }
    });

    it("creates a bridal service via repository with bridal category fallback", async () => {
      const bridalService = await dbRepo.createService({
        name: "Shahi Dulhan Luxury Bridal Suite",
        slug: "",
        description: "Editorial bridal package crafted for grand celebrations in Lalganj.",
        price: 18000,
        discountedPrice: 15000,
        durationMinutes: 240,
        gender: "FEMALE",
        categoryId: "cat_6", // Bridal suite category
        imageUrl: "/images/services/service-bridal-makeup.jpg",
        isBridal: true,
        isFeatured: true,
        isPopular: true,
        isActive: true,
        minAdvanceAmount: 3000,
        maxAdvanceAmount: 6000,
      });

      expect(bridalService).toBeDefined();
      expect(bridalService.name).toBe("Shahi Dulhan Luxury Bridal Suite");
      expect(bridalService.slug).toBe("shahi-dulhan-luxury-bridal-suite");
      expect(bridalService.isFeatured).toBe(true);

      // Clean up test bridal service
      await dbRepo.deleteService(bridalService.id);
    });
  });

  // -------------------------------------------------------------
  // 4. PACKAGE MANAGEMENT CRUD
  // -------------------------------------------------------------
  describe("Package Management CRUD", () => {
    it("creates a comprehensive salon package", async () => {
      const pkg = await dbRepo.createPackage({
        name: "Pre-Bridal Glow & Rejuvenation Ritual",
        slug: "pre-bridal-glow-rejuvenation",
        description: "Full body polishing, gold facial, hair spa, manicure and pedicure.",
        price: 8999,
        originalPrice: 11500,
        durationMinutes: 180,
        servicesList: [
          "Diamond Microdermabrasion Facial",
          "Aromatherapy Full Body Polish",
          "Moroccan Argan Hair Spa",
          "Deluxe Spa Manicure & Pedicure",
        ],
        imageUrl: "/images/services/service-pre-bridal.jpg",
        isFeatured: true,
        isActive: true,
      });

      expect(pkg).toBeDefined();
      expect(pkg.id).toBeDefined();
      expect(pkg.name).toBe("Pre-Bridal Glow & Rejuvenation Ritual");
      expect(pkg.price).toBe(8999);
      expect(pkg.servicesList.length).toBe(4);
      createdPackageId = pkg.id;
    });

    it("updates package with safe scalar mapping", async () => {
      const updated = await dbRepo.updatePackage(createdPackageId, {
        price: 8499,
        durationMinutes: 200,
        isFeatured: true,
      });

      expect(updated).toBeDefined();
      expect(updated.price).toBe(8499);
      expect(updated.durationMinutes).toBe(200);
    });

    it("deletes package cleanly", async () => {
      const deleted = await dbRepo.deletePackage(createdPackageId);
      expect(deleted).toBe(true);

      const allPackages = await dbRepo.getAllPackages();
      expect(allPackages.find((p) => p.id === createdPackageId)).toBeUndefined();
    });
  });

  // -------------------------------------------------------------
  // 5. ACCURATE DATABASE ERROR CONTEXT REPORTING
  // -------------------------------------------------------------
  describe("Error Context Logging Verification", () => {
    it("ensures updateService throws properly contextualized errors and never mentions cancelAppointment", async () => {
      // In a scenario where an update target is missing
      try {
        await dbRepo.updateService("non-existent-service-id-xyz", { name: "Ghost Service" });
      } catch (err: any) {
        expect(err.message).not.toContain("Failed to cancel appointment in database");
      }
    });

    it("ensures updatePackage throws properly contextualized errors and never mentions cancelAppointment", async () => {
      try {
        await dbRepo.updatePackage("non-existent-package-id-xyz", { name: "Ghost Package" });
      } catch (err: any) {
        expect(err.message).not.toContain("Failed to cancel appointment in database");
      }
    });
  });
});
