# SERVICES & BRIDAL VALIDATION FIX IMPLEMENTATION REPORT
## The Jawed Habib Salon – Lalganj, Vaishali, Bihar

**Report Reference:** `JH-LLG-VALIDATION-FIX-002`  
**Date:** November 15, 2026  
**Auditor:** Principal Frontend & Backend Integration Specialist  
**Status:** `VERIFIED WORKING` / `FIXED AND VERIFIED`  
**Target URL:** `https://www.thejawedhabibsalons.in/admin/services`

---

## 1. Executive Summary

This report documents the architectural and implementation fixes applied to the Services, Bridal Suites, Packages, and Category validation layers. 

Prior to this fix:
1. Submitting the "Add New Service / Package" modal without a manual slug generated a 400 Bad Request error: `Validation failed for bridal service: slug: ["String must contain at least 2 character(s)"]`.
2. Editing any existing service sent unmapped relational fields (`categoryId`) and non-Prisma administrative attributes to the PostgreSQL database, triggering a fatal `DATABASE_PERSISTENCE_FAILED` exception.
3. The Admin Services management hub only fetched bridal-only records, leaving individual services listed at 0 items.

All three defects have been resolved with strict backward-compatibility, server-side auto-generation, defensive relational normalization, and complete test coverage.

---

## 2. Server-Side Validation Fixes (`src/lib/validation/schemas.ts`)

### 2.1 The Issue with `slug` in Zod Schemas
In `src/lib/validation/schemas.ts`, `adminServiceSchema`, `adminCategorySchema`, and `adminPackageSchema` required `slug: z.string().min(2).max(100)`. When salon administrators filled out the modal form, they provided customer-facing values (Name, Price, Duration, Advance Amount), expecting the system to automatically generate clean URL-safe slugs.

### 2.2 The Code Changes

```diff
--- a/src/lib/validation/schemas.ts
+++ b/src/lib/validation/schemas.ts
@@ -263,2 +263,2 @@
   name: z.string().min(2, "Service name required").max(100),
-  slug: z.string().min(2).max(100),
+  slug: z.string().max(100).optional().default(""),
@@ -387,2 +387,2 @@
   name: z.string().min(2, "Category name required"),
-  slug: z.string().min(2),
+  slug: z.string().optional().default(""),
@@ -466,2 +466,2 @@
   name: z.string().min(2, "Package name required"),
-  slug: z.string().min(2),
+  slug: z.string().optional().default(""),
```

**Result:** Any request where `slug` is omitted or passed as `""` (empty string) passes validation cleanly, allowing repository methods to auto-derive the slug from the item name.

---

## 3. Route Handler Fixes

### 3.1 `src/app/api/bridal/services/route.ts`
The route handler now ensures that if `body.slug` is missing or empty, it is automatically derived from `body.name` prior to running schema validation:

```typescript
// src/app/api/bridal/services/route.ts
const body = await req.json();

// Default category to Bridal (cat_6) if not explicitly set
if (!body.categoryId) {
  body.categoryId = "cat_6";
}
body.isBridal = true;

// Normalize slug from name if omitted or empty
if (!body.slug || typeof body.slug !== "string" || !body.slug.trim()) {
  body.slug = (body.name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Validate using adminServiceSchema
const validated = adminServiceSchema.safeParse(body);
```

In addition, business rules for advance deposits are enforced:
```typescript
const servicePrice = validated.data.discountedPrice ?? validated.data.price;
if (validated.data.minAdvanceAmount > servicePrice) {
  validated.data.minAdvanceAmount = servicePrice;
}
if (validated.data.maxAdvanceAmount < validated.data.minAdvanceAmount) {
  validated.data.maxAdvanceAmount = validated.data.minAdvanceAmount;
}
```

### 3.2 `src/app/api/bridal/services/[id]/route.ts` & `src/app/api/admin/services/[id]/route.ts`
Previously, `src/app/api/bridal/services/[id]/route.ts` only exported `GET`, `PUT`, and `DELETE`. The frontend toggle handler called `PATCH`, resulting in HTTP 405.

Both route files now export HTTP method aliases to support both standard RESTful conventions:
```typescript
// Bridal Services Route:
export const PATCH = PUT;

// Admin Services Route:
export const PUT = PATCH;
```

---

## 4. Repository Relational Normalization (`src/lib/db/repo.ts`)

### 4.1 Safe Service Update Logic
In `updateService`, the incoming payload is sanitized to prevent Prisma from receiving non-schema fields. Category connection is performed via Prisma's relational syntax:

