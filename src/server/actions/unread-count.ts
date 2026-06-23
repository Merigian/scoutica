"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getUnreadMessageCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  try {
    const participants = await db.conversationParticipant.findMany({
      where: { userId: session.user.id },
      select: {
        lastReadAt: true,
        conversation: {
          select: {
            messages: {
              where: { senderId: { not: session.user.id } },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { createdAt: true },
            },
          },
        },
      },
    });

    let count = 0;
    for (const p of participants) {
      const lastMsg = p.conversation.messages[0];
      if (lastMsg && (!p.lastReadAt || lastMsg.createdAt > p.lastReadAt)) {
        count++;
      }
    }

    return count;
  } catch (error) {
    // Non-critical badge — degrade gracefully if the DB is briefly unreachable
    // (e.g. Neon serverless cold start) instead of crashing the page.
    console.error("getUnreadMessageCount failed:", error);
    return 0;
  }
}
