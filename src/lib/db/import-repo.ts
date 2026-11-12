import dbRepo from "@/lib/db/repo";
import {
  GenderTarget,
  RoleType,
  AppointmentStatus,
  BookingSource,
  PaymentStatus,
  PaymentGateway,
  PaymentTransactionStatus,
} from "@prisma/client";

export interface ImportError {
  row: number;
  error: string;
}

export interface ImportResult {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: ImportError[];
}

/**
 * Service Categories Import
 */
export async function importCategories(
  records: any[],
  overwrite: boolean = false
): Promise<ImportResult> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: ImportError[] = [];
  const memoryDb = (dbRepo as any)._memoryDb;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowIdx = i + 1;
    if (!row.name || !String(row.name).trim()) {
      errors.push({ row: rowIdx, error: "Category name is required" });
      continue;
    }
    const name = String(row.name).trim();
    const slug =
      row.slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existing = memoryDb.categories.find((c: any) => c.slug === slug);

    if (existing) {
      if (overwrite) {
        existing.name = name;
        if (row.description !== undefined) existing.description = String(row.description);
        if (row.iconName !== undefined) existing.iconName = String(row.iconName);
        if (row.sortOrder !== undefined) existing.sortOrder = Number(row.sortOrder) || 0;
        if (row.isActive !== undefined) existing.isActive = String(row.isActive).toLowerCase() !== "false";
        existing.updatedAt = new Date();
        updated++;
      } else {
        skipped++;
      }
    } else {
      memoryDb.categories.push({
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        slug,
        description: row.description || null,
        imageUrl: row.imageUrl || null,
        iconName: row.iconName || "Scissors",
        sortOrder: Number(row.sortOrder) || memoryDb.categories.length + 1,
        isActive: String(row.isActive).toLowerCase() !== "false",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted++;
    }
  }

  return { total: records.length, inserted, updated, skipped, errors };
}

/**
 * Services Catalogue Import
 */
export async function importServices(
  records: any[],
  overwrite: boolean = false
): Promise<ImportResult> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: ImportError[] = [];
  const memoryDb = (dbRepo as any)._memoryDb;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowIdx = i + 1;
    if (!row.name || !String(row.name).trim()) {
      errors.push({ row: rowIdx, error: "Service name is required" });
      continue;
    }
    const price = Number(row.price);
    if (isNaN(price) || price <= 0) {
      errors.push({ row: rowIdx, error: `Invalid price: ${row.price}` });
      continue;
    }

    // Resolve Category
    let categoryId = "";
    if (row.categorySlug) {
      const cat = memoryDb.categories.find(
        (c: any) =>
          c.slug === row.categorySlug ||
          c.name.toLowerCase() === String(row.categorySlug).toLowerCase()
      );
      if (cat) categoryId = cat.id;
    }
    if (!categoryId && memoryDb.categories.length > 0) {
      categoryId = memoryDb.categories[0].id;
    }

    const name = String(row.name).trim();
    const slug =
      row.slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existing = memoryDb.services.find((s: any) => s.slug === slug);

    let gender: GenderTarget = GenderTarget.UNISEX;
    if (row.gender) {
      const g = String(row.gender).toUpperCase();
      if (g === "FEMALE") gender = GenderTarget.FEMALE;
      else if (g === "MALE") gender = GenderTarget.MALE;
      else if (g === "KIDS") gender = GenderTarget.KIDS;
    }

    const durationMinutes = Number(row.durationMinutes) || 30;
    const discountedPrice =
      row.discountedPrice && !isNaN(Number(row.discountedPrice))
        ? Number(row.discountedPrice)
        : null;
    const depositType = ["NO_DEPOSIT", "FIXED", "PERCENTAGE", "FULL"].includes(row.depositType)
      ? row.depositType
      : "NO_DEPOSIT";
    const depositValue = Number(row.depositValue) || 0;

    if (existing) {
      if (overwrite) {
        existing.name = name;
        existing.price = price;
        existing.discountedPrice = discountedPrice;
        existing.durationMinutes = durationMinutes;
        existing.gender = gender;
        existing.categoryId = categoryId;
        existing.depositType = depositType;
        existing.depositValue = depositValue;
        existing.allowOnlineBooking = String(row.allowOnlineBooking).toLowerCase() !== "false";
        existing.isPopular = String(row.isPopular).toLowerCase() === "true";
        existing.isFeatured = String(row.isFeatured).toLowerCase() === "true";
        existing.isActive = String(row.isActive).toLowerCase() !== "false";
        if (row.description) existing.description = String(row.description);
        existing.updatedAt = new Date();
        updated++;
      } else {
        skipped++;
      }
    } else {
      memoryDb.services.push({
        id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        slug,
        description: row.description || null,
        price,
        discountedPrice,
        durationMinutes,
        gender,
        categoryId,
        imageUrl: row.imageUrl || null,
        detailedDescription: row.detailedDescription || null,
        priceDisplayType: "FIXED",
        isStartingPrice: false,
        allowOnlineBooking: String(row.allowOnlineBooking).toLowerCase() !== "false",
        allowAdvancePayment: depositType !== "NO_DEPOSIT",
        depositType,
        depositValue,
        bufferTimeMinutes: 0,
        sortOrder: memoryDb.services.length + 1,
        additionalImages: [],
        isPopular: String(row.isPopular).toLowerCase() === "true",
        isFeatured: String(row.isFeatured).toLowerCase() === "true",
        isActive: String(row.isActive).toLowerCase() !== "false",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted++;
    }
  }

  return { total: records.length, inserted, updated, skipped, errors };
}

