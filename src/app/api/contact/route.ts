import { NextRequest } from "next/server";
import { POST as enquiriesPost } from "../enquiries/route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public Contact Form Submission Endpoint (/api/contact)
 * Synchronizes with Neon PostgreSQL, Admin Portal, Google Sheets, and Email.
 */
export async function POST(req: NextRequest) {
  return enquiriesPost(req);
}
