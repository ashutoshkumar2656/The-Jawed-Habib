import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/auth/rbac";
import { importServices, importCategories, importPackages } from "@/lib/db/import-repo";
import { generateCsv } from "@/lib/reports/exporter";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

/**
 * GET: Download sample CSV templates for Services, Categories, or Packages
 */
export async function GET(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "services"; // "services", "categories", "packages"

    if (type === "categories") {
      const headers = ["name", "slug", "description", "iconName", "sortOrder", "isActive"];
      const sampleRows = [
        ["Hair Cut & Styling", "hair-cut-styling", "Expert haircutting and styling for men and women", "Scissors", 1, "true"],
        ["Hair Spa & Therapy", "hair-spa-therapy", "Intensive deep nourishing hair spa and scalp care", "Sparkles", 2, "true"],
        ["Skin & Facial Glow", "skin-facial-glow", "Premium skin rejuvenation and bridal facials", "Sparkles", 3, "true"],
      ];
      const csv = generateCsv(headers, sampleRows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="jawed_habib_categories_template.csv"',
        },
      });
    }

    if (type === "packages") {
      const headers = ["name", "slug", "price", "originalPrice", "durationMinutes", "servicesList", "description", "isFeatured", "isActive"];
      const sampleRows = [
        [
          "Habib Signature Royal Package",
          "habib-signature-royal-package",
          2499,
          3500,
          90,
          "Hair Cut, Hair Spa, Deep Cleansing Facial, Beard Styling",
          "Complete luxury grooming package for all festive occasions",
          "true",
          "true",
        ],
        [
          "Bridal Radiance Glow Package",
          "bridal-radiance-glow-package",
          5999,
          7999,
          150,
          "Bridal Facial, Crystal Hair Spa, Full Arms Wax, Manicure, Pedicure",
          "Comprehensive bridal ritual crafted by Jawed Habib experts",
          "true",
          "true",
        ],
      ];
      const csv = generateCsv(headers, sampleRows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="jawed_habib_packages_template.csv"',
        },
      });
    }

    // Default: Services Template
    const headers = [
      "name",
      "slug",
      "categorySlug",
      "price",
      "discountedPrice",
      "durationMinutes",
      "gender",
      "depositType",
      "depositValue",
      "allowOnlineBooking",
      "isPopular",
      "isFeatured",
      "isActive",
      "description",
    ];
    const sampleRows = [
      [
        "Classic Habib Haircut & Wash",
        "classic-habib-haircut-wash",
        "hair-cut-styling",
        450,
        399,
        35,
        "UNISEX",
        "PERCENTAGE",
        20,
        "true",
        "true",
        "true",
        "true",
        "Precision cut with hair wash and blow dry styling",
      ],
      [
        "Keratin Smooth Hair Spa",
        "keratin-smooth-hair-spa",
        "hair-spa-therapy",
        1500,
        1299,
        60,
        "UNISEX",
        "FIXED",
        300,
        "true",
        "true",
        "false",
        "true",
        "Infuses deep keratin proteins to revitalize damaged hair",
      ],
      [
        "Gold Luxury Facial Glow",
        "gold-luxury-facial-glow",
        "skin-facial-glow",
        2200,
        1899,
        75,
        "FEMALE",
        "PERCENTAGE",
        25,
        "true",
        "true",
        "true",
        "true",
        "24K gold foil infused radiant facial for luminous glow",
      ],
    ];

    const csv = generateCsv(headers, sampleRows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="jawed_habib_services_template.csv"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Validate and Commit CSV Import
 */
export async function POST(req: NextRequest) {
  try {
    const auth = checkAdminAuth(req, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { type = "services", records = [], dryRun = false, overwrite = false } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, error: "No records provided for import" },
        { status: 400 }
      );
    }

    // Dry Run Preview and Validation
    if (dryRun) {
      const validationErrors: { row: number; error: string }[] = [];
      records.forEach((row, idx) => {
        const rowNum = idx + 1;
        if (!row.name || !String(row.name).trim()) {
          validationErrors.push({ row: rowNum, error: "Name is required" });
        }
        if (type === "services" || type === "packages") {
          const p = Number(row.price);
          if (isNaN(p) || p <= 0) {
            validationErrors.push({ row: rowNum, error: `Invalid price value: ${row.price}` });
          }
        }
      });

      return NextResponse.json({
        success: true,
        dryRun: true,
        totalRows: records.length,
        valid: validationErrors.length === 0,
        errors: validationErrors,
        preview: records.slice(0, 10), // first 10 rows for preview
      });
    }

    // Real Execution
    let result;
    if (type === "categories") {
      result = await importCategories(records, overwrite);
    } else if (type === "packages") {
      result = await importPackages(records, overwrite);
    } else {
      result = await importServices(records, overwrite);
    }

    return NextResponse.json({
      success: true,
      message: `Import processed: ${result.inserted} created, ${result.updated} updated, ${result.skipped} skipped, ${result.errors.length} failed`,
      result,
    });
  } catch (error: any) {
    console.error("Services import error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
