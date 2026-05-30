import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCronAuth, unauthorizedCron } from "@/lib/cron-auth";

// Expires ContactRequests still in PENDING after 14 days.
// Scheduled via Vercel Cron — see vercel.json.
// GET /api/cron/contact-request-expiry
export async function GET(request: Request) {
  if (!verifyCronAuth(request)) return unauthorizedCron();

  try {
    const threshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const result = await db.contactRequest.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: threshold },
      },
      data: { status: "EXPIRED" },
    });

    return NextResponse.json({
      expired: result.count,
      thresholdDate: threshold.toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ContactRequest expiry cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