```typescript
// src/lib/db/repo.ts -> updateService
async updateService(id: string, data: Partial<AdminServiceInput>) {
  if (await canUsePrisma()) {
    try {
      let existing = await prisma.service.findUnique({ where: { id } });
      if (!existing && data.slug) {
        existing = await prisma.service.findUnique({ where: { slug: data.slug } });
      }
      const targetId = existing ? existing.id : id;

      // Build clean update data mapping only valid Service scalar fields
      const prismaData: any = {};
      if (data.name !== undefined) prismaData.name = data.name;
      if (data.slug && data.slug.trim().length > 0) {
        prismaData.slug = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      if (data.description !== undefined) prismaData.description = data.description;
      if (data.detailedDescription !== undefined) prismaData.detailedDescription = data.detailedDescription;
      if (data.price !== undefined) prismaData.price = Number(data.price);
      if (data.discountedPrice !== undefined) prismaData.discountedPrice = data.discountedPrice !== null ? Number(data.discountedPrice) : null;
      if (data.durationMinutes !== undefined) prismaData.durationMinutes = Number(data.durationMinutes);
      if (data.gender !== undefined) prismaData.gender = data.gender;
      if (data.imageUrl !== undefined) prismaData.imageUrl = data.imageUrl;
      if (data.isStartingPrice !== undefined) prismaData.isStartingPrice = Boolean(data.isStartingPrice);
      if (data.priceDisplayType !== undefined) prismaData.priceDisplayType = data.priceDisplayType;
      if (data.allowOnlineBooking !== undefined) prismaData.allowOnlineBooking = Boolean(data.allowOnlineBooking);
      if (data.allowAdvancePayment !== undefined) prismaData.allowAdvancePayment = Boolean(data.allowAdvancePayment);
      if (data.depositType !== undefined) prismaData.depositType = data.depositType;
      if (data.depositValue !== undefined) prismaData.depositValue = Number(data.depositValue);
      if (data.bufferTimeMinutes !== undefined) prismaData.bufferTimeMinutes = Number(data.bufferTimeMinutes);
      if (data.sortOrder !== undefined) prismaData.sortOrder = Number(data.sortOrder);
      if (data.additionalImages !== undefined) prismaData.additionalImages = data.additionalImages;
      if (data.isPopular !== undefined) prismaData.isPopular = Boolean(data.isPopular);
      if (data.isFeatured !== undefined) prismaData.isFeatured = Boolean(data.isFeatured);
      if (data.isActive !== undefined) prismaData.isActive = Boolean(data.isActive);

      // Handle category relation properly
      if (data.categoryId) {
        let cat = await prisma.serviceCategory.findUnique({ where: { id: data.categoryId } });
        if (!cat) {
          cat = await prisma.serviceCategory.findUnique({ where: { slug: data.categoryId } });
        }
        if (cat) {
          prismaData.category = { connect: { id: cat.id } };
        }
      }

      const updated = await prisma.service.update({
        where: { id: targetId },
        data: prismaData,
        include: { category: true },
      });
      return updated;
    } catch (err: any) {
      if (shouldEnforceDurablePersistence()) {
        console.error("[DATABASE_PERSISTENCE_FAILED] Neon PostgreSQL error during updateService:", err);
        throw new Error(`DATABASE_PERSISTENCE_FAILED: Failed to update service in database: ${err.message || "Unknown error"}`);
      }
      isPostgresAvailable = false;
    }
  }
  ...
}
```

### 4.2 Category Deletion Protection
To prevent foreign key constraint violations (`onDelete: Restrict`), `deleteCategory` now actively checks for attached services:

```typescript
// src/lib/db/repo.ts -> deleteCategory
async deleteCategory(id: string) {
  if (await canUsePrisma()) {
    try {
      const attachedServicesCount = await prisma.service.count({ where: { categoryId: id } });
      if (attachedServicesCount > 0) {
        throw new Error(`Cannot delete category: ${attachedServicesCount} active service(s) are associated with this category. Please reassign or delete them first.`);
      }
      await prisma.serviceCategory.delete({ where: { id } });
      return { success: true };
    } catch (err: any) {
      if (shouldEnforceDurablePersistence() || err.message?.includes("Cannot delete category")) {
        console.error("[DATABASE_PERSISTENCE_FAILED] Neon PostgreSQL error during deleteCategory:", err);
        throw new Error(`DATABASE_PERSISTENCE_FAILED: Failed to delete category in database: ${err.message || "Unknown error"}`);
      }
      isPostgresAvailable = false;
    }
  }
  ...
}
```

---

## 5. UI Enhancements (`ServicesManagementHub`)

1. **Comprehensive Data Fetching:**
   Now calls `/api/admin/services` to load all services (both bridal suites and individual salon services) alongside all service categories.
2. **Category Selection Dropdown:**
   A `<select>` element was added to the service creation/edit modal, populated with live categories (Haircuts, Hair Spa, Color, Bridal, etc.) from the database.
3. **Optional Custom URL Slug Input:**
   Staff can supply an optional custom URL slug or leave it blank to be auto-derived from the service name.
4. **Resilient Categorization:**
   Packages tab filters bridal suite offerings and items tagged with bridal/package indicators. Individual Services tab displays all standard everyday salon services (classic haircuts, grooming, facials, skin therapy).

---

## 6. Verification Status

| Check | Tool / Method | Expected | Actual | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Relational Update** | Vitest (`updateService`) | No `Unknown argument` | Passed | `VERIFIED WORKING` |
| **Empty Slug Validation** | Vitest (`adminServiceSchema`) | `success: true` | Passed | `VERIFIED WORKING` |
| **Bridal Auto-Slug** | Vitest (`POST /api/bridal/services`) | HTTP 201 Created | Passed | `VERIFIED WORKING` |
| **Category Constraint** | Vitest (`deleteCategory`) | Throws descriptive error | Passed | `VERIFIED WORKING` |
| **Type Integrity** | `tsc --noEmit` | 0 errors | 0 errors | `VERIFIED WORKING` |
| **ESLint** | `next lint` | 0 warnings | 0 warnings | `VERIFIED WORKING` |
| **Production Build** | `npm run build` | Code 0 | Code 0 (67 routes) | `VERIFIED WORKING` |
