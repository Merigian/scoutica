import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCronAuth, unauthorizedCron } from "@/lib/cron-auth";

// This can be called by a cron job (e.g., Vercel Cron) every hour
// GET /api/cron/boost-expiry
export async function GET(request: Request) {
  if (!verifyCronAuth(request)) return unauthorizedCron();

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
