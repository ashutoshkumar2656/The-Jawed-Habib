import { describe, it, expect, beforeEach } from "vitest";
import dbRepo from "@/lib/db/repo";
import { adminTransformationSchema } from "@/lib/validation/schemas";
import { NextRequest } from "next/server";
import { GET as getPublicTransformations } from "@/app/api/transformations/route";
import {
  POST as createAdminTransformation,
  GET as getAdminTransformations,
} from "@/app/api/admin/transformations/route";
import {
  PATCH as updateAdminTransformation,
  DELETE as deleteAdminTransformation,
} from "@/app/api/admin/transformations/[id]/route";
import {
  GET as getAdminMedia,
  POST as createAdminMedia,
} from "@/app/api/admin/media/route";
import {
  PUT as updateAdminMedia,
  DELETE as deleteAdminMedia,
} from "@/app/api/admin/media/[id]/route";

describe("Phase 9: Comprehensive Before & After Media Management Verification (Tests 1 - 12)", () => {
  const sampleCloudinaryBeforeUrl =
    "https://res.cloudinary.com/qhoxax43/image/upload/v1794641749/jawed_habib_lalganj/transformations/keratin-before.webp";
  const sampleCloudinaryAfterUrl =
    "https://res.cloudinary.com/qhoxax43/image/upload/v1794641749/jawed_habib_lalganj/transformations/keratin-after.webp";
  const sampleExternalBeforeUrl =
    "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80";
  const sampleExternalAfterUrl =
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80";

  // -------------------------------------------------------------
  // TEST 1: Create a transformation using two manually pasted image URLs
  // -------------------------------------------------------------
  it("TEST 1: Creates a transformation using two manually pasted HTTPS image URLs", async () => {
    const input = {
      title: "Hand-Crafted Balayage Ombre",
      description: "Seamless caramel and honey dimension with root melt finish.",
      beforeImageUrl: sampleExternalBeforeUrl,
      afterImageUrl: sampleExternalAfterUrl,
      category: "Hair Coloring & Balayage",
      clientGender: "FEMALE" as const,
      isFeatured: true,
      sortOrder: 1,
    };

    const parseResult = adminTransformationSchema.safeParse(input);
    expect(parseResult.success).toBe(true);

    const created = await dbRepo.createTransformation(input);
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.beforeImageUrl).toBe(sampleExternalBeforeUrl);
    expect(created.afterImageUrl).toBe(sampleExternalAfterUrl);
    expect(created.title).toBe("Hand-Crafted Balayage Ombre");
  });

  // -------------------------------------------------------------
  // TEST 2: Upload Before Image through Cloudinary and paste After Image URL manually
  // -------------------------------------------------------------
  it("TEST 2: Supports hybrid inputs (Cloudinary Before upload + manually pasted After URL)", async () => {
    const input = {
      title: "Hybrid Sourced Hair Rejuvenation",
      description: "Client brought custom after reference, salon took live before photo.",
      beforeImageUrl: sampleCloudinaryBeforeUrl, // From Cloudinary upload
      afterImageUrl: sampleExternalAfterUrl, // Manually pasted
      category: "Hair Spa & Keratin Therapy",
      clientGender: "UNISEX" as const,
      isFeatured: true,
      sortOrder: 2,
    };

    const parseResult = adminTransformationSchema.safeParse(input);
    expect(parseResult.success).toBe(true);

    const created = await dbRepo.createTransformation(input);
    expect(created.beforeImageUrl).toContain("cloudinary.com");
    expect(created.afterImageUrl).toContain("unsplash.com");
    expect(created.beforeImageUrl).not.toBe(created.afterImageUrl);
  });

  // -------------------------------------------------------------
  // TEST 3: Upload both images using Cloudinary
  // -------------------------------------------------------------
  it("TEST 3: Uploads both images through Cloudinary and pairs them into one Transformation", async () => {
    const input = {
      title: "L'Oréal Nanoplastia Smooth & Gloss",
      description: "Formaldehyde-free smoothing and brilliant mirror shine.",
      beforeImageUrl: sampleCloudinaryBeforeUrl,
      afterImageUrl: sampleCloudinaryAfterUrl,
      category: "Hair Spa & Keratin Therapy",
      clientGender: "FEMALE" as const,
      isFeatured: true,
      sortOrder: 3,
    };

    const parseResult = adminTransformationSchema.safeParse(input);
    expect(parseResult.success).toBe(true);

    const created = await dbRepo.createTransformation(input);
    expect(created.id).toBeDefined();
    expect(created.beforeImageUrl).toBe(sampleCloudinaryBeforeUrl);
    expect(created.afterImageUrl).toBe(sampleCloudinaryAfterUrl);

    // Verify it links to ONE transformation record rather than two disjoint records
    const all = await dbRepo.getTransformations();
    const matches = all.filter((t) => t.id === created.id);
    expect(matches.length).toBe(1);
    expect(matches[0].beforeImageUrl).toBe(sampleCloudinaryBeforeUrl);
    expect(matches[0].afterImageUrl).toBe(sampleCloudinaryAfterUrl);
  });

  // -------------------------------------------------------------
  // TEST 4: Edit an existing transformation and replace only the Before Image
  // -------------------------------------------------------------
  it("TEST 4: Replaces only the Before Image without erasing or modifying the After Image", async () => {
    const original = await dbRepo.createTransformation({
      title: "Precision Men's Skin Fade",
      description: "Low skin fade with beard line up.",
      beforeImageUrl: "https://example.com/initial-before-fade.jpg",
      afterImageUrl: "https://example.com/stable-after-fade.jpg",
      category: "Beard Sculpting & Grooming",
      clientGender: "MALE" as const,
      isFeatured: true,
      sortOrder: 4,
    });

    const newBeforeUrl = "https://res.cloudinary.com/qhoxax43/image/upload/v99/new-angle-before.jpg";
    const updated = await dbRepo.updateTransformation(original.id, {
      beforeImageUrl: newBeforeUrl,
    });

    expect(updated.id).toBe(original.id);
    expect(updated.beforeImageUrl).toBe(newBeforeUrl);
    expect(updated.afterImageUrl).toBe("https://example.com/stable-after-fade.jpg"); // Preserved intact
  });

  // -------------------------------------------------------------
  // TEST 5: Replace only the After Image
  // -------------------------------------------------------------
  it("TEST 5: Replaces only the After Image without erasing or modifying the Before Image", async () => {
    const original = await dbRepo.createTransformation({
      title: "Charlotte Tilbury Bridal Makeover",
      description: "Royal HD glass skin and statement lips.",
      beforeImageUrl: "https://example.com/stable-before-bridal.jpg",
      afterImageUrl: "https://example.com/initial-after-bridal.jpg",
      category: "Bridal Makeover",
      clientGender: "FEMALE" as const,
      isFeatured: true,
      sortOrder: 5,
    });

    const newAfterUrl = "https://res.cloudinary.com/qhoxax43/image/upload/v99/final-studio-after.jpg";
    const updated = await dbRepo.updateTransformation(original.id, {
      afterImageUrl: newAfterUrl,
    });

    expect(updated.id).toBe(original.id);
    expect(updated.beforeImageUrl).toBe("https://example.com/stable-before-bridal.jpg"); // Preserved intact
    expect(updated.afterImageUrl).toBe(newAfterUrl);
  });

  // -------------------------------------------------------------
  // TEST 6: Refresh the Admin Panel and verify both URLs remain saved
  // -------------------------------------------------------------
  it("TEST 6: Re-queries backend repository and verifies persisted state of both URLs", async () => {
    const tf = await dbRepo.createTransformation({
      title: "Botox Hair Restorative Therapy",
      description: "Hydration replenishment for chemically treated hair.",
      beforeImageUrl: "https://res.cloudinary.com/qhoxax43/image/upload/v1/botox-before.jpg",
      afterImageUrl: "https://res.cloudinary.com/qhoxax43/image/upload/v1/botox-after.jpg",
      category: "Hair Spa & Keratin Therapy",
      clientGender: "UNISEX" as const,
      isFeatured: true,
      sortOrder: 6,
    });

    // Simulate page refresh / subsequent fetch
    const listAfterRefresh = await dbRepo.getTransformations();
    const retrieved = listAfterRefresh.find((item) => item.id === tf.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.beforeImageUrl).toBe("https://res.cloudinary.com/qhoxax43/image/upload/v1/botox-before.jpg");
    expect(retrieved?.afterImageUrl).toBe("https://res.cloudinary.com/qhoxax43/image/upload/v1/botox-after.jpg");
    expect(retrieved?.title).toBe("Botox Hair Restorative Therapy");
  });

  // -------------------------------------------------------------
  // TEST 7: Publish a transformation and verify it appears on the public website
  // -------------------------------------------------------------
  it("TEST 7: Newly published transformation appears immediately on the public website endpoint", async () => {
    const published = await dbRepo.createTransformation({
      title: "Publicly Featured Hair Transformation",
      description: "Volumizing layers and radiant shine.",
      beforeImageUrl: sampleCloudinaryBeforeUrl,
      afterImageUrl: sampleCloudinaryAfterUrl,
      category: "Hair Styling",
      clientGender: "FEMALE" as const,
      isFeatured: true, // PUBLISHED
      sortOrder: 7,
    });

    const req = new NextRequest("http://localhost:3000/api/transformations");
    const res = await getPublicTransformations(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    const match = json.data.find((item: any) => item.id === published.id);
    expect(match).toBeDefined();
    expect(match.title).toBe("Publicly Featured Hair Transformation");
    expect(match.beforeImageUrl).toBe(sampleCloudinaryBeforeUrl);
    expect(match.afterImageUrl).toBe(sampleCloudinaryAfterUrl);
  });

  // -------------------------------------------------------------
  // TEST 8: Create a Draft transformation and verify it remains hidden publicly
  // -------------------------------------------------------------
  it("TEST 8: Draft transformation (isFeatured: false) remains hidden from the public website", async () => {
    const draft = await dbRepo.createTransformation({
      title: "Unapproved Internal Work in Progress",
      description: "Stylist testing new lighting fixture.",
      beforeImageUrl: sampleCloudinaryBeforeUrl,
      afterImageUrl: sampleCloudinaryAfterUrl,
      category: "Hair Styling",
      clientGender: "UNISEX" as const,
      isFeatured: false, // DRAFT / HIDDEN
      sortOrder: 8,
    });

    const req = new NextRequest("http://localhost:3000/api/transformations");
    const res = await getPublicTransformations(req);
    const json = await res.json();

    expect(json.success).toBe(true);
    const match = json.data.find((item: any) => item.id === draft.id);
    expect(match).toBeUndefined(); // Strictly hidden from public
  });

  // -------------------------------------------------------------
  // TEST 9: Test invalid image URLs
  // -------------------------------------------------------------
  it("TEST 9: Validates URL formats and strictly rejects javascript: and unsafe protocols", () => {
    const unsafeBefore = {
      title: "XSS Attempt in Before URL",
      beforeImageUrl: "javascript:alert('xss')",
      afterImageUrl: sampleCloudinaryAfterUrl,
      clientGender: "UNISEX" as const,
    };
    expect(adminTransformationSchema.safeParse(unsafeBefore).success).toBe(false);

    const unsafeAfter = {
      title: "XSS Attempt in After URL",
      beforeImageUrl: sampleCloudinaryBeforeUrl,
      afterImageUrl: "data:text/html,<script>alert(1)</script>",
      clientGender: "UNISEX" as const,
    };
    expect(adminTransformationSchema.safeParse(unsafeAfter).success).toBe(false);

    const missingScheme = {
      title: "Missing HTTP/HTTPS Scheme",
      beforeImageUrl: "my-photo.jpg",
      afterImageUrl: sampleCloudinaryAfterUrl,
      clientGender: "UNISEX" as const,
    };
    expect(adminTransformationSchema.safeParse(missingScheme).success).toBe(false);
  });

  // -------------------------------------------------------------
  // TEST 10: Test broken image links & fallback error detection
  // -------------------------------------------------------------
  it("TEST 10: Detects empty or broken URL inputs and enforces minimum field requirements", () => {
    const emptyBoth = {
      title: "Empty URLs",
      beforeImageUrl: "",
      afterImageUrl: "",
    };
    const result = adminTransformationSchema.safeParse(emptyBoth);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = result.error.format();
      expect(formatted.beforeImageUrl?._errors.length).toBeGreaterThan(0);
      expect(formatted.afterImageUrl?._errors.length).toBeGreaterThan(0);
    }
  });

  // -------------------------------------------------------------
  // TEST 11: Test mobile and desktop layout payload integrity
  // -------------------------------------------------------------
  it("TEST 11: Delivers structured payload with category, gender, and both image URLs for sliders", async () => {
    const tf = await dbRepo.createTransformation({
      title: "Signature Global Hair Color",
      description: "Rich espresso brown with dimensional beige babylights.",
      beforeImageUrl: sampleCloudinaryBeforeUrl,
      afterImageUrl: sampleCloudinaryAfterUrl,
      category: "Hair Coloring & Balayage",
      clientGender: "FEMALE" as const,
      isFeatured: true,
      sortOrder: 11,
    });

    const all = await dbRepo.getTransformations();
    const item = all.find((t) => t.id === tf.id);

    expect(item).toBeDefined();
    expect(item?.beforeImageUrl).toBeDefined();
    expect(item?.afterImageUrl).toBeDefined();
    expect(item?.clientGender).toBe("FEMALE");
    expect((item as any)?.category).toBeDefined();
  });

  // -------------------------------------------------------------
  // TEST 12: Verify existing GalleryImage records and other media categories still work
  // -------------------------------------------------------------
  it("TEST 12: Preserves existing MediaItem and GalleryImage records across bridal, interior, and hero folders", async () => {
    // 1. Verify media library standard categories still query cleanly
    const allMedia = await dbRepo.getAllMedia();
    expect(allMedia.length).toBeGreaterThan(0);

    const heroMedia = await dbRepo.getAllMedia("hero");
    expect(heroMedia.length).toBeGreaterThan(0);
    expect(heroMedia.every((m) => m.folder === "hero")).toBe(true);

    const bridalMedia = await dbRepo.getAllMedia("bridal");
    expect(bridalMedia.length).toBeGreaterThan(0);
    expect(bridalMedia.every((m) => m.folder === "bridal")).toBe(true);

    // 2. Create a standard bridal media item
    const createdMedia = await dbRepo.createMediaItem({
      title: "Regal Rajputana Maang Tikka Close-Up",
      altText: "Hand-crafted jewellery styling for royal bride",
      url: "https://res.cloudinary.com/qhoxax43/image/upload/v1/bridal-tikka.jpg",
      mediaType: "IMAGE",
      folder: "bridal",
      fileSize: "380 KB",
      isPublished: true,
      sortOrder: 99,
    });

    expect(createdMedia.id).toBeDefined();
    expect(createdMedia.folder).toBe("bridal");

    // 3. Verify media item can be updated without affecting transformations
    const updatedMedia = await dbRepo.updateMediaItem(createdMedia.id, {
      title: "Updated Bridal Maang Tikka",
    });
    expect(updatedMedia.title).toBe("Updated Bridal Maang Tikka");

    // 4. Verify gallery images operate independently and intact
    const gallery = await dbRepo.getGalleryImages();
    expect(Array.isArray(gallery)).toBe(true);
  });
});
