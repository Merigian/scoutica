"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { ActionResponse } from "@/types";

/**
 * Record a profile view. Deduplicated per user per day (or per IP per day for anonymous).
 * Called server-side from the public profile page.
 * Does NOT count the model viewing their own profile.
 */
export async function recordProfileView(modelProfileId: string): Promise<void> {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;

    // Don't count the model viewing their own profile
    if (viewerId) {
      const profile = await db.modelProfile.findUnique({
        where: { id: modelProfileId },
        select: { userId: true },
      });
      if (profile?.userId === viewerId) return;
    }

    // Get today's date (UTC, date-only for dedup)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (viewerId) {
      // Authenticated user — dedup by (profileId, userId, date)
      const existing = await db.profileView.findUnique({
        where: {
          modelProfileId_viewerId_viewDate: {
            modelProfileId,
            viewerId,
            viewDate: today,
          },
        },
      });
      if (existing) return; // Already viewed today

      await db.$transaction([
        db.profileView.create({
          data: {
            modelProfileId,
            viewerId,
            viewDate: today,
          },
        }),
        db.modelProfile.update({
          where: { id: modelProfileId },
          data: { viewCount: { increment: 1 } },
        }),
      ]);

      // Notify model when a scout views their profile (max 1/day)
      if (session?.user?.role === "SCOUT") {
        const profile = await db.modelProfile.findUnique({
          where: { id: modelProfileId },
          select: { userId: true },
        });
        if (profile) {
          const recentNotif = await db.notification.findFirst({
            where: {
              userId: profile.userId,
              type: "SYSTEM",
              createdAt: { gte: today },
              title: { contains: "professionista" },
            },
          });
          if (!recentNotif) {
            await db.notification.create({
              data: {
                userId: profile.userId,
                type: "SYSTEM",
                title: "Un professionista ha visualizzato il tuo profilo",
                body: "Il tuo profilo è stato visto da uno scout verificato.",
                link: "/model/home",
              },
            });
          }
        }
      }
    } else {
      // Anonymous — dedup by IP + date
      const headersList = await headers();
      const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

      const existing = await db.profileView.findFirst({
        where: {
          modelProfileId,
          viewerIp: ip,
          viewDate: today,
          viewerId: null,
        },
      });
      if (existing) return;

      await db.$transaction([
        db.profileView.create({
          data: {
            modelProfileId,
            viewerIp: ip,
            viewDate: today,
          },
        }),
        db.modelProfile.update({
          where: { id: modelProfileId },
          data: { viewCount: { increment: 1 } },
        }),
      ]);
    }
  } catch {
    // Silently fail — view tracking should never break the page
  }
}

/**
 * Toggle whether the current user has saved a model profile to their bookmarks.
 * Requires authentication. Returns the new saved state.
 * The aggregate `likeCount` field on ModelProfile is still updated because it is
 * used as a ranking signal for the popular sort; it is never displayed publicly.
 */
export async function toggleProfileBookmark(
  modelProfileId: string
): Promise<ActionResponse<{ saved: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    const profile = await db.modelProfile.findUnique({
      where: { id: modelProfileId },
      select: { userId: true },
    });
    if (!profile) {
      return { success: false, error: "Profile not found" };
    }
    if (profile.userId === userId) {
      return { success: false, error: "Cannot bookmark your own profile" };
    }

    const existing = await db.profileLike.findUnique({
      where: {
        modelProfileId_userId: {
          modelProfileId,
          userId,
        },
      },
    });

    if (existing) {
      await db.$transaction([
        db.profileLike.delete({
          where: { id: existing.id },
        }),
        db.modelProfile.update({
          where: { id: modelProfileId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return { success: true, data: { saved: false } };
    }

    await db.$transaction([
      db.profileLike.create({
        data: { modelProfileId, userId },
      }),
      db.modelProfile.update({
        where: { id: modelProfileId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    return { success: true, data: { saved: true } };
  } catch {
    return { success: false, error: "Failed to toggle bookmark" };
  }
}
