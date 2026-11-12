import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { GenderTarget } from "@prisma/client";

describe("Dynamic CMS & Database-Driven Architecture", () => {
  describe("1. Service Category Dynamic CMS", () => {
    it("allows admin to create a category and immediately retrieves it", async () => {
      const created = await dbRepo.createCategory({
        name: "Laser Aesthetics",
        slug: "laser-aesthetics",
        description: "Advanced non-invasive laser treatments for skin and hair.",
        imageUrl: "/images/salon/services/jh-lalganj-hydrafacial-machine.webp",
        iconName: "Sparkles",
        sortOrder: 10,
        isActive: true,
      });

      expect(created).toBeDefined();
      expect(created.id).toBeTruthy();
      expect(created.name).toBe("Laser Aesthetics");

      // Public getCategories should return it
      const publicCats = await dbRepo.getCategories();
      const found = publicCats.find((c) => c.id === created.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe("Laser Aesthetics");
    });

    it("excludes unpublished categories from public queries while retaining them for admin", async () => {
      const draftCat = await dbRepo.createCategory({
        name: "Exclusive VIP Spa Lounge",
        slug: "vip-spa-lounge",
        description: "Draft category pending launch.",
        imageUrl: null,
        iconName: "Crown",
        sortOrder: 99,
        isActive: false, // Unpublished draft
      });

      // Public call (includeInactive = false)
      const publicCats = await dbRepo.getCategories(false);
      expect(publicCats.some((c) => c.id === draftCat.id)).toBe(false);

      // Admin call (includeInactive = true)
      const adminCats = await dbRepo.getCategories(true);
      expect(adminCats.some((c) => c.id === draftCat.id)).toBe(true);
    });

    it("allows admin to toggle category active status dynamically", async () => {
      const cat = await dbRepo.createCategory({
        name: "Seasonal Winter Hair Care",
        slug: "winter-hair-care",
        description: "Winter hydration treatments.",
        sortOrder: 15,
        isActive: true,
      });

      // Initially active
      let publicCats = await dbRepo.getCategories(false);
      expect(publicCats.some((c) => c.id === cat.id)).toBe(true);

      // Admin deactivates
      await dbRepo.updateCategory(cat.id, { isActive: false });

      // Now hidden from public
      publicCats = await dbRepo.getCategories(false);
      expect(publicCats.some((c) => c.id === cat.id)).toBe(false);

      // But still present for admin
      const adminCats = await dbRepo.getCategories(true);
      expect(adminCats.some((c) => c.id === cat.id)).toBe(true);
    });
  });

  describe("2. Services Dynamic CMS", () => {
    it("allows admin to create a new service and reflects it in public catalogue", async () => {
      const cat = await dbRepo.createCategory({
        name: "Beard Architecture",
        slug: "beard-architecture",
        sortOrder: 5,
        isActive: true,
      });

      const newService = await dbRepo.createService({
        name: "Royal Ozone Beard Spa",
        slug: "royal-ozone-beard-spa",
        description: "Ozone steam softening, tea tree scrub, razor contouring and argan oil finish.",
        detailedDescription: "Full 45-minute treatment including facial lymphatic drainage and hot herbal compress.",
        price: 349,
        discountedPrice: 299,
        isStartingPrice: false,
        durationMinutes: 45,
        gender: GenderTarget.MALE,
        categoryId: cat.id,
        imageUrl: "/images/salon/services/jh-lalganj-styling-scissors.webp",
        isPopular: true,
        isFeatured: true,
        isActive: true,
      });

      expect(newService.id).toBeTruthy();

      // Retrieve via public getServices
      const publicServices = await dbRepo.getServices({ categoryId: cat.id });
      expect(publicServices.length).toBeGreaterThan(0);
      const found = publicServices.find((s) => s.id === newService.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe("Royal Ozone Beard Spa");
      expect(found?.price).toBe(349);
      expect(found?.discountedPrice).toBe(299);
    });

    it("respects publish/unpublish status for services without code changes", async () => {
      const cat = await dbRepo.createCategory({
        name: "Testing Cat",
        slug: "testing-cat",
        isActive: true,
      });

      const service = await dbRepo.createService({
        name: "Experimental Treatment",
        slug: "experimental-treatment",
        price: 999,
        durationMinutes: 60,
        gender: GenderTarget.UNISEX,
        categoryId: cat.id,
        isPopular: false,
        isFeatured: false,
        isActive: false, // DRAFT
      });

      // Public call does not return it
      const publicList = await dbRepo.getServices({ categoryId: cat.id, includeInactive: false });
      expect(publicList.some((s) => s.id === service.id)).toBe(false);

      // Admin call returns it
      const adminList = await dbRepo.getServices({ categoryId: cat.id, includeInactive: true });
      expect(adminList.some((s) => s.id === service.id)).toBe(true);

      // Admin publishes service
      await dbRepo.updateService(service.id, { isActive: true });

      // Now visible to public
      const updatedPublicList = await dbRepo.getServices({ categoryId: cat.id, includeInactive: false });
      expect(updatedPublicList.some((s) => s.id === service.id)).toBe(true);
    });

    it("allows updating service price and duration immediately", async () => {
      const cat = (await dbRepo.getCategories(true))[0];
      const service = await dbRepo.createService({
        name: "Dynamic Price Service",
        slug: "dynamic-price-service",
        price: 500,
        durationMinutes: 30,
        gender: GenderTarget.UNISEX,
        categoryId: cat.id,
        isPopular: false,
        isFeatured: false,
        isActive: true,
      });

      // Admin changes price
      await dbRepo.updateService(service.id, {
        price: 599,
        durationMinutes: 40,
      });

      const retrieved = await dbRepo.getServiceById(service.id);
      expect(retrieved?.price).toBe(599);
      expect(retrieved?.durationMinutes).toBe(40);
    });
  });

  describe("3. Packages & Bundles Dynamic CMS", () => {
    it("allows creating combo packages with dynamic inclusions", async () => {
      const newPkg = await dbRepo.createPackage({
        name: "Groom Royal Transformation Bundle",
        slug: "groom-royal-bundle",
        description: "Complete royal pre-wedding ritual for grooms.",
        price: 3499,
        originalPrice: 4800,
        durationMinutes: 180,
        servicesList: [
          "Geometric Jawed Habib Haircut",
          "O3+ Illuminating Facial",
          "Deep Condition Hair Spa",
          "Beard Contouring with Hot Towel",
        ],
        imageUrl: "/images/salon/services/jh-lalganj-jawed-habib-mastercut.webp",
        isFeatured: true,
        isActive: true,
      });

      expect(newPkg.id).toBeTruthy();

      const publicPkgs = await dbRepo.getPackages();
      const found = publicPkgs.find((p) => p.id === newPkg.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe("Groom Royal Transformation Bundle");
      expect(found?.servicesList.length).toBe(4);
      expect(found?.price).toBe(3499);
    });

    it("hides unpublished packages from public catalogue", async () => {
      const draftPkg = await dbRepo.createPackage({
        name: "Unreleased Festive Combo",
        slug: "unreleased-festive",
        description: "Unreleased festive package for special holidays.",
        price: 1999,
        originalPrice: 2500,
        durationMinutes: 90,
        servicesList: ["Spa", "Cut"],
        isFeatured: false,
        isActive: false, // Inactive
      });

      const publicPkgs = await dbRepo.getPackages(false);
      expect(publicPkgs.some((p) => p.id === draftPkg.id)).toBe(false);

      const adminPkgs = await dbRepo.getAllPackages();
      expect(adminPkgs.some((p) => p.id === draftPkg.id)).toBe(true);
    });
  });

  describe("4. Photo Gallery Dynamic CMS", () => {
    it("stores and retrieves authentic Lalganj salon photographs", async () => {
      const publicPhotos = await dbRepo.getGalleryImages();
      expect(publicPhotos.length).toBeGreaterThan(0);

      // Verify authentic webp images exist in database
      const interiorPhotos = publicPhotos.filter((p) => p.category === "Salon Ambience");
      expect(interiorPhotos.length).toBeGreaterThan(0);
      expect(interiorPhotos.some((p) => p.imageUrl.includes("jh-lalganj"))).toBe(true);
    });

    it("allows adding and unpublishing gallery items without code changes", async () => {
      const newImg = await dbRepo.createGalleryImage({
        title: "Newly Renovated VIP Styling Chair",
        imageUrl: "/images/salon/interior/jh-lalganj-styling-station-single.webp",
        category: "Salon Ambience",
        caption: "High-comfort hydraulic chair with ring halo mirror.",
        isFeatured: false,
        isPublished: true,
        sortOrder: 50,
      });

      let publicGallery = await dbRepo.getGalleryImages("Salon Ambience");
      expect(publicGallery.some((g) => g.id === newImg.id)).toBe(true);

      // Admin unpublishes the image
      await dbRepo.updateGalleryImage(newImg.id, { isPublished: false });

      // Public call excludes it
      publicGallery = await dbRepo.getGalleryImages("Salon Ambience", false);
      expect(publicGallery.some((g) => g.id === newImg.id)).toBe(false);

      // Admin call includes it
      const adminGallery = await dbRepo.getGalleryImages("Salon Ambience", true);
      expect(adminGallery.some((g) => g.id === newImg.id)).toBe(true);
    });
  });

  describe("5. Site Content & Hours Dynamic CMS", () => {
    it("allows admin to update site settings and immediately retrieves updated values", async () => {
      const current = await dbRepo.getSiteSettings();
      expect(current.site_title).toBeTruthy();

      await dbRepo.updateSiteSettings({
        hero_headline: "Discover Your Signature Style in Lalganj.",
        hero_subtitle: "Artistry, precision geometric cuts, and pure luxury at Tinpulwa Chowk.",
      });

      const updated = await dbRepo.getSiteSettings();
      expect(updated.hero_headline).toBe("Discover Your Signature Style in Lalganj.");
      expect(updated.hero_subtitle).toBe("Artistry, precision geometric cuts, and pure luxury at Tinpulwa Chowk.");
    });
  });
});
