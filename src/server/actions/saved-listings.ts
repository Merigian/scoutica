"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function toggleSavedCasting(
  castingId: string
): Promise<ActionResponse<{ saved: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    const casting = await db.casting.findUnique({
      where: { id: castingId },
      select: { id: true },
    });
    if (!casting) {
      return { success: false, error: "Casting not found" };
    }

    const existing = await db.savedListing.findUnique({
      where: { userId_castingId: { userId, castingId } },
    });

    if (existing) {
      await db.savedListing.delete({ where: { id: existing.id } });
      revalidatePath("/[locale]/model/saved", "page");
      return { success: true, data: { saved: false } };
    }

    await db.savedListing.create({
      data: { userId, castingId },
    });
    revalidatePath("/[locale]/model/saved", "page");
    return { success: true, data: { saved: true } };
  } catch {
    return { success: false, error: "Failed to toggle saved casting" };
  }
}

export async function toggleSavedJob(
  jobId: string
): Promise<ActionResponse<{ saved: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }

    const userId = session.user.id;

    const job = await db.job.findUnique({
      where: { id: jobId },
      select: { id: true },
    });
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    const existing = await db.savedListing.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existing) {
      await db.savedListing.delete({ where: { id: existing.id } });
      revalidatePath("/[locale]/model/saved", "page");
      return { success: true, data: { saved: false } };
    }

    await db.savedListing.create({
      data: { userId, jobId },
    });
    revalidatePath("/[locale]/model/saved", "page");
    return { success: true, data: { saved: true } };
  } catch {
    return { success: false, error: "Failed to toggle saved job" };
  }
}
