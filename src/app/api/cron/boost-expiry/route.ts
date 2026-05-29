import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// This can be called by a cron job (e.g., Vercel Cron) every hour
// GET /api/cron/boost-expiry?secret=CRON_SECRET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find boosts that expired in the last 2 hours (to not send duplicate notifications)
    const recentlyExpired = await db.boost.findMany({
      where: {
        endsAt: {
          gte: new Date(Date.now() - 7200000), // 2 hours ago
          lt: new Date(),
        },
      },
      include: {
        modelProfile: {
          select: { userId: true, fullName: true },
        },
      },
    });

    let notified = 0;

    for (const boost of recentlyExpired) {
      // Check if notification already sent
      const existing = await db.notification.findFirst({
        where: {
          userId: boost.modelProfile.userId,
          type: "BOOST_EXPIRED",
          createdAt: { gte: new Date(Date.now() - 7200000) },
        },
      });

      if (!existing) {
        await db.notification.create({
          data: {
            userId: boost.modelProfile.userId,
            type: "BOOST_EXPIRED",
            title: "Boost scaduto",
            body: "Il tuo boost è scaduto. Acquistane un altro per rimanere in evidenza.",
            link: "/model/settings/billing",
          },
        });
        notified++;
      }
    }

    return NextResponse.json({
      expired: recentlyExpired.length,
      notified,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Boost expiry cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
