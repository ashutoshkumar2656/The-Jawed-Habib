import { NextRequest, NextResponse } from "next/server";
import { getRequestSessionUser } from "@/lib/auth/session";
import { reviewSubmitSchema } from "@/lib/validation/schemas";
import dbRepo from "@/lib/db/repo";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const reviews = await dbRepo.getReviews(true); // approved only for public display
    return NextResponse.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getRequestSessionUser(req);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to submit a review.",
        },
        { status: 401 }
      );
    }

    const rateLimit = checkRateLimit(`review_submit_${session.userId}`, 5, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "You have submitted multiple reviews recently. Please wait before submitting another.",
          retryAfterMs: rateLimit.resetInMs,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = reviewSubmitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const review = await dbRepo.submitReview({
      userId: session.userId,
      rating: result.data.rating,
      title: result.data.title,
      comment: result.data.comment,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for your review! To maintain quality, customer reviews are published upon quick moderation by our salon team.",
        data: review,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Reviews POST error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