/**
 * Packages Catalogue Import
 */
export async function importPackages(
  records: any[],
  overwrite: boolean = false
): Promise<ImportResult> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: ImportError[] = [];
  const memoryDb = (dbRepo as any)._memoryDb;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowIdx = i + 1;
    if (!row.name || !String(row.name).trim()) {
      errors.push({ row: rowIdx, error: "Package name is required" });
      continue;
    }
    const price = Number(row.price);
    if (isNaN(price) || price <= 0) {
      errors.push({ row: rowIdx, error: `Invalid price: ${row.price}` });
      continue;
    }

    const name = String(row.name).trim();
    const slug =
      row.slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existing = memoryDb.packages.find((p: any) => p.slug === slug);

    const servicesList: string[] =
      typeof row.servicesList === "string"
        ? row.servicesList
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : Array.isArray(row.servicesList)
        ? row.servicesList
        : [];

    if (existing) {
      if (overwrite) {
        existing.name = name;
        existing.price = price;
        if (row.originalPrice) existing.originalPrice = Number(row.originalPrice) || price;
        if (row.durationMinutes) existing.durationMinutes = Number(row.durationMinutes) || 90;
        if (servicesList.length > 0) existing.servicesList = servicesList;
        if (row.description) existing.description = String(row.description);
        if (row.isActive !== undefined) existing.isActive = String(row.isActive).toLowerCase() !== "false";
        existing.updatedAt = new Date();
        updated++;
      } else {
        skipped++;
      }
    } else {
      memoryDb.packages.push({
        id: `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        slug,
        description: row.description || "Curated salon package",
        price,
        originalPrice: Number(row.originalPrice) || price,
        durationMinutes: Number(row.durationMinutes) || 90,
        servicesList,
        imageUrl: row.imageUrl || null,
        isFeatured: String(row.isFeatured).toLowerCase() === "true",
        isActive: String(row.isActive).toLowerCase() !== "false",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      inserted++;
    }
  }

  return { total: records.length, inserted, updated, skipped, errors };
}

/**
 * Calendar Overrides & Blocked Dates Import
 */
export async function importCalendarOverrides(
  records: any[],
  overwrite: boolean = false
): Promise<ImportResult> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: ImportError[] = [];

  const settings = await dbRepo.getCalendarSettings();
  const currentBlocked = [...(settings.blockedDates || [])];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowIdx = i + 1;
    const dateStr = row.date?.trim();

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      errors.push({ row: rowIdx, error: `Invalid date format (must be YYYY-MM-DD): ${dateStr}` });
      continue;
    }

    const existingIdx = currentBlocked.findIndex((b) => b.date === dateStr);
    const isFullDay = String(row.isFullDay).toLowerCase() === "true" || !row.startTime;
    const isSpecialHours =
      String(row.type).toUpperCase() === "SPECIAL_HOURS" ||
      String(row.isSpecialHours).toLowerCase() === "true";

    const overrideEntry = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: dateStr,
      blockEntireDay: !isSpecialHours && isFullDay,
      isFullDay: !isSpecialHours && isFullDay,
      startTime: row.startTime || null,
      endTime: row.endTime || null,
      isSpecialHours,
      specialOpenTime: isSpecialHours ? row.startTime || "11:00" : null,
      specialCloseTime: isSpecialHours ? row.endTime || "19:00" : null,
      reason: row.reason || row.title || "Calendar Schedule Override",
      isActive: true,
    };

    if (existingIdx >= 0) {
      if (overwrite) {
        currentBlocked[existingIdx] = overrideEntry;
        updated++;
      } else {
        skipped++;
      }
    } else {
      currentBlocked.push(overrideEntry);
      inserted++;
    }
  }

  await dbRepo.updateCalendarSettings({ blockedDates: currentBlocked });
  return { total: records.length, inserted, updated, skipped, errors };
}

/**
 * Phase 7: Historical Bookings Import with Absolute Payment Safety
 * All imported historical records are strictly isolated with gateway = MANUAL_CASH/UPI.
 * Razorpay transactions are NEVER fabricated or marked as verified.
 */
export async function importHistoricalAppointments(records: any[]): Promise<{
  total: number;
  imported: number;
  errors: ImportError[];
}> {
  let imported = 0;
  const errors: ImportError[] = [];
  const memoryDb = (dbRepo as any)._memoryDb;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const rowIdx = i + 1;

    if (!row.customerName || !row.phone) {
      errors.push({ row: rowIdx, error: "Customer name and phone are required" });
      continue;
    }

    // Check or create customer
    let profile = memoryDb.customerProfiles.find((p: any) => {
      const u = memoryDb.users.find((user: any) => user.id === p.userId);
      return u?.phone === row.phone;
    });

    if (!profile) {
      const userId = `usr_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      memoryDb.users.push({
        id: userId,
        name: row.customerName,
        phone: row.phone,
        email: row.email || null,
        passwordHash: null,
        roleType: RoleType.CUSTOMER,
        avatarUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      profile = {
        id: `cp_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        alternatePhone: null,
        dateOfBirth: null,
        anniversary: null,
        address: null,
        notes: "Imported via historical CSV migration",
        totalVisits: 1,
        totalSpent: Number(row.amount) || 0,
        preferredStaffId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryDb.customerProfiles.push(profile);
    }

    const totalAmount = Number(row.amount) || 500;
    const aptId = `apt_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const aptNumber = `IMP-${Date.now().toString().slice(-6)}-${rowIdx}`;

    // STRICT PAYMENT SAFETY: source is WALK_IN, gateway is MANUAL_CASH.
    // Razorpay IDs remain null.
    memoryDb.appointments.push({
      id: aptId,
      appointmentNumber: aptNumber,
      customerProfileId: profile.id,
      staffId: null,
      status: AppointmentStatus.COMPLETED,
      source: BookingSource.WALK_IN,
      appointmentDate: row.date || new Date().toISOString().split("T")[0],
      startTime: row.time || "11:00",
      endTime: "12:00",
      subtotal: totalAmount,
      discountAmount: 0,
      totalAmount,
      depositAmount: totalAmount,
      remainingAmount: 0,
      depositType: "FULL",
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: "CASH_COUNTER",
      couponCode: null,
      holdToken: null,
      notes: "Historical salon appointment record",
      adminNotes: "Imported historical appointment - not an online transaction",
      internalNotes: "HISTORICAL_IMPORT_SAFE",
      createdAt: new Date(row.date || Date.now()),
      updatedAt: new Date(row.date || Date.now()),
      serviceIds: memoryDb.services.length > 0 ? [memoryDb.services[0].id] : [],
    });

    memoryDb.payments.push({
      id: `p_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      appointmentId: aptId,
      transactionRef: `HIST-${aptNumber}`,
      gateway: PaymentGateway.MANUAL_CASH,
      gatewayPaymentId: null,
      gatewaySignature: null,
      amount: totalAmount,
      currency: "INR",
      status: PaymentTransactionStatus.SUCCESS,
      failureReason: null,
      metadata: JSON.stringify({
        source: "MANUAL_HISTORICAL_IMPORT",
        customerName: row.customerName,
        environment: "OFFLINE",
        paymentPurpose: "HISTORICAL_RECORD",
      }),
      createdAt: new Date(row.date || Date.now()),
      updatedAt: new Date(row.date || Date.now()),
      paymentPurpose: "HISTORICAL_RECORD",
      paymentMethod: "Historical Cash at Counter",
      environment: "OFFLINE",
      recordedBy: "Data Import Migration",
    });
    imported++;
  }

  return { total: records.length, imported, errors };
}
